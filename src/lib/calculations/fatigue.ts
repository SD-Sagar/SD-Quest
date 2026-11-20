// src/lib/calculations/fatigue.ts
// SD-QUEST: ADVANCED BIOLOGICAL FATIGUE ENGINE & DUAL TELEMETRY SYSTEM
// Incorporates:
// 1. Set-by-Set Physical Accumulation & Rest Interval Phosphagen Recovery
// 2. Hunter Level System Plan Benchmark (Following system plan digit-by-digit = 70%-85% fatigue)
// 3. Calibrated 9-Hour Work Shift (540 min = 75% Mental Fatigue; Overtime = +2% per 5 min)
// 4. Max Difficulty Acceleration (2x rate, reaches 75% in 4.5 hours)
// 5. Neural Lockout at 85% Mental Fatigue (0% XP Freeze)
// 6. 90%+ Overload Severity Tiers (0.002% -> 0.02% -> 0.2% drain per 30s)
// 7. Limiter-Break Overtime Attribute Growth (+0.75x to +1.0x boost)
// 8. Fun Hierarchy & Refreshment Purge
// 9. Dual/Mixed Quest Domain Processing

import { AttributeType } from "@/types";

export type FatigueTier = "optimal" | "strained" | "heavy" | "overload";

export interface FatigueStatusInfo {
  tier: FatigueTier;
  xpMultiplier: number;
  drainRatePer30s: number;
  drainRatePerMin: number;
  statusLabel: string;
  isOverload: boolean;
  isNeuralLockout: boolean;
  limiterBreakMultiplier: number;
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
 * Calculates the expected workout tonnage for Hunter Level L.
 * Completing this baseline tonnage digit-by-digit results in exactly 75% Physical Fatigue.
 */
export function calculateSystemPrescribedTonnage(hunterLevel = 1): number {
  const lvl = Math.max(1, Number(hunterLevel) || 1);
  // Level 1: 350 kg (e.g. 2 exercises x 3 sets x 10 reps @ 6 kg)
  // Level 10: ~1,230 kg
  // Level 30: ~3,190 kg
  // Level 50: ~5,150 kg
  // Level 100+: ~10,000+ kg
  return Math.round(350 * (1 + (lvl - 1) * 0.28));
}

/**
 * Evaluates live fatigue state, Neural Lockout (85% Mental = 0% XP),
 * 90%+ Overload Drain Severity Scale, and Limiter-Break Attribute Multipliers.
 */
export function getFatigueStatus(mentalFatigue = 0, physicalFatigue = 0): FatigueStatusInfo {
  const mental = Math.min(100, Math.max(0, Number(mentalFatigue) || 0));
  const physical = Math.min(100, Math.max(0, Number(physicalFatigue) || 0));
  const peakFatigue = Math.max(mental, physical);

  const isNeuralLockout = mental >= 85;

  // 1. CRITICAL OVERLOAD TIER (>= 90%)
  if (peakFatigue >= 90) {
    let drainRatePer30s = 0.002;
    let tierLabel = "TIER I (0.002% Drain)";
    let limiterBreakMultiplier = 1.75; // +0.75x attribute acceleration

    if (peakFatigue >= 98) {
      drainRatePer30s = 0.2; // 0.2% per 30s
      tierLabel = "TIER III EXTREME (0.2% Drain)";
      limiterBreakMultiplier = 2.0; // +1.0x attribute acceleration
    } else if (peakFatigue >= 94) {
      drainRatePer30s = 0.02; // 0.02% per 30s
      tierLabel = "TIER II SEVERE (0.02% Drain)";
      limiterBreakMultiplier = 1.85; // +0.85x attribute acceleration
    }

    const xpMultiplier = isNeuralLockout ? 0.0 : 0.4;

    return {
      tier: "overload",
      xpMultiplier,
      drainRatePer30s,
      drainRatePerMin: drainRatePer30s * 2,
      statusLabel: `CRITICAL OVERLOAD // ${tierLabel}`,
      isOverload: true,
      isNeuralLockout,
      limiterBreakMultiplier,
      activeDebuffDescription: isNeuralLockout
        ? `BRAIN FOG LOCKOUT (0% XP): Mental fatigue >= 85%! Vitality leak active (${drainRatePer30s}%/30s). Attribute Surge active (${limiterBreakMultiplier}x). Rest or consume refreshment required!`
        : `LIMITER BREAK ACTIVE: Peak fatigue >= 90%. Vitality leak (${drainRatePer30s}%/30s), but attribute growth boosted to ${limiterBreakMultiplier}x!`,
    };
  }

  // 2. HEAVY STRAIN TIER (70% - 89.9%)
  if (peakFatigue >= 70) {
    const xpMultiplier = isNeuralLockout ? 0.0 : 0.6;
    return {
      tier: "heavy",
      xpMultiplier,
      drainRatePer30s: 0,
      drainRatePerMin: 0,
      statusLabel: isNeuralLockout ? "NEURAL LOCKOUT (0% XP)" : "HEAVY STRAIN (70-85% Target Zone)",
      isOverload: false,
      isNeuralLockout,
      limiterBreakMultiplier: 1.0,
      activeDebuffDescription: isNeuralLockout
        ? "BRAIN FOG LOCKOUT (0% XP): Mental fatigue >= 85%! Zero XP gained from any quest until mental exhaustion drops below 85%."
        : "Heavy Fatigue: Target exhaustion range reached. -40% XP gain speed. Rest or fun protocol recommended.",
    };
  }

  // 3. STRAINED TIER (40% - 69.9%)
  if (peakFatigue >= 40) {
    return {
      tier: "strained",
      xpMultiplier: 0.85,
      drainRatePer30s: 0,
      drainRatePerMin: 0,
      statusLabel: "STRAINED",
      isOverload: false,
      isNeuralLockout: false,
      limiterBreakMultiplier: 1.0,
      activeDebuffDescription: "Moderate Fatigue: -15% XP Yield. Character experiencing natural daily wear.",
    };
  }

  // 4. OPTIMAL STATE (< 40%)
  return {
    tier: "optimal",
    xpMultiplier: 1.0,
    drainRatePer30s: 0,
    drainRatePerMin: 0,
    statusLabel: "OPTIMAL CONDITION",
    isOverload: false,
    isNeuralLockout: false,
    limiterBreakMultiplier: 1.0,
    activeDebuffDescription: "Peak Hunter Condition: 100% XP & Attribute Progression active.",
  };
}

/**
 * Classifies domain based on linked attributes and category.
 * Detects Dual / Mixed Quests automatically.
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

export interface SetFatigueInput {
  setIndex: number; // 0-indexed completed sets count
  totalSets: number; // Total planned sets in the workout
  weightKg: number;
  reps: number;
  plannedWeightKg?: number;
  plannedReps?: number;
  hunterLevel?: number;
  endurance?: number;
  vitality?: number;
}

/**
 * Calculates set-by-set compounding physical & CNS mental fatigue during an active gym session.
 * Compounding curve: Set 1 causes ~3.3% gross, final set causes ~11.5% gross.
 * Balanced so that completing all N planned sets with 100% planned rest yields exactly 75.0% net fatigue!
 */
export function calculateSetFatigueDelta(params: SetFatigueInput): {
  physicalDelta: number;
  mentalDelta: number;
} {
  const {
    setIndex,
    totalSets,
    weightKg,
    reps,
    plannedWeightKg,
    plannedReps,
    hunterLevel = 1,
    endurance = 1,
    vitality = 1,
  } = params;

  const N = Math.max(1, totalSets);
  const k = Math.min(N, setIndex + 1); // 1-indexed completed set
  const progressRatio = (k - 1) / Math.max(1, N - 1); // 0 to 1

  // Load ratio: actual work vs planned work
  const actualWork = Math.max(1, weightKg * reps);
  const plannedWork = Math.max(1, (plannedWeightKg || weightKg) * (plannedReps || reps));
  const loadRatio = Math.max(0.4, Math.min(2.5, actualWork / plannedWork));

  // Stat resistance from Hunter stats
  const statResistance = Math.max(
    0.5,
    1 / (1 + (Number(endurance) + Number(vitality)) * 0.005 + Math.max(0, hunterLevel - 1) * 0.004)
  );

  // Calibration: over N sets with planned rest, net fatigue = 75.0%
  // Average target net per set = 75.0 / N
  // Full planned rest recovers 2.0% per interval -> Total planned rest = (N - 1) * 2.0
  const totalPlannedRestRecovery = (N - 1) * 2.0;
  const targetTotalGross = 75.0 + totalPlannedRestRecovery;
  const targetAvgGross = targetTotalGross / N;

  // Compounding shape: base + curve * p^1.8
  const baseGross = targetAvgGross * 0.55;
  const curveGross = targetAvgGross * 1.35;

  const grossPhysical =
    (baseGross + curveGross * Math.pow(progressRatio, 1.8)) *
    Math.pow(loadRatio, 1.25) *
    statResistance;

  // CNS Mental fatigue: heavy lifting requires neural focus (~0.3% to ~0.7% per set)
  const grossMental = (0.3 + 0.35 * progressRatio) * Math.min(1.5, loadRatio) * statResistance;

  return {
    physicalDelta: Number(grossPhysical.toFixed(2)),
    mentalDelta: Number(grossMental.toFixed(2)),
  };
}

/**
 * Phosphagen / ATP-CP recovery per second during rest interval.
 * Resting the full planned time (e.g. 90s) restores 2.0% physical fatigue (~0.022%/sec).
 * If the user cuts rest short, they miss out on recovery and enter the next set with higher residual fatigue!
 */
export function calculateRestRecoveryPerSecond(plannedRestSeconds = 90): number {
  const restSecs = Math.max(15, plannedRestSeconds);
  return 2.0 / restSecs;
}

export function calculateRestRecoveryDelta(restSeconds: number, plannedRestSeconds = 90): number {
  if (restSeconds <= 0) return 0;
  const perSec = calculateRestRecoveryPerSecond(plannedRestSeconds);
  return Number((restSeconds * perSec).toFixed(2));
}

export interface SessionFatigueParams {
  durationMinutes: number;
  targetMinutes: number;
  isFun?: boolean;
  linkedAttributes?: AttributeType[];
  category?: string;
  currentMentalFatigue?: number;
  currentPhysicalFatigue?: number;
  intensityMultiplier?: number;
  hunterLevel?: number;
  endurance?: number;
  vitality?: number;
  discipline?: number;
  mentality?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  difficulty?: string;
  actualTonnageKg?: number;
  plannedTonnageKg?: number;
  actualFinalPhysicalFatigue?: number;
  actualFinalMentalFatigue?: number;
}

/**
 * Master Fatigue Delta Engine:
 * - 9-hour work shift = 75% Mental Fatigue (0.1389%/min).
 * - Overtime = +2% for every 5 minutes (+0.40%/min).
 * - Max Difficulty = 2x rate (75% reached in 4.5 hours).
 * - Gym Session: Following prescribed System Tonnage digit-by-digit = 75% Physical Fatigue.
 * - Mixed Quests: Both meters accumulate simultaneously.
 * - Fun Protocol: Pure fun drops mental fatigue entirely; Fun with work dampens fatigue by 70%.
 */
export function calculateSessionFatigueDelta(params: SessionFatigueParams): SessionFatigueResult {
  const {
    durationMinutes,
    targetMinutes,
    isFun = false,
    linkedAttributes = [],
    category,
    currentMentalFatigue = 0,
    currentPhysicalFatigue = 0,
    intensityMultiplier = 1.0,
    hunterLevel = 1,
    endurance = 1.0,
    vitality = 1.0,
    discipline = 1.0,
    mentality = 1.0,
    priority = "medium",
    difficulty = "Recruit",
    actualTonnageKg = 0,
  } = params;

  const domain = determineTaskDomain(linkedAttributes, category);
  const overtimeMinutes = Math.max(0, durationMinutes - targetMinutes);
  const normalMinutes = Math.min(durationMinutes, targetMinutes);

  // Overtime Surge Multiplier (+0.75x baseline acceleration)
  let overtimeSurgeMultiplier = overtimeMinutes > 0 ? 1.75 : 1.0;

  // Biological Capacity & Stat Resistance
  const physicalResistance = Math.max(
    0.35,
    1 / (1 + (Number(endurance) + Number(vitality)) * 0.006 + Math.max(0, hunterLevel - 1) * 0.005)
  );
  const mentalResistance = Math.max(
    0.35,
    1 / (1 + (Number(discipline) + Number(mentality)) * 0.006 + Math.max(0, hunterLevel - 1) * 0.005)
  );

  let mentalDelta = 0;
  let physicalDelta = 0;
  let drainPenaltyXp = 0;
  let summaryMessage = "";

  // ---------------------------------------------------------------------------
  // CASE 1: PURE FUN (No heavy attributes linked, e.g. watching anime, chilling)
  // ---------------------------------------------------------------------------
  if (isFun && linkedAttributes.length === 0) {
    // Drops mental fatigue drastically (up to -30% or clears completely)
    const hours = durationMinutes / 60;
    mentalDelta = -Math.min(currentMentalFatigue, Math.round(25 + hours * 5));
    physicalDelta = 0;
    summaryMessage = `Recreational Protocol: Mental Fatigue purged by ${Math.abs(mentalDelta)}%!`;
  }
  // ---------------------------------------------------------------------------
  // CASE 2: FUN WITH STATS / WORK (e.g. casual football, music, gaming)
  // ---------------------------------------------------------------------------
  else if (isFun && linkedAttributes.length > 0) {
    // Relieves mental stress rapidly, but retains some fatigue because work is being done.
    // Builds ~70% slower (0.3x rate).
    const normalMental = (normalMinutes / 540) * 75.0 * 0.3;
    const overtimeMental = (overtimeMinutes / 5) * 2.0 * 0.3;
    mentalDelta = Number(((normalMental + overtimeMental) * mentalResistance).toFixed(1));

    if (domain === "physical" || domain === "hybrid") {
      const normalPhysical = (normalMinutes / 60) * 15.0 * 0.3;
      const overtimePhysical = (overtimeMinutes / 60) * 30.0 * 0.3;
      physicalDelta = Number(((normalPhysical + overtimePhysical) * physicalResistance).toFixed(1));
    }
    summaryMessage = "Recreational Directive: Full attribute growth with 70% dampened fatigue buildup.";
  }
  // ---------------------------------------------------------------------------
  // CASE 3: GYM WORKOUT / PHYSICAL EXERTION
  // ---------------------------------------------------------------------------
  else if (category === "fitness" || domain === "physical") {
    if (params.actualFinalPhysicalFatigue !== undefined) {
      // In-session live set compounding directly committed
      physicalDelta = params.actualFinalPhysicalFatigue;
      mentalDelta = params.actualFinalMentalFatigue || 0;
    } else {
      // Fallback: calibrate against routine planned tonnage (or system prescribed level tonnage)
      const prescribedTonnage = params.plannedTonnageKg || calculateSystemPrescribedTonnage(hunterLevel);
      const sessionTonnage = actualTonnageKg > 0 ? actualTonnageKg : Math.round(prescribedTonnage * (durationMinutes / 45));
      const workloadRatio = sessionTonnage / Math.max(50, prescribedTonnage);

      // Following System Plan digit-by-digit (ratio = 1.0) yields exactly 75% physical fatigue!
      // Pushing beyond 100% volume accelerates into 85% -> 90%+ overload.
      let basePhysical = 75.0 * Math.pow(Math.min(2.0, workloadRatio), 1.25);

      // Overtime gym spikes physical fatigue
      if (overtimeMinutes > 0) {
        basePhysical += (overtimeMinutes / 5) * 2.0;
      }

      // Testing floor for very fast test workouts (< 5 min)
      const finalPhysical = Math.max(durationMinutes < 5 ? 4.0 : 1.0, basePhysical * physicalResistance);
      physicalDelta = Number(finalPhysical.toFixed(1));

      // CNS (Central Nervous System) Fatigue: Heavy workout or overtime spills over into Mental Fatigue
      if (overtimeMinutes >= 15 || workloadRatio > 1.15) {
        mentalDelta = Number((((overtimeMinutes / 5) * 1.5 + (workloadRatio > 1.15 ? 10 : 0)) * mentalResistance).toFixed(1));
      }
    }

    summaryMessage = overtimeMinutes > 0
      ? `Workout Complete with Overtime! Heavy physical load & CNS strain incurred.`
      : `Workout Complete: System Plan volume executed.`;
  }
  // ---------------------------------------------------------------------------
  // CASE 4: STANDARD DISCIPLINED TASK (9-Hour Shift, Coding, Deep Study)
  // ---------------------------------------------------------------------------
  else {
    // Multiplier for Maximum Difficulty / Urgent tasks (2x rate: reaches 75% in 4.5 hours)
    const isMaxDifficulty = priority === "urgent" || difficulty === "Spartan" || difficulty === "Ascendant";
    const difficultyMultiplier = isMaxDifficulty ? 2.0 : 1.0;

    // Normal rate: 9 hours (540 min) = exactly 75.0% mental fatigue
    const normalMental = (normalMinutes / 540) * 75.0 * difficultyMultiplier;

    // Overtime rate: +2% for every 5 minutes (+0.40% / min)
    const overtimeMental = (overtimeMinutes / 5) * 2.0 * difficultyMultiplier;

    mentalDelta = Number(((normalMental + overtimeMental) * mentalResistance).toFixed(1));

    // Sedentary Posture & Eye Strain Spillover: Working long overtime (> 30 min) causes physical fatigue
    if (overtimeMinutes >= 30) {
      physicalDelta = Number(((overtimeMinutes / 30) * 4.0 * physicalResistance).toFixed(1));
    }

    // Dual/Mixed Quests: If tagged with physical attributes as well, calculate physical fatigue
    if (domain === "hybrid") {
      const normalPhys = (normalMinutes / 60) * 10.0 * difficultyMultiplier;
      const overtimePhys = (overtimeMinutes / 5) * 1.5;
      physicalDelta = Math.max(physicalDelta, Number(((normalPhys + overtimePhys) * physicalResistance).toFixed(1)));
    }

    summaryMessage = overtimeMinutes > 0
      ? `Shift / Quest Complete with Overtime (+2% per 5 min accrued)!`
      : `Shift / Quest Complete: Normal cognitive strain applied.`;
  }

  // ---------------------------------------------------------------------------
  // 90%+ OVERLOAD EVALUATION & DRAIN CALCULATION
  // ---------------------------------------------------------------------------
  const prospectivePeak = Math.max(
    currentMentalFatigue + mentalDelta,
    currentPhysicalFatigue + physicalDelta
  );

  if (prospectivePeak >= 90) {
    const status = getFatigueStatus(currentMentalFatigue + mentalDelta, currentPhysicalFatigue + physicalDelta);
    overtimeSurgeMultiplier = status.limiterBreakMultiplier;

    if (overtimeMinutes > 0) {
      // Drain scaled by severity (0.002% to 0.2% per 30s)
      const intervalsOf30s = (overtimeMinutes * 60) / 30;
      drainPenaltyXp = Number((intervalsOf30s * status.drainRatePer30s).toFixed(2));
      summaryMessage = `${status.statusLabel} Active! Overload Drain applied (-${drainPenaltyXp} XP), but Limiter-Break Attribute Surge granted (${overtimeSurgeMultiplier}x)!`;
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

export interface HunterRecoveryStats {
  hunterLevel?: number;
  rank?: string;
  vitality?: number;
  endurance?: number;
  mentality?: number;
  discipline?: number;
  lastHydrationSurgeAt?: string | null;
}

export interface DynamicRecoveryRateResult {
  physicalRatePerSec: number;
  mentalRatePerSec: number;
  physicalPerMin: number;
  mentalPerMin: number;
  physicalStatMultiplier: number;
  mentalStatMultiplier: number;
  isHydrationSurgeActive: boolean;
  hydrationSurgeRemainingSeconds: number;
}

/**
 * Calculates continuous biological physical and mental recovery rates per second
 * based on Hunter Rank, Level, Vitality, Endurance, Mentality, Discipline,
 * and 5-minute Cellular Hydration Surges.
 *
 * Real-Life Physiology & Solo Leveling Conditioning:
 * - Baseline Human (Level 1 Recruit, 10 VIT, 10 END): Takes ~3 to 3.5 hours of passive rest
 *   to clear heavy post-workout fatigue (~22% per hour / ~0.367%/min / ~0.0061%/sec).
 * - High Stats & Levels (Vitality & Endurance): Cellular regeneration scales up by 2x to 5x+.
 * - Cellular Hydration Surge (1 tap of water): +0.10%/min physical recovery for 5 minutes.
 *   During those 5 minutes, subsequent sips do not stack. Mental recovery receives a +0.05%/min neural boost.
 */
export function calculateDynamicFatigueRecovery(
  stats: HunterRecoveryStats = {}
): DynamicRecoveryRateResult {
  const level = Math.max(1, stats.hunterLevel || 1);
  const vit = Math.max(1, stats.vitality ?? 10);
  const end = Math.max(1, stats.endurance ?? 10);
  const men = Math.max(1, stats.mentality ?? 10);
  const dis = Math.max(1, stats.discipline ?? 10);

  // Baseline Human at Level 1 Recruit (10 VIT, 10 END):
  // ~22% physical clearance per hour (~0.367%/min, ~0.00611%/sec)
  // ~18% mental clearance per hour (~0.300%/min, ~0.00500%/sec)
  const basePhysicalRatePerSec = 0.00611;
  const baseMentalRatePerSec = 0.005;

  // Physical Regeneration Multiplier:
  // Scales up with Vitality, Endurance, and Hunter Level
  const physicalStatMultiplier = Math.max(
    0.6,
    1.0 + (vit - 10) * 0.025 + (end - 10) * 0.015 + (level - 1) * 0.02
  );

  // Mental Regeneration Multiplier:
  // Scales up with Mentality, Discipline, and Hunter Level
  const mentalStatMultiplier = Math.max(
    0.6,
    1.0 + (men - 10) * 0.03 + (dis - 10) * 0.015 + (level - 1) * 0.02
  );

  let physicalRatePerSec = basePhysicalRatePerSec * physicalStatMultiplier;
  let mentalRatePerSec = baseMentalRatePerSec * mentalStatMultiplier;

  // 5-Minute Cellular Hydration Surge:
  // 1 tap of water increases physical reduction rate by +0.10%/min (+0.00167%/sec) for 5 minutes.
  // Neural hydration boost increases mental reduction rate by +0.05%/min (+0.00083%/sec).
  let isHydrationSurgeActive = false;
  let hydrationSurgeRemainingSeconds = 0;

  if (stats.lastHydrationSurgeAt) {
    const surgeStart = new Date(stats.lastHydrationSurgeAt).getTime();
    const elapsedSeconds = (Date.now() - surgeStart) / 1000;
    if (elapsedSeconds >= 0 && elapsedSeconds < 300) {
      isHydrationSurgeActive = true;
      hydrationSurgeRemainingSeconds = Math.max(0, 300 - Math.floor(elapsedSeconds));
      physicalRatePerSec += 0.10 / 60; // +0.10% per min
      mentalRatePerSec += 0.05 / 60; // +0.05% per min
    }
  }

  return {
    physicalRatePerSec,
    mentalRatePerSec,
    physicalPerMin: physicalRatePerSec * 60,
    mentalPerMin: mentalRatePerSec * 60,
    physicalStatMultiplier,
    mentalStatMultiplier,
    isHydrationSurgeActive,
    hydrationSurgeRemainingSeconds,
  };
}

/**
 * Calculates continuous passive decay during idle hours or sleep,
 * driven by dynamic Hunter stats, Rank, and Cellular Hydration Surges.
 */
export function calculatePassiveFatigueDecay(
  lastUpdateIso: string | undefined | null,
  currentMental = 0,
  currentPhysical = 0,
  nowIso?: string,
  recoveryStats?: HunterRecoveryStats
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

  // Less than 3 seconds, ignore jitter
  if (diffMs < 3000) {
    return {
      newMentalFatigue: currentMental,
      newPhysicalFatigue: currentPhysical,
      hoursElapsed,
    };
  }

  const rates = calculateDynamicFatigueRecovery(recoveryStats);
  const secondsElapsed = diffMs / 1000;
  const mentalRecovery = secondsElapsed * rates.mentalRatePerSec;
  const physicalRecovery = secondsElapsed * rates.physicalRatePerSec;

  const newMentalFatigue = Math.max(0, Number((currentMental - mentalRecovery).toFixed(2)));
  const newPhysicalFatigue = Math.max(0, Number((currentPhysical - physicalRecovery).toFixed(2)));

  return {
    newMentalFatigue,
    newPhysicalFatigue,
    hoursElapsed,
  };
}

export interface SleepProtocolResult {
  hoursSlept: number;
  minutesSlept: number;
  isDeprived: boolean; // < 4 hours (240 mins)
  isOptimal: boolean; // 8.0 to 8.5 hours (480-510 mins)
  isCompleted: boolean; // >= 4 hours (240 mins)
  mentalDelta: number;
  physicalDelta: number;
  xpPenalty: number; // 100 XP penalty if deprived (< 4 hours)
  expBoosterMultiplier: number; // 2.0 if optimal, 1.0 otherwise
  expBoosterDurationHours: number; // 5 hours if optimal
  mentalityGain: number; // +0.75 if optimal, +0.25 if completed, 0 if deprived
  sleepDeprivationHours: number; // 5 hours debuff if deprived
  summaryMessage: string;
}

/**
 * Biological Circadian Sleep Protocol Engine:
 * - < 4 hours: Sleep Deprivation (-100 Mana/XP penalty & 5h 0.7x EXP debuff)
 * - 4 to 8 hours: Standard biological recovery (12-hour cooldown before reactivation)
 * - 8.0 to 8.5 hours: OPTIMAL CIRCADIAN SYNC -> 2X EXP Booster for 5 hours + full fatigue wipe + Mentality boost
 * - > 8.5 hours: Extended rest (full recovery, no 2x booster, slight grogginess if > 9.5h)
 */
export function calculateSleepProtocolRecovery(minutesSlept: number): SleepProtocolResult {
  const hoursSlept = Number((minutesSlept / 60).toFixed(2));

  // CASE 1: SLEEP DEPRIVATION (< 4 HOURS)
  if (hoursSlept < 4.0) {
    return {
      hoursSlept,
      minutesSlept,
      isDeprived: true,
      isOptimal: false,
      isCompleted: false,
      mentalDelta: -Number((hoursSlept * 2.0).toFixed(2)),
      physicalDelta: -Number((hoursSlept * 2.5).toFixed(2)),
      xpPenalty: 100,
      expBoosterMultiplier: 1.0,
      expBoosterDurationHours: 0,
      mentalityGain: 0,
      sleepDeprivationHours: 5,
      summaryMessage: `Sleep Deprivation (< 4h): Terminating rest at ${hoursSlept}h causes circadian breakdown! Penalty: -100 Mana and a 5-hour EXP debuff (0.7x speed).`,
    };
  }

  // CASE 2: OPTIMAL CIRCADIAN SYNCHRONIZATION (8.0 to 8.5 HOURS)
  if (hoursSlept >= 8.0 && hoursSlept <= 8.5) {
    return {
      hoursSlept,
      minutesSlept,
      isDeprived: false,
      isOptimal: true,
      isCompleted: true,
      mentalDelta: -40.0,
      physicalDelta: -50.0,
      xpPenalty: 0,
      expBoosterMultiplier: 2.0,
      expBoosterDurationHours: 5,
      mentalityGain: 0.75,
      sleepDeprivationHours: 0,
      summaryMessage: `Optimal Circadian Sync (${hoursSlept}h): ⚡ 2X EXP Booster activated for the next 5 hours! Complete neural and muscular restoration.`,
    };
  }

  // CASE 3: EXTENDED SLEEP (> 8.5 HOURS)
  if (hoursSlept > 8.5) {
    return {
      hoursSlept,
      minutesSlept,
      isDeprived: false,
      isOptimal: false,
      isCompleted: true,
      mentalDelta: -Number((hoursSlept * 4.0).toFixed(2)),
      physicalDelta: -Number((hoursSlept * 5.0).toFixed(2)),
      xpPenalty: 0,
      expBoosterMultiplier: 1.0,
      expBoosterDurationHours: 0,
      mentalityGain: 0.35,
      sleepDeprivationHours: 0,
      summaryMessage: `Extended Sleep (${hoursSlept}h): Full restorative recovery applied. (12-hour cooldown started).`,
    };
  }

  // CASE 4: STANDARD REST (4.0 to 7.99 HOURS)
  return {
    hoursSlept,
    minutesSlept,
    isDeprived: false,
    isOptimal: false,
    isCompleted: true,
    mentalDelta: -Number((hoursSlept * 4.0).toFixed(2)),
    physicalDelta: -Number((hoursSlept * 5.0).toFixed(2)),
    xpPenalty: 0,
    expBoosterMultiplier: 1.0,
    expBoosterDurationHours: 0,
    mentalityGain: 0.25,
    sleepDeprivationHours: 0,
    summaryMessage: `Circadian Rest (${hoursSlept}h): Restorative recovery applied. (12-hour cooldown started).`,
  };
}
