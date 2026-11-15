import { EquipmentInventory, EquipmentPlate } from "@/types";

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
    let countUsed = 0;

    while (
      countUsed < maxUsablePerSide &&
      currentPerSide + plate.weightKg <= targetPerSide + 0.001
    ) {
      currentPerSide += plate.weightKg;
      countUsed++;
    }

    if (countUsed > 0) {
      platesPerSide.push({ weightKg: plate.weightKg, count: countUsed });
    }
  }

  const achievedTotalWeight = handleWeight + currentPerSide * 2;
  const isExact = Math.abs(achievedTotalWeight - targetTotalWeightKg) < 0.1;

  let summaryString = `Handle (${handleWeight}kg)`;
  if (platesPerSide.length > 0) {
    const platesText = platesPerSide
      .map((p) => `${p.count}×${p.weightKg}kg`)
      .join(" + ");
    summaryString += ` + [${platesText}] per side`;
  }

  return {
    achievableWeightKg: Number(achievedTotalWeight.toFixed(2)),
    isExact,
    platesPerSide,
    summaryString,
  };
}

/**
 * Double Progression Rule Evaluator
 * When all sets reach max target reps with controlled RPE, prescribe next weight step.
 */
export function evaluateDoubleProgression(
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
 * MET-based workout calorie expenditure estimator.
 * Formula: Calories = Duration (hours) × MET × Bodyweight (kg)
 * Reference values:
 * - Dumbbell Resistance Training: 5.5 MET
 * - Heavy Leg / Back Compounds: 6.5 MET
 * - Core / Belly Protocol: 4.0 MET
 * - Jump Rope (100+ skips): 10.0 MET
 * - Mobility & Active Recovery: 2.5 MET
 */
export function calculateWorkoutCalories(
  durationSeconds: number,
  bodyweightKg: number = 70,
  averageMet: number = 5.5,
  skippingCount: number = 0
): number {
  const durationHours = Math.max(0, durationSeconds) / 3600;
  const liftingCalories = durationHours * averageMet * bodyweightKg;

  // Skipping calorie bonus (100 skips ≈ 15-20 kcal)
  const skippingCalories = (skippingCount / 100) * 16;

  return Math.round(liftingCalories + skippingCalories);
}


