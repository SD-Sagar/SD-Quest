import { createClient } from "@/lib/supabase/server";
import { EquipmentInventory, WorkoutSession, WorkoutSetLog, ExerciseDefinition, TrainingSplitDay } from "@/types";
import { getExerciseDumbbellMultiplier } from "@/lib/calculations/gym";
import { PlayerRepository } from "./player.repository";

export class WorkoutRepository {
  static async getEquipment(userId: string): Promise<EquipmentInventory | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("equipment_inventory")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch equipment inventory: ${error.message}`);
    }

    return data as EquipmentInventory;
  }

  static async upsertEquipment(userId: string, equipment: Partial<EquipmentInventory>): Promise<EquipmentInventory> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("equipment_inventory")
      .upsert({
        user_id: userId,
        has_bench: equipment.has_bench ?? true,
        bench_positions: equipment.bench_positions || [
          "Flat",
          "Incline 15°",
          "Incline 30°",
          "Incline 45°",
          "Incline 60°",
          "Incline 75°",
          "Seated 90°",
          "Decline",
        ],
        dumbbell_handle_weight_kg: equipment.dumbbell_handle_weight_kg ?? 2.0,
        plate_5kg_count: equipment.plate_5kg_count ?? 8,
        plate_2_5kg_count: equipment.plate_2_5kg_count ?? 4,
        plate_2kg_count: equipment.plate_2kg_count ?? 4,
        plate_1_25kg_count: equipment.plate_1_25kg_count ?? 8,
        plate_1kg_count: equipment.plate_1kg_count ?? 4,
        custom_plates: equipment.custom_plates || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update equipment inventory: ${error.message}`);
    }

    return data as EquipmentInventory;
  }

  static async getExerciseCatalog(): Promise<ExerciseDefinition[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exercise_catalog")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch exercise catalog: ${error.message}`);
    }

    return (data || []) as ExerciseDefinition[];
  }

  static async getWorkoutSessions(userId: string, limit = 30): Promise<WorkoutSession[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch workout sessions: ${error.message}`);
    }

    return ((data || []) as any[]).map((s) => {
      const parsedKcal = s.notes?.match(/\[KCAL:(\d+)\]/)?.[1];
      const parsedNum = parsedKcal ? parseInt(parsedKcal, 10) : 0;
      const cal =
        s.calories_burned && Number(s.calories_burned) > 0
          ? Number(s.calories_burned)
          : parsedNum > 0
          ? parsedNum
          : Math.round((s.total_tonnage_kg || 0) * 0.045 + (s.duration_minutes || 0) * 5);

      return {
        ...s,
        calories_burned: cal,
      } as WorkoutSession;
    });
  }

  static async getTodaysCompletedWorkouts(userId: string): Promise<WorkoutSession[]> {
    const supabase = await createClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*, workout_set_logs(*)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("completed_at", twentyFourHoursAgo.toISOString())
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch today's workout sessions:", error);
      return [];
    }

    return ((data || []) as any[]).map((s) => {
      const parsedKcal = s.notes?.match(/\[KCAL:(\d+)\]/)?.[1];
      const parsedNum = parsedKcal ? parseInt(parsedKcal, 10) : 0;
      const cal =
        s.calories_burned && Number(s.calories_burned) > 0
          ? Number(s.calories_burned)
          : parsedNum > 0
          ? parsedNum
          : Math.round((s.total_tonnage_kg || 0) * 0.045 + (s.duration_minutes || 0) * 5);

      return {
        ...s,
        calories_burned: cal,
      } as WorkoutSession;
    });
  }

  static async saveCompletedWorkout(params: {
    userId: string;
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
  }): Promise<{ session: WorkoutSession; rpgRewards: any; caloriesBurned: number }> {
    const supabase = await createClient();

    // 1. Calculate actual tonnage from sets based on realistic dumbbell count (pair vs single vs bodyweight)
    let totalTonnageKg = 0;
    for (const s of params.sets) {
      const multiplier = getExerciseDumbbellMultiplier(s.exercise_name);
      totalTonnageKg += s.weight_kg * s.reps * multiplier;
    }

    const finalCaloriesBurned = params.caloriesBurned || Math.round(totalTonnageKg * 0.045 + params.durationMinutes * 5);

    let sessionNotes = params.notes || "";
    if (params.isSingleExercise && !sessionNotes.includes("[SOLO_TRIAL]")) {
      sessionNotes = `${sessionNotes} [SOLO_TRIAL]`.trim();
    }
    sessionNotes = `${sessionNotes} [KCAL:${finalCaloriesBurned}]`.trim();

    // 2. Insert session record with resilient column fallback
    const insertPayload: any = {
      user_id: params.userId,
      split_day: params.splitDay,
      title: params.title,
      target_muscles: params.targetMuscles,
      duration_minutes: params.durationMinutes,
      total_tonnage_kg: Math.round(totalTonnageKg),
      skipping_target: params.skippingTarget,
      skipping_completed: params.skippingCompleted,
      calories_burned: finalCaloriesBurned,
      status: "completed",
      notes: sessionNotes,
      started_at: new Date(Date.now() - params.durationMinutes * 60000).toISOString(),
      completed_at: new Date().toISOString(),
    };

    let session: any = null;
    let sessionError: any = null;

    const firstTry = await supabase
      .from("workout_sessions")
      .insert(insertPayload)
      .select()
      .single();

    if (firstTry.error && firstTry.error.message?.includes("calories_burned")) {
      delete insertPayload.calories_burned;
      const secondTry = await supabase
        .from("workout_sessions")
        .insert(insertPayload)
        .select()
        .single();
      session = secondTry.data;
      sessionError = secondTry.error;
    } else {
      session = firstTry.data;
      sessionError = firstTry.error;
    }

    if (sessionError || !session) {
      throw new Error(`Failed to save workout session: ${sessionError?.message}`);
    }

    // 3. Insert individual set logs
    if (params.sets.length > 0) {
      const setRecords = params.sets.map((s, index) => ({
        session_id: session.id,
        user_id: params.userId,
        exercise_name: s.exercise_name,
        target_muscle: s.target_muscle,
        set_number: index + 1,
        weight_kg: s.weight_kg,
        reps: s.reps,
        rpe: s.rpe || null,
        bench_angle: s.bench_angle || null,
        plate_breakdown: s.plate_breakdown || null,
        completed: s.completed ?? true,
      }));

      const { error: setsError } = await supabase
        .from("workout_set_logs")
        .insert(setRecords);

      if (setsError) {
        console.error("Failed to insert workout set logs:", setsError);
      }
    }

    // 4. Calculate calibrated real-life RPG rewards with extra work multiplier support
    let xpBase = params.isSingleExercise ? 25 : 85;
    const tonnageBonusXp = Math.min(25, Math.floor(totalTonnageKg / 300));
    const skipBonusXp = params.skippingCompleted >= params.skippingTarget ? 15 : 0;
    const speedBonusXp = params.completedEarly ? 15 : 0;
    const skipPenaltyXp = (params.skippedCount || 0) * 15;
    
    let totalXp = Math.max(15, xpBase + tonnageBonusXp + skipBonusXp + speedBonusXp - skipPenaltyXp);

    // Apply Extra Workout Multiplier if beyond daily quota
    if (params.extraWorkoutMultiplier) {
      totalXp = Math.max(10, Math.round(totalXp * params.extraWorkoutMultiplier));
    }

    const disPenalty = (params.skippedCount || 0) * 0.10;
    const attrMultiplier = params.extraWorkoutMultiplier || 1.0;

    const attrDeltas: Record<string, number> = {
      strength: Number((0.35 * attrMultiplier).toFixed(2)),
      discipline: Number((Math.max(0.05, 0.20 - disPenalty) * attrMultiplier).toFixed(2)),
      vitality: Number((0.15 * attrMultiplier).toFixed(2)),
    };

    if (params.skippingCompleted >= params.skippingTarget) {
      attrDeltas.agility = (attrDeltas.agility || 0) + Number((0.20 * attrMultiplier).toFixed(2));
    }

    if (params.completedEarly) {
      attrDeltas.agility = (attrDeltas.agility || 0) + 0.10;
      attrDeltas.discipline = (attrDeltas.discipline || 0) + 0.10;
    }

    // 5. Grant rewards securely via server transaction
    const rpgRewards = await PlayerRepository.grantXpAndAttributes({
      userId: params.userId,
      xpDelta: totalXp,
      attrDeltas,
      sourceType: "workout",
      sourceId: session.id,
      notes: `Cleared workout: ${params.title} (${Math.round(totalTonnageKg)}kg • ${finalCaloriesBurned} kcal${params.extraWorkoutMultiplier ? ` • Extra Multiplier: ${params.extraWorkoutMultiplier}x` : ""})`,
    });

    // 6. Clear cross-device active session in Supabase
    await PlayerRepository.clearActiveSession(params.userId);

    return {
      session: {
        ...session,
        calories_burned: finalCaloriesBurned,
      } as WorkoutSession,
      rpgRewards,
      caloriesBurned: finalCaloriesBurned,
    };
  }
}

