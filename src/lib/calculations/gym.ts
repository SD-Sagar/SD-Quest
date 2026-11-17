import { EquipmentInventory, EquipmentPlate, HunterRank } from "@/types";
import {
  calculateWorkoutSessionCalories,
  calculateWalkingCalories,
  resolveExerciseMetCategory,
  CALORIE_UNCERTAINTY_DISCLAIMER,
} from "./calorieEngine";

export interface PlateCombinationResult {
  achievableWeightKg: number;
  isExact: boolean;
  platesPerSide: { weightKg: number; count: number }[];
  summaryString: string;
}

/**
 * Calculates the exact plates required per side of a dumbbell handle to reach or approximate target weight.
 * Remember: A dumbbell is symmetric. Plates placed on side A must be mirrored on side B.
 * If dualDumbbells = true, available plate inventory is halved between the two handles.
 */
export function calculateDumbbellPlates(
  targetTotalWeightKg: number,
  inventory: EquipmentInventory,
  dualDumbbells: boolean = true
): PlateCombinationResult {
  const handleWeight = Number(inventory.dumbbell_handle_weight_kg) || 2.0;
  const targetPlatesWeight = Math.max(0, targetTotalWeightKg - handleWeight);
  // Each dumbbell has 2 ends (sides). So target weight for one side:
  const targetPerSide = targetPlatesWeight / 2;

  // Available plates per side:
  // If dual dumbbells (2 DBs = 4 sides total), divide plate count by 4.
  // If single dumbbell (1 DB = 2 sides total), divide plate count by 2.
  const divisor = dualDumbbells ? 4 : 2;

  // Build full inventory of available plates
  const availablePlates: EquipmentPlate[] = [
    { weightKg: 5.0, count: inventory.plate_5kg_count || 0 },
    { weightKg: 2.5, count: inventory.plate_2_5kg_count || 0 },
    { weightKg: 2.0, count: inventory.plate_2kg_count || 0 },
    { weightKg: 1.25, count: inventory.plate_1_25kg_count || 0 },
    { weightKg: 1.0, count: inventory.plate_1kg_count || 0 },
    ...(inventory.custom_plates || []),
  ];

  // Sort available plates from largest to smallest for greedy fit
  const sortedPlates = availablePlates
    .filter((p) => p.count >= divisor && p.weightKg > 0)
    .sort((a, b) => b.weightKg - a.weightKg);

  let currentPerSide = 0;
  const platesPerSide: { weightKg: number; count: number }[] = [];

  // Greedy plate solver
  for (const plate of sortedPlates) {
    const maxUsablePerSide = Math.floor(plate.count / divisor);
    const neededPerSide = Math.floor(
      (targetPerSide - currentPerSide + 0.001) / plate.weightKg
    );
    const take = Math.min(maxUsablePerSide, neededPerSide);

    if (take > 0) {
      platesPerSide.push({ weightKg: plate.weightKg, count: take });
      currentPerSide += take * plate.weightKg;
    }
  }

  const achievableTotalPerDumbbell = Number(
    (handleWeight + currentPerSide * 2).toFixed(2)
  );
  const isExact = Math.abs(achievableTotalPerDumbbell - targetTotalWeightKg) < 0.1;

  // Build summary text
  const breakdownParts = platesPerSide.map(
    (p) => `${p.count}×${p.weightKg}kg`
  );
  const summaryString =
    breakdownParts.length > 0
      ? `Handle (${handleWeight}kg) + [${breakdownParts.join(" + ")}] per side`
      : `Bare Handle (${handleWeight}kg)`;

  return {
    achievableWeightKg: achievableTotalPerDumbbell,
    isExact,
    platesPerSide,
    summaryString,
  };
}

/**
 * Double Progression Rule (Section 7.3 of gym.txt)
 */
export function checkDoubleProgression(
  sets: { actualReps: number; targetRepsMax: number; rpe?: number }[],
  currentWeightKg: number,
  nextAchievableWeightKg: number
): {
  recommendation: "increase_weight" | "maintain_weight" | "deload_suggested";
  recommendedWeightKg: number;
  reason: string;
} {
  const allHitCeiling = sets.every((s) => s.actualReps >= s.targetRepsMax);
  const averageRpe =
    sets.reduce((sum, s) => sum + (s.rpe || 8), 0) / (sets.length || 1);

  if (allHitCeiling && averageRpe <= 8.5) {
    return {
      recommendation: "increase_weight",
      recommendedWeightKg: nextAchievableWeightKg,
      reason: `All sets achieved target ceiling (${sets[0].targetRepsMax} reps) with sub-maximal exertion. Ready to progress load.`,
    };
  }

  if (averageRpe >= 9.5) {
    return {
      recommendation: "deload_suggested",
      recommendedWeightKg: currentWeightKg,
      reason: `High perceived exertion detected (RPE ${averageRpe.toFixed(1)}). Maintain current load or prepare for a deload week.`,
    };
  }

  return {
    recommendation: "maintain_weight",
    recommendedWeightKg: currentWeightKg,
    reason: `Continue consolidating volume at ${currentWeightKg}kg until all sets hit target rep ceiling.`,
  };
}

/**
 * Detects whether an exercise uses a pair of dumbbells, single dumbbell, or bodyweight.
 */
export function getExerciseDumbbellMultiplier(exerciseName: string = ""): number {
  const name = exerciseName.toLowerCase();

  // Pure bodyweight / core calisthenics (external load is 0 or 1 plate held)
  if (
    name.includes("hollow body") ||
    name.includes("accordion crunch") ||
    name.includes("hanging knee") ||
    name.includes("push up") ||
    name.includes("pushup") ||
    (name.includes("crunch") && !name.includes("dumbbell")) ||
    name.includes("plank")
  ) {
    return 1;
  }

  // Single dumbbell movements
  if (
    name.includes("sumo squat") ||
    name.includes("goblet squat") ||
    name.includes("pullover") ||
    name.includes("crunch pulse") ||
    (name.includes("tricep extension") && !name.includes("pair")) ||
    name.includes("single arm") ||
    name.includes("one arm")
  ) {
    return 1;
  }

  // Default: Pair of dumbbells (e.g. DB Bench Press, Incline DB Press, DB Rows, DB Curls, DB Lunges)
  return 2;
}

/**
 * Scientifically Grounded Calorie Engine (2024 Adult Compendium of Physical Activities)
 * Strictly fulfills kcal.txt:
 * - Decoupled from arbitrary rank/XP multipliers (Rule 11)
 * - Zero mechanical tonnage double-counting (Rule 10)
 * - MET applied to full exercise block duration including rest intervals (Rule 4)
 * - Calculates Active Calories (primary) and Gross Calories (secondary) (Rule 6, 44)
 * - Independent skipping calculation (Rule 7)
 */
export function calculateAccurateWorkoutCalories(params: {
  durationSeconds: number;
  heightCm?: number;
  weightKg: number;
  playerLevel?: number;
  playerRank?: HunterRank;
  sets: { weightKg: number; reps: number; exerciseName?: string; targetMuscle?: string }[];
  skippingCount?: number;
}): {
  totalCaloriesBurned: number; // Active calories (primary for dashboard & net burn per Rule 44)
  activeCaloriesBurned: number;
  grossCaloriesBurned: number;
  skippingKcal: number;
  tonnageMovedKg: number;
  averageMet: number;
  exerciseBreakdown: {
    exerciseName: string;
    setsCount: number;
    tonnageKg: number;
    caloriesBurned: number; // Active calories
    grossCaloriesBurned: number;
  }[];
  disclaimer: string;
} {
  const {
    durationSeconds,
    weightKg = 70,
    sets = [],
    skippingCount = 0,
  } = params;

  let totalTonnageKg = 0;
  // Group sets by exercise name to construct exercise blocks
  const exerciseMap = new Map<string, { targetMuscle: string; setsCount: number; tonnageKg: number }>();

  for (const s of sets) {
    const exName = s.exerciseName || "Exercise Movement";
    const multiplier = getExerciseDumbbellMultiplier(exName);
    const effectiveLoad = s.weightKg * multiplier;
    const setTonnage = effectiveLoad * s.reps;
    totalTonnageKg += setTonnage;

    const existing = exerciseMap.get(exName) || {
      targetMuscle: s.targetMuscle || "",
      setsCount: 0,
      tonnageKg: 0,
    };
    exerciseMap.set(exName, {
      targetMuscle: s.targetMuscle || existing.targetMuscle,
      setsCount: existing.setsCount + 1,
      tonnageKg: existing.tonnageKg + setTonnage,
    });
  }

  const totalDurationMinutes = Math.max(0.5, durationSeconds / 60);
  const totalSetsCount = Math.max(1, sets.length);

  // Divide session duration proportionately across exercises based on set volume
  const exerciseBlocks = Array.from(exerciseMap.entries()).map(([name, data]) => {
    const fractionOfSets = data.setsCount / totalSetsCount;
    const blockMinutes = Math.max(0.2, Number((totalDurationMinutes * fractionOfSets).toFixed(2)));
    const metCategory = resolveExerciseMetCategory(name, data.targetMuscle);

    return {
      exerciseName: name,
      targetMuscle: data.targetMuscle,
      metCategory,
      durationMinutes: blockMinutes,
      setsCount: data.setsCount,
      tonnageKg: Math.round(data.tonnageKg),
    };
  });

  const sessionResult = calculateWorkoutSessionCalories({
    exerciseBlocks,
    skippingCount,
    totalSessionDurationMinutes: totalDurationMinutes,
    bodyweightKg: weightKg,
  });

  return {
    totalCaloriesBurned: sessionResult.totalActiveCalories,
    activeCaloriesBurned: sessionResult.totalActiveCalories,
    grossCaloriesBurned: sessionResult.totalGrossCalories,
    skippingKcal: sessionResult.skippingActiveCalories,
    tonnageMovedKg: Math.round(totalTonnageKg),
    averageMet: sessionResult.averageMet,
    exerciseBreakdown: sessionResult.exerciseBreakdown.map((b) => ({
      exerciseName: b.exerciseName,
      setsCount: b.setsCount,
      tonnageKg: b.tonnageKg,
      caloriesBurned: b.activeCalories,
      grossCaloriesBurned: b.grossCalories,
    })),
    disclaimer: sessionResult.disclaimer,
  };
}

/**
 * Calculates Caloric Expenditure from Daily Walking & Steps (2024 Compendium 3.5 MET)
 */
export function calculateStepsCalories(
  steps: number,
  weightKg: number = 70,
  heightCm: number = 175
): { distanceKm: number; caloriesBurned: number; grossCaloriesBurned: number } {
  const result = calculateWalkingCalories({ steps, bodyweightKg: weightKg, heightCm });
  return {
    distanceKm: result.distanceKm,
    caloriesBurned: result.activeCalories,
    grossCaloriesBurned: result.grossCalories,
  };
}

/**
 * Generates Rank-Differentiated Over-Training & Volume Warnings
 */
export function getRankVolumeWarning(params: {
  playerRank: HunterRank;
  playerLevel: number;
  totalSetsToday: number;
  isExtraWorkout: boolean;
  exerciseName?: string;
}): {
  severity: "none" | "caution" | "hazard" | "spartan_pass";
  title: string;
  message: string;
  allowProceed: boolean;
} {
  const { playerRank, playerLevel, totalSetsToday, isExtraWorkout } = params;

  if (playerRank === "Spartan" || playerLevel >= 40) {
    return {
      severity: "spartan_pass",
      title: "SPARTAN RESILIENCE // THRESHOLD EXPANDED",
      message: "The System acknowledges elite Spartan conditioning. Work capacity limiters deactivated. Caloric burn multiplier engaged.",
      allowProceed: true,
    };
  }

  if (playerRank === "Recruit" || playerLevel <= 4) {
    if (isExtraWorkout || totalSetsToday >= 15) {
      return {
        severity: "hazard",
        title: "SYSTEM WARNING: HIGH VOLUME HAZARD (RECRUIT RANK)",
        message: "Your central nervous system and tendon attachments are still in Awakening adaptation. Continuing high volume may trigger Fatigue status (-20% next-day stat yield). Rest is strongly advised.",
        allowProceed: true,
      };
    }
  }

  if (playerRank === "Initiate" || (playerLevel >= 5 && playerLevel <= 9)) {
    if (totalSetsToday >= 20 || isExtraWorkout) {
      return {
        severity: "caution",
        title: "SYSTEM ADVISORY: VOLUME EXCEEDS INITIATE STANDARD",
        message: "You have completed your daily prescribed quota. Extra volume yields diminishing XP returns (0.25x). Ensure strict hydration and recovery.",
        allowProceed: true,
      };
    }
  }

  if (playerRank === "Warrior" || playerRank === "Vanguard") {
    if (totalSetsToday >= 28) {
      return {
        severity: "caution",
        title: "WARRIOR ENDURANCE // HIGH VOLUME ACTIVE",
        message: "Muscular fatigue accumulating. Extra volume authorized with calibrated diminishing returns.",
        allowProceed: true,
      };
    }
  }

  return {
    severity: "none",
    title: "",
    message: "",
    allowProceed: true,
  };
}

/**
 * Calculates XP and stat yield for extra workouts beyond daily quota
 * - 1st extra workout: 0.25x XP
 * - 2nd extra workout: 0.50x XP
 * - 3rd+ extra workout: 0.25x XP (diminishing return safeguard)
 */
export function calculateExtraWorkoutXpMultiplier(extraWorkoutNumber: number): number {
  if (extraWorkoutNumber === 1) return 0.25;
  if (extraWorkoutNumber === 2) return 0.50;
  return 0.25;
}

// Backward compatibility export
export const calculateWorkoutCalories = (
  durationSeconds: number,
  bodyweightKg: number = 70,
  averageMet: number = 5.5,
  skippingCount: number = 0
): number => {
  return calculateAccurateWorkoutCalories({
    durationSeconds,
    heightCm: 175,
    weightKg: bodyweightKg,
    playerLevel: 1,
    playerRank: "Recruit",
    sets: [{ weightKg: 15, reps: 30 }],
    skippingCount,
  }).totalCaloriesBurned;
};
