import { createClient } from "@/lib/supabase/server";
import { Quest, AttributeType } from "@/types";
import { PlayerRepository } from "./player.repository";
import {
  calculatePassiveFatigueDecay,
  calculateSessionFatigueDelta,
  getFatigueStatus,
} from "@/lib/calculations/fatigue";

export class QuestRepository {
  static async getQuests(userId: string): Promise<Quest[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch quests: ${error.message}`);
    }

    return (data || []) as Quest[];
  }

  static async createQuest(userId: string, quest: Partial<Quest> & { title: string }): Promise<Quest> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quests")
      .insert({
        user_id: userId,
        title: quest.title,
        description: quest.description || null,
        classification: quest.classification || "temporary",
        category: quest.category || "routine",
        start_date: quest.start_date || new Date().toISOString().split("T")[0],
        deadline: quest.deadline || null,
        recurrence: quest.recurrence || "none",
        recurrence_days: quest.recurrence_days || [],
        estimated_duration_minutes: quest.estimated_duration_minutes || 30,
        actual_duration_minutes: null,
        priority: quest.priority || "medium",
        difficulty: quest.difficulty || "Recruit",
        attribute_rewards: quest.attribute_rewards || {},
        xp_reward: quest.xp_reward || 50,
        penalty_config: quest.penalty_config || {},
        status: "pending",
        is_manual: quest.is_manual ?? true,
        is_fun: quest.is_fun ?? false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quest: ${error.message}`);
    }

    return data as Quest;
  }

  static async completeQuest(userId: string, questId: string, actualDurationMinutes?: number): Promise<{ quest: Quest; rpgRewards: any }> {
    const supabase = await createClient();
    
    // 1. Fetch current quest to get rewards and status
    const { data: quest, error: fetchError } = await supabase
      .from("quests")
      .select("*")
      .eq("id", questId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !quest) {
      throw new Error("Quest not found or does not belong to user");
    }

    if (quest.status === "completed") {
      throw new Error("Quest has already been completed");
    }

    const duration = actualDurationMinutes || quest.estimated_duration_minutes;

    // 2. Fetch current profile for fatigue telemetry & passive decay
    const profile = await PlayerRepository.getProfile(userId);
    const decay = calculatePassiveFatigueDecay(
      profile?.last_fatigue_update_at,
      profile?.mental_fatigue,
      profile?.physical_fatigue
    );

    // 3. Compute fatigue delta & overtime surge
    const fatigueDelta = calculateSessionFatigueDelta({
      durationMinutes: duration,
      targetMinutes: quest.estimated_duration_minutes,
      isFun: quest.is_fun || false,
      linkedAttributes: Object.keys(quest.attribute_rewards || {}) as AttributeType[],
      category: quest.category,
      currentMentalFatigue: decay.newMentalFatigue,
      currentPhysicalFatigue: decay.newPhysicalFatigue,
    });

    const newMental = Math.min(100, Math.max(0, Number((decay.newMentalFatigue + fatigueDelta.mentalDelta).toFixed(2))));
    const newPhysical = Math.min(100, Math.max(0, Number((decay.newPhysicalFatigue + fatigueDelta.physicalDelta).toFixed(2))));

    // 4. Calculate fatigue debuff & scaled rewards
    const fatigueStatus = getFatigueStatus(decay.newMentalFatigue, decay.newPhysicalFatigue);
    const scaledXp = Math.max(1, Math.round(quest.xp_reward * fatigueStatus.xpMultiplier - fatigueDelta.drainPenaltyXp));

    const scaledAttributes: Record<string, number> = {};
    for (const [attr, val] of Object.entries(quest.attribute_rewards || {})) {
      scaledAttributes[attr] = Number(((val as number) * fatigueDelta.overtimeSurgeMultiplier).toFixed(3));
    }

    // 5. Update quest status
    const { data: updatedQuest, error: updateError } = await supabase
      .from("quests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        actual_duration_minutes: duration,
      })
      .eq("id", questId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update quest status: ${updateError.message}`);
    }

    // 6. Update player fatigue levels & clear session if active
    await supabase
      .from("profiles")
      .update({
        mental_fatigue: newMental,
        physical_fatigue: newPhysical,
        last_fatigue_update_at: new Date().toISOString(),
        active_session_state: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // 7. Atomically execute server-side XP & attribute rewards
    const rpgRewards = await PlayerRepository.grantXpAndAttributes({
      userId,
      xpDelta: scaledXp,
      attrDeltas: scaledAttributes,
      sourceType: "quest_completion",
      sourceId: questId,
      notes: `Completed quest: ${quest.title}. ${fatigueDelta.summaryMessage} (Fatigue: MNT ${newMental}% • PHY ${newPhysical}%)`,
    });

    return { quest: updatedQuest as Quest, rpgRewards };
  }

  static async deleteQuest(userId: string, questId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("quests")
      .delete()
      .eq("id", questId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete quest: ${error.message}`);
    }

    return true;
  }
}

