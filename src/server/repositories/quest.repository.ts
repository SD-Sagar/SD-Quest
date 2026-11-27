import { createClient } from "@/lib/supabase/server";
import { Quest, AttributeType } from "@/types";
import { PlayerRepository } from "./player.repository";
import {
  calculatePassiveFatigueDecay,
  calculateSessionFatigueDelta,
  getFatigueStatus,
  determineTaskDomain,
} from "@/lib/calculations/fatigue";

export class QuestRepository {
  static async getQuests(userId: string): Promise<Quest[]> {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch quests: ${error.message}`);
    }

    const resetQuestIds: string[] = [];

    const mapped = (data || []).map((q: any) => {
      const questObj: any = { ...q };
      if (questObj.description?.includes("[MEDITATION_PROTOCOL]") && questObj.category === "routine") {
        questObj.category = "meditation";
      }

      // Check recurring quest rollover across day boundaries
      const isRecurring = questObj.recurrence && questObj.recurrence !== "none";
      if (isRecurring) {
        const lastDoneDate =
          questObj.last_completed_date ||
          (questObj.completed_at ? questObj.completed_at.split("T")[0] : null);

        if (lastDoneDate !== todayStr && questObj.status === "completed") {
          // Stale completion from an earlier day: reset to pending for today
          questObj.status = "pending";
          resetQuestIds.push(questObj.id);
        }
      }

      return questObj;
    }) as Quest[];

    // Asynchronously synchronize reset status in database
    if (resetQuestIds.length > 0) {
      supabase
        .from("quests")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .in("id", resetQuestIds)
        .then();
    }

    return mapped;
  }

  static async createQuest(userId: string, quest: Partial<Quest> & { title: string }): Promise<Quest> {
    const supabase = await createClient();
    const dbCategory =
      quest.category === "sleep" || quest.category === "meditation"
        ? "routine"
        : quest.category || "routine";

    const { data, error } = await supabase
      .from("quests")
      .insert({
        user_id: userId,
        title: quest.title,
        description: quest.description || null,
        classification: quest.classification || "temporary",
        category: dbCategory,
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

  static async completeQuest(
    userId: string,
    questId: string,
    actualDurationMinutes?: number,
    options?: { isRepeatSession?: boolean; isOffDaySession?: boolean }
  ): Promise<{ quest: Quest; rpgRewards: any }> {
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

    const todayStr = new Date().toISOString().split("T")[0];
    const isRecurring = quest.recurrence && quest.recurrence !== "none";
    const lastDoneDate =
      quest.last_completed_date ||
      (quest.completed_at ? quest.completed_at.split("T")[0] : null);

    if (isRecurring && lastDoneDate === todayStr && !options?.isRepeatSession) {
      throw new Error("This recurring directive has already been completed today. Tap 'Unlock Repeat Session' to push your limits!");
    } else if (!isRecurring && quest.status === "completed") {
      throw new Error("Quest has already been completed");
    }

    const duration = actualDurationMinutes || quest.estimated_duration_minutes;

    // 2. Fetch current profile for fatigue telemetry & passive decay
    const profile = await PlayerRepository.getProfile(userId);
    const attrs = await PlayerRepository.getAttributes(userId);
    const decay = calculatePassiveFatigueDecay(
      profile?.last_fatigue_update_at,
      profile?.mental_fatigue,
      profile?.physical_fatigue,
      undefined,
      {
        hunterLevel: profile?.current_level,
        rank: profile?.rank,
        vitality: attrs?.vitality,
        endurance: attrs?.endurance,
        mentality: attrs?.mentality,
        discipline: attrs?.discipline,
        lastHydrationSurgeAt: profile?.last_hydration_surge_at,
      }
    );

    const sessionState = (profile?.active_session_state as any) || {};
    const isMeditation =
      quest.category === "meditation" ||
      quest.description?.includes("[MEDITATION_PROTOCOL]") ||
      quest.title.toLowerCase().includes("meditat");
    const graceCoinSpent = Boolean(
      sessionState.grace_coin_consumed_for_session === quest.id ||
      (sessionState.grace_coin_consumed_at &&
        Date.now() - new Date(sessionState.grace_coin_consumed_at).getTime() < 3 * 3600 * 1000)
    );

    // 3. Compute fatigue delta & overtime surge
    const fatigueDelta = calculateSessionFatigueDelta({
      durationMinutes: duration,
      targetMinutes: quest.estimated_duration_minutes,
      isFun: quest.is_fun || false,
      linkedAttributes: Object.keys(quest.attribute_rewards || {}) as AttributeType[],
      category: isMeditation ? "meditation" : quest.category,
      currentMentalFatigue: decay.newMentalFatigue,
      currentPhysicalFatigue: decay.newPhysicalFatigue,
      hunterLevel: profile?.current_level,
      endurance: attrs?.endurance,
      vitality: attrs?.vitality,
      discipline: attrs?.discipline,
      mentality: attrs?.mentality,
      priority: quest.priority,
      difficulty: quest.difficulty,
      graceCoinSpent,
    });

    const domain = determineTaskDomain(
      Object.keys(quest.attribute_rewards || {}) as AttributeType[],
      isMeditation ? "meditation" : quest.category
    );

    // Same-Day Repeat Session: fatigue accumulates 25% faster (1.25x), and attributes are boosted (1.25x)!
    const fatigueSpeedFactor = options?.isRepeatSession ? 1.25 : 1.0;
    const attributeBoostFactor = options?.isRepeatSession ? 1.25 : 1.0;

    const effMentalDelta = Number((fatigueDelta.mentalDelta * fatigueSpeedFactor).toFixed(2));
    const effPhysicalDelta = Number((fatigueDelta.physicalDelta * fatigueSpeedFactor).toFixed(2));

    let newMental: number;
    let newPhysical: number;

    if (isMeditation || quest.is_fun) {
      newMental = Math.min(100, Math.max(0, Number(((profile?.mental_fatigue ?? 0) + effMentalDelta).toFixed(2))));
      newPhysical = Math.min(100, Math.max(0, Number((decay.newPhysicalFatigue + effPhysicalDelta).toFixed(2))));
    } else if (domain === "mental") {
      newMental = Math.min(100, Math.max(0, Number(((profile?.mental_fatigue ?? 0) + effMentalDelta).toFixed(2))));
      newPhysical = Math.min(100, Math.max(0, Number((decay.newPhysicalFatigue + effPhysicalDelta).toFixed(2))));
    } else if (domain === "physical") {
      newPhysical = Math.min(100, Math.max(0, Number(((profile?.physical_fatigue ?? 0) + effPhysicalDelta).toFixed(2))));
      newMental = Math.min(100, Math.max(0, Number((decay.newMentalFatigue + effMentalDelta).toFixed(2))));
    } else {
      newMental = Math.min(100, Math.max(0, Number(((profile?.mental_fatigue ?? 0) + effMentalDelta).toFixed(2))));
      newPhysical = Math.min(100, Math.max(0, Number(((profile?.physical_fatigue ?? 0) + effPhysicalDelta).toFixed(2))));
    }

    // 4. Calculate fatigue debuff & scaled rewards (Neural Lockout = 0% XP if Mental >= 85%)
    const fatigueStatus = getFatigueStatus(decay.newMentalFatigue, decay.newPhysicalFatigue);
    const baseXpEarned = fatigueStatus.isNeuralLockout
      ? 0
      : Math.round(quest.xp_reward * fatigueStatus.xpMultiplier);
    const finalXpDelta = baseXpEarned - fatigueDelta.drainPenaltyXp;

    const scaledAttributes: Record<string, number> = {};
    for (const [attr, val] of Object.entries(quest.attribute_rewards || {})) {
      scaledAttributes[attr] = Number(
        ((val as number) * fatigueDelta.overtimeSurgeMultiplier * attributeBoostFactor).toFixed(3)
      );
    }

    // 5. Update quest status & record completion date
    const updatePayload: Record<string, any> = {
      status: "completed",
      completed_at: new Date().toISOString(),
      last_completed_date: todayStr,
      actual_duration_minutes: duration,
    };

    let updatedQuest: any = null;
    const { data: resData, error: updateError } = await supabase
      .from("quests")
      .update(updatePayload)
      .eq("id", questId)
      .select()
      .single();

    if (updateError) {
      delete updatePayload.last_completed_date;
      const retryRes = await supabase
        .from("quests")
        .update(updatePayload)
        .eq("id", questId)
        .select()
        .single();
      if (retryRes.error) {
        throw new Error(`Failed to update quest status: ${retryRes.error.message}`);
      }
      updatedQuest = retryRes.data;
    } else {
      updatedQuest = resData;
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
    const repeatTag = options?.isRepeatSession
      ? " [REPEAT UNLOCKED: +25% Fatigue Rate & 1.25x Attribute Boost Applied]"
      : options?.isOffDaySession
      ? " [OFF-DAY UNLOCKED]"
      : "";
    const rpgRewards = await PlayerRepository.grantXpAndAttributes({
      userId,
      xpDelta: finalXpDelta,
      attrDeltas: scaledAttributes,
      sourceType: "quest_completion",
      sourceId: questId,
      notes: `Completed quest: ${quest.title}.${repeatTag} ${fatigueDelta.summaryMessage} (Fatigue: MNT ${newMental}% • PHY ${newPhysical}%)`,
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

