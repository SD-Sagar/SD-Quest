"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { addWaterTap, undoLastTap } from "@/store/slices/hydrationSlice";
import { addAttributePoints } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import { Droplet, RotateCcw, Plus, Sparkles } from "lucide-react";

export function WaterMeter() {
  const dispatch = useAppDispatch();
  const { currentMl, targetMl, logs } = useAppSelector((state) => state.hydration);

  const percentage = Math.min(100, Math.round((currentMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - currentMl);

  const handleDrink = () => {
    triggerHaptic("medium");
    dispatch(addWaterTap(300));
    dispatch(addAttributePoints({ vitality: 0.05 }));
  };

  const handleUndo = () => {
    triggerHaptic("light");
    dispatch(undoLastTap());
  };

  return (
    <div className="hunter-panel rounded-3xl p-5 border border-slate-800 relative overflow-hidden space-y-4">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Droplet className="w-5 h-5 fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-0.5">
              RESOURCE INTAKE
            </span>
            <h3 className="text-base font-black text-white tracking-tight">
              HYDRATION RESERVOIR
            </h3>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-base font-black text-white">{currentMl}</span>
          <span className="text-xs text-slate-500"> / {targetMl} ML</span>
        </div>
      </div>

      {/* Progress Bar & Water Drop Liquid Meter */}
      <div className="relative z-10 space-y-2">
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-500 rounded-full transition-all duration-300 shadow-sm shadow-cyan-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>{percentage}% COMPLETE</span>
          <span>{remainingMl > 0 ? `${remainingMl} ML REMAINING` : "TARGET ACHIEVED ✓"}</span>
        </div>
      </div>

      {/* Action Buttons: Quick Tap 300ml & Undo */}
      <div className="flex items-center gap-2 relative z-10">
        <button
          onClick={handleDrink}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-950 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          +300 ML WATER TAP
        </button>

        <button
          onClick={handleUndo}
          disabled={logs.length === 0}
          className="p-3 rounded-2xl border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white disabled:opacity-40 transition"
          title="Undo Last Tap"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
