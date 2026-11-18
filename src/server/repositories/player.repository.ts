import { createClient } from "@/lib/supabase/server";
import { Profile, PlayerAttributes, AttributeTransaction, XpTransaction, HunterRank } from "@/types";
import { calculateDailyCrateHarvest } from "@/lib/calculations/streak";

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

    return data as Profile;
  }

  static async createProfile(profileData: Partial<Profile> & { id: string; name: string; dob: string }): Promise<Profile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert({
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
      })
      .select()
      .single();

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
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select()
      .single();

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

  static async applyPoisonDebuff(userId: string, durationHours: number): Promise<Profile | null> {
    const supabase = await createClient();
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("profiles")
      .update({ poison_expires_at: expiresAt })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Failed to apply poison debuff:", error);
      return null;
    }
    return data as Profile;
  }

  static async clearPoisonDebuff(userId: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ poison_expires_at: null })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Failed to clear poison debuff:", error);
      return null;
    }
    return data as Profile;
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

    // Check if hunter is currently under Poison Debuff (-35% XP Reducer)
    const { data: profile } = await supabase
      .from("profiles")
      .select("poison_expires_at")
      .eq("id", params.userId)
      .single();

    if (profile?.poison_expires_at && new Date(profile.poison_expires_at).getTime() > Date.now()) {
      finalXpDelta = Math.max(1, Math.round(params.xpDelta * 0.65));
      finalNotes = finalNotes
        ? `${finalNotes} [POISON DEBUFF ACTIVE: -35% XP]`
        : "[POISON DEBUFF ACTIVE: -35% XP]";
    }

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

    console.warn(`[PlayerRepository] grant_xp_and_attributes RPC fallback engaged: ${error?.message}`);

    // Resilient fallback engine: Direct transaction in case RPC columns are undergoing migration
    const { data: currentProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.userId)
      .single();

    if (profileErr || !currentProfile) {
      throw new Error(`Failed to fetch hunter profile for RPG transaction: ${error?.message || profileErr?.message}`);
    }

    const { data: currentAttrs, error: attrErr } = await supabase
      .from("player_attributes")
      .select("*")
      .eq("user_id", params.userId)
      .single();

    if (attrErr || !currentAttrs) {
      throw new Error(`Failed to fetch player attributes for RPG transaction: ${error?.message || attrErr?.message}`);
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

    // 10-Class Quadratic Level Progression: XP(L) = 500 + 25 * (L^2 - 1)
    let newLevel = currentProfile.current_level || 1;
    let newXp = (currentProfile.current_xp || 0) + finalXpDelta;
    const totalXp = (currentProfile.lifetime_total_xp || 0) + Math.max(0, finalXpDelta);
    let highestLevel = currentProfile.lifetime_highest_level || newLevel;
    let xpToNext = Math.max(500, 500 + 25 * (newLevel * newLevel - 1));
    let levelsGained = 0;
    let newStatPoints = currentProfile.unallocated_stat_points || 0;

    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel += 1;
      levelsGained += 1;
      xpToNext = 500 + 25 * (newLevel * newLevel - 1);
      if (newLevel > highestLevel) {
        highestLevel = newLevel;
      }
    }

    if (levelsGained > 0) {
      newStatPoints += levelsGained * 3;
    }

    let newRank: HunterRank = "Recruit";
    if (newLevel >= 100) newRank = "Spartan";
    else if (newLevel >= 90) newRank = "Ascendant";
    else if (newLevel >= 80) newRank = "Sovereign";
    else if (newLevel >= 70) newRank = "Juggernaut";
    else if (newLevel >= 60) newRank = "Warlord";
    else if (newLevel >= 50) newRank = "Gladiator";
    else if (newLevel >= 40) newRank = "Knight";
    else if (newLevel >= 30) newRank = "Vanguard";
    else if (newLevel >= 20) newRank = "Warrior";
    else if (newLevel >= 10) newRank = "Initiate";

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
      levels_gained: levelsGained,
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
    await supabase
      .from("profiles")
      .update({
        active_session_state: sessionState,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  static async clearActiveSession(userId: string): Promise<void> {
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({
        active_session_state: null,
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

