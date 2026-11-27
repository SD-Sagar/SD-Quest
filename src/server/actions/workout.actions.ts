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
  finalPhysicalFatigue?: number;
  finalMentalFatigue?: number;
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

export async function getTodaySkippingStatusAction(): Promise<{
  alreadyCompleted: boolean;
  count: number;
  source: "workout" | "quest" | "none";
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { alreadyCompleted: false, count: 0, source: "none" };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayStart = `${todayStr}T00:00:00.000Z`;

  try {
    // 1. Check if a workout completed today already cleared >= 100 skips
    const { data: workouts } = await supabase
      .from("workout_sessions")
      .select("skipping_completed, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", todayStart)
      .gte("skipping_completed", 100);

    if (workouts && workouts.length > 0) {
      const totalSkips = workouts.reduce((sum, w) => sum + (w.skipping_completed || 0), 0);
      return { alreadyCompleted: true, count: totalSkips, source: "workout" };
    }

    // 2. Check if the daily skipping quest was completed today on the quest board
    const { data: quests } = await supabase
      .from("quests")
      .select("id, title, status, last_completed_date, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .ilike("title", "%skip%");

    const completedTodayQuest = quests?.find(
      (q) =>
        q.last_completed_date === todayStr ||
        (q.completed_at && q.completed_at.startsWith(todayStr))
    );

    if (completedTodayQuest) {
      return { alreadyCompleted: true, count: 100, source: "quest" };
    }
  } catch (err) {
    console.warn("Failed to check today skipping status:", err);
  }

  return { alreadyCompleted: false, count: 0, source: "none" };
}

