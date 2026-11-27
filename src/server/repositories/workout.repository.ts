import { createClient } from "@/lib/supabase/server";
import { EquipmentInventory, WorkoutSession, WorkoutSetLog, ExerciseDefinition, TrainingSplitDay } from "@/types";
import { getExerciseDumbbellMultiplier, calculateIntelligentWorkoutRewards } from "@/lib/calculations/gym";
import { calculateSessionFatigueDelta, calculatePassiveFatigueDecay } from "@/lib/calculations/fatigue";
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

    const equip = data as EquipmentInventory;
    if (equip && equip.has_leg_developer === undefined) {
      try {
        const { data: prof } = await supabase.from("profiles").select("active_session_state").eq("id", userId).single();
        if (prof?.active_session_state?.has_leg_developer !== undefined) {
          equip.has_leg_developer = Boolean(prof.active_session_state.has_leg_developer);
        }
      } catch {}
    }

    return equip;
  }

  static async upsertEquipment(userId: string, equipment: Partial<EquipmentInventory>): Promise<EquipmentInventory> {
    const supabase = await createClient();
    const payload: Record<string, any> = {
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
      plate_10kg_count: equipment.plate_10kg_count ?? 0,
      has_barbell: equipment.has_barbell ?? false,
      barbell_weight_kg: equipment.barbell_weight_kg ?? 7.0,
      has_ez_bar: equipment.has_ez_bar ?? false,
      ez_bar_weight_kg: equipment.ez_bar_weight_kg ?? 5.0,
      has_cable_pulley: equipment.has_cable_pulley ?? false,
      has_leg_developer: equipment.has_leg_developer ?? false,
      plate_5kg_count: equipment.plate_5kg_count ?? 8,
      plate_2_5kg_count: equipment.plate_2_5kg_count ?? 4,
      plate_2kg_count: equipment.plate_2kg_count ?? 4,
      plate_1_25kg_count: equipment.plate_1_25kg_count ?? 8,
      plate_1kg_count: equipment.plate_1kg_count ?? 4,
      custom_plates: equipment.custom_plates || [],
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("equipment_inventory")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error && error.message.toLowerCase().includes("column")) {
      delete payload.has_leg_developer;
      delete payload.plate_10kg_count;
      delete payload.has_barbell;
      delete payload.barbell_weight_kg;
      delete payload.has_ez_bar;
      delete payload.ez_bar_weight_kg;
      delete payload.has_cable_pulley;
      const retry = await supabase
        .from("equipment_inventory")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Failed to update equipment inventory: ${error.message}`);
    }

    // Resilient sync of extended equipment flags to active_session_state
    try {
      const { data: prof } = await supabase.from("profiles").select("active_session_state").eq("id", userId).single();
      const sessionState = prof?.active_session_state || {};
      sessionState.has_leg_developer = equipment.has_leg_developer ?? false;
      sessionState.has_barbell = equipment.has_barbell ?? false;
      sessionState.has_ez_bar = equipment.has_ez_bar ?? false;
      sessionState.has_cable_pulley = equipment.has_cable_pulley ?? false;
      await supabase.from("profiles").update({ active_session_state: sessionState }).eq("id", userId);
    } catch {}

    const result = data as EquipmentInventory;
    if (result && equipment.has_leg_developer !== undefined) {
      result.has_leg_developer = equipment.has_leg_developer;
    }

    return result;
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
    finalPhysicalFatigue?: number;
    finalMentalFatigue?: number;
  }): Promise<{ session: WorkoutSession; rpgRewards: any; caloriesBurned: number }> {
    const supabase = await createClient();

    // 1. Calculate actual tonnage from sets based on realistic dumbbell count (pair vs single vs bodyweight)
    let totalTonnageKg = 0;
    for (const s of params.sets) {
      const multiplier = getExerciseDumbbellMultiplier(s.exercise_name);
      totalTonnageKg += s.weight_kg * s.reps * multiplier;
    }

    // Scientific Calorie Expenditure (2024 Adult Compendium of Physical Activities MET)
    const defaultMet = 4.0;
    const finalCaloriesBurned =
      params.caloriesBurned ??
      Math.round((((defaultMet - 1) * 3.5 * 70) / 200) * params.durationMinutes);

    let sessionNotes = params.notes || "";
    if (params.isSingleExercise && !sessionNotes.includes("[SOLO_TRIAL]")) {
      sessionNotes = `${sessionNotes} [SOLO_TRIAL]`.trim();
    }
    if (!sessionNotes.includes("[KCAL_ACTIVE:")) {
      sessionNotes = `${sessionNotes} [KCAL_ACTIVE:${finalCaloriesBurned}]`.trim();
    }

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

    // 4. Calculate calibrated real-life RPG rewards with extra work multiplier and heavy load support
    const maxWorkingWeightKg = params.sets.length > 0 ? Math.max(0, ...params.sets.map((s) => s.weight_kg || 0)) : 10;
    const totalRepsCount = params.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
    const totalSetsCount = params.sets.length;

    const { totalXp, attrDeltas } = calculateIntelligentWorkoutRewards({
      isSingleExercise: params.isSingleExercise,
      totalTonnageKg,
      maxWorkingWeightKg,
      totalSetsCount,
      totalRepsCount,
      skippedCount: params.skippedCount,
      skippingCompleted: params.skippingCompleted,
      skippingTarget: params.skippingTarget,
      completedEarly: params.completedEarly,
      extraWorkoutMultiplier: params.extraWorkoutMultiplier,
      targetMusclesTrained: params.targetMuscles || "",
    });

    // 5. Grant rewards securely via server transaction
    const rpgRewards = await PlayerRepository.grantXpAndAttributes({
      userId: params.userId,
      xpDelta: totalXp,
      attrDeltas,
      sourceType: "workout",
      sourceId: session.id,
      notes: `Cleared workout: ${params.title} (${Math.round(totalTonnageKg)}kg • ${finalCaloriesBurned} kcal${params.extraWorkoutMultiplier ? ` • Extra Multiplier: ${params.extraWorkoutMultiplier}x` : ""})`,
    });

    // 5.5 Update Biological Fatigue Telemetry
    try {
      let newMental = 0;
      let newPhysical = 0;

      if (params.finalPhysicalFatigue !== undefined) {
        newPhysical = Math.min(100, Math.max(0, Number(params.finalPhysicalFatigue.toFixed(2))));
        newMental = Math.min(100, Math.max(0, Number((params.finalMentalFatigue ?? 0).toFixed(2))));
      } else {
        const profile = await PlayerRepository.getProfile(params.userId);
        const attrs = await PlayerRepository.getAttributes(params.userId);
        const decay = calculatePassiveFatigueDecay(
          profile?.last_fatigue_update_at,
          profile?.mental_fatigue,
          profile?.physical_fatigue,
          undefined,
          {
            hunterLevel: profile?.current_level,
            rank: profile?.rank,
            vitality: attrs?.vitality,
            endurance: attrs?.endurance,
            mentality: attrs?.mentality,
            discipline: attrs?.discipline,
            lastHydrationSurgeAt: profile?.last_hydration_surge_at,
          }
        );

        const fatigueDelta = calculateSessionFatigueDelta({
          durationMinutes: params.durationMinutes,
          targetMinutes: params.durationMinutes,
          isFun: false,
          linkedAttributes: ["strength", "endurance", "vitality", "agility"],
          category: "fitness",
          currentMentalFatigue: decay.newMentalFatigue,
          currentPhysicalFatigue: decay.newPhysicalFatigue,
          intensityMultiplier: (params.extraWorkoutMultiplier && params.extraWorkoutMultiplier < 1.0 ? 1.5 : 1.0),
          hunterLevel: profile?.current_level,
          endurance: attrs?.endurance,
          vitality: attrs?.vitality,
          discipline: attrs?.discipline,
          mentality: attrs?.mentality,
          actualTonnageKg: totalTonnageKg,
          plannedTonnageKg: totalTonnageKg,
        });

        newMental = Math.min(100, Math.max(0, Number((decay.newMentalFatigue + fatigueDelta.mentalDelta).toFixed(2))));
        newPhysical = Math.min(100, Math.max(0, Number((decay.newPhysicalFatigue + fatigueDelta.physicalDelta).toFixed(2))));
      }

      await supabase
        .from("profiles")
        .update({
          mental_fatigue: newMental,
          physical_fatigue: newPhysical,
          last_fatigue_update_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.userId);
    } catch (fatigueErr) {
      console.warn("Biological fatigue telemetry update non-fatal error:", fatigueErr);
    }

    // 5.6 Bi-directional bridge: Synchronize skipping completion to Quest Board
    if ((params.skippingCompleted || 0) >= (params.skippingTarget || 100) && (params.skippingCompleted || 0) >= 100) {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        // Find matching daily skipping quest
        const { data: skipQuests } = await supabase
          .from("quests")
          .select("id, title, status, last_completed_date")
          .eq("user_id", params.userId)
          .ilike("title", "%skip%");

        if (skipQuests && skipQuests.length > 0) {
          const targetIds = skipQuests.map((q) => q.id);
          await supabase
            .from("quests")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              last_completed_date: todayStr,
              updated_at: new Date().toISOString(),
            })
            .in("id", targetIds);
        }
      } catch (skipBridgeErr) {
        console.warn("Failed to bridge gym skipping completion to quest board:", skipBridgeErr);
      }
    }

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

