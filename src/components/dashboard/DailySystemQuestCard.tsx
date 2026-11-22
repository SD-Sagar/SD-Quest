"use client";

import { useState, useEffect } from "react";
import { triggerHaptic } from "@/lib/utils";
import { playLevelUpSound } from "@/lib/audio/soundEffects";
import { claimDailyMysteryBoxAction } from "@/server/actions/player.actions";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Circle,
  Gift,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface DailySystemQuestCardProps {
  workoutCompleted: boolean;
  isRestDay: boolean;
  currentHydrationMl: number;
  targetHydrationMl: number;
  currentSteps: number;
  targetSteps: number;
  completedQuestsCount: number;
  totalQuestsCount: number;
  streakDays?: number;
  streakStatus?: "completed_today" | "pending_today" | "grace_period" | "sanctuary_protected" | "expired";
  streakMultiplier?: string;
  streakTier?: "baseline" | "ignition" | "surge" | "overdrive";
  streakMessage?: string;
  initialCrateClaimed?: boolean;
  enableGym?: boolean;
  activeMainQuest?: string;
  isMainGoalCompleted?: boolean;
}

export function DailySystemQuestCard({
  workoutCompleted,
  isRestDay,
  currentHydrationMl,
  targetHydrationMl = 2400,
  currentSteps,
  targetSteps = 6000,
  completedQuestsCount,
  totalQuestsCount,
  streakDays = 0,
  streakStatus = "pending_today",
  streakMultiplier = "1.00x",
  streakTier = "baseline",
  streakMessage,
  initialCrateClaimed = false,
  enableGym = true,
  activeMainQuest = "fitness",
  isMainGoalCompleted,
}: DailySystemQuestCardProps) {
  const [crateClaimed, setCrateClaimed] = useState(initialCrateClaimed);
  const [currentStreakDisplay, setCurrentStreakDisplay] = useState(streakDays);
  const [claimRewardInfo, setClaimRewardInfo] = useState<{
    xpAwarded?: number;
    multiplierLabel?: string;
    newStreak?: number;
    bonusStatPoints?: number;
    isMilestone?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    setCrateClaimed(initialCrateClaimed);
    setCurrentStreakDisplay(streakDays);
  }, [initialCrateClaimed, streakDays]);

  // Dynamic Challenge 1 based on Hunter's Active Main Quest Domain
  const mainQuestDomain = activeMainQuest || (enableGym ? "fitness" : "career");
  const isFitnessDomain = mainQuestDomain === "fitness";

  const task1Done = isFitnessDomain
    ? (workoutCompleted || isRestDay)
    : (isMainGoalCompleted !== undefined ? isMainGoalCompleted : completedQuestsCount >= 1);
  const task2Done = currentHydrationMl >= targetHydrationMl;
  const task3Done = currentSteps >= targetSteps;
  const task4Done = isFitnessDomain
    ? (completedQuestsCount >= 1)
    : (completedQuestsCount >= 2 || (completedQuestsCount >= 1 && totalQuestsCount <= 1));

  let task1Title = "1. Physical Conditioning";
  let task1Subtitle = isRestDay ? "Recovery Protocol" : "Today's Split or 100 Pushups";

  if (mainQuestDomain === "career") {
    task1Title = "1. Career & Professional Focus";
    task1Subtitle = "Conquer Priority Work Sprint or Milestone";
  } else if (mainQuestDomain === "education") {
    task1Title = "1. Intellectual Mastery";
    task1Subtitle = "Complete Deep Study or Academic Sprint";
  } else if (mainQuestDomain === "finance") {
    task1Title = "1. Financial Governance";
    task1Subtitle = "Track Expenses, Revenue or Budget Audit";
  }

  const totalTasks = 4;
  const completedTasks = [task1Done, task2Done, task3Done, task4Done].filter(Boolean).length;
  // User Rule: Streak qualifies as long as Today's Main Quest (task1) is completed AND at least 1 other challenge is completed
  const isStreakQualified = task1Done && (task2Done || task3Done || task4Done);
  const allCompleted = completedTasks === totalTasks;

  // Authentic Solo Leveling Grade Styling
  let dailyGrade = "E";
  let gradeColor = "text-slate-400 border-slate-800 bg-[#070b14]";
  if (completedTasks === 4) {
    dailyGrade = "S";
    gradeColor = "text-white border-white bg-white/20 shadow-[0_0_20px_#ffffff] mana-text-glow";
  } else if (isStreakQualified) {
    dailyGrade = completedTasks === 3 ? "A" : "B";
    gradeColor = "text-white border-white/60 bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.3)]";
  } else if (completedTasks === 1) {
    dailyGrade = "C";
    gradeColor = "text-slate-300 border-slate-700 bg-slate-900";
  }

  // Fallback streak multiplier if not explicitly passed
  let activeMultiplier = streakMultiplier;
  if (!activeMultiplier) {
    if (currentStreakDisplay >= 14) activeMultiplier = "1.50x";
    else if (currentStreakDisplay >= 7) activeMultiplier = "1.25x";
    else if (currentStreakDisplay >= 3) activeMultiplier = "1.10x";
    else activeMultiplier = "1.00x";
  }

  const handleClaimCrate = async () => {
    if (!allCompleted || crateClaimed) return;
    triggerHaptic("heavy");
    playLevelUpSound();
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.5 },
    });
    setCrateClaimed(true);

    try {
      const res = await claimDailyMysteryBoxAction();
      if (res) {
        setClaimRewardInfo({
          xpAwarded: res.xpAwarded,
          multiplierLabel: res.multiplierLabel,
          newStreak: res.newStreak,
          bonusStatPoints: res.bonusStatPoints,
          isMilestone: res.isMilestone,
          message: res.message,
        });
        if (res.newStreak !== undefined) {
          setCurrentStreakDisplay(res.newStreak);
        }
      }
    } catch (err) {
      console.error("Failed to claim crate in Supabase:", err);
    }
  };

  return (
    <div className="solo-frame rounded-2xl p-4 sm:p-5 relative overflow-hidden space-y-4">
      {/* Background Mana Aura Shimmer */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Daily Rank Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase font-solo">
              THE SYSTEM // MANDATORY DIRECTIVE
            </span>

            {/* Dynamic Streak Indicator */}
            {streakStatus === "sanctuary_protected" ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/50 text-blue-300 flex items-center gap-1 font-hud">
                <Shield className="w-3 h-3 text-cyan-400" />
                {currentStreakDisplay}D (FROZEN/PROTECTED)
              </span>
            ) : streakStatus === "grace_period" ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 flex items-center gap-1 font-hud animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {currentStreakDisplay}D (REDEMPTION PENDING)
              </span>
            ) : isStreakQualified ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 border border-white/50 text-white flex items-center gap-1 font-hud shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                <Zap className="w-3 h-3 text-white fill-white" />
                STREAK SECURED ({currentStreakDisplay}D)
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1 font-hud">
                <Zap className="w-3 h-3 text-cyan-400" />
                {currentStreakDisplay}D STREAK ({activeMultiplier})
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-black text-white tracking-tight mana-text-glow font-solo">
            [DAILY QUEST: PREPARATION TO BECOME STRONG]
          </h2>
          <p className="text-xs text-slate-400 font-hud">
            Mandatory real-life protocol. Complete all 4 objectives to maintain hunter status.
          </p>
          {streakMessage && (
            <p className="text-[10.5px] text-cyan-400/85 font-mono mt-0.5">
              ◆ {streakMessage}
            </p>
          )}
        </div>

        {/* Daily Hunter Grade */}
        <div
          className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-solo shrink-0 transition-all ${gradeColor}`}
        >
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">GRADE</span>
          <span className="text-2xl font-black">{dailyGrade}</span>
        </div>
      </div>

      {/* The 4 Core Objectives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
        {/* Task 1: Physical Workout */}
        <div
          className={`p-3 rounded-xl border transition flex items-center justify-between text-xs font-hud ${
            task1Done
              ? "bg-cyan-950/70 border-cyan-400/60 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              : "bg-[#070b14]/90 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task1Done ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold block truncate">
                {task1Title}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {task1Subtitle}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold shrink-0">{task1Done ? "CLEARED ◆" : "0/1"}</span>
        </div>

        {/* Task 2: Hydration */}
        <div
          className={`p-3 rounded-xl border transition flex items-center justify-between text-xs font-hud ${
            task2Done
              ? "bg-cyan-950/70 border-cyan-400/60 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              : "bg-[#070b14]/90 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task2Done ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold block truncate">2. Cellular Hydration</span>
              <span className="text-[10px] text-slate-400 truncate block">
                Target: {targetHydrationMl} ml
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold shrink-0">
            {currentHydrationMl} / {targetHydrationMl}
          </span>
        </div>

        {/* Task 3: Walking Kinetic Energy */}
        <div
          className={`p-3 rounded-xl border transition flex items-center justify-between text-xs font-hud ${
            task3Done
              ? "bg-cyan-950/70 border-cyan-400/60 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              : "bg-[#070b14]/90 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task3Done ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold block truncate">3. Kinetic Movement</span>
              <span className="text-[10px] text-slate-400 truncate block">
                Target: {targetSteps} Steps
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold shrink-0">
            {currentSteps} / {targetSteps}
          </span>
        </div>

        {/* Task 4: Mind & Career Quest */}
        <div
          className={`p-3 rounded-xl border transition flex items-center justify-between text-xs font-hud ${
            task4Done
              ? "bg-cyan-950/70 border-cyan-400/60 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              : "bg-[#070b14]/90 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task4Done ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold block truncate">4. Tactical Discipline</span>
              <span className="text-[10px] text-slate-400 truncate block">
                Conquer 1+ Scheduled Side Quest
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold shrink-0">
            {completedQuestsCount} / {Math.max(1, totalQuestsCount)}
          </span>
        </div>
      </div>

      {/* Claim Mystery Box Reward Action */}
      {allCompleted && !crateClaimed && (
        <div className="pt-2 relative z-10 animate-bounce">
          <button
            type="button"
            onClick={handleClaimCrate}
            className="w-full solo-btn py-3"
          >
            <Gift className="w-4 h-4 text-cyan-300" />
            <span>[ SYSTEM REWARD: UNLOCK BLESSED RANDOM BOX ]</span>
          </button>
        </div>
      )}

      {crateClaimed && (
        <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-400/60 text-center relative z-10 space-y-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest font-hud">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>DAILY BLESSED CRATE HARVESTED // STREAK SAFEGUARD SECURED ◆</span>
          </div>
          {claimRewardInfo ? (
            <div className="space-y-1">
              <div className="text-sm font-black text-white font-solo mana-text-glow flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span>+{claimRewardInfo.xpAwarded} XP AWARDED ({claimRewardInfo.multiplierLabel} STREAK BONUS)</span>
              </div>
              {claimRewardInfo.bonusStatPoints ? (
                <div className="text-xs font-bold text-amber-300 font-mono">
                  ★ 7-DAY MILESTONE PERK: +{claimRewardInfo.bonusStatPoints} STAT POINT GRANTED!
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-[11px] text-slate-300 font-mono">
              Reward claim verified. Streak multiplier active for all directives.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
