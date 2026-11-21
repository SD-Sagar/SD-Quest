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
    { weightKg: 10.0, count: inventory.plate_10kg_count || 0 },
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
 * Calculates the exact plates required per side of a barbell or EZ curl rod.
 * Barbell has 2 ends (sides). Available plate inventory is divided by 2 (one per side).
 */
export function calculateBarbellPlates(
  targetTotalWeightKg: number,
  inventory: EquipmentInventory,
  barType: "straight" | "ez" = "straight"
): PlateCombinationResult {
  const barWeight =
    barType === "ez"
      ? Number(inventory.ez_bar_weight_kg) || 5.0
      : Number(inventory.barbell_weight_kg) || 7.0;

  const barLabel = barType === "ez" ? "EZ Bar" : "Barbell";
  const targetPlatesWeight = Math.max(0, targetTotalWeightKg - barWeight);
  const targetPerSide = targetPlatesWeight / 2;
  const divisor = 2; // 2 sides on a barbell

  const availablePlates: EquipmentPlate[] = [
    { weightKg: 10.0, count: inventory.plate_10kg_count || 0 },
    { weightKg: 5.0, count: inventory.plate_5kg_count || 0 },
    { weightKg: 2.5, count: inventory.plate_2_5kg_count || 0 },
    { weightKg: 2.0, count: inventory.plate_2kg_count || 0 },
    { weightKg: 1.25, count: inventory.plate_1_25kg_count || 0 },
    { weightKg: 1.0, count: inventory.plate_1kg_count || 0 },
    ...(inventory.custom_plates || []),
  ];

  const sortedPlates = availablePlates
    .filter((p) => p.count >= divisor && p.weightKg > 0)
    .sort((a, b) => b.weightKg - a.weightKg);

  let currentPerSide = 0;
  const platesPerSide: { weightKg: number; count: number }[] = [];

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

  const achievableTotal = Number((barWeight + currentPerSide * 2).toFixed(2));
  const isExact = Math.abs(achievableTotal - targetTotalWeightKg) < 0.1;

  const breakdownParts = platesPerSide.map((p) => `${p.count}×${p.weightKg}kg`);
  const summaryString =
    breakdownParts.length > 0
      ? `${barLabel} (${barWeight}kg) + [${breakdownParts.join(" + ")}] per side`
      : `Bare ${barLabel} (${barWeight}kg)`;

  return {
    achievableWeightKg: achievableTotal,
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

  // Barbell, EZ bar, cable pulley, and pure bodyweight movements use the total entered load directly (multiplier = 1)
  if (
    name.includes("barbell") ||
    name.includes("ez-bar") ||
    name.includes("ez bar") ||
    name.includes("cable") ||
    name.includes("pulley") ||
    name.includes("chain") ||
    name.includes("pull-up") ||
    name.includes("pullup") ||
    name.includes("chin-up") ||
    name.includes("chinup") ||
    name.includes("dip") ||
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
  const exerciseMap = new Map<string, { targetMuscle: string; setsCount: number; tonnageKg: number; maxWeightKg: number }>();

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
      maxWeightKg: 0,
    };
    exerciseMap.set(exName, {
      targetMuscle: s.targetMuscle || existing.targetMuscle,
      setsCount: existing.setsCount + 1,
      tonnageKg: existing.tonnageKg + setTonnage,
      maxWeightKg: Math.max(existing.maxWeightKg, s.weightKg),
    });
  }

  const totalDurationMinutes = Math.max(0.5, durationSeconds / 60);
  const totalSetsCount = Math.max(1, sets.length);

  // Divide session duration proportionately across exercises based on set volume
  const exerciseBlocks = Array.from(exerciseMap.entries()).map(([name, data]) => {
    const fractionOfSets = data.setsCount / totalSetsCount;
    const blockMinutes = Math.max(0.2, Number((totalDurationMinutes * fractionOfSets).toFixed(2)));
    const metCategory = resolveExerciseMetCategory(name, data.targetMuscle, false, data.maxWeightKg, weightKg);

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
 * Calculates XP required to advance from level L to L+1
 * Exact quadratic progression: XP(L) = 500 + 25 * (L^2 - 1)
 */
export function getXpRequiredForLevel(level: number): number {
  const safeL = Math.max(1, Math.floor(level));
  return 500 + 25 * (safeL * safeL - 1);
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

  if (playerRank === "Spartan" || playerLevel >= 100) {
    return {
      severity: "spartan_pass",
      title: "SPARTAN RESILIENCE // THRESHOLD EXPANDED",
      message: "The System acknowledges peak Spartan conditioning. Work capacity limiters deactivated. Caloric burn multiplier engaged.",
      allowProceed: true,
    };
  }

  if (playerRank === "Recruit" || playerLevel <= 9) {
    if (isExtraWorkout || totalSetsToday >= 15) {
      return {
        severity: "hazard",
        title: "SYSTEM WARNING: HIGH VOLUME HAZARD (RECRUIT RANK)",
        message: "Your central nervous system and tendon attachments are still in Awakening adaptation. Continuing high volume may trigger Fatigue status (-20% next-day stat yield). Rest is strongly advised.",
        allowProceed: true,
      };
    }
  }

  if (playerRank === "Initiate" || (playerLevel >= 10 && playerLevel <= 19)) {
    if (totalSetsToday >= 20 || isExtraWorkout) {
      return {
        severity: "caution",
        title: "SYSTEM ADVISORY: VOLUME EXCEEDS INITIATE STANDARD",
        message: "You have completed your daily prescribed quota. Extra volume yields diminishing returns. Ensure strict hydration and recovery.",
        allowProceed: true,
      };
    }
  }

  if (playerRank === "Warrior" || playerRank === "Vanguard" || playerRank === "Knight") {
    if (totalSetsToday >= 28) {
      return {
        severity: "caution",
        title: `${playerRank.toUpperCase()} ENDURANCE // HIGH VOLUME ACTIVE`,
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

/**
 * Maximum sets allowed per exercise based on Hunter Rank.
 * Absolute ceiling across the entire system is 10 sets.
 */
export function getMaxSetsForRank(rank: HunterRank = "Recruit"): number {
  switch (rank) {
    case "Spartan":
    case "Ascendant":
    case "Sovereign":
    case "Juggernaut":
    case "Elite":
      return 10;
    case "Warlord":
    case "Gladiator":
      return 9;
    case "Knight":
    case "Vanguard":
      return 8;
    case "Warrior":
      return 7;
    case "Initiate":
      return 6;
    case "Recruit":
    default:
      return 5;
  }
}

/**
 * Intelligent Rep-Lock Ceiling based on Hunter Rank and current Set count.
 * Prevents central nervous system exhaustion and tendon breakdown for lower-level hunters.
 */
export function getRepCeilingForRankAndSets(
  rank: HunterRank = "Recruit",
  setsCount: number = 3
): {
  maxReps: number;
  isRestricted: boolean;
  reason?: string;
} {
  const safeSets = Math.min(10, Math.max(1, setsCount));

  if (rank === "Spartan") {
    return {
      maxReps: 50,
      isRestricted: false,
    };
  }

  if (rank === "Ascendant") {
    if (safeSets >= 9) {
      return {
        maxReps: 30,
        isRestricted: true,
        reason: "Ascendant Directive: Sets 9-10 capped at 30 reps to manage peak myofibrillar stress.",
      };
    }
    return { maxReps: 40, isRestricted: false };
  }

  if (rank === "Sovereign") {
    if (safeSets >= 8) {
      return {
        maxReps: 25,
        isRestricted: true,
        reason: "Sovereign Directive: Sets 8-10 capped at 25 reps for optimal metabolic recovery.",
      };
    }
    return { maxReps: 35, isRestricted: false };
  }

  if (rank === "Juggernaut") {
    if (safeSets >= 8) {
      return {
        maxReps: 22,
        isRestricted: true,
        reason: "Juggernaut Protocol: Sets 8-10 capped at 22 reps to preserve joint capsule integrity.",
      };
    }
    return { maxReps: 30, isRestricted: false };
  }

  if (rank === "Warlord") {
    if (safeSets >= 7) {
      return {
        maxReps: 20,
        isRestricted: true,
        reason: "Warlord Protocol: Sets 7-9 capped at 20 reps for high-density fatigue management.",
      };
    }
    return { maxReps: 28, isRestricted: false };
  }

  if (rank === "Gladiator") {
    if (safeSets >= 7) {
      return {
        maxReps: 18,
        isRestricted: true,
        reason: "Gladiator Protocol: Sets 7-9 capped at 18 reps to sustain mechanical tension.",
      };
    }
    return { maxReps: 25, isRestricted: false };
  }

  if (rank === "Knight") {
    if (safeSets >= 6) {
      return {
        maxReps: 16,
        isRestricted: true,
        reason: "Knight Protocol: Sets 6-8 capped at 16 reps to reinforce tendon remodeling.",
      };
    }
    return { maxReps: 22, isRestricted: false };
  }

  if (rank === "Vanguard") {
    if (safeSets >= 6) {
      return {
        maxReps: 14,
        isRestricted: true,
        reason: "Vanguard Protocol: Sets 6-8 capped at 14 reps to stabilize core and rotator cuff.",
      };
    }
    return { maxReps: 20, isRestricted: false };
  }

  if (rank === "Warrior") {
    if (safeSets >= 5) {
      return {
        maxReps: 12,
        isRestricted: true,
        reason: "Warrior Protocol: Sets 5-7 capped at 12 reps to prioritize hypertrophy mechanics.",
      };
    }
    return { maxReps: 18, isRestricted: false };
  }

  if (rank === "Initiate") {
    if (safeSets >= 5) {
      return {
        maxReps: 10,
        isRestricted: true,
        reason: "Initiate Protocol: Sets 5-6 capped at 10 reps to protect developing connective tissue.",
      };
    }
    return { maxReps: 15, isRestricted: false };
  }

  // Recruit (Rank 1, Level 1-9)
  if (safeSets >= 4) {
    return {
      maxReps: 8,
      isRestricted: true,
      reason: "Recruit Limit: Awakening conditioning limits Sets 4-5 to 8 reps to prevent tendonitis.",
    };
  }
  return {
    maxReps: 12,
    isRestricted: false,
  };
}

/**
 * Calculates Calibrated RPG Rewards (XP and Attributes) for Workout Completion:
 * - Tonnage & Weight-Scaled Strength (STR)
 * - Volume-Scaled Endurance (END)
 * - Discipline (DIS) with volume completion bonus and skip penalties
 * - Rank & Level-Calibrated Diminishing Returns for sets 5+
 */
export function calculateIntelligentWorkoutRewards(params: {
  isSingleExercise?: boolean;
  totalTonnageKg: number;
  maxWorkingWeightKg: number;
  totalSetsCount: number;
  totalRepsCount: number;
  skippedCount?: number;
  skippingCompleted?: number;
  skippingTarget?: number;
  completedEarly?: boolean;
  extraWorkoutMultiplier?: number;
  targetMusclesTrained?: string | string[];
  playerRank?: HunterRank;
  playerLevel?: number;
}): {
  totalXp: number;
  attrDeltas: Record<string, number>;
} {
  const {
    isSingleExercise = false,
    totalTonnageKg = 0,
    maxWorkingWeightKg = 10,
    totalSetsCount = 3,
    totalRepsCount = 30,
    skippedCount = 0,
    skippingCompleted = 0,
    skippingTarget = 0,
    completedEarly = false,
    extraWorkoutMultiplier = 1.0,
    targetMusclesTrained = "",
    playerRank = "Recruit",
    playerLevel = 1,
  } = params;

  // 1. XP Base
  let xpBase = isSingleExercise ? 25 : 85;

  // Tonnage XP: 1 XP per 300kg tonnage (capped at 30)
  const tonnageBonusXp = Math.min(30, Math.floor(totalTonnageKg / 300));

  // Set Volume Diminishing Returns:
  // Sets 1-4 = full credit, sets 5-7 = 75%, sets 8-10 = 50%
  let setBonusXp = 0;
  if (totalSetsCount > 3) {
    const extraSets = totalSetsCount - 3;
    if (extraSets <= 3) {
      setBonusXp = extraSets * 4; // up to 12 XP
    } else {
      setBonusXp = 3 * 4 + (extraSets - 3) * 2; // up to 20 XP
    }
  }

  const skipBonusXp = skippingTarget > 0 && skippingCompleted >= skippingTarget ? 15 : 0;
  const speedBonusXp = completedEarly ? 15 : 0;
  const skipPenaltyXp = (skippedCount || 0) * 15;

  let totalXp = Math.max(15, xpBase + tonnageBonusXp + setBonusXp + skipBonusXp + speedBonusXp - skipPenaltyXp);

  // Apply Extra Workout Multiplier if beyond daily quota
  if (extraWorkoutMultiplier && extraWorkoutMultiplier !== 1.0) {
    totalXp = Math.max(10, Math.round(totalXp * extraWorkoutMultiplier));
  }

  // 2. Intelligent Attribute Deltas
  const disPenalty = (skippedCount || 0) * 0.10;
  const attrMult = extraWorkoutMultiplier || 1.0;

  // Heavy Dumbbell Strength Scaling:
  // Baseline: +0.35. If max weight >= 15kg -> +0.40; >= 22.5kg -> +0.48; >= 30kg -> +0.55
  let strBase = 0.35;
  if (maxWorkingWeightKg >= 30) {
    strBase = 0.55;
  } else if (maxWorkingWeightKg >= 22.5) {
    strBase = 0.48;
  } else if (maxWorkingWeightKg >= 15) {
    strBase = 0.40;
  }

  // Class mastery efficiency (+0.02 STR per class tier above Recruit, +0.20 at Spartan)
  const rankTierMap: Record<string, number> = {
    Recruit: 0,
    Initiate: 1,
    Warrior: 2,
    Vanguard: 3,
    Knight: 4,
    Gladiator: 5,
    Warlord: 6,
    Juggernaut: 7,
    Sovereign: 8,
    Ascendant: 9,
    Spartan: 10,
    Elite: 10,
  };
  const rankTier = rankTierMap[playerRank] || 0;
  const masteryBonus = rankTier * 0.02;
  strBase += masteryBonus;

  // Volume-Scaled Endurance (END):
  // If moving high volume (>= 5 sets or >= 50 total reps), grant END reward
  let endYield = 0;
  if (totalSetsCount >= 6 || totalRepsCount >= 60) {
    endYield = 0.30 + (masteryBonus * 0.5);
  } else if (totalSetsCount >= 4 || totalRepsCount >= 40) {
    endYield = 0.15 + (masteryBonus * 0.25);
  }

  // High Volume Discipline bonus (pushing through 6+ sets)
  let disBase = 0.20;
  if (totalSetsCount >= 6) {
    disBase += 0.08;
  }

  const attrDeltas: Record<string, number> = {
    strength: Number((strBase * attrMult).toFixed(2)),
    discipline: Number((Math.max(0.05, disBase - disPenalty) * attrMult).toFixed(2)),
    vitality: Number((0.15 * attrMult).toFixed(2)),
  };

  if (endYield > 0) {
    attrDeltas.endurance = Number((endYield * attrMult).toFixed(2));
  }

  // Check target muscles trained to grant specific RPG yields
  const muscleString = Array.isArray(targetMusclesTrained)
    ? targetMusclesTrained.join(" ").toLowerCase()
    : (targetMusclesTrained || "").toLowerCase();
  if (muscleString.includes("quad") || muscleString.includes("leg") || muscleString.includes("hamstring")) {
    attrDeltas.vitality = (attrDeltas.vitality || 0) + 0.10;
    attrDeltas.endurance = (attrDeltas.endurance || 0) + 0.10;
  }
  if (muscleString.includes("shoulder") || muscleString.includes("delt")) {
    attrDeltas.agility = (attrDeltas.agility || 0) + 0.10;
  }
  if (muscleString.includes("core") || muscleString.includes("ab") || muscleString.includes("belly")) {
    attrDeltas.endurance = (attrDeltas.endurance || 0) + 0.15;
  }

  if (skippingTarget > 0 && skippingCompleted >= skippingTarget) {
    attrDeltas.agility = (attrDeltas.agility || 0) + Number((0.20 * attrMult).toFixed(2));
  }

  if (completedEarly) {
    attrDeltas.agility = (attrDeltas.agility || 0) + 0.10;
    attrDeltas.discipline = (attrDeltas.discipline || 0) + 0.10;
  }

  return { totalXp, attrDeltas };
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
