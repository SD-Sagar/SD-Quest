import { AvailablePlate, GymEquipmentInventory } from "@/types";

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
  inventory: GymEquipmentInventory,
  dualDumbbells: boolean = true
): PlateCombinationResult {
  const handleWeight = inventory.dumbbellHandleWeightKg;
  const targetPlatesWeight = Math.max(0, targetTotalWeightKg - handleWeight);
  // Each dumbbell has 2 ends (sides). So target weight for one side:
  const targetPerSide = targetPlatesWeight / 2;

  // Available plates per side:
  // If dual dumbbells (2 DBs = 4 sides total), divide plate count by 4.
  // If single dumbbell (1 DB = 2 sides total), divide plate count by 2.
  const divisor = dualDumbbells ? 4 : 2;

  // Sort available plates from largest to smallest for greedy fit
  const sortedPlates = [...inventory.plates]
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
 * Standard Home-Gym Inventory Presets (20-in-1 bench + 60kg plates + DB handles)
 */
export const DEFAULT_HOME_GYM_INVENTORY: GymEquipmentInventory = {
  dumbbellHandleWeightKg: 2.0,
  hasBench: true,
  benchNotches: [
    "Flat",
    "Incline 15°",
    "Incline 30°",
    "Incline 45°",
    "Incline 60°",
    "Incline 75°",
    "Seated 90°",
    "Decline",
  ],
  plates: [
    { weightKg: 5.0, count: 8 },  // 40 kg
    { weightKg: 2.5, count: 4 },  // 10 kg
    { weightKg: 1.25, count: 8 }, // 10 kg -> Total 60 kg
  ],
};

