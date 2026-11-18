// src/lib/calculations/streak.ts
// Smart Dynamic Streak Engine with Lore-Accurate Sanctuary Protection & Reward Multipliers

import { ConditionStatus } from "@/types";

export interface StreakMultiplierInfo {
  multiplier: number;
  label: string;
  tier: "baseline" | "ignition" | "surge" | "overdrive";
}

export interface EffectiveStreakStatus {
  effectiveStreak: number;
  longestStreak: number;
  multiplier: number;
  multiplierLabel: string;
  tier: "baseline" | "ignition" | "surge" | "overdrive";
  status: "completed_today" | "pending_today" | "grace_period" | "sanctuary_protected" | "expired";
  statusMessage: string;
  isSecuredToday: boolean;
}

export interface DailyCrateHarvestResult {
  newStreak: number;
  newLongestStreak: number;
  multiplier: number;
  multiplierLabel: string;
  baseXp: number;
  bonusXpFromStreak: number;
  totalXpAwarded: number;
  bonusStatPoints: number;
  isMilestone: boolean;
  statusType: "extended" | "initiated" | "grace_salvaged" | "sanctuary_protected";
  logMessage: string;
}

/**
 * Returns streak multiplier scalar and tier designation
 */
export function getStreakMultiplier(streakDays: number): StreakMultiplierInfo {
  if (streakDays >= 14) {
    return { multiplier: 1.5, label: "1.50x", tier: "overdrive" };
  }
  if (streakDays >= 7) {
    return { multiplier: 1.25, label: "1.25x", tier: "surge" };
  }
  if (streakDays >= 3) {
    return { multiplier: 1.1, label: "1.10x", tier: "ignition" };
  }
  return { multiplier: 1.0, label: "1.00x", tier: "baseline" };
}

/**
 * Helper to compute date difference in calendar days (UTC date string comparison)
 */
function getDayDifference(dateA: string, dateB: string): number {
  const dA = new Date(dateA + "T00:00:00Z");
  const dB = new Date(dateB + "T00:00:00Z");
  const diffMs = dA.getTime() - dB.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates the player's live active streak state for UI rendering and HUD gauges
 */
export function getEffectiveStreakInfo(
  profile: {
    current_streak?: number;
    longest_streak?: number;
    last_streak_date?: string | null;
    condition?: ConditionStatus;
  },
  todayStr?: string
): EffectiveStreakStatus {
  const today = todayStr || new Date().toISOString().split("T")[0];
  const storedStreak = Math.max(0, profile.current_streak || 0);
  const longestStreak = Math.max(storedStreak, profile.longest_streak || 0);
  const lastDate = profile.last_streak_date;
  const isSanctuary = profile.condition === "medical_sanctuary";

  // Case 1: Fresh hunter (no completed days yet)
  if (!lastDate || storedStreak === 0) {
    const mult = getStreakMultiplier(0);
    return {
      effectiveStreak: 0,
      longestStreak,
      multiplier: mult.multiplier,
      multiplierLabel: mult.label,
      tier: mult.tier,
      status: "pending_today",
      statusMessage: "Day 1 In Progress. Complete all directives to ignite streak.",
      isSecuredToday: false,
    };
  }

  const daysSinceLast = getDayDifference(today, lastDate);

  // Case 2: Today already secured
  if (daysSinceLast === 0) {
    const mult = getStreakMultiplier(storedStreak);
    return {
      effectiveStreak: storedStreak,
      longestStreak,
      multiplier: mult.multiplier,
      multiplierLabel: mult.label,
      tier: mult.tier,
      status: "completed_today",
      statusMessage: `Streak Secured for Today (${storedStreak}D Active).`,
      isSecuredToday: true,
    };
  }

  // Case 3: Completed yesterday, today is pending
  if (daysSinceLast === 1) {
    const mult = getStreakMultiplier(storedStreak);
    return {
      effectiveStreak: storedStreak,
      longestStreak,
      multiplier: mult.multiplier,
      multiplierLabel: mult.label,
      tier: mult.tier,
      status: "pending_today",
      statusMessage: `${storedStreak}D Streak Active. Conquer today's directives to reach ${storedStreak + 1}D!`,
      isSecuredToday: false,
    };
  }

  // Case 4: Medical Sanctuary is active (Frozen / Immune from decay)
  if (isSanctuary) {
    const mult = getStreakMultiplier(storedStreak);
    return {
      effectiveStreak: storedStreak,
      longestStreak,
      multiplier: mult.multiplier,
      multiplierLabel: mult.label,
      tier: mult.tier,
      status: "sanctuary_protected",
      statusMessage: `Honorable Sanctuary Active. ${storedStreak}D Streak Protected from decay.`,
      isSecuredToday: false,
    };
  }

  // Case 5: Missed 1 day (daysSinceLast === 2) -> 24h Grace Period
  if (daysSinceLast === 2) {
    const mult = getStreakMultiplier(storedStreak);
    return {
      effectiveStreak: storedStreak,
      longestStreak,
      multiplier: mult.multiplier,
      multiplierLabel: mult.label,
      tier: mult.tier,
      status: "grace_period",
      statusMessage: `[PENALTY WARNING] 24H Grace Redemption Active. Conquer today to salvage your ${storedStreak}D streak!`,
      isSecuredToday: false,
    };
  }

  // Case 6: Missed > 2 days without Sanctuary -> Expired
  const mult = getStreakMultiplier(0);
  return {
    effectiveStreak: 0,
    longestStreak,
    multiplier: mult.multiplier,
    multiplierLabel: mult.label,
    tier: mult.tier,
    status: "expired",
    statusMessage: "Streak lapsed. Complete today's protocol to reignite Day 1.",
    isSecuredToday: false,
  };
}

/**
 * Calculates new streak numbers and rewards upon opening/claiming the Daily Blessed Mystery Box
 */
export function calculateDailyCrateHarvest(
  profile: {
    current_streak?: number;
    longest_streak?: number;
    last_streak_date?: string | null;
    condition?: ConditionStatus;
  },
  todayStr?: string
): DailyCrateHarvestResult {
  const today = todayStr || new Date().toISOString().split("T")[0];
  const storedStreak = Math.max(0, profile.current_streak || 0);
  const longestStreak = Math.max(storedStreak, profile.longest_streak || 0);
  const lastDate = profile.last_streak_date;
  const isSanctuary = profile.condition === "medical_sanctuary";

  let newStreak = 1;
  let statusType: DailyCrateHarvestResult["statusType"] = "initiated";
  let logMessage = "Day 1 Hunter Streak Ignited!";

  if (!lastDate || storedStreak === 0) {
    newStreak = 1;
    statusType = "initiated";
    logMessage = "First Daily Protocol Conquered! 1-Day Streak Ignited.";
  } else {
    const daysSinceLast = getDayDifference(today, lastDate);

    if (daysSinceLast === 0) {
      // Already claimed today, maintain current streak
      newStreak = storedStreak;
      statusType = "extended";
      logMessage = `Daily protocol affirmed. ${newStreak}D streak maintained.`;
    } else if (daysSinceLast === 1) {
      // Consecutive day progression
      newStreak = storedStreak + 1;
      statusType = "extended";
      logMessage = `Consecutive Day Conquered! Streak Advanced to ${newStreak}D!`;
    } else if (isSanctuary) {
      // Sanctuary thaw & increment
      newStreak = storedStreak + 1;
      statusType = "sanctuary_protected";
      logMessage = `Honorable Sanctuary Protected your progress! Streak advanced to ${newStreak}D.`;
    } else if (daysSinceLast === 2) {
      // 24H Grace redemption
      newStreak = storedStreak + 1;
      statusType = "grace_salvaged";
      logMessage = `Redemption protocol successful! Salvaged and advanced streak to ${newStreak}D!`;
    } else {
      // Restarted
      newStreak = 1;
      statusType = "initiated";
      logMessage = `Streak Reignited! Day 1 Protocol Conquered.`;
    }
  }

  const newLongestStreak = Math.max(longestStreak, newStreak);
  const multInfo = getStreakMultiplier(newStreak);

  // Scaled XP Reward Mechanics
  const baseXp = 150;
  const totalXpAwarded = Math.round(baseXp * multInfo.multiplier);
  const bonusXpFromStreak = totalXpAwarded - baseXp;

  // 7-Day Milestone Perks
  const isMilestone = newStreak > 0 && newStreak % 7 === 0;
  const bonusStatPoints = isMilestone ? 1 : 0;

  return {
    newStreak,
    newLongestStreak,
    multiplier: multInfo.multiplier,
    multiplierLabel: multInfo.label,
    baseXp,
    bonusXpFromStreak,
    totalXpAwarded,
    bonusStatPoints,
    isMilestone,
    statusType,
    logMessage,
  };
}
