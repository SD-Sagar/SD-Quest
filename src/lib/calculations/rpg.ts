import { AttributeType, HunterRank, QuestCategory } from "@/types";

/**
 * Calculates XP required for next level using exponential calibrated RPG growth curve:
 * Base: Level 1 requires 500 XP.
 * xp(L) = floor(500 * L ^ 1.45)
 */
export function calculateXpForNextLevel(level: number): number {
  return Math.floor(500 * Math.pow(Math.max(1, level), 1.45));
}

/**
 * Derives hunter rank based on player level (per gym.txt):
 * - Level 1 to 4: Recruit
 * - Level 5 to 9: Initiate
 * - Level 10 to 19: Warrior
 * - Level 20 to 29: Vanguard
 * - Level 30 to 39: Elite
 * - Level 40+: Spartan
 */
export function getRankForLevel(level: number): HunterRank {
  if (level >= 40) return "Spartan";
  if (level >= 30) return "Elite";
  if (level >= 20) return "Vanguard";
  if (level >= 10) return "Warrior";
  if (level >= 5) return "Initiate";
  return "Recruit";
}

/**
 * Computes fair, grounded attribute yield based on duration and difficulty.
 * Avoids hyper-inflation.
 */
export function calculateFairStatYield(
  durationMinutes: number,
  difficulty: HunterRank,
  selectedAttributes: AttributeType[]
): Record<AttributeType, number> {
  if (selectedAttributes.length === 0) {
    return {} as Record<AttributeType, number>;
  }

  const rankMultipliers: Record<HunterRank, number> = {
    Recruit: 1.0,
    Initiate: 1.15,
    Warrior: 1.25,
    Vanguard: 1.5,
    Elite: 1.65,
    Spartan: 1.8,
  };

  const multiplier = rankMultipliers[difficulty] || 1.0;
  // Baseline: 60 minutes = 0.35 total pool of stat points distributed across selected attributes
  const pool = (durationMinutes / 60) * 0.35 * multiplier;
  const yieldPerStat = Number(
    Math.max(0.05, Math.min(1.0, pool / selectedAttributes.length)).toFixed(2)
  );

  const rewards: Partial<Record<AttributeType, number>> = {};
  for (const attr of selectedAttributes) {
    rewards[attr] = yieldPerStat;
  }

  return rewards as Record<AttributeType, number>;
}

/**
 * Computes fair quest XP reward based on duration, difficulty, and priority.
 */
export function calculateFairQuestXp(
  durationMinutes: number,
  difficulty: HunterRank,
  priority: "low" | "medium" | "high" | "urgent"
): number {
  const baseRate = 1.2; // 1.2 XP per minute
  let xp = durationMinutes * baseRate;

  const difficultyBonus: Record<HunterRank, number> = {
    Recruit: 1.0,
    Initiate: 1.15,
    Warrior: 1.25,
    Vanguard: 1.5,
    Elite: 1.65,
    Spartan: 1.8,
  };

  const priorityBonus: Record<string, number> = {
    low: 0.9,
    medium: 1.0,
    high: 1.2,
    urgent: 1.35,
  };

  xp *= difficultyBonus[difficulty] || 1.0;
  xp *= priorityBonus[priority] || 1.0;

  return Math.max(10, Math.round(xp));
}

/**
 * Calculates dynamic Basal Metabolic Rate (Mifflin-St Jeor) and TDEE:
 */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex?: "male" | "female" | "other" | null;
}): number {
  const { weightKg, heightCm, ageYears, sex } = params;
  // BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + s
  // s = +5 for males, -161 for females
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (sex === "female") {
    return Math.round(base - 161);
  }
  return Math.round(base + 5);
}

