// src/lib/calculations/fatigue.ts
// Dual Fatigue Telemetry, Overtime Surge & Dynamic Recovery Engine

import { AttributeType } from "@/types";

export type FatigueTier = "optimal" | "strained" | "heavy" | "overload";

export interface FatigueStatusInfo {
  tier: FatigueTier;
  xpMultiplier: number;
  drainRatePerMin: number;
  statusLabel: string;
  isOverload: boolean;
  activeDebuffDescription: string;
}

export interface SessionFatigueResult {
  mentalDelta: number;
  physicalDelta: number;
  overtimeMinutes: number;
  overtimeSurgeMultiplier: number;
  drainPenaltyXp: number;
  domain: "mental" | "physical" | "hybrid";
  summaryMessage: string;
}

export interface PassiveDecayResult {
  newMentalFatigue: number;
  newPhysicalFatigue: number;
  hoursElapsed: number;
}

/**
 * Returns fatigue status, active XP multiplier, and debuff designation
 */
export function getFatigueStatus(mentalFatigue = 0, physicalFatigue = 0): FatigueStatusInfo {
  const mental = Math.min(100, Math.max(0, Number(mentalFatigue) || 0));
  const physical = Math.min(100, Math.max(0, Number(physicalFatigue) || 0));
  const peakFatigue = Math.max(mental, physical);

  if (peakFatigue >= 90) {
    return {
      tier: "overload",
      xpMultiplier: 0.5,
      drainRatePerMin: 0.02,
      statusLabel: "CRITICAL OVERLOAD",
      isOverload: true,
      activeDebuffDescription: "Severe Exhaustion: -50% XP Yield & Active -0.02 XP/min Overload Drain. Rest or consume refreshment required.",
    };
  }

  if (peakFatigue >= 70) {
    return {
      tier: "heavy",
      xpMultiplier: 0.6,
      drainRatePerMin: 0,
      statusLabel: "HEAVY STRAIN",
      isOverload: false,
      activeDebuffDescription: "Heavy Fatigue: -40% XP Yield. Stat progression slowed. Rest or fun activity recommended.",
    };
  }

  if (peakFatigue >= 40) {
    return {
      tier: "strained",
      xpMultiplier: 0.85,
      drainRatePerMin: 0,
      statusLabel: "STRAINED",
      isOverload: false,
      activeDebuffDescription: "Moderate Fatigue: -15% XP Yield. Character experiencing biological wear.",
    };
  }

  return {
    tier: "optimal",
    xpMultiplier: 1.0,
    drainRatePerMin: 0,
    statusLabel: "OPTIMAL STATE",
    isOverload: false,
    activeDebuffDescription: "Peak Hunter Condition: 100% XP & Attribute Progression active.",
  };
}

/**
 * Classifies domain based on linked attributes and category
 */
export function determineTaskDomain(
  linkedAttributes: AttributeType[] = [],
  category?: string
): "mental" | "physical" | "hybrid" {
  const mentalAttributes = new Set(["intelligence", "mentality", "discipline"]);
  const physicalAttributes = new Set(["strength", "endurance", "agility", "vitality"]);

  let hasMental = category === "career" || category === "education";
  let hasPhysical = category === "fitness";

  for (const attr of linkedAttributes) {
    if (mentalAttributes.has(attr)) hasMental = true;
    if (physicalAttributes.has(attr)) hasPhysical = true;
  }

  if (hasMental && hasPhysical) return "hybrid";
  if (hasPhysical) return "physical";
  return "mental";
}

/**
 * Calculates fatigue accumulation and overtime attribute surge for any completed session
 */
export function calculateSessionFatigueDelta(params: {
  durationMinutes: number;
  targetMinutes: number;
  isFun?: boolean;
  linkedAttributes?: AttributeType[];
  category?: string;
  currentMentalFatigue?: number;
  currentPhysicalFatigue?: number;
}): SessionFatigueResult {
  const {
    durationMinutes,
    targetMinutes,
    isFun = false,
    linkedAttributes = [],
    category,
    currentMentalFatigue = 0,
    currentPhysicalFatigue = 0,
  } = params;

  const domain = determineTaskDomain(linkedAttributes, category);
  const overtimeMinutes = Math.max(0, durationMinutes - targetMinutes);
  const normalMinutes = Math.min(durationMinutes, targetMinutes);

  // Overtime Surge: +0.75x bonus stat acceleration during overtime window
  const overtimeSurgeMultiplier = overtimeMinutes > 0 ? 1.75 : 1.0;

  let mentalDelta = 0;
  let physicalDelta = 0;
  let drainPenaltyXp = 0;
  let summaryMessage = "";

  // CASE 1: PURE FUN (No heavy attributes linked, e.g. watching movie, hanging out, casual gaming)
  if (isFun && linkedAttributes.length === 0) {
    mentalDelta = -20; // Active mental recovery
    physicalDelta = 0;
    summaryMessage = "Recreational Protocol: Mental Fatigue purged by -20%!";
  }
  // CASE 2: FUN WITH LINKED ATTRIBUTES (e.g. playing soccer with friends, chess, music)
  else if (isFun && linkedAttributes.length > 0) {
    // Fatigue builds ~70% slower than usual (0.3x rate)
    const baseFatigue = (normalMinutes / 60) * 1.5; // ~1.5% per hour
    const overtimeFatigue = (overtimeMinutes / 60) * 3.5;

    if (domain === "mental" || domain === "hybrid") {
      mentalDelta = Number((baseFatigue + overtimeFatigue).toFixed(1));
    }
    if (domain === "physical" || domain === "hybrid") {
      physicalDelta = Number((baseFatigue + overtimeFatigue).toFixed(1));
    }
    summaryMessage = `Enjoyable Directive: Full attribute growth with 70% dampened fatigue buildup.`;
  }
  // CASE 3: STANDARD DISCIPLINED TASK (Work shift, intense study, gym workout)
  else {
    // Normal rate: ~5.0% fatigue per hour
    const normalFatigue = (normalMinutes / 60) * 5.0;
    // Overtime rate: ~15.0% fatigue per overtime hour (spikes 3x faster)
    const overtimeFatigue = (overtimeMinutes / 60) * 15.0;
    const totalFatigue = Number((normalFatigue + overtimeFatigue).toFixed(1));

    if (domain === "mental" || domain === "hybrid") {
      mentalDelta = totalFatigue;
    }
    if (domain === "physical" || domain === "hybrid") {
      physicalDelta = totalFatigue;
    }

    // If overtime exceeded by > 60 min and hunter is entering overload (>90%), apply active XP drain penalty
    const prospectivePeak = Math.max(
      currentMentalFatigue + mentalDelta,
      currentPhysicalFatigue + physicalDelta
    );

    if (prospectivePeak >= 90 && overtimeMinutes > 0) {
      // 0.02 XP per overtime minute
      drainPenaltyXp = Number((overtimeMinutes * 0.02).toFixed(2));
      summaryMessage = `Overtime Surge applied (+0.75x Stat Yield), but heavy exhaustion incurred (-${drainPenaltyXp} XP drain).`;
    } else if (overtimeMinutes > 0) {
      summaryMessage = `Overtime Surge Active (+0.75x Stat Yield) for ${overtimeMinutes} extra minutes!`;
    } else {
      summaryMessage = `Session completed on target. Healthy fatigue accumulated.`;
    }
  }

  return {
    mentalDelta,
    physicalDelta,
    overtimeMinutes,
    overtimeSurgeMultiplier,
    drainPenaltyXp,
    domain,
    summaryMessage,
  };
}

/**
 * Calculates natural passive decay during idle hours or sleep
 * (~4% mental recovery per hour, ~5% physical recovery per hour)
 */
export function calculatePassiveFatigueDecay(
  lastUpdateIso: string | undefined | null,
  currentMental = 0,
  currentPhysical = 0,
  nowIso?: string
): PassiveDecayResult {
  if (!lastUpdateIso) {
    return {
      newMentalFatigue: currentMental,
      newPhysicalFatigue: currentPhysical,
      hoursElapsed: 0,
    };
  }

  const then = new Date(lastUpdateIso).getTime();
  const now = nowIso ? new Date(nowIso).getTime() : Date.now();
  const diffMs = Math.max(0, now - then);
  const hoursElapsed = diffMs / (1000 * 60 * 60);

  if (hoursElapsed < 0.25) {
    // Less than 15 mins, no notable decay
    return {
      newMentalFatigue: currentMental,
      newPhysicalFatigue: currentPhysical,
      hoursElapsed,
    };
  }

  const mentalRecovery = hoursElapsed * 4.0; // 4% per hour
  const physicalRecovery = hoursElapsed * 5.0; // 5% per hour

  const newMentalFatigue = Math.max(0, Number((currentMental - mentalRecovery).toFixed(2)));
  const newPhysicalFatigue = Math.max(0, Number((currentPhysical - physicalRecovery).toFixed(2)));

  return {
    newMentalFatigue,
    newPhysicalFatigue,
    hoursElapsed,
  };
}
