"use client";

import { useState, useTransition } from "react";
import { logDailyActivityAction } from "@/server/actions/activity.actions";
import { triggerHaptic } from "@/lib/utils";
import { Footprints, Flame, Timer, Compass, Plus } from "lucide-react";
import { ActivityLog } from "@/types";

interface WalkingMeterProps {
  activity: ActivityLog | null;
  dateStr: string;
}

export function WalkingMeter({ activity, dateStr }: WalkingMeterProps) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [stepInput, setStepInput] = useState(activity?.steps ? String(activity.steps) : "");

  const currentSteps = activity?.steps || 0;
  const targetSteps = 6000;
  const percentage = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  const handleSaveSteps = (e: React.FormEvent) => {
    e.preventDefault();
    const steps = parseInt(stepInput, 10);
    if (isNaN(steps) || steps < 0) return;

    triggerHaptic("heavy");
    startTransition(async () => {
      await logDailyActivityAction({
        log_date: dateStr,
        steps,
        source: "manual",
      });
      setIsAdding(false);
    });
  };

  return (
    <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              WALKING & STEP TRACKER
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Section 11 Physical Telemetry
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-mono font-bold transition flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>LOG STEPS</span>
        </button>
      </div>

      {/* Manual Input Form */}
      {isAdding && (
        <form onSubmit={handleSaveSteps} className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2">
          <label className="text-[10px] text-slate-400 font-mono uppercase block">
            Enter Total Steps For Today (Manual Entry)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              required
              min={0}
              max={100000}
              placeholder="e.g. 6500"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase transition disabled:opacity-50"
            >
              SAVE
            </button>
          </div>
        </form>
      )}

      {/* Main Metric & Bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xl font-black font-mono text-white tracking-tight">
            {currentSteps.toLocaleString()} <span className="text-xs text-slate-400 font-normal">steps</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">
            / {targetSteps.toLocaleString()} Daily Target ({percentage}%)
          </span>
        </div>

        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Calculated Physical Kinetics */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-xs font-mono">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-500 uppercase block flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            Distance
          </span>
          <span className="text-white font-bold text-xs mt-0.5 block">
            {activity?.distance_km || 0} km
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-500 uppercase block flex items-center justify-center gap-1">
            <Timer className="w-3 h-3 text-amber-400" />
            Duration
          </span>
          <span className="text-white font-bold text-xs mt-0.5 block">
            {activity?.walking_duration_minutes || 0} min
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-500 uppercase block flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-red-400" />
            Calories
          </span>
          <span className="text-white font-bold text-xs mt-0.5 block">
            {activity?.estimated_calories_burned || 0} kcal
          </span>
        </div>
      </div>
    </div>
  );
}

