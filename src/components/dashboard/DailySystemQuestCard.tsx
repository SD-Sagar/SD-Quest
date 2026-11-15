"use client";

import { useState, useEffect } from "react";
import { triggerHaptic } from "@/lib/utils";
import { playLevelUpSound, playQuestCompleteSound } from "@/lib/audio/soundEffects";
import { claimDailyMysteryBoxAction } from "@/server/actions/player.actions";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Circle,
  Gift,
  Flame,
  Zap,
  Award,
  Crown,
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
  initialCrateClaimed?: boolean;
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
  streakDays = 3,
  initialCrateClaimed = false,
}: DailySystemQuestCardProps) {
  const [crateClaimed, setCrateClaimed] = useState(initialCrateClaimed);

  useEffect(() => {
    setCrateClaimed(initialCrateClaimed);
  }, [initialCrateClaimed]);

  const task1Done = workoutCompleted || isRestDay;
  const task2Done = currentHydrationMl >= targetHydrationMl;
  const task3Done = currentSteps >= targetSteps;
  const task4Done = completedQuestsCount >= 1;

  const totalTasks = 4;
  const completedTasks = [task1Done, task2Done, task3Done, task4Done].filter(Boolean).length;
  const allCompleted = completedTasks === totalTasks;

  // Rank evaluation
  let dailyGrade = "E";
  let gradeColor = "text-slate-400 border-slate-700 bg-slate-900";
  if (completedTasks === 4) {
    dailyGrade = "S";
    gradeColor = "text-amber-400 border-amber-500/60 bg-amber-950/40 shadow-lg shadow-amber-950/60";
  } else if (completedTasks === 3) {
    dailyGrade = "A";
    gradeColor = "text-cyan-400 border-cyan-500/60 bg-cyan-950/40";
  } else if (completedTasks === 2) {
    dailyGrade = "B";
    gradeColor = "text-purple-400 border-purple-500/60 bg-purple-950/40";
  } else if (completedTasks === 1) {
    dailyGrade = "C";
    gradeColor = "text-blue-400 border-blue-500/60 bg-blue-950/40";
  }

  // Streak Multiplier
  let streakMultiplier = "1.0x";
  if (streakDays >= 14) streakMultiplier = "1.50x";
  else if (streakDays >= 7) streakMultiplier = "1.25x";
  else if (streakDays >= 3) streakMultiplier = "1.10x";

  const handleClaimCrate = () => {
    if (!allCompleted || crateClaimed) return;
    triggerHaptic("heavy");
    playLevelUpSound();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    });
    setCrateClaimed(true);
    claimDailyMysteryBoxAction().catch((err) => console.error("Failed to claim crate in Supabase:", err));
  };

  return (
    <div className="hunter-panel rounded-3xl border border-cyan-500/50 p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background Mana Aura Shimmer */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Daily Rank Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              THE SYSTEM // MANDATORY DIRECTIVE
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-300 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              {streakDays}D STREAK ({streakMultiplier})
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mana-text-glow font-mono">
            [DAILY QUEST: PREPARATION TO BECOME STRONG]
          </h2>
          <p className="text-xs text-slate-400">
            Mandatory real-life protocol. Complete all 4 objectives to maintain hunter status.
          </p>
        </div>

        {/* Daily Hunter Grade */}
        <div
          className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono shrink-0 ${gradeColor}`}
        >
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">GRADE</span>
          <span className="text-2xl font-black">{dailyGrade}</span>
        </div>
      </div>

      {/* The 4 Core Objectives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
        {/* Task 1: Physical Workout */}
        <div
          className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs font-mono ${
            task1Done
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-slate-900/80 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task1Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold block truncate">1. Physical Conditioning</span>
              <span className="text-[10px] text-slate-400 truncate block">
                {isRestDay ? "Recovery Protocol" : "Today's Split or 100 Pushups"}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold shrink-0">{task1Done ? "CLEARED" : "0/1"}</span>
        </div>

        {/* Task 2: Hydration */}
        <div
          className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs font-mono ${
            task2Done
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-slate-900/80 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task2Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
          <span className="text-[11px] font-bold shrink-0">
            {currentHydrationMl} / {targetHydrationMl}
          </span>
        </div>

        {/* Task 3: Walking Kinetic Energy */}
        <div
          className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs font-mono ${
            task3Done
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-slate-900/80 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task3Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
          <span className="text-[11px] font-bold shrink-0">
            {currentSteps} / {targetSteps}
          </span>
        </div>

        {/* Task 4: Mind & Career Quest */}
        <div
          className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs font-mono ${
            task4Done
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-slate-900/80 border-slate-800 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {task4Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="truncate">
              <span className="font-bold block truncate">4. Mind &amp; Career Focus</span>
              <span className="text-[10px] text-slate-400 truncate block">
                Clear 1 Scheduled Quest
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold shrink-0">
            {completedQuestsCount} / {Math.max(1, totalQuestsCount)}
          </span>
        </div>
      </div>

      {/* Rewards vs Penalty Footer */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
        <div className="space-y-0.5">
          <span className="text-cyan-400 font-bold block uppercase font-mono text-[11px]">
            REWARDS: +150 XP • FULL STATUS RECOVERY • +1 ATTRIBUTE POINT
          </span>
          <span className="text-rose-400 text-[10px] block font-mono">
            PENALTY: 3 Consecutive Missed Days Triggers Penalty Zone (-20% XP Chicken Debuff)
          </span>
        </div>

        {/* Claim Mystery Crate Button */}
        {allCompleted ? (
          <button
            onClick={handleClaimCrate}
            disabled={crateClaimed}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
              crateClaimed
                ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-950 animate-pulse"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{crateClaimed ? "SYSTEM CRATE CLAIMED ✓" : "CLAIM DAILY MYSTERY CRATE"}</span>
          </button>
        ) : (
          <span className="text-slate-500 font-mono text-[11px] self-start sm:self-auto">
            {completedTasks} of {totalTasks} Directives Completed
          </span>
        )}
      </div>
    </div>
  );
}

