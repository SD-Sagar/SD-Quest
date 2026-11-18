import { AttributeType, HunterRank, QuestCategory } from "@/types";

/**
 * Calculates XP required for next level using quadratic calibrated RPG growth curve:
 * Base: Level 1 requires 500 XP.
 * XP(L) = 500 + 25 * (L^2 - 1)
 */
export function calculateXpForNextLevel(level: number): number {
  const l = Math.max(1, level);
  return Math.max(500, 500 + 25 * (l * l - 1));
}

/**
 * Derives hunter rank based on player level (10-Tier Solo Leveling hierarchy):
 * - Level 1 to 9: Recruit
 * - Level 10 to 19: Initiate
 * - Level 20 to 29: Warrior
 * - Level 30 to 39: Vanguard
 * - Level 40 to 49: Knight
 * - Level 50 to 59: Gladiator
 * - Level 60 to 69: Warlord
 * - Level 70 to 79: Juggernaut
 * - Level 80 to 89: Sovereign
 * - Level 90 to 99: Ascendant
 * - Level 100+: Spartan
 */
export function getRankForLevel(level: number): HunterRank {
  if (level >= 100) return "Spartan";
  if (level >= 90) return "Ascendant";
  if (level >= 80) return "Sovereign";
  if (level >= 70) return "Juggernaut";
  if (level >= 60) return "Warlord";
  if (level >= 50) return "Gladiator";
  if (level >= 40) return "Knight";
  if (level >= 30) return "Vanguard";
  if (level >= 20) return "Warrior";
  if (level >= 10) return "Initiate";
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
    Vanguard: 1.4,
    Knight: 1.5,
    Gladiator: 1.6,
    Warlord: 1.7,
    Juggernaut: 1.8,
    Sovereign: 1.9,
    Ascendant: 2.0,
    Spartan: 2.2,
    Elite: 2.2,
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
    Vanguard: 1.4,
    Knight: 1.5,
    Gladiator: 1.6,
    Warlord: 1.7,
    Juggernaut: 1.8,
    Sovereign: 1.9,
    Ascendant: 2.0,
    Spartan: 2.2,
    Elite: 2.2,
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

