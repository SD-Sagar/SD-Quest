"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store";
import { completeQuest } from "@/store/slices/questSlice";
import { addXp, addAttributePoints } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import { Quest } from "@/types";
import { Play, Pause, Square, Clock, X, Check, ArrowRight } from "lucide-react";

interface LiveQuestStopwatchProps {
  quest: Quest | null;
  onClose: () => void;
}

export function LiveQuestStopwatch({ quest, onClose }: LiveQuestStopwatchProps) {
  const dispatch = useAppDispatch();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || !quest) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, quest]);

  if (!quest) return null;

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const estimatedMinutes = quest.estimatedDurationMinutes;
  const diffMinutes = minutes - estimatedMinutes;
  const velocityRatio = minutes > 0 ? (minutes / estimatedMinutes).toFixed(2) : "1.00";

  const handleTogglePlay = () => {
    triggerHaptic("light");
    setIsRunning(!isRunning);
  };

  const handleComplete = () => {
    triggerHaptic("heavy");
    const actualMins = Math.max(1, minutes);

    dispatch(completeQuest({ id: quest.id, actualDurationMinutes: actualMins }));
    dispatch(addXp(quest.xpReward));
    if (quest.attributeRewards) {
      dispatch(addAttributePoints(quest.attributeRewards));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl hunter-panel border border-cyan-500/50 p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
        {/* Mana aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
          <span className="flex items-center gap-1 font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            QUEST TIME INTELLIGENCE
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
            {quest.title}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
            Target Estimate: {estimatedMinutes} Minutes
          </span>
        </div>

        {/* Stopwatch Display */}
        <div className="py-4">
          <div className="w-36 h-36 mx-auto rounded-full border-4 border-cyan-500/40 flex flex-col items-center justify-center bg-cyan-950/20 shadow-lg shadow-cyan-950">
            <span className="text-3xl font-black font-mono tracking-tight text-white mana-text-glow">
              {timeString}
            </span>
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-1">
              {isRunning ? "Tracking Active" : "Paused"}
            </span>
          </div>
        </div>

        {/* Velocity & Planning Fallacy Feedback */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex justify-between items-center">
            <span>Velocity Ratio:</span>
            <span className="text-cyan-300 font-bold">{velocityRatio}x</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 italic text-left">
            {diffMinutes > 0
              ? `Exceeded estimate by ${diffMinutes}m. Recording precision without penalty.`
              : "Pacing within expected operational window."}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleTogglePlay}
            className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-white hover:border-slate-600 transition flex items-center justify-center gap-1.5"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                RESUME
              </>
            )}
          </button>

          <button
            onClick={handleComplete}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition"
          >
            <Check className="w-4 h-4" />
            COMPLETE
          </button>
        </div>
      </div>
    </div>
  );
}

