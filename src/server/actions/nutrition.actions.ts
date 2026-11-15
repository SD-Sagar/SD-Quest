"use server";

import { createClient } from "@/lib/supabase/server";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { MealType, DailyNutritionTargets } from "@/types";
import { revalidatePath } from "next/cache";

export async function logMealAction(item: {
  log_date: string;
  meal_type: MealType;
  food_name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost_inr?: number;
  is_verified?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const log = await NutritionRepository.addLog(user.id, item);
  revalidatePath("/");
  revalidatePath("/diet");
  return log;
}

export async function deleteMealLogAction(logId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const success = await NutritionRepository.deleteLog(user.id, logId);
  revalidatePath("/");
  revalidatePath("/diet");
  return success;
}

export async function updateNutritionTargetsAction(targets: Partial<DailyNutritionTargets>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const updated = await NutritionRepository.upsertTargets(user.id, targets);
  revalidatePath("/");
  revalidatePath("/diet");
  return updated;
}

