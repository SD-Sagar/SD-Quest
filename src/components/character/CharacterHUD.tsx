"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Profile, PlayerAttributes, AttributeType } from "@/types";
import { calculateAge, triggerHaptic } from "@/lib/utils";
import { getRemainingPoisonTime } from "@/lib/calculations/nutrition";
import { StatAllocationModal } from "./StatAllocationModal";
import { getFatigueStatus, calculateCircadianAwakeStatus } from "@/lib/calculations/fatigue";
import { useLiveFatigue } from "@/lib/hooks/useLiveFatigue";
import { useAppSelector } from "@/store";
import {
  Zap,
  Shield,
  HeartPulse,
  Skull,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  Flame,
  Droplets,
  Moon,
  Coins,
} from "lucide-react";

interface CharacterHUDProps {
  profile: Profile;
  attributes: PlayerAttributes;
  onOpenSanctuaryModal?: () => void;
}

const ATTRIBUTE_LABELS: Record<AttributeType, { name: string; full: string }> = {
  strength: { name: "Strength", full: "STR" },
  agility: { name: "Agility", full: "AGI" },
  intelligence: { name: "Intelligent", full: "INT" },
  mentality: { name: "Mentality", full: "MEN" },
  vitality: { name: "Vitality", full: "VIT" },
  endurance: { name: "Endurance", full: "END" },
  discipline: { name: "Discipline", full: "DIS" },
};

export function CharacterHUD({
  profile,
  attributes,
  onOpenSanctuaryModal,
}: CharacterHUDProps) {
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
  const age = calculateAge(profile.dob);
  const unallocatedPoints = profile.unallocated_stat_points || 0;
  const poisonInfo = getRemainingPoisonTime(profile.poison_expires_at);

  const xpPercentage = Math.min(
    100,
    Math.round((profile.current_xp / (profile.xp_to_next_level || 500)) * 100)
  );

  const activeWorkout = useAppSelector((state) => state.workoutUi);
  const isWorkoutActive = activeWorkout.isActive && activeWorkout.status !== "completed";

  const sessionState = ((profile.active_session_state as any) || {});
  const isCurrentlySleeping = Boolean(
    sessionState.is_sleeping ||
    sessionState.category === "sleep" ||
    sessionState.session_id === "system-compulsory-sleep-stasis" ||
    sessionState.type === "sleep"
  );
  const circadian = calculateCircadianAwakeStatus({
    lastSleepStartedAt: profile.last_sleep_started_at || sessionState.last_sleep_started_at,
    lastSleepCompletedAt: profile.last_sleep_completed_at || sessionState.last_sleep_completed_at,
    rollingSleepMinutes: profile.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes,
    isCurrentlySleeping,
    frozenAwakeHours: sessionState.frozen_awake_hours,
    createdAt: profile.created_at,
  });

  const recoveryStats = useMemo(
    () => ({
      hunterLevel: profile.current_level,
      rank: profile.rank,
      vitality: attributes?.vitality,
      endurance: attributes?.endurance,
      mentality: attributes?.mentality,
      discipline: attributes?.discipline,
      lastHydrationSurgeAt: profile.last_hydration_surge_at || null,
    }),
    [profile, attributes]
  );

  const live = useLiveFatigue(
    profile.mental_fatigue,
    profile.physical_fatigue,
    profile.last_fatigue_update_at,
    recoveryStats
  );

  // If a workout session is active (even minimized), Dashboard displays live session fatigue!
  const mentalFatigue = isWorkoutActive
    ? activeWorkout.currentMentalFatigue
    : live.mentalFatigue;
  const physicalFatigue = isWorkoutActive
    ? activeWorkout.currentPhysicalFatigue
    : live.physicalFatigue;
  const displayMental = isWorkoutActive
    ? `${activeWorkout.currentMentalFatigue.toFixed(1)}%`
    : live.displayMental;
  const displayPhysical = isWorkoutActive
    ? `${activeWorkout.currentPhysicalFatigue.toFixed(1)}%`
    : live.displayPhysical;
  const fatigueStatus = isWorkoutActive
    ? getFatigueStatus(activeWorkout.currentMentalFatigue, activeWorkout.currentPhysicalFatigue)
    : live.fatigueStatus;

  const isExpBoosterActive = Boolean(
    profile.exp_booster_expires_at &&
      new Date(profile.exp_booster_expires_at).getTime() > Date.now()
  );
  const isSleepDeprived = Boolean(
    profile.sleep_deprived_expires_at &&
      new Date(profile.sleep_deprived_expires_at).getTime() > Date.now()
  );

  const getRingColor = (pct: number) => {
    if (pct >= 90) return "stroke-red-500 text-red-400";
    if (pct >= 70) return "stroke-orange-500 text-orange-400";
    if (pct >= 40) return "stroke-amber-400 text-amber-300";
    return "stroke-cyan-400 text-cyan-300";
  };

  const attributeKeys: AttributeType[] = [
    "strength",
    "agility",
    "intelligence",
    "mentality",
    "vitality",
    "endurance",
    "discipline",
  ];

  // Construct Unified Active Status Effects (Debuffs = RED, Buffs/Boosts = BLUE/WHITE)
  const activeEffects = useMemo(() => {
    const list: {
      id: string;
      type: "buff" | "debuff";
      title: string;
      description: string;
      badge?: string;
      timer?: string;
      icon: React.ReactNode;
      href?: string;
      onClick?: () => void;
    }[] = [];

    // 0. Circadian Exhaustion Lockout (26h+ Awake Deficit) (RED)
    if (circadian.isExhaustionLockout) {
      list.push({
        id: "circadian-lockout",
        type: "debuff",
        title: "CRITICAL EXHAUSTION // 26H+ SLEEP DEFICIT",
        description: `-50 XP/m Mana leak • 0% XP rate • Awake ${circadian.hoursAwakeLive.toFixed(1)}h`,
        badge: "LOCKOUT",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
        href: "/quests",
      });
    } else if (!circadian.hasAdequateSleep) {
      const sleptH = (circadian.cumulativeSleepMinutes / 60).toFixed(1);
      list.push({
        id: "inadequate-sleep",
        type: "debuff",
        title: `INADEQUATE REST (${sleptH}h / 4.0h MINIMUM)`,
        description: "Physical conditioning & Gym locked • Afternoon recovery nap needed",
        badge: "LOCKED",
        icon: <Moon className="w-3.5 h-3.5 text-red-400 shrink-0" />,
        href: "/quests",
      });
    }

    // 1. Alcohol Poison / Intoxication Debuff (RED)
    if (poisonInfo.isPoisoned) {
      list.push({
        id: "poison",
        type: "debuff",
        title: `POISON // INTOXICATION (${poisonInfo.intoxicationTier.toUpperCase()})`,
        description: `-${poisonInfo.xpPenaltyPct}% XP speed • Liver clearance in progress`,
        badge: `-${poisonInfo.xpPenaltyPct}% XP`,
        timer: poisonInfo.formattedString,
        icon: <Skull className="w-3.5 h-3.5 text-red-400 shrink-0" />,
        href: "/diet",
      });
    }

    // 2. Biological Fatigue Strain Debuff (RED)
    if (fatigueStatus.tier !== "optimal") {
      const isLockout = fatigueStatus.isNeuralLockout;
      list.push({
        id: "fatigue-strain",
        type: "debuff",
        title: isLockout ? "BRAIN FOG NEURAL LOCKOUT" : `BIOLOGICAL STRAIN // ${fatigueStatus.statusLabel.toUpperCase()}`,
        description: isLockout
          ? "Mental strain ≥ 85% • Zero XP earned until rested"
          : fatigueStatus.isOverload
          ? `Vitality leak (-${fatigueStatus.drainRatePer30s}%/30s) • Limiter-break threshold`
          : `Physical ${displayPhysical} | Mental ${displayMental} • Clear with rest / soft drinks`,
        badge: isLockout ? "0% XP" : `-${Math.round((1 - fatigueStatus.xpMultiplier) * 100)}% XP`,
        icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
      });
    }

    // 3. Sleep Deprived Debuff (RED)
    if (isSleepDeprived) {
      list.push({
        id: "sleep-deprived",
        type: "debuff",
        title: "SLEEP DEPRIVED // REST DEFICIT",
        description: "Rest protocol under 4 hours • Impaired cognitive recovery",
        badge: "-30% SPEED",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
      });
    }

    // 4. Chicken Status Debuff (RED)
    if (profile.condition === "chicken") {
      list.push({
        id: "chicken-condition",
        type: "debuff",
        title: "CHICKEN STATUS // PENALTY ACTIVE",
        description: "Discipline failure protocol applied",
        badge: "DEBUFF",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
        onClick: onOpenSanctuaryModal,
      });
    }

    // 5. Circadian Stasis 2X EXP Booster (BLUE/WHITE BUFF)
    if (isExpBoosterActive) {
      list.push({
        id: "circadian-booster",
        type: "buff",
        title: "CIRCADIAN STASIS // 2X EXP BOOSTER",
        description: "Optimal circadian sleep synchronization bonus",
        badge: "2.0X EXP",
        icon: <Zap className="w-3.5 h-3.5 text-cyan-300 fill-cyan-400 shrink-0" />,
      });
    }

    // 6. Cellular Hydration Surge (BLUE/WHITE BUFF)
    if (live.isHydrationSurgeActive && !isWorkoutActive) {
      const mins = Math.floor(live.hydrationRemainingSeconds / 60);
      const secs = String(live.hydrationRemainingSeconds % 60).padStart(2, "0");
      list.push({
        id: "hydration-surge",
        type: "buff",
        title: "CELLULAR HYDRATION SURGE",
        description: "+0.10%/m PHY • +0.05%/m MEN accelerated fatigue decay",
        badge: "SURGE",
        timer: `${mins}:${secs}`,
        icon: <Droplets className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />,
      });
    }

    // 7. Medical Sanctuary (BLUE/WHITE BUFF)
    if (profile.condition === "medical_sanctuary") {
      list.push({
        id: "medical-sanctuary",
        type: "buff",
        title: "HONORABLE MEDICAL SANCTUARY",
        description: "Streaks and historical progress protected",
        badge: "PROTECTED",
        icon: <Shield className="w-3.5 h-3.5 text-cyan-300 shrink-0" />,
        onClick: onOpenSanctuaryModal,
      });
    }

    return list;
  }, [
    poisonInfo,
    circadian,
    fatigueStatus,
    displayPhysical,
    displayMental,
    isSleepDeprived,
    profile.condition,
    isExpBoosterActive,
    live.isHydrationSurgeActive,
    live.hydrationRemainingSeconds,
    isWorkoutActive,
    onOpenSanctuaryModal,
  ]);

  const hasDebuff = activeEffects.some((e) => e.type === "debuff");

  return (
    <div className="solo-frame rounded-2xl p-4 sm:p-5 relative overflow-hidden space-y-4">
      {/* Top Ambient Mana Aura */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HUNTER HEADER & SILHOUETTE AVATAR */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative shrink-0">
          {/* Authentic Solo Leveling Avatar Frame with Dynamic Red/Cyan Contour Glow */}
          <div
            style={{
              borderColor: poisonInfo.isPoisoned ? poisonInfo.borderRgba : undefined,
              boxShadow: poisonInfo.isPoisoned ? poisonInfo.boxShadowGlow : undefined,
            }}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-b from-[#0b1220] to-[#05070d] p-1 flex items-center justify-center border-2 transition-all duration-700 ${
              poisonInfo.isPoisoned && poisonInfo.intoxicationLevel > 0.4
                ? "animate-pulse"
                : "border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            }`}
          >
            <div className="w-full h-full rounded-lg bg-[#070b14] flex items-center justify-center font-black text-2xl font-solo text-cyan-400 mana-text-glow">
              {(profile.name || "H").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Rank Badge */}
          <div className="absolute -bottom-2 -right-1 bg-cyan-950 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-400 shadow font-solo uppercase">
            {profile.rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white truncate font-solo white-text-glow">
              {profile.name}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                LVL {profile.current_level}
              </span>
              {unallocatedPoints > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("heavy");
                    setIsStatModalOpen(true);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-blue-600 border border-blue-400/50 text-[11px] font-mono font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.7)] transition"
                  title="Grace Coins Available for Debuff Purification!"
                >
                  <Coins className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  <span>{unallocatedPoints} COIN{unallocatedPoints !== 1 ? "S" : ""}</span>
                </button>
              )}
              {onOpenSanctuaryModal && (
                <button
                  onClick={onOpenSanctuaryModal}
                  className="p-1 rounded bg-slate-900/80 text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition"
                  title="Sanctuary / Condition Settings"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Age and Title Tag */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap font-hud">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
              AGE: {age}
            </span>
            <span className="text-xs text-slate-300 font-medium truncate">
              {profile.title}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MANA / EXPERIENCE ENERGY GAUGE */}
      <div className="relative z-10 space-y-1">
        <div className="flex justify-between items-center text-xs font-hud">
          <span className="text-slate-400 font-bold tracking-wider">MANA / XP PROGRESSION</span>
          <span className="text-cyan-400 font-bold font-mono mana-text-glow">
            {profile.current_xp} / {profile.xp_to_next_level} XP ({xpPercentage}%)
          </span>
        </div>
        <div className="h-2 w-full bg-[#05070e] rounded-full overflow-hidden border border-cyan-500/40 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white transition-all duration-500 ease-out shadow-[0_0_10px_#00e5ff]"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* 2.2 UNIFIED ACTIVE STATUS EFFECTS BAR (Live Responsive Matrix - RED Debuffs & BLUE/WHITE Boosts) */}
      {activeEffects.length > 0 && (
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-400 px-0.5">
            <span className="flex items-center gap-1.5 uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${hasDebuff ? "bg-red-500" : "bg-cyan-400"} animate-pulse`} />
              ACTIVE STATUS TELEMETRY ({activeEffects.length})
            </span>
            <span className="text-[9px] text-slate-500 uppercase">
              {hasDebuff ? "ADVERSE DEBUFFS PRESENT" : "BENEFICIAL ENHANCEMENTS"}
            </span>
          </div>

          <div
            className={`grid gap-2 ${
              activeEffects.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {activeEffects.map((effect) => {
              const isDebuff = effect.type === "debuff";
              const cardContent = (
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all duration-300 ${
                    isDebuff
                      ? "bg-white/[0.07] backdrop-blur-md border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.14)] hover:border-white/50"
                      : "bg-[#070b14]/90 border-cyan-400/40 text-cyan-200 shadow-[0_0_16px_rgba(0,229,255,0.18)] hover:border-cyan-400/70"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isDebuff
                          ? "bg-red-950/80 border border-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.5)] text-red-400"
                          : "bg-cyan-950/80 border border-cyan-500/70 shadow-[0_0_8px_rgba(0,229,255,0.5)] text-cyan-300"
                      }`}
                    >
                      {effect.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold block truncate font-hud tracking-wide text-white">
                        {isDebuff ? (
                          <>
                            <span className="text-red-400 font-black tracking-wider">
                              {effect.title.split("//")[0]?.trim()}
                            </span>
                            {effect.title.includes("//") && (
                              <span className="text-slate-200 font-semibold">
                                {" // " + effect.title.split("//").slice(1).join("//").trim()}
                              </span>
                            )}
                          </>
                        ) : (
                          effect.title
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-mono block truncate ${
                          isDebuff ? "text-slate-300" : "text-cyan-300/90"
                        }`}
                      >
                        {effect.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1 font-mono">
                    {effect.badge && (
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          isDebuff
                            ? "bg-red-950/90 text-red-300 border-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                            : "bg-cyan-950/90 text-cyan-300 border-cyan-400/70 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                        }`}
                      >
                        {effect.badge}
                      </span>
                    )}
                    {effect.timer && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded border ${
                          isDebuff
                            ? "bg-black/60 text-red-300 border-red-500/40"
                            : "bg-black/60 text-cyan-300 border-cyan-500/40"
                        }`}
                      >
                        {effect.timer}
                      </span>
                    )}
                  </div>
                </div>
              );

              if (effect.href) {
                return (
                  <Link key={effect.id} href={effect.href} className="block group">
                    {cardContent}
                  </Link>
                );
              }

              if (effect.onClick) {
                return (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={effect.onClick}
                    className="text-left w-full block group"
                  >
                    {cardContent}
                  </button>
                );
              }

              return <div key={effect.id}>{cardContent}</div>;
            })}
          </div>
        </div>
      )}

      {/* 2.5 DUAL BIOLOGICAL FATIGUE TELEMETRY (Mental & Physical Mini Rings) */}
      <div className="relative z-10 p-3 rounded-2xl bg-[#070b14]/90 border border-slate-800 space-y-2 font-hud">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isWorkoutActive ? "bg-amber-400" : "bg-cyan-400"} animate-pulse`} />
            {isWorkoutActive ? "LIVE SESSION TELEMETRY" : "BIOLOGICAL FATIGUE TELEMETRY"}
          </span>
          <span
            className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
              circadian.isExhaustionLockout
                ? "bg-red-950/90 text-red-300 border-red-500/70 animate-pulse"
                : !circadian.hasAdequateSleep
                ? "bg-red-950/80 text-red-300 border-red-500/60"
                : fatigueStatus.tier !== "optimal"
                ? "bg-red-950/80 text-red-300 border-red-500/60 animate-pulse"
                : "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
            }`}
          >
            {circadian.isExhaustionLockout
              ? "EXHAUSTION LOCKOUT"
              : !circadian.hasAdequateSleep
              ? "SLEEP DEFICIT"
              : fatigueStatus.statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Mental Fatigue Mini Ring */}
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
              <svg className="w-9 h-9 sm:w-10 sm:h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-slate-800"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className={`${getRingColor(mentalFatigue)} transition-all duration-500`}
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (94.2 * mentalFatigue) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Brain className="w-3.5 h-3.5 text-cyan-400 absolute" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block truncate">
                MENTAL
              </span>
              <span className="text-xs font-mono font-black text-white">
                {displayMental}
              </span>
            </div>
          </div>

          {/* Physical Fatigue Mini Ring */}
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
              <svg className="w-9 h-9 sm:w-10 sm:h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-slate-800"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className={`${getRingColor(physicalFatigue)} transition-all duration-500`}
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (94.2 * physicalFatigue) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Flame className="w-3.5 h-3.5 text-amber-400 absolute" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block truncate">
                PHYSICAL
              </span>
              <span className="text-xs font-mono font-black text-white">
                {displayPhysical}
              </span>
            </div>
          </div>

          {/* Circadian 26h Awake Mini Ring */}
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
              <svg className="w-9 h-9 sm:w-10 sm:h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-slate-800"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className={`${circadian.gaugeColor} transition-all duration-500`}
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (94.2 * circadian.gaugePercentage) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Moon className={`w-3.5 h-3.5 absolute ${circadian.isExhaustionLockout ? "text-red-400 animate-pulse" : "text-cyan-400"}`} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block truncate">
                CIRCADIAN
              </span>
              <span className={`text-[11px] sm:text-xs font-mono font-black truncate block ${circadian.isCurrentlySleeping ? "text-cyan-300 animate-pulse" : circadian.isExhaustionLockout ? "text-red-400 animate-pulse" : "text-white"}`}>
                {circadian.isCurrentlySleeping ? "STASIS (FROZEN)" : `${circadian.hoursAwakeLive.toFixed(1)}h/26h`}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Status / Debuff Note */}
        <p className="text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-1.5">
          {circadian.isCurrentlySleeping ? (
            <span className="text-cyan-300 font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              CIRCADIAN STASIS ACTIVE: Sleep stasis engaged. Awake countdown frozen at {circadian.hoursAwakeLive.toFixed(1)}h. Continuous decay halted.
            </span>
          ) : circadian.isExhaustionLockout ? (
            <span className="text-red-400 font-bold animate-pulse">
              ⚠ CRITICAL EXHAUSTION LOCKOUT ACTIVE: Awake {circadian.hoursAwakeLive.toFixed(1)}h (&ge; 26h limit)! -50 XP/min Mana leak active. Zero XP rate on all tasks. Enter bed or initiate sleep stasis immediately to halt decay!
            </span>
          ) : !circadian.hasAdequateSleep ? (
            <span className="text-red-400 font-bold">
              ⚠ INADEQUATE SLEEP ({Math.floor(circadian.cumulativeSleepMinutes / 60)}h {circadian.cumulativeSleepMinutes % 60}m / 4.0h): Physical conditioning &amp; gym protocols locked to prevent motor failure. Log an afternoon recovery nap to unlock!
            </span>
          ) : fatigueStatus.isNeuralLockout ? (
            <span className="text-red-400 font-bold animate-pulse">
              ⚠ BRAIN FOG LOCKOUT (0% XP ACTIVE): Mental fatigue &ge; 85%! Zero XP can be earned from any task until mental strain drops below 85%. Rest, fun activity, or cold drinks required.
            </span>
          ) : fatigueStatus.isOverload ? (
            <span className="text-red-400 font-bold animate-pulse">
              ⚠ VITALITY LEAK ACTIVE: -{fatigueStatus.drainRatePer30s}%/30s drain. Limiter-Break Surge active ({fatigueStatus.limiterBreakMultiplier}x attribute growth). Rest or consume refreshment!
            </span>
          ) : fatigueStatus.tier !== "optimal" ? (
            <span className="text-red-400 font-bold">
              Debuff Active: {Math.round(fatigueStatus.xpMultiplier * 100)}% XP gain speed. Leisure or soft drinks clear strain.
            </span>
          ) : (
            <span className="text-cyan-400/80">
              Optimal biological conditioning. Full 100% XP &amp; attribute growth active.
            </span>
          )}
        </p>
      </div>

      {/* 3. AUTHENTIC [ PERSONAL STATUS ] STATS SCREEN (Expandable / Collapsible) */}
      <div className="relative z-10 pt-1 space-y-2.5 font-hud">
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            setIsAttributesExpanded(!isAttributesExpanded);
          }}
          className="w-full p-2 rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 text-center relative overflow-hidden flex items-center justify-between px-3 transition group"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 text-xs">◆</span>
            <span className="text-[11px] font-solo font-bold text-cyan-300 uppercase tracking-widest mana-text-glow">
              PERSONAL STATUS ATTRIBUTES
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 group-hover:text-white transition">
            <span>{isAttributesExpanded ? "COLLAPSE ▲" : "EXPAND STATS ▼"}</span>
            {isAttributesExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {/* 2-Column Bracketed Stats matching Reference 2: [Strength Lv. X] [Agility Lv. Y] */}
        {isAttributesExpanded && (
          <div className="grid grid-cols-2 gap-2 font-hud animate-in fade-in slide-in-from-top-1 duration-150">
            {attributeKeys.map((attrKey) => {
              const score = Number(attributes[attrKey]) || 1.0;
              const meta = ATTRIBUTE_LABELS[attrKey];

              return (
                <div
                  key={attrKey}
                  className="solo-bracket flex items-center justify-between hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,229,255,0.25)] transition duration-150"
                >
                  <div className="min-w-0 flex items-center gap-1.5 truncate">
                    <span className="text-cyan-400 text-xs font-mono">◆</span>
                    <span className="text-slate-300 text-xs font-bold truncate">
                      [{meta.name} Lv. {Math.floor(score)}]
                    </span>
                  </div>
                  <span className="text-white font-mono font-black text-xs shrink-0 pl-1">
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stat Allocation Modal */}
      {isStatModalOpen && (
        <StatAllocationModal
          isOpen={isStatModalOpen}
          profile={profile}
          attributes={attributes}
          onClose={() => setIsStatModalOpen(false)}
        />
      )}
    </div>
  );
}
