"use server";

import { createClient } from "@/lib/supabase/server";
import { ActivityRepository } from "@/server/repositories/activity.repository";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { revalidatePath } from "next/cache";

export async function logDailyActivityAction(params: {
  log_date: string;
  steps: number;
  walking_duration_minutes?: number;
  distance_km?: number;
  estimated_calories_burned?: number;
  source?: "manual" | "device_synced";
  notes?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const activity = await ActivityRepository.upsertActivity(user.id, params);

  // If daily steps target met (e.g. >= 6000 steps), award endurance and discipline XP
  if (params.steps >= 6000) {
    await PlayerRepository.grantXpAndAttributes({
      userId: user.id,
      xpDelta: 40,
      attrDeltas: { endurance: 0.15, discipline: 0.10 },
      sourceType: "habit",
      sourceId: activity.id,
      notes: `Hit step goal: ${params.steps.toLocaleString()} steps logged`,
    });
  }

  revalidatePath("/");
  return activity;
}

