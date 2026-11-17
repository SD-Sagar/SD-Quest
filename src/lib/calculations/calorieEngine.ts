/**
 * SCIE-ENGINE: 2024 Adult Compendium of Physical Activities Caloric Engine
 * 
 * Complies strictly with kcal.txt specifications:
 * - Independent of React and Supabase repositories (Unit testable)
 * - Zero rank/level multipliers, zero EPOC multipliers, zero mechanical work double-counting
 * - MET applied across full exercise blocks (active sets + rest intervals)
 * - Segregates Active Calories (net above 1 MET) vs Gross Calories (total energy)
 * - Independent skipping and cardio calculation
 * - Preserves historical parameters (bodyweight and MET)
 */

import { MetCategory } from "@/types";

export const MET_CLASSIFICATIONS: Record<MetCategory, number> = {
  general_resistance: 3.5,
  squats_deadlifts: 5.0,
  vigorous_weightlifting: 6.0,
  resistance_circuit: 5.8,
  general_bodyweight: 3.0,
  high_intensity_bodyweight: 6.5,
  skipping_rope: 11.0,
  walking_moderate: 3.5,
};

export const CALORIE_UNCERTAINTY_DISCLAIMER =
  "Caloric expenditure is an estimate based on the 2024 Adult Compendium of Physical Activities MET classifications. Individual metabolic rates vary according to body composition, movement economy, and rest intervals.";

/**
 * Gross calories:
 * (MET * 3.5 * bodyweightKg / 200) * durationMinutes
 */
export function calculateGrossCalories(params: {
  met: number;
  bodyweightKg: number;
  durationMinutes: number;
}): number {
  const { met, bodyweightKg, durationMinutes } = params;
  if (durationMinutes <= 0 || bodyweightKg <= 0 || met <= 0) return 0;
  return Number((((met * 3.5 * bodyweightKg) / 200) * durationMinutes).toFixed(1));
}

/**
 * Active calories (Net energy expenditure above baseline Resting Metabolic Rate):
 * ((MET - 1) * 3.5 * bodyweightKg / 200) * durationMinutes
 */
export function calculateActiveCalories(params: {
  met: number;
  bodyweightKg: number;
  durationMinutes: number;
}): number {
  const { met, bodyweightKg, durationMinutes } = params;
  if (durationMinutes <= 0 || bodyweightKg <= 0 || met <= 1) return 0;
  return Number(((((met - 1) * 3.5 * bodyweightKg) / 200) * durationMinutes).toFixed(1));
}

/**
 * Resolves appropriate 2024 Compendium MET category based on exercise name and target muscle.
 */
export function resolveExerciseMetCategory(
  exerciseName: string = "",
  targetMuscle: string = "",
  isCircuit: boolean = false
): MetCategory {
  if (isCircuit) return "resistance_circuit";

  const name = exerciseName.toLowerCase();
  const muscle = targetMuscle.toLowerCase();

  // Skipping
  if (name.includes("skip") || name.includes("rope")) {
    return "skipping_rope";
  }

  // Squats and Deadlifts (Lower body compound movements)
  if (
    name.includes("squat") ||
    name.includes("deadlift") ||
    name.includes("rdl") ||
    name.includes("lunge") ||
    muscle.includes("quad") ||
    muscle.includes("hamstring") ||
    muscle.includes("glute")
  ) {
    return "squats_deadlifts";
  }

  // Vigorous weightlifting (Heavy upper-body compound presses & rows)
  if (
    name.includes("bench press") ||
    name.includes("incline press") ||
    name.includes("chest press") ||
    name.includes("bent over row") ||
    name.includes("dumbbell row") ||
    name.includes("overhead press") ||
    name.includes("shoulder press")
  ) {
    return "vigorous_weightlifting";
  }

  // Bodyweight core and general calisthenics
  if (
    name.includes("hollow body") ||
    name.includes("crunch") ||
    name.includes("plank") ||
    name.includes("knee raise") ||
    muscle.includes("abs") ||
    muscle.includes("core")
  ) {
    return "general_bodyweight";
  }

  // High-intensity bodyweight
  if (
    name.includes("pushup") ||
    name.includes("push up") ||
    name.includes("burpee") ||
    name.includes("jump")
  ) {
    return "high_intensity_bodyweight";
  }

  // General resistance training (Isolation, arms, delts, calves)
  return "general_resistance";
}

export interface ExerciseBlockCalculationParams {
  exerciseName: string;
  targetMuscle?: string;
  metCategory?: MetCategory;
  durationMinutes: number;
  bodyweightKg: number;
  setsCount?: number;
  tonnageKg?: number;
}

export interface ExerciseBlockCalculationResult {
  exerciseName: string;
  metCategory: MetCategory;
  metValue: number;
  durationMinutes: number;
  bodyweightKg: number;
  activeCalories: number;
  grossCalories: number;
  setsCount: number;
  tonnageKg: number;
}

/**
 * Calculates Caloric Expenditure for an individual completed exercise block
 * (includes active set time and rest intervals per Rule 4).
 */
export function calculateExerciseBlockCalories(
  params: ExerciseBlockCalculationParams
): ExerciseBlockCalculationResult {
  const {
    exerciseName,
    targetMuscle = "",
    durationMinutes,
    bodyweightKg,
    setsCount = 0,
    tonnageKg = 0,
  } = params;

  const metCategory = params.metCategory || resolveExerciseMetCategory(exerciseName, targetMuscle);
  const metValue = MET_CLASSIFICATIONS[metCategory] || 3.5;

  const gross = calculateGrossCalories({ met: metValue, bodyweightKg, durationMinutes });
  const active = calculateActiveCalories({ met: metValue, bodyweightKg, durationMinutes });

  return {
    exerciseName,
    metCategory,
    metValue,
    durationMinutes,
    bodyweightKg,
    activeCalories: Math.round(active),
    grossCalories: Math.round(gross),
    setsCount,
    tonnageKg: Math.round(tonnageKg),
  };
}

export interface WorkoutSessionCalculationParams {
  exerciseBlocks: {
    exerciseName: string;
    targetMuscle?: string;
    metCategory?: MetCategory;
    durationMinutes: number;
    setsCount?: number;
    tonnageKg?: number;
  }[];
  skippingCount?: number;
  skippingDurationMinutes?: number;
  totalSessionDurationMinutes: number;
  bodyweightKg: number;
}

export interface WorkoutSessionCalculationResult {
  totalActiveCalories: number;
  totalGrossCalories: number;
  bodyweightKgUsed: number;
  averageMet: number;
  totalDurationMinutes: number;
  skippingActiveCalories: number;
  skippingGrossCalories: number;
  skippingMinutes: number;
  exerciseBreakdown: ExerciseBlockCalculationResult[];
  disclaimer: string;
}

/**
 * Calculates Workout Session Total Expenditure (Aggregating all exercise blocks + independent skipping)
 */
export function calculateWorkoutSessionCalories(
  params: WorkoutSessionCalculationParams
): WorkoutSessionCalculationResult {
  const {
    exerciseBlocks = [],
    skippingCount = 0,
    totalSessionDurationMinutes,
    bodyweightKg,
  } = params;

  const validWeight = Math.max(30, bodyweightKg || 70);
  const validTotalMins = Math.max(0.5, totalSessionDurationMinutes || 1);

  // 1. Calculate each exercise block
  let aggregatedBlockMinutes = 0;
  let weightedMetSum = 0;
  const breakdown: ExerciseBlockCalculationResult[] = [];

  for (const block of exerciseBlocks) {
    const blockDuration = Math.max(0.2, block.durationMinutes);
    aggregatedBlockMinutes += blockDuration;

    const res = calculateExerciseBlockCalories({
      exerciseName: block.exerciseName,
      targetMuscle: block.targetMuscle,
      metCategory: block.metCategory,
      durationMinutes: blockDuration,
      bodyweightKg: validWeight,
      setsCount: block.setsCount,
      tonnageKg: block.tonnageKg,
    });

    weightedMetSum += res.metValue * blockDuration;
    breakdown.push(res);
  }

  // 2. Skipping Rope Plyometrics (Calculated independently with 11.0 MET per Rule 7)
  // Standard skipping rate: ~100-120 skips per minute
  let skippingMinutes = params.skippingDurationMinutes || 0;
  if (skippingCount > 0 && skippingMinutes <= 0) {
    skippingMinutes = Math.max(0.2, Number((skippingCount / 100).toFixed(2)));
  }

  const skippingMet = MET_CLASSIFICATIONS.skipping_rope; // 11.0
  const skippingGross = skippingMinutes > 0
    ? calculateGrossCalories({ met: skippingMet, bodyweightKg: validWeight, durationMinutes: skippingMinutes })
    : 0;
  const skippingActive = skippingMinutes > 0
    ? calculateActiveCalories({ met: skippingMet, bodyweightKg: validWeight, durationMinutes: skippingMinutes })
    : 0;

  // 3. Normalize or distribute session time if blocks were not individually timed
  let totalActiveKcal = 0;
  let totalGrossKcal = 0;

  if (breakdown.length > 0) {
    totalActiveKcal = breakdown.reduce((sum, b) => sum + b.activeCalories, 0) + Math.round(skippingActive);
    totalGrossKcal = breakdown.reduce((sum, b) => sum + b.grossCalories, 0) + Math.round(skippingGross);
  } else {
    // Single general resistance session fallback
    const fallbackMet = 4.5;
    totalGrossKcal = Math.round(
      calculateGrossCalories({ met: fallbackMet, bodyweightKg: validWeight, durationMinutes: validTotalMins }) +
      skippingGross
    );
    totalActiveKcal = Math.round(
      calculateActiveCalories({ met: fallbackMet, bodyweightKg: validWeight, durationMinutes: validTotalMins }) +
      skippingActive
    );
  }

  const totalEffectiveMinutes = aggregatedBlockMinutes + skippingMinutes;
  const averageMet = totalEffectiveMinutes > 0
    ? Number(((weightedMetSum + skippingMet * skippingMinutes) / totalEffectiveMinutes).toFixed(2))
    : 4.0;

  return {
    totalActiveCalories: Math.max(1, totalActiveKcal),
    totalGrossCalories: Math.max(1, totalGrossKcal),
    bodyweightKgUsed: validWeight,
    averageMet,
    totalDurationMinutes: Number((totalEffectiveMinutes || validTotalMins).toFixed(1)),
    skippingActiveCalories: Math.round(skippingActive),
    skippingGrossCalories: Math.round(skippingGross),
    skippingMinutes,
    exerciseBreakdown: breakdown,
    disclaimer: CALORIE_UNCERTAINTY_DISCLAIMER,
  };
}

/**
 * Calculates Caloric Expenditure from Walking & Daily Steps (Independent cardio at 3.5 MET)
 */
export function calculateWalkingCalories(params: {
  steps: number;
  bodyweightKg?: number;
  heightCm?: number;
  walkingMinutes?: number;
}): {
  distanceKm: number;
  walkingMinutes: number;
  activeCalories: number;
  grossCalories: number;
  disclaimer: string;
} {
  const { steps, bodyweightKg = 70, heightCm = 175 } = params;
  const validWeight = Math.max(30, bodyweightKg);
  const validHeight = Math.max(120, heightCm);

  // Stride length formula: height (cm) * 0.415
  const strideMeters = (validHeight * 0.415) / 100;
  const distanceKm = Number(((steps * strideMeters) / 1000).toFixed(2));

  // Cadence: ~100 steps per minute at moderate 4.8 km/h pace
  const walkingMinutes = params.walkingMinutes && params.walkingMinutes > 0
    ? params.walkingMinutes
    : Math.max(1, Math.round(steps / 100));

  const walkingMet = MET_CLASSIFICATIONS.walking_moderate; // 3.5 MET
  const gross = calculateGrossCalories({ met: walkingMet, bodyweightKg: validWeight, durationMinutes: walkingMinutes });
  const active = calculateActiveCalories({ met: walkingMet, bodyweightKg: validWeight, durationMinutes: walkingMinutes });

  return {
    distanceKm,
    walkingMinutes,
    activeCalories: Math.round(active),
    grossCalories: Math.round(gross),
    disclaimer: CALORIE_UNCERTAINTY_DISCLAIMER,
  };
}
