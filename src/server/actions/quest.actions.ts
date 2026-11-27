"use server";

import { createClient } from "@/lib/supabase/server";
import { QuestRepository } from "@/server/repositories/quest.repository";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { Quest } from "@/types";
import { revalidatePath } from "next/cache";

export async function createQuestAction(questData: Partial<Quest> & { title: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const newQuest = await QuestRepository.createQuest(user.id, questData);
  revalidatePath("/");
  revalidatePath("/quests");
  revalidatePath("/calendar");
  return newQuest;
}

export async function completeQuestAction(
  questId: string,
  actualDurationMinutes?: number,
  options?: { isRepeatSession?: boolean; isOffDaySession?: boolean }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const result = await QuestRepository.completeQuest(user.id, questId, actualDurationMinutes, options);
  revalidatePath("/");
  revalidatePath("/quests");
  revalidatePath("/calendar");
  return result;
}

export async function unlockOffDayQuestAction(questId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Deduct 10 XP as off-day early access fee
  await PlayerRepository.grantXpAndAttributes({
    userId: user.id,
    xpDelta: -10,
    attrDeltas: {},
    sourceType: "quest_completion",
    sourceId: questId,
    notes: "Unlocked off-day directive early (-10 XP access fee)",
  });

  revalidatePath("/");
  revalidatePath("/quests");
  revalidatePath("/calendar");
  return { success: true, message: "Off-day directive unlocked (-10 XP early access fee)" };
}

export async function deleteQuestAction(questId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const success = await QuestRepository.deleteQuest(user.id, questId);
  revalidatePath("/");
  revalidatePath("/quests");
  revalidatePath("/calendar");
  return success;
}

