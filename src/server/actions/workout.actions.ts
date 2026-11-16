"use server";

import { createClient } from "@/lib/supabase/server";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { WorkoutSession, WorkoutSetLog, EquipmentInventory } from "@/types";
import { revalidatePath } from "next/cache";

export async function finishWorkoutAction(params: {
  splitDay: WorkoutSession["split_day"];
  title: string;
  targetMuscles: string;
  durationMinutes: number;
  targetDurationMinutes?: number;
  completedEarly?: boolean;
  skippingTarget: number;
  skippingCompleted: number;
  skippedCount?: number;
  caloriesBurned?: number;
  isExtraWorkout?: boolean;
  extraWorkoutMultiplier?: number;
  isSingleExercise?: boolean;
  notes?: string;
  sets: Omit<WorkoutSetLog, "id" | "session_id" | "user_id" | "created_at">[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const result = await WorkoutRepository.saveCompletedWorkout({
    userId: user.id,
    ...params,
  });

  revalidatePath("/");
  revalidatePath("/gym");
  revalidatePath("/quests");
  revalidatePath("/calendar");
  revalidatePath("/body");
  return result;
}

export async function getTodaysWorkoutsAction(): Promise<WorkoutSession[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];
  return await WorkoutRepository.getTodaysCompletedWorkouts(user.id);
}

export async function updateEquipmentAction(equipmentData: Partial<EquipmentInventory>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updated = await WorkoutRepository.upsertEquipment(user.id, equipmentData);
  revalidatePath("/");
  revalidatePath("/gym");
  return updated;
}

