"use client";

import { useState, useEffect } from "react";
import { completeQuestAction } from "@/server/actions/quest.actions";
import { triggerHaptic } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Play, Pause, Square, Clock, X, CheckCircle2 } from "lucide-react";
import { Quest } from "@/types";

interface LiveQuestStopwatchProps {
  quest: Quest;
  onClose: () => void;
}

export function LiveQuestStopwatch({ quest, onClose }: LiveQuestStopwatchProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(
    displaySeconds
  ).padStart(2, "0")}`;

  const estimatedMinutes = quest.estimated_duration_minutes || 30;
  const diffMinutes = minutes - estimatedMinutes;

  const handleFinish = async () => {
    triggerHaptic("heavy");
    setLoading(true);

    try {
      await completeQuestAction(quest.id, Math.max(1, minutes));
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl hunter-panel border border-cyan-500/40 p-6 text-center shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
            QUEST TIME INTELLIGENCE
          </span>
          <h3 className="text-base font-black text-white tracking-tight line-clamp-1">
            {quest.title}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Estimated Duration: {estimatedMinutes} Minutes
          </p>
        </div>

        {/* Timer Circle */}
        <div className="w-40 h-40 mx-auto rounded-full border-4 border-cyan-500/30 bg-cyan-950/20 flex flex-col items-center justify-center shadow-lg shadow-cyan-950">
          <span className="text-4xl font-black font-mono tracking-tight text-white mana-text-glow">
            {timeFormatted}
          </span>
          <span className="text-[10px] text-cyan-400 font-bold font-mono uppercase tracking-widest mt-1">
            {isRunning ? "TIMER RUNNING" : "PAUSED"}
          </span>
        </div>

        {/* Estimation Kinetics */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          {diffMinutes > 0 ? (
            <span className="text-amber-400">
              Exceeded estimate by {diffMinutes} min (learning pace)
            </span>
          ) : diffMinutes === 0 ? (
            <span className="text-cyan-400">Pacing exactly on target</span>
          ) : (
            <span className="text-emerald-400">
              Under estimate ({Math.abs(diffMinutes)} min remaining)
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              triggerHaptic("medium");
              setIsRunning(!isRunning);
            }}
            className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-cyan-400" />
                RESUME
              </>
            )}
          </button>

          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPLETE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

