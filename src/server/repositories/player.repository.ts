import { createClient } from "@/lib/supabase/server";
import { Profile, PlayerAttributes, AttributeTransaction, XpTransaction, HunterRank } from "@/types";

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

    // Initialize baseline attributes in player_attributes
    const { error: attrError } = await supabase.from("player_attributes").insert({
      user_id: profileData.id,
      strength: 10.0,
      endurance: 10.0,
      intelligence: 10.0,
      discipline: 10.0,
      mentality: 10.0,
      agility: 10.0,
      vitality: 10.0,
      highest_strength: 10.0,
      highest_endurance: 10.0,
      highest_intelligence: 10.0,
      highest_discipline: 10.0,
      highest_mentality: 10.0,
      highest_agility: 10.0,
      highest_vitality: 10.0,
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

    if (error) {
      throw new Error(`Failed to execute secure RPG transaction: ${error.message}`);
    }

    return data;
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

  static async claimDailyMysteryBox(userId: string): Promise<{ success: boolean; date: string }> {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase
      .from("profiles")
      .update({
        last_mystery_box_claimed_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to claim mystery crate: ${error.message}`);
    }
    return { success: true, date: today };
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

