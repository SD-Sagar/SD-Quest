"use server";

import { createClient } from "@/lib/supabase/server";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { revalidatePath } from "next/cache";

export async function allocateStatPointAction(attribute: string, points: number = 1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const result = await PlayerRepository.allocateStatPoint(user.id, attribute, points);
  revalidatePath("/");
  revalidatePath("/gym");
  return result;
}

export async function updateEquipmentPlatesAction(plates: {
  plate_5kg_count: number;
  plate_2_5kg_count: number;
  plate_2kg_count: number;
  plate_1_25kg_count: number;
  plate_1kg_count: number;
  dumbbell_handle_weight_kg?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("equipment_inventory")
    .upsert({
      user_id: user.id,
      plate_5kg_count: plates.plate_5kg_count,
      plate_2_5kg_count: plates.plate_2_5kg_count,
      plate_2kg_count: plates.plate_2kg_count,
      plate_1_25kg_count: plates.plate_1_25kg_count,
      plate_1kg_count: plates.plate_1kg_count,
      dumbbell_handle_weight_kg: plates.dumbbell_handle_weight_kg || 2.0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update equipment inventory: ${error.message}`);
  }

  revalidatePath("/settings");
  revalidatePath("/gym");
  return data;
}

export async function claimDailyMysteryBoxAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const result = await PlayerRepository.claimDailyMysteryBox(user.id);
  revalidatePath("/");
  return result;
}

export async function saveActiveSessionAction(sessionState: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  await PlayerRepository.saveActiveSession(user.id, sessionState);
}

export async function getActiveSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  const profile = await PlayerRepository.getProfile(user.id);
  return profile?.active_session_state || null;
}

export async function clearActiveSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  await PlayerRepository.clearActiveSession(user.id);
}

export async function syncFatigueOnSessionAbandonAction(physicalFatigue: number, mentalFatigue: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      physical_fatigue: Math.min(100, Math.max(0, Number(physicalFatigue.toFixed(2)))),
      mental_fatigue: Math.min(100, Math.max(0, Number(mentalFatigue.toFixed(2)))),
      last_fatigue_update_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await PlayerRepository.clearActiveSession(user.id);
  revalidatePath("/");
  revalidatePath("/gym");
}

export async function saveCustomPlanAction(dayRoutines: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  await PlayerRepository.saveCustomPlan(user.id, dayRoutines);
  revalidatePath("/gym");
  return { success: true };
}

export async function getCustomPlanAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return await PlayerRepository.getCustomPlan(user.id);
}

/**
 * Exports the Hunter's complete 30-day dossier before any granular micro-logs are pruned.
 */
export async function exportHunterDossierAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const [profile, attributes, workouts, activityLogs, nutritionLogs, hydrationLogs, measurements] =
    await Promise.all([
      PlayerRepository.getProfile(user.id),
      PlayerRepository.getAttributes(user.id),
      supabase.from("workout_sessions").select("*, workout_set_logs(*)").eq("user_id", user.id).limit(50),
      supabase.from("activity_logs").select("*").eq("user_id", user.id).limit(50),
      supabase.from("nutrition_logs").select("*").eq("user_id", user.id).limit(500),
      supabase.from("hydration_logs").select("*").eq("user_id", user.id).limit(500),
      supabase.from("body_measurements").select("*").eq("user_id", user.id).limit(50),
    ]);

  const dossier = {
    system_version: "SD-Quest v2.0 // Solo Leveling Telemetry Engine",
    exported_at: new Date().toISOString(),
    hunter: {
      name: profile?.name,
      rank: profile?.rank,
      level: profile?.current_level,
      total_xp: profile?.current_xp,
      attributes,
    },
    retention_period: "30-Day Rolling Granular Telemetry Window",
    workout_history: workouts.data || [],
    daily_activity: activityLogs.data || [],
    nutrition_history: nutritionLogs.data || [],
    hydration_history: hydrationLogs.data || [],
    body_measurements: measurements.data || [],
  };

  return { success: true, dossier };
}

/**
 * Server-safe rolling retention cleaner: cleans granular micro-logs older than 32 days
 * to keep Supabase DB within free tier without losing Level, Rank, or progression stats.
 */
export async function pruneOldGranularLogsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 32);
  const cutoffDateStr = cutoff.toISOString().split("T")[0];

  await Promise.all([
    supabase.from("hydration_logs").delete().eq("user_id", user.id).lt("log_date", cutoffDateStr),
    supabase.from("nutrition_logs").delete().eq("user_id", user.id).lt("log_date", cutoffDateStr),
  ]);

  return { success: true, prunedBefore: cutoffDateStr };
}

export async function completeSleepSessionAction(minutesSlept: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const result = await PlayerRepository.completeSleepSession(user.id, minutesSlept);
  await PlayerRepository.clearActiveSession(user.id);
  revalidatePath("/");
  revalidatePath("/quests");
  return result;
}

export async function applySleepDeprivationAction(minutesSlept: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const result = await PlayerRepository.applySleepDeprivationPenalty(user.id, minutesSlept);
  await PlayerRepository.clearActiveSession(user.id);
  revalidatePath("/");
  revalidatePath("/quests");
  return result;
}

