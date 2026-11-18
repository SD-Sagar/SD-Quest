"use server";

import { createClient } from "@/lib/supabase/server";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { calculatePoisonDurationHours } from "@/lib/calculations/nutrition";
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

  // If item is a refreshing drink or beverage, trigger fatigue recovery
  const nameLower = item.food_name.toLowerCase();
  const isDrink = /drink|cold\s*drink|soft\s*drink|soda|coke|pepsi|juice|tea|coffee|shake|beverage|water/.test(nameLower);
  if (isDrink) {
    await PlayerRepository.relieveFatigue(user.id, { mental: 12.0, physical: 6.0 });
  }

  revalidatePath("/");
  revalidatePath("/diet");
  return log;
}

export async function logPresetMealAction(item: {
  log_date: string;
  food_name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost_inr?: number;
  isPoisonous?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const log = await NutritionRepository.addLog(user.id, {
    log_date: item.log_date,
    meal_type: "custom",
    food_name: item.food_name,
    serving_size: item.serving_size,
    calories: item.calories,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    cost_inr: item.cost_inr || 0,
    is_verified: true,
  });

  // If poisonous (Liquor/Alcohol), apply level-scaled poison debuff
  if (item.isPoisonous) {
    const profile = await PlayerRepository.getProfile(user.id);
    const durationHours = calculatePoisonDurationHours(profile?.current_level || 1);
    await PlayerRepository.applyPoisonDebuff(user.id, durationHours);
  } else {
    // If refreshing non-alcoholic beverage, relieve fatigue
    const nameLower = item.food_name.toLowerCase();
    const isDrink = /drink|cold\s*drink|soft\s*drink|soda|coke|pepsi|juice|tea|coffee|shake|beverage|water/.test(nameLower);
    if (isDrink) {
      await PlayerRepository.relieveFatigue(user.id, { mental: 12.0, physical: 6.0 });
    }
  }

  revalidatePath("/");
  revalidatePath("/diet");
  revalidatePath("/gym");
  return log;
}

export async function clearPoisonAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const res = await PlayerRepository.clearPoisonDebuff(user.id);
  revalidatePath("/");
  revalidatePath("/diet");
  return res;
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

