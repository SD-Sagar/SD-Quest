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

  // Update physical biological fatigue based on steps & hunter endurance
  try {
    const profile = await PlayerRepository.getProfile(user.id);
    const attrs = await PlayerRepository.getAttributes(user.id);
    const physicalResistance = Math.max(
      0.35,
      1 / (1 + (Number(attrs?.endurance || 1) + Number(attrs?.vitality || 1)) * 0.006 + Math.max(0, (profile?.current_level || 1) - 1) * 0.005)
    );
    // Biological baseline: 10,000 steps = ~15.0% physical fatigue, mitigated by endurance
    const rawDelta = (params.steps / 10000) * 15.0;
    const finalPhysicalDelta = Number((rawDelta * physicalResistance).toFixed(1));
    const currentPhys = Number(profile?.physical_fatigue || 0);
    const newPhys = Math.min(100, Math.max(0, Number((currentPhys + finalPhysicalDelta).toFixed(2))));

    await supabase
      .from("profiles")
      .update({
        physical_fatigue: newPhys,
        last_fatigue_update_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } catch (err) {
    console.warn("Step fatigue update non-fatal error:", err);
  }

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

