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

