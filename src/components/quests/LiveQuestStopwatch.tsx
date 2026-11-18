"use client";

import { useState, useEffect } from "react";
import { completeQuestAction } from "@/server/actions/quest.actions";
import {
  saveActiveSessionAction,
  clearActiveSessionAction,
  getActiveSessionAction,
} from "@/server/actions/player.actions";
import { triggerHaptic } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Play, Pause, X, CheckCircle2, Zap, Flame, Shield } from "lucide-react";
import { Quest } from "@/types";

interface LiveQuestStopwatchProps {
  quest: Quest;
  onClose: () => void;
}

export function LiveQuestStopwatch({ quest, onClose }: LiveQuestStopwatchProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [startTimeIso, setStartTimeIso] = useState<string | null>(null);

  const estimatedMinutes = quest.estimated_duration_minutes || 30;

  // 1. Initialize or resume universal timestamp session from Supabase
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const active = await getActiveSessionAction();
        let sessionStart = new Date().toISOString();

        if (active && active.session_id === quest.id && active.started_at) {
          sessionStart = active.started_at;
        } else if (quest.started_at) {
          sessionStart = quest.started_at;
        } else {
          // Register fresh session in Supabase for cross-device & offline tracking
          await saveActiveSessionAction({
            session_id: quest.id,
            type: "quest",
            title: quest.title,
            started_at: sessionStart,
            target_minutes: estimatedMinutes,
            is_fun: quest.is_fun || false,
            linked_attributes: Object.keys(quest.attribute_rewards || {}),
            category: quest.category,
          });
        }

        if (isMounted) {
          setStartTimeIso(sessionStart);
          const elapsed = Math.max(
            0,
            Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000)
          );
          setSeconds(elapsed);
        }
      } catch (e) {
        console.error("Failed to init universal session timestamp:", e);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [quest.id, quest.title, quest.started_at, quest.is_fun, quest.attribute_rewards, quest.category, estimatedMinutes]);

  // 2. Real-time tick anchored to timestamp (never drifts or halts if tab sleeps)
  useEffect(() => {
    if (!isRunning || !startTimeIso) return;

    const interval = setInterval(() => {
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - new Date(startTimeIso).getTime()) / 1000)
      );
      setSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTimeIso]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(
    displaySeconds
  ).padStart(2, "0")}`;

  const diffMinutes = minutes - estimatedMinutes;
  const isOvertime = diffMinutes > 0;

  const handleFinish = async () => {
    triggerHaptic("heavy");
    setLoading(true);

    try {
      await clearActiveSessionAction();
      await completeQuestAction(quest.id, Math.max(1, minutes));
      confetti({
        particleCount: 100,
        spread: 75,
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
      <div className="w-full max-w-sm rounded-3xl hunter-panel border border-cyan-500/40 p-6 text-center shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          title="Minimize Session (Background timer stays active)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
              UNIVERSAL ACTIVE TELEMETRY
            </span>
          </div>
          <h3 className="text-base font-black text-white tracking-tight line-clamp-1">
            {quest.title}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Target Duration: {estimatedMinutes} Min • {quest.is_fun ? "Recreational Mode" : "Disciplined Mode"}
          </p>
        </div>

        {/* Timer Circle */}
        <div
          className={`w-44 h-44 mx-auto rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-all ${
            isOvertime
              ? "border-amber-500/60 bg-amber-950/20 shadow-amber-950/60"
              : "border-cyan-500/40 bg-cyan-950/20 shadow-cyan-950"
          }`}
        >
          <span className="text-4xl font-black font-mono tracking-tight text-white mana-text-glow">
            {timeFormatted}
          </span>
          <span
            className={`text-[10px] font-bold font-mono uppercase tracking-widest mt-1 ${
              isOvertime ? "text-amber-400 animate-pulse" : "text-cyan-400"
            }`}
          >
            {isOvertime ? `OVERTIME (+${diffMinutes}m)` : isRunning ? "SERVER TIMED" : "PAUSED"}
          </span>
        </div>

        {/* Estimation & Overtime Kinetics */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5">
          {isOvertime ? (
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>OVERTIME SURGE ACTIVE (+0.75x Stat Yield)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pushing beyond target limits rewards accelerated attribute growth.
                {quest.is_fun
                  ? " (Fatigue growth dampened by ~70% due to fun factor)."
                  : " (Fatigue builds rapidly during overtime)."}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Target Pace</span>
              <span className="text-cyan-400 font-bold">
                {Math.max(0, estimatedMinutes - minutes)} Min Remaining
              </span>
            </div>
          )}

          {quest.is_fun && (
            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] text-purple-300">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-400" />
                Recreational Protection Active
              </span>
              <span className="font-bold">~70% Fatigue Relief</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setIsRunning(!isRunning);
            }}
            className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-cyan-400" />
                <span>RESUME</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? "RECORDING..." : "COMPLETE"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
