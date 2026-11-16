import { EquipmentInventory, EquipmentPlate, HunterRank } from "@/types";

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
 * Advanced Biomechanical & Physiological Calorie Expenditure Engine
 * Incorporates:
 * 1. Height & displacement mechanics (arm reach vs squat displacement).
 * 2. Weight & body mass fraction lifted.
 * 3. Exact mechanical work in Joules converted to metabolic kcal (efficiency η ≈ 0.21).
 * 4. Duration, rest intervals, and metabolic conditioning factor based on player rank.
 * 5. Compulsory skipping plyometric burn (MET 11.5).
 */
export function calculateAccurateWorkoutCalories(params: {
  durationSeconds: number;
  heightCm: number;
  weightKg: number;
  playerLevel: number;
  playerRank: HunterRank;
  sets: { weightKg: number; reps: number; exerciseName?: string; targetMuscle?: string }[];
  skippingCount?: number;
}): {
  totalCaloriesBurned: number;
  mechanicalWorkKcal: number;
  aerobicRestKcal: number;
  skippingKcal: number;
  tonnageMovedKg: number;
} {
  const {
    durationSeconds,
    heightCm = 175,
    weightKg = 70,
    playerLevel = 1,
    sets = [],
    skippingCount = 0,
  } = params;

  const heightM = heightCm / 100;
  let totalTonnageKg = 0;
  let mechanicalWorkJoules = 0;
  let legCompoundCount = 0;

  // 1. Calculate Mechanical Work Per Rep based on anthropometric travel
  for (const s of sets) {
    const pairWeight = s.weightKg * 2; // pair of dumbbells
    totalTonnageKg += pairWeight * s.reps;

    const muscle = (s.targetMuscle || s.exerciseName || "").toLowerCase();
    const isLegCompound =
      muscle.includes("quad") ||
      muscle.includes("leg") ||
      muscle.includes("squat") ||
      muscle.includes("glute") ||
      muscle.includes("lunge");

    if (isLegCompound) legCompoundCount += 1;

    // Vertical displacement travel distance
    // Squats: ~0.45 of height. Bench/Presses: ~0.35 of height
    const displacement = isLegCompound ? heightM * 0.45 : heightM * 0.35;

    // For leg movements, lifter also displaces ~65% of upper bodyweight against gravity
    const bodyweightLoad = isLegCompound ? weightKg * 0.65 : 0;
    const totalMassLifted = pairWeight + bodyweightLoad;

    // Work = force * distance = (m * g) * d
    // Concentric lift + controlled eccentric lowering adds 30% eccentric energy expenditure
    const workPerRep = totalMassLifted * 9.81 * displacement * 1.30;
    mechanicalWorkJoules += workPerRep * s.reps;
  }

  // Muscular mechanical efficiency η ≈ 0.21. 1 kcal = 4184 Joules.
  const mechanicalWorkKcal = mechanicalWorkJoules / (0.21 * 4184);

  // 2. Realistic Exercise Physiology Duration & MET Expenditure (Compendium / ACSM standard)
  // Each performed set represents ~1.8 to 2.2 minutes of total cardiovascular and neuromuscular exertion (tempo + rest interval).
  // If app elapsed time is short (e.g. user logged sets after training), we ground duration in biological set volume.
  const physicalDurationMinutes = Math.max(
    durationSeconds / 60,
    sets.length > 0 ? sets.length * 1.9 : 15
  );

  // Vigorous resistance training MET: 6.5 baseline, up to 7.8 for heavy leg/chest compound splits
  const baseMet = legCompoundCount > 3 ? 7.6 : 6.8;

  // Conditioning Factor: Day 1 Recruit expends slightly more metabolic effort per unit work (+8%),
  // while seasoned Spartans have optimized muscular efficiency
  const conditioningFactor = Math.max(0.94, 1.08 - (playerLevel - 1) * 0.005);

  // ACSM Caloric Burn Formula: kcal/min = (MET * 3.5 * weightKg) / 200
  const metabolicKcalPerMinute = ((baseMet * 3.5 * weightKg) / 200) * conditioningFactor;
  const aerobicResistanceKcal = physicalDurationMinutes * metabolicKcalPerMinute;

  // 3. Skipping Rope Plyometrics
  // ~0.18 kcal per skip scaled to user bodyweight (70kg baseline)
  const skippingKcal = (skippingCount / 100) * 18.0 * (weightKg / 70);

  // Combined physiological expenditure (metabolic baseline + mechanical load EPOC factor + plyometrics)
  const totalCaloriesBurned = Math.round(aerobicResistanceKcal + mechanicalWorkKcal * 0.45 + skippingKcal);

  return {
    totalCaloriesBurned: Math.max(30, totalCaloriesBurned),
    mechanicalWorkKcal: Math.round(mechanicalWorkKcal),
    aerobicRestKcal: Math.round(aerobicResistanceKcal),
    skippingKcal: Math.round(skippingKcal),
    tonnageMovedKg: Math.round(totalTonnageKg),
  };
}

/**
 * Calculates Caloric Expenditure from Daily Walking & Steps
 */
export function calculateStepsCalories(
  steps: number,
  weightKg: number = 70,
  heightCm: number = 175
): { distanceKm: number; caloriesBurned: number } {
  // Stride length formula: height (cm) * 0.415
  const strideMeters = (heightCm * 0.415) / 100;
  const distanceKm = Number(((steps * strideMeters) / 1000).toFixed(2));
  
  // Standard human walking expenditure: ~0.73 kcal per kg per km
  const caloriesBurned = Math.round(distanceKm * weightKg * 0.73);
  return { distanceKm, caloriesBurned };
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
