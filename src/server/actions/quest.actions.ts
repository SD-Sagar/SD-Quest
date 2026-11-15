"use server";

import { createClient } from "@/lib/supabase/server";
import { QuestRepository } from "@/server/repositories/quest.repository";
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
  return newQuest;
}

export async function completeQuestAction(questId: string, actualDurationMinutes?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const result = await QuestRepository.completeQuest(user.id, questId, actualDurationMinutes);
  revalidatePath("/");
  revalidatePath("/quests");
  return result;
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
  return success;
}

