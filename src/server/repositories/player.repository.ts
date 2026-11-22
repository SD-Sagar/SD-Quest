import { createClient } from "@/lib/supabase/server";
import { Profile, PlayerAttributes, AttributeTransaction, XpTransaction, HunterRank } from "@/types";
import { calculateDailyCrateHarvest } from "@/lib/calculations/streak";
import {
  calculatePassiveFatigueDecay,
  getFatigueStatus,
  calculateSleepProtocolRecovery,
  calculateCircadianAwakeStatus,
  SleepProtocolResult,
} from "@/lib/calculations/fatigue";
import { calculateLevelTransition, calculateXpForNextLevel, getRankForLevel } from "@/lib/calculations/rpg";

export class PlayerRepository {
  static async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    const profile = data as Profile;
    const sessionState = ((profile.active_session_state as any) || {});

    // Resilient fallback for poison debuff expiry from active_session_state if dedicated column is not yet migrated
    if (!profile.poison_expires_at && sessionState.poison_expires_at) {
      profile.poison_expires_at = sessionState.poison_expires_at;
    }

    // Resilient fallback for circadian sleep telemetry
    if (!profile.last_sleep_completed_at && sessionState.last_sleep_completed_at) {
      profile.last_sleep_completed_at = sessionState.last_sleep_completed_at;
    }
    if (!profile.last_sleep_started_at) {
      if (sessionState.last_sleep_started_at) {
        profile.last_sleep_started_at = sessionState.last_sleep_started_at;
      } else if (profile.last_sleep_completed_at) {
        profile.last_sleep_started_at = new Date(
          new Date(profile.last_sleep_completed_at).getTime() - 8 * 3600 * 1000
        ).toISOString();
      }
    }

    // Auto-clear expired sleep deprivation debuff
    if (profile.sleep_deprived_expires_at && new Date(profile.sleep_deprived_expires_at).getTime() <= Date.now()) {
      profile.sleep_deprived_expires_at = null;
      if (sessionState.sleep_deprived_expires_at) {
        sessionState.sleep_deprived_expires_at = null;
      }
    }

    if (profile.rolling_sleep_minutes === undefined || profile.rolling_sleep_minutes === null || profile.rolling_sleep_minutes === 0) {
      if (sessionState.rolling_sleep_minutes !== undefined && sessionState.rolling_sleep_minutes > 0) {
        profile.rolling_sleep_minutes = sessionState.rolling_sleep_minutes;
      } else if (profile.last_sleep_completed_at) {
        // If the hunter completed a restorative sleep session in the last 26 hours and has no active sleep deprivation debuff
        const isDeprived = Boolean(
          profile.sleep_deprived_expires_at &&
          new Date(profile.sleep_deprived_expires_at).getTime() > Date.now()
        );
        const msSinceSleep = Date.now() - new Date(profile.last_sleep_completed_at).getTime();
        if (msSinceSleep <= 26 * 3600 * 1000 && !isDeprived) {
          profile.rolling_sleep_minutes = 420; // 7.0 hours verified restorative rest
          sessionState.rolling_sleep_minutes = 420;
        } else {
          profile.rolling_sleep_minutes = 0;
        }
      } else {
        profile.rolling_sleep_minutes = 0;
      }
    }

    // Continuous Circadian 26h+ Exhaustion Mana Drain (-50 XP/min)
    const isCurrentlySleeping = Boolean(
      sessionState.is_sleeping ||
      sessionState.category === "sleep" ||
      sessionState.session_id === "system-compulsory-sleep-stasis" ||
      sessionState.type === "sleep"
    );

    const lastSleepCompleted =
      profile.last_sleep_completed_at ||
      sessionState.last_sleep_completed_at ||
      profile.created_at;

    // STASIS PAUSE: When actively sleeping, countdown stops and ZERO XP drain can ever occur.
    if (lastSleepCompleted && !isCurrentlySleeping) {
      const msSinceSleepCompleted = Math.max(0, Date.now() - new Date(lastSleepCompleted).getTime());
      const hoursAwake = msSinceSleepCompleted / 3600000;

      if (hoursAwake >= 26.0) {
        const overdueMs = msSinceSleepCompleted - 26.0 * 3600000;
        const totalOverdueMins = Math.floor(overdueMs / 60000);

        const lastDrainAt = sessionState.last_circadian_drain_at;
        let minsToDrain = totalOverdueMins;

        if (lastDrainAt) {
          const msSinceLastDrain = Date.now() - new Date(lastDrainAt).getTime();
          minsToDrain = Math.floor(msSinceLastDrain / 60000);
        }

        if (minsToDrain > 0) {
          const drainXp = minsToDrain * 50;
          sessionState.last_circadian_drain_at = new Date().toISOString();

          // Sync drain state to profile
          supabase
            .from("profiles")
            .update({ active_session_state: sessionState })
            .eq("id", userId)
            .then();

          // Apply negative XP delta with universal de-leveling
          await this.grantXpAndAttributes({
            userId,
            xpDelta: -drainXp,
            attrDeltas: {},
            sourceType: "circadian_exhaustion_drain",
            notes: `[CRITICAL EXHAUSTION LOCKOUT: 26H+ SLEEP DEFICIT (-50 XP/m for ${minsToDrain}m)]`,
          });
        }
      }
    }

    // 3-Day Directive Inactivity Failure Penalty:
    // If no daily challenges are completed across a 3-day lapse without Medical Sanctuary:
    // A complete level is wiped out, and XP is set to 99% of that previous level.
    if (profile.last_streak_date && profile.condition !== "medical_sanctuary") {
      const today = new Date().toISOString().split("T")[0];
      const d1 = new Date(today + "T00:00:00Z");
      const d2 = new Date(profile.last_streak_date + "T00:00:00Z");
      const daysSinceLastStreak = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));

      const lastWipeDate = sessionState.last_inactivity_wipe_streak_date;
      if (daysSinceLastStreak >= 3 && lastWipeDate !== profile.last_streak_date) {
        sessionState.last_inactivity_wipe_streak_date = profile.last_streak_date;
        const newLevel = Math.max(1, profile.current_level - 1);
        const xpThreshold = profile.xp_to_next_level || 500;
        const newXp = Math.floor(xpThreshold * 0.99);

        profile.current_level = newLevel;
        profile.current_xp = newXp;
        profile.current_streak = 0;

        await supabase
          .from("profiles")
          .update({
            current_level: newLevel,
            current_xp: newXp,
            current_streak: 0,
            active_session_state: sessionState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }

    // Continuous Passive Fatigue Decay:
    // When hunter opens or refreshes app after resting / sleeping, naturally decay fatigue
    if (profile.last_fatigue_update_at && (profile.mental_fatigue || profile.physical_fatigue)) {
      const decay = calculatePassiveFatigueDecay(
        profile.last_fatigue_update_at,
        profile.mental_fatigue,
        profile.physical_fatigue,
        undefined,
        {
          hunterLevel: profile.current_level,
          rank: profile.rank,
          lastHydrationSurgeAt: profile.last_hydration_surge_at,
        }
      );

      if (
        decay.newMentalFatigue !== profile.mental_fatigue ||
        decay.newPhysicalFatigue !== profile.physical_fatigue
      ) {
        profile.mental_fatigue = decay.newMentalFatigue;
        profile.physical_fatigue = decay.newPhysicalFatigue;
        profile.last_fatigue_update_at = new Date().toISOString();

        // Non-blocking sync to database
        supabase
          .from("profiles")
          .update({
            mental_fatigue: decay.newMentalFatigue,
            physical_fatigue: decay.newPhysicalFatigue,
            last_fatigue_update_at: profile.last_fatigue_update_at,
          })
          .eq("id", userId)
          .then();
      }
    }

    return profile;
  }

  static async createProfile(profileData: Partial<Profile> & { id: string; name: string; dob: string }): Promise<Profile> {
    const supabase = await createClient();
    const insertPayload: Record<string, any> = {
      id: profileData.id,
      name: profileData.name,
      dob: profileData.dob,
      height_cm: profileData.height_cm || 175,
      weight_kg: profileData.weight_kg || 70,
      sex: profileData.sex || "male",
      fitness_experience: profileData.fitness_experience || "beginner",
      fitness_objective: profileData.fitness_objective || "Hypertrophy & Lifelong Physical Conditioning",
      current_level: 1,
      current_xp: 0,
      xp_to_next_level: 500,
      unallocated_stat_points: 0,
      current_streak: 0,
      longest_streak: 0,
      last_streak_date: null,
      lifetime_highest_level: 1,
      lifetime_total_xp: 0,
      rank: "Recruit",
      title: "Awakened Recruit",
      condition: "normal",
      active_main_quest: profileData.active_main_quest || "fitness",
      enable_gym: profileData.enable_gym !== undefined ? profileData.enable_gym : true,
    };

    let { data, error } = await supabase
      .from("profiles")
      .insert(insertPayload)
      .select()
      .single();

    if (error && error.message.toLowerCase().includes("column")) {
      delete insertPayload.enable_gym;
      const retry = await supabase
        .from("profiles")
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Failed to create hunter profile: ${error.message}`);
    }

    // Initialize baseline attributes in player_attributes (All attributes start at 1.00 by default)
    const { error: attrError } = await supabase.from("player_attributes").insert({
      user_id: profileData.id,
      strength: 1.0,
      endurance: 1.0,
      intelligence: 1.0,
      discipline: 1.0,
      mentality: 1.0,
      agility: 1.0,
      vitality: 1.0,
      highest_strength: 1.0,
      highest_endurance: 1.0,
      highest_intelligence: 1.0,
      highest_discipline: 1.0,
      highest_mentality: 1.0,
      highest_agility: 1.0,
      highest_vitality: 1.0,
    });

    if (attrError) {
      console.error("Failed to initialize baseline player attributes:", attrError);
    }

    return data as Profile;
  }

  static async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const supabase = await createClient();
    const updatePayload: Record<string, any> = { ...data };
    let { data: updated, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error && error.message.toLowerCase().includes("column") && "enable_gym" in updatePayload) {
      delete updatePayload.enable_gym;
      const retry = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single();
      updated = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Failed to update hunter profile: ${error.message}`);
    }

    return updated as Profile;
  }

  static async getAttributes(userId: string): Promise<PlayerAttributes | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("player_attributes")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch player attributes: ${error.message}`);
    }

    return data as PlayerAttributes;
  }

  static async setPoisonDebuffExpiry(userId: string, expiresAt: string | null): Promise<Profile | null> {
    const supabase = await createClient();

    // 1. Persist to active_session_state (guaranteed JSONB column in database)
    const { data: current } = await supabase
      .from("profiles")
      .select("active_session_state")
      .eq("id", userId)
      .single();

    const currentState = ((current?.active_session_state as any) || {});
    if (expiresAt) {
      currentState.poison_expires_at = expiresAt;
    } else {
      delete currentState.poison_expires_at;
    }

    await supabase
      .from("profiles")
      .update({ active_session_state: Object.keys(currentState).length ? currentState : null })
      .eq("id", userId);

    // 2. Also attempt updating dedicated column if available
    try {
      await supabase
        .from("profiles")
        .update({ poison_expires_at: expiresAt })
        .eq("id", userId);
    } catch {
      // Column may not yet exist if SQL migration hasn't been executed
    }

    return this.getProfile(userId);
  }

  static async applyPoisonDebuff(userId: string, durationHours: number): Promise<Profile | null> {
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
    return this.setPoisonDebuffExpiry(userId, expiresAt);
  }

  static async clearPoisonDebuff(userId: string): Promise<Profile | null> {
    return this.setPoisonDebuffExpiry(userId, null);
  }

  static async grantXpAndAttributes(params: {
    userId: string;
    xpDelta: number;
    attrDeltas: Record<string, number>;
    sourceType: string;
    sourceId?: string;
    notes?: string;
  }) {
    const supabase = await createClient();

    let finalXpDelta = params.xpDelta;
    let finalNotes = params.notes || "";

    // Check hunter status modifiers: Fatigue, 2X EXP Booster, Sleep Deprivation, Poison
    const { data: profile } = await supabase
      .from("profiles")
      .select("poison_expires_at, mental_fatigue, physical_fatigue, exp_booster_multiplier, exp_booster_expires_at, sleep_deprived_expires_at")
      .eq("id", params.userId)
      .single();

    // 1. NEURAL LOCKOUT: If Mental Fatigue >= 85%, XP gain is 0% (Brain Fog blocks learning)
    if (profile && Number(profile.mental_fatigue || 0) >= 85) {
      finalXpDelta = 0;
      finalNotes = finalNotes
        ? `${finalNotes} [BRAIN FOG LOCKOUT: 0% XP ACTIVE (Mental Fatigue >= 85%)]`
        : "[BRAIN FOG LOCKOUT: 0% XP ACTIVE (Mental Fatigue >= 85%)]";
    } else {
      // 2. CHECK 2X EXP BOOSTER (Active from 8.0-8.5h optimal sleep)
      if (
        profile?.exp_booster_expires_at &&
        new Date(profile.exp_booster_expires_at).getTime() > Date.now()
      ) {
        const boosterMultiplier = Number(profile.exp_booster_multiplier) || 2.0;
        finalXpDelta = Math.round(finalXpDelta * boosterMultiplier);
        finalNotes = finalNotes
          ? `${finalNotes} [⚡ 2X EXP BOOSTER ACTIVE (${boosterMultiplier}x)]`
          : `[⚡ 2X EXP BOOSTER ACTIVE (${boosterMultiplier}x)]`;
      }

      // 3. CHECK SLEEP DEPRIVATION DEBUFF (< 4h sleep penalty: 0.7x XP speed)
      if (
        profile?.sleep_deprived_expires_at &&
        new Date(profile.sleep_deprived_expires_at).getTime() > Date.now()
      ) {
        finalXpDelta = Math.max(1, Math.round(finalXpDelta * 0.70));
        finalNotes = finalNotes
          ? `${finalNotes} [⚠️ SLEEP DEPRIVED: 0.7x EXP SPEED]`
          : "[⚠️ SLEEP DEPRIVED: 0.7x EXP SPEED]";
      }

      // 4. CHECK POISON DEBUFF
      if (profile?.poison_expires_at && new Date(profile.poison_expires_at).getTime() > Date.now()) {
        finalXpDelta = Math.max(1, Math.round(finalXpDelta * 0.65));
        finalNotes = finalNotes
          ? `${finalNotes} [POISON DEBUFF ACTIVE: -35% XP]`
          : "[POISON DEBUFF ACTIVE: -35% XP]";
      }
    }

    // If delta is negative (penalty/drain), always run through direct TypeScript transition engine
    // to guarantee universal de-leveling and demotion without relying on Postgres RPC!
    if (finalXpDelta >= 0) {
      const { data, error } = await supabase.rpc("grant_xp_and_attributes", {
        p_user_id: params.userId,
        p_xp_delta: finalXpDelta,
        p_attr_deltas: params.attrDeltas,
        p_source_type: params.sourceType,
        p_source_id: params.sourceId || null,
        p_notes: finalNotes || null,
      });

      if (!error && data) {
        return data;
      }
    }

    // Resilient fallback engine: Direct transaction in case RPC columns are undergoing migration
    const { data: currentProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.userId)
      .single();

    if (profileErr || !currentProfile) {
      throw new Error(`Failed to fetch hunter profile for RPG transaction: ${profileErr?.message}`);
    }

    const { data: currentAttrs, error: attrErr } = await supabase
      .from("player_attributes")
      .select("*")
      .eq("user_id", params.userId)
      .single();

    if (attrErr || !currentAttrs) {
      throw new Error(`Failed to fetch player attributes for RPG transaction: ${attrErr?.message}`);
    }

    const updatedAttrs: Record<string, any> = { ...currentAttrs };
    const attrUpdates: Record<string, any> = {};

    if (params.attrDeltas) {
      for (const [key, deltaVal] of Object.entries(params.attrDeltas)) {
        const delta = Number(deltaVal) || 0;
        const attrKey = key.toLowerCase();
        const currentVal = Number(updatedAttrs[attrKey] ?? 1.0);
        const newVal = Math.max(1.0, Number((currentVal + delta).toFixed(2)));
        const highestCol = `highest_${attrKey}`;
        const currentHighest = Number(updatedAttrs[highestCol] ?? currentVal);
        const newHighest = Math.max(newVal, currentHighest);

        updatedAttrs[attrKey] = newVal;
        updatedAttrs[highestCol] = newHighest;
        attrUpdates[attrKey] = newVal;
        attrUpdates[highestCol] = newHighest;

        // Resilient ledger logging across schema column differences
        try {
          await supabase.from("attribute_transactions").insert({
            user_id: params.userId,
            attribute_type: attrKey,
            attribute_name: attrKey,
            delta,
            resulting_score: newVal,
            resulting_value: newVal,
            source_type: params.sourceType,
            source_id: params.sourceId || null,
            notes: finalNotes || null,
          });
        } catch {
          try {
            await supabase.from("attribute_transactions").insert({
              user_id: params.userId,
              attribute_type: attrKey,
              delta,
              resulting_score: newVal,
              source_type: params.sourceType,
            });
          } catch {
            // Ledger failure is non-fatal to hunter progression
          }
        }
      }

      if (Object.keys(attrUpdates).length > 0) {
        attrUpdates.updated_at = new Date().toISOString();
        await supabase
          .from("player_attributes")
          .update(attrUpdates)
          .eq("user_id", params.userId);
      }
    }

    // Universal 10-Class Quadratic Level & De-Leveling Progression
    const transition = calculateLevelTransition({
      currentLevel: currentProfile.current_level || 1,
      currentXp: currentProfile.current_xp || 0,
      xpDelta: finalXpDelta,
    });

    const newLevel = transition.newLevel;
    const newXp = transition.newXp;
    const xpToNext = transition.xpToNext;
    const newRank = transition.newRank;
    const totalXp = Math.max(0, (currentProfile.lifetime_total_xp || 0) + finalXpDelta);
    const highestLevel = Math.max(currentProfile.lifetime_highest_level || 1, newLevel);
    let newStatPoints = currentProfile.unallocated_stat_points || 0;

    if (transition.isPromoted && transition.levelsDelta > 0) {
      newStatPoints += transition.levelsDelta * 3;
    }

    if (transition.isDemoted) {
      finalNotes = finalNotes
        ? `${finalNotes} [DEMOTED TO LVL ${newLevel} (${newRank})]`
        : `[DEMOTED TO LVL ${newLevel} (${newRank})]`;
    }

    await supabase
      .from("profiles")
      .update({
        current_level: newLevel,
        current_xp: newXp,
        xp_to_next_level: xpToNext,
        lifetime_highest_level: highestLevel,
        lifetime_total_xp: totalXp,
        rank: newRank,
        unallocated_stat_points: newStatPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.userId);

    try {
      await supabase.from("xp_transactions").insert({
        user_id: params.userId,
        delta_xp: finalXpDelta,
        xp_delta: finalXpDelta,
        resulting_xp: newXp,
        resulting_total_xp: totalXp,
        resulting_level: newLevel,
        source_type: params.sourceType,
        source_id: params.sourceId || null,
        notes: finalNotes || null,
      });
    } catch {
      // Non-fatal
    }

    return {
      xp_gained: finalXpDelta,
      new_xp: newXp,
      xp_to_next: xpToNext,
      new_level: newLevel,
      levels_gained: transition.levelsDelta,
      new_rank: newRank,
      unallocated_stat_points: newStatPoints,
      attributes: {
        strength: updatedAttrs.strength,
        endurance: updatedAttrs.endurance,
        intelligence: updatedAttrs.intelligence,
        discipline: updatedAttrs.discipline,
        mentality: updatedAttrs.mentality,
        agility: updatedAttrs.agility,
        vitality: updatedAttrs.vitality,
      },
    };
  }

  static async getAttributeTransactions(userId: string, limit = 50): Promise<AttributeTransaction[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attribute_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch attribute audit logs: ${error.message}`);
    }

    return (data || []) as AttributeTransaction[];
  }

  static async allocateStatPoint(userId: string, attribute: string, points: number = 1) {
    const supabase = await createClient();
    const attrLower = attribute.toLowerCase();

    // 1. Try calling the allocate_stat_point RPC first
    const { data, error } = await supabase.rpc("allocate_stat_point", {
      p_user_id: userId,
      p_attribute: attrLower,
      p_points: points,
    });

    if (!error) {
      return data;
    }

    // 2. Resilient fallback if RPC hasn't been run yet:
    const { data: profile } = await supabase
      .from("profiles")
      .select("unallocated_stat_points")
      .eq("id", userId)
      .single();

    const currentPoints = profile?.unallocated_stat_points || 0;
    if (currentPoints < points) {
      throw new Error(`Insufficient unallocated stat points. Available: ${currentPoints}`);
    }

    const { data: attrs } = await supabase
      .from("player_attributes")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!attrs) throw new Error("Player attributes not found");

    const currentVal = Number(attrs[attrLower] || 10.0);
    const newVal = currentVal + (points * 1.0);
    const highestCol = `highest_${attrLower}`;
    const highestVal = Math.max(newVal, Number(attrs[highestCol] || currentVal));

    await supabase
      .from("player_attributes")
      .update({
        [attrLower]: newVal,
        [highestCol]: highestVal,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await supabase
      .from("profiles")
      .update({
        unallocated_stat_points: currentPoints - points,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return {
      success: true,
      allocated_attribute: attrLower,
      points_spent: points,
      remaining_points: currentPoints - points,
      new_attribute_value: newVal,
    };
  }

  static async useGraceCoin(
    userId: string,
    debuffType: "poison" | "circadian" | "sleep_deprivation" | "fatigue"
  ): Promise<{
    success: boolean;
    remainingCoins: number;
    message: string;
  }> {
    const supabase = await createClient();
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Hunter profile not found");

    const currentCoins = profile.unallocated_stat_points || 0;
    if (currentCoins < 1) {
      throw new Error("Insufficient Grace Coins. Complete hunter milestones to earn Grace Coins.");
    }

    const sessionState = ((profile.active_session_state as any) || {});
    const updatePayload: Record<string, any> = {
      unallocated_stat_points: currentCoins - 1,
      updated_at: new Date().toISOString(),
    };

    let message = "";

    if (debuffType === "poison") {
      const poisonExpires = profile.poison_expires_at || sessionState.poison_expires_at;
      if (poisonExpires) {
        const msRemaining = new Date(poisonExpires).getTime() - Date.now();
        if (msRemaining <= 3 * 3600 * 1000) {
          updatePayload.poison_expires_at = null;
          delete sessionState.poison_expires_at;
          message = "Grace Coin activated: Alcohol Poison completely cleansed!";
        } else {
          const newExp = new Date(new Date(poisonExpires).getTime() - 3 * 3600 * 1000).toISOString();
          updatePayload.poison_expires_at = newExp;
          sessionState.poison_expires_at = newExp;
          message = "Grace Coin activated: Poison clearance accelerated by 3 hours!";
        }
      } else {
        message = "Grace Coin activated: Liver biological pathways reinforced.";
      }
    } else if (debuffType === "circadian") {
      // 3-hour reduction of active awake strain + 3-hour (180m) stasis credit
      const currentAnchor = profile.last_sleep_completed_at || sessionState.last_sleep_completed_at || profile.last_sleep_started_at;
      const now = Date.now();
      let newAnchorIso: string;
      if (currentAnchor) {
        newAnchorIso = new Date(new Date(currentAnchor).getTime() + 3 * 3600 * 1000).toISOString();
      } else {
        newAnchorIso = new Date(now - 19 * 3600 * 1000).toISOString();
      }

      const currentRolling = Number(profile.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes ?? 0);
      const newRolling = currentRolling + 180; // 3 hours of restorative stasis credit

      updatePayload.last_sleep_completed_at = newAnchorIso;
      updatePayload.last_sleep_started_at = newAnchorIso;
      updatePayload.rolling_sleep_minutes = newRolling;
      sessionState.last_sleep_completed_at = newAnchorIso;
      sessionState.last_sleep_started_at = newAnchorIso;
      sessionState.rolling_sleep_minutes = newRolling;
      delete sessionState.last_circadian_drain_at;

      if (newRolling >= 240) {
        updatePayload.sleep_deprived_expires_at = null;
        sessionState.sleep_deprived_expires_at = null;
      }

      message = `Grace Coin activated: Awake strain reduced by 3.0h (+180m sleep credit)! Total rest: ${(newRolling / 60).toFixed(1)}h/4.0h.`;
    } else if (debuffType === "sleep_deprivation") {
      const depExpires = profile.sleep_deprived_expires_at || sessionState.sleep_deprived_expires_at;
      if (depExpires) {
        const msRemaining = new Date(depExpires).getTime() - Date.now();
        if (msRemaining <= 3 * 3600 * 1000) {
          updatePayload.sleep_deprived_expires_at = null;
          sessionState.sleep_deprived_expires_at = null;
          message = "Grace Coin activated: Sleep Deprivation debuff completely purged!";
        } else {
          const newExp = new Date(new Date(depExpires).getTime() - 3 * 3600 * 1000).toISOString();
          updatePayload.sleep_deprived_expires_at = newExp;
          sessionState.sleep_deprived_expires_at = newExp;
          message = "Grace Coin activated: Sleep Deprivation debuff shortened by 3 hours!";
        }
      } else {
        updatePayload.sleep_deprived_expires_at = null;
        sessionState.sleep_deprived_expires_at = null;
        message = "Grace Coin activated: Rest deficit lifted.";
      }
    } else if (debuffType === "fatigue") {
      const currentMental = Number(profile.mental_fatigue) || 0;
      const currentPhysical = Number(profile.physical_fatigue) || 0;
      const newMental = currentMental <= 30 ? 0 : Math.max(0, Number((currentMental - 30).toFixed(1)));
      const newPhysical = currentPhysical <= 30 ? 0 : Math.max(0, Number((currentPhysical - 30).toFixed(1)));

      updatePayload.mental_fatigue = newMental;
      updatePayload.physical_fatigue = newPhysical;
      updatePayload.last_fatigue_update_at = new Date().toISOString();
      message = `Grace Coin activated: Biological fatigue purged by -30% (Physical: ${newPhysical}%, Mental: ${newMental}%)!`;
    }

    updatePayload.active_session_state = sessionState;

    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", userId);
    if (error) {
      console.warn("Retrying useGraceCoin without dedicated columns:", error.message);
      delete updatePayload.last_sleep_started_at;
      delete updatePayload.rolling_sleep_minutes;
      await supabase.from("profiles").update(updatePayload).eq("id", userId);
    }

    return {
      success: true,
      remainingCoins: currentCoins - 1,
      message,
    };
  }

  static async claimDailyMysteryBox(userId: string): Promise<{
    success: boolean;
    date: string;
    newStreak: number;
    longestStreak: number;
    xpAwarded: number;
    multiplier: number;
    multiplierLabel: string;
    bonusStatPoints: number;
    isMilestone: boolean;
    message: string;
  }> {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch current profile
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error("Profile not found");

    // 2. Compute dynamic streak harvest
    const harvest = calculateDailyCrateHarvest(profile, today);

    // 3. Grant scaled XP + Discipline/Mentality stat yield
    await this.grantXpAndAttributes({
      userId,
      xpDelta: harvest.totalXpAwarded,
      attrDeltas: { discipline: 0.15, mentality: 0.15 },
      sourceType: "daily_system_mystery_box",
      notes: `${harvest.logMessage} (XP Multiplier: ${harvest.multiplierLabel})`,
    });

    // 4. Update profiles with new streak and bonus unallocated stat points if milestone
    const updatePayload: Record<string, any> = {
      last_mystery_box_claimed_date: today,
      last_streak_date: today,
      current_streak: harvest.newStreak,
      longest_streak: harvest.newLongestStreak,
      updated_at: new Date().toISOString(),
    };

    if (harvest.bonusStatPoints > 0) {
      updatePayload.unallocated_stat_points = (profile.unallocated_stat_points || 0) + harvest.bonusStatPoints;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to claim mystery crate: ${error.message}`);
    }

    return {
      success: true,
      date: today,
      newStreak: harvest.newStreak,
      longestStreak: harvest.newLongestStreak,
      xpAwarded: harvest.totalXpAwarded,
      multiplier: harvest.multiplier,
      multiplierLabel: harvest.multiplierLabel,
      bonusStatPoints: harvest.bonusStatPoints,
      isMilestone: harvest.isMilestone,
      message: harvest.logMessage,
    };
  }

  static async saveActiveSession(userId: string, sessionState: any): Promise<void> {
    const supabase = await createClient();
    const profile = await this.getProfile(userId);

    const isSleep =
      sessionState?.category === "sleep" ||
      sessionState?.session_id === "system-compulsory-sleep-stasis" ||
      sessionState?.type === "sleep";

    if (isSleep) {
      sessionState.is_sleeping = true;
      sessionState.sleep_started_at = sessionState.started_at || new Date().toISOString();

      // Calculate and freeze current awake hours at the exact moment sleep starts
      const existingSessionState = (profile?.active_session_state as any) || {};
      const anchor =
        profile?.last_sleep_completed_at ||
        existingSessionState.last_sleep_completed_at ||
        profile?.created_at;
      const awakeMs = anchor ? Math.max(0, Date.now() - new Date(anchor).getTime()) : 0;
      sessionState.frozen_awake_hours = Number((awakeMs / (1000 * 3600)).toFixed(2));
    }

    await supabase
      .from("profiles")
      .update({
        active_session_state: sessionState,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  static async getActiveSession(userId: string): Promise<any | null> {
    const profile = await this.getProfile(userId);
    return profile?.active_session_state || null;
  }

  static async clearActiveSession(userId: string): Promise<void> {
    const supabase = await createClient();
    const profile = await this.getProfile(userId);
    const sessionState = ((profile?.active_session_state as any) || {});

    // Preserve persistent circadian telemetry keys while clearing active runtime keys
    const preservedState: Record<string, any> = {};
    if (sessionState.last_sleep_completed_at) preservedState.last_sleep_completed_at = sessionState.last_sleep_completed_at;
    if (sessionState.last_sleep_started_at) preservedState.last_sleep_started_at = sessionState.last_sleep_started_at;
    if (sessionState.rolling_sleep_minutes !== undefined) preservedState.rolling_sleep_minutes = sessionState.rolling_sleep_minutes;
    if (sessionState.sleep_deprived_expires_at) preservedState.sleep_deprived_expires_at = sessionState.sleep_deprived_expires_at;
    if (sessionState.poison_expires_at) preservedState.poison_expires_at = sessionState.poison_expires_at;

    await supabase
      .from("profiles")
      .update({
        active_session_state: Object.keys(preservedState).length > 0 ? preservedState : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  static async relieveFatigue(
    userId: string,
    relief: { mental?: number; physical?: number }
  ): Promise<{ mental: number; physical: number }> {
    const supabase = await createClient();
    const profile = await this.getProfile(userId);
    if (!profile) return { mental: 0, physical: 0 };

    const currentMental = Number(profile.mental_fatigue) || 0;
    const currentPhysical = Number(profile.physical_fatigue) || 0;

    const newMental = Math.max(0, Number((currentMental - (relief.mental || 0)).toFixed(2)));
    const newPhysical = Math.max(0, Number((currentPhysical - (relief.physical || 0)).toFixed(2)));

    await supabase
      .from("profiles")
      .update({
        mental_fatigue: newMental,
        physical_fatigue: newPhysical,
        last_fatigue_update_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return { mental: newMental, physical: newPhysical };
  }

  static async completeSleepSession(userId: string, minutesSlept: number): Promise<SleepProtocolResult> {
    const supabase = await createClient();
    const result = calculateSleepProtocolRecovery(minutesSlept);
    const profile = await this.getProfile(userId);

    const currentMental = Number(profile?.mental_fatigue) || 0;
    const currentPhysical = Number(profile?.physical_fatigue) || 0;

    const newMental = Math.max(0, Number((currentMental + result.mentalDelta).toFixed(2)));
    const newPhysical = Math.max(0, Number((currentPhysical + result.physicalDelta).toFixed(2)));

    const now = new Date();
    const sessionStartIso = new Date(now.getTime() - minutesSlept * 60 * 1000).toISOString();
    const sessionState = ((profile?.active_session_state as any) || {});

    // MAIN SLEEP PROTOCOL >= 4.0h RESETS THE 26-HOUR CIRCADIAN WINDOW TO 0!
    // The player has had adequate core sleep; awake time resets to 0h starting from now.
    const newRolling = minutesSlept;

    const updatePayload: Record<string, any> = {
      mental_fatigue: newMental,
      physical_fatigue: newPhysical,
      last_fatigue_update_at: now.toISOString(),
      last_sleep_completed_at: now.toISOString(), // Wake up time: anchors new 0h awake clock!
      last_sleep_started_at: sessionStartIso,
      rolling_sleep_minutes: newRolling,
      sleep_deprived_expires_at: null, // Clears any prior sleep deprivation debuff
      updated_at: now.toISOString(),
    };

    if (result.isOptimal) {
      updatePayload.exp_booster_multiplier = 2.0;
      updatePayload.exp_booster_expires_at = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();
    }

    sessionState.is_sleeping = false;
    delete sessionState.frozen_awake_hours;
    delete sessionState.sleep_started_at;
    delete sessionState.last_circadian_drain_at;
    sessionState.last_sleep_completed_at = now.toISOString();
    sessionState.last_sleep_started_at = sessionStartIso;
    sessionState.rolling_sleep_minutes = newRolling;
    sessionState.sleep_deprived_expires_at = null;
    updatePayload.active_session_state = sessionState;

    const { error: endSleepErr } = await supabase.from("profiles").update(updatePayload).eq("id", userId);
    if (endSleepErr) {
      console.warn("Retrying endSleepSession with active_session_state fallback:", endSleepErr.message);
      delete updatePayload.last_sleep_started_at;
      delete updatePayload.rolling_sleep_minutes;
      await supabase.from("profiles").update(updatePayload).eq("id", userId);
    }

    if (result.mentalityGain > 0) {
      await this.grantXpAndAttributes({
        userId,
        xpDelta: result.isOptimal ? 150 : 50,
        attrDeltas: { mentality: result.mentalityGain },
        sourceType: "sleep_protocol",
        notes: result.summaryMessage,
      });
    }

    return result;
  }

  static async applySleepDeprivationPenalty(userId: string, minutesSlept: number): Promise<SleepProtocolResult> {
    const supabase = await createClient();
    const result = calculateSleepProtocolRecovery(minutesSlept);
    const profile = await this.getProfile(userId);
    const now = new Date();
    const sessionStartIso = new Date(now.getTime() - minutesSlept * 60 * 1000).toISOString();

    const sessionState = ((profile?.active_session_state as any) || {});
    const currentRolling = Number(profile?.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes ?? 0);
    const newRolling = currentRolling + minutesSlept;

    // PREMATURE SLEEP (< 4.0h):
    // 26-hour window DOES NOT RESET to 0!
    // Deduct sleep duration from frozen awake hours and shift anchor.
    const frozenAwake = sessionState.frozen_awake_hours !== undefined 
      ? Number(sessionState.frozen_awake_hours) 
      : 24.0;
    const sleepHours = minutesSlept / 60;
    const deductedAwake = Math.max(0, frozenAwake - sleepHours);

    // Anchor last_sleep_completed_at so (now - last_sleep_completed_at) equals deductedAwake hours
    const adjustedAnchorIso = new Date(now.getTime() - deductedAwake * 3600 * 1000).toISOString();

    const updatePayload: Record<string, any> = {
      sleep_deprived_expires_at: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      last_sleep_completed_at: adjustedAnchorIso,
      last_sleep_started_at: sessionStartIso,
      rolling_sleep_minutes: newRolling,
      updated_at: now.toISOString(),
    };

    sessionState.is_sleeping = false;
    delete sessionState.frozen_awake_hours;
    delete sessionState.sleep_started_at;
    delete sessionState.last_circadian_drain_at;
    sessionState.last_sleep_completed_at = adjustedAnchorIso;
    sessionState.last_sleep_started_at = sessionStartIso;
    sessionState.rolling_sleep_minutes = newRolling;
    updatePayload.active_session_state = sessionState;

    const { error: endSleepErr } = await supabase.from("profiles").update(updatePayload).eq("id", userId);
    if (endSleepErr) {
      console.warn("Retrying endSleepSession with active_session_state fallback:", endSleepErr.message);
      delete updatePayload.last_sleep_started_at;
      delete updatePayload.rolling_sleep_minutes;
      await supabase.from("profiles").update(updatePayload).eq("id", userId);
    }

    // Apply -100 XP / Mana penalty (stays intact, universal de-leveling triggers if XP drops below 0)
    await this.grantXpAndAttributes({
      userId,
      xpDelta: -100,
      attrDeltas: {},
      sourceType: "sleep_deprivation_penalty",
      notes: result.summaryMessage,
    });

    return result;
  }

  static async logManualSleepSession(
    userId: string,
    minutesSlept: number
  ): Promise<{
    cumulativeMinutes: number;
    hasAdequateSleep: boolean;
    clearedDebuff: boolean;
    result: SleepProtocolResult;
  }> {
    const supabase = await createClient();
    const profile = await this.getProfile(userId);
    const result = calculateSleepProtocolRecovery(minutesSlept);
    const now = new Date();
    const sessionStartIso = new Date(now.getTime() - minutesSlept * 60 * 1000).toISOString();

    const currentMental = Number(profile?.mental_fatigue) || 0;
    const currentPhysical = Number(profile?.physical_fatigue) || 0;

    const newMental = Math.max(0, Number((currentMental + result.mentalDelta).toFixed(2)));
    const newPhysical = Math.max(0, Number((currentPhysical + result.physicalDelta).toFixed(2)));

    const sessionState = ((profile?.active_session_state as any) || {});
    const currentRolling = Number(profile?.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes ?? 0);
    const newRolling = currentRolling + minutesSlept;
    const hasAdequateSleep = newRolling >= 240;

    // SIDE SLEEP / NAPS DO NOT RESET THE 26-HOUR CIRCADIAN CYCLE.
    // Deduct nap duration from current awake strain by shifting anchor forward:
    const currentAnchor = profile?.last_sleep_completed_at || sessionState.last_sleep_completed_at || profile?.created_at;
    let adjustedAnchorIso = currentAnchor;
    if (currentAnchor) {
      const currentAnchorMs = new Date(currentAnchor).getTime();
      adjustedAnchorIso = new Date(currentAnchorMs + minutesSlept * 60 * 1000).toISOString();
    }

    const updatePayload: Record<string, any> = {
      mental_fatigue: newMental,
      physical_fatigue: newPhysical,
      last_fatigue_update_at: now.toISOString(),
      last_sleep_completed_at: adjustedAnchorIso,
      rolling_sleep_minutes: newRolling,
      updated_at: now.toISOString(),
    };

    let clearedDebuff = false;
    if (hasAdequateSleep) {
      updatePayload.sleep_deprived_expires_at = null;
      clearedDebuff = true;
    }

    sessionState.is_sleeping = false;
    sessionState.last_sleep_completed_at = adjustedAnchorIso;
    sessionState.rolling_sleep_minutes = newRolling;
    if (hasAdequateSleep) {
      sessionState.sleep_deprived_expires_at = null;
    }
    delete sessionState.last_circadian_drain_at;
    updatePayload.active_session_state = sessionState;

    const { error: endSleepErr } = await supabase.from("profiles").update(updatePayload).eq("id", userId);
    if (endSleepErr) {
      console.warn("Retrying endSleepSession with active_session_state fallback:", endSleepErr.message);
      delete updatePayload.last_sleep_started_at;
      delete updatePayload.rolling_sleep_minutes;
      await supabase.from("profiles").update(updatePayload).eq("id", userId);
    }

    return {
      cumulativeMinutes: newRolling,
      hasAdequateSleep,
      clearedDebuff,
      result,
    };
  }

  static async saveCustomPlan(userId: string, dayRoutines: any): Promise<void> {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("custom_workout_plans")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase
        .from("custom_workout_plans")
        .update({
          day_routines: dayRoutines,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("custom_workout_plans")
        .insert({
          user_id: userId,
          name: "My Custom Hunter Split",
          day_routines: dayRoutines,
          is_active: true,
        });
    }
  }

  static async getCustomPlan(userId: string): Promise<any | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("custom_workout_plans")
      .select("day_routines")
      .eq("user_id", userId)
      .single();

    return data?.day_routines || null;
  }
}

