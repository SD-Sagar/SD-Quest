import { createClient } from "@/lib/supabase/server";
import { Quest } from "@/types";
import { PlayerRepository } from "./player.repository";

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

    // 2. Mark quest as completed
    const { data: updatedQuest, error: updateError } = await supabase
      .from("quests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        actual_duration_minutes: actualDurationMinutes || quest.estimated_duration_minutes,
      })
      .eq("id", questId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update quest status: ${updateError.message}`);
    }

    // 3. Atomically execute server-side XP & attribute rewards
    const rpgRewards = await PlayerRepository.grantXpAndAttributes({
      userId,
      xpDelta: quest.xp_reward,
      attrDeltas: quest.attribute_rewards || {},
      sourceType: "quest_completion",
      sourceId: questId,
      notes: `Completed quest: ${quest.title}`,
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

