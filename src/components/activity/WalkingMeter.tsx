"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logDailyActivityAction } from "@/server/actions/activity.actions";
import { triggerHaptic } from "@/lib/utils";
import { Footprints, Flame, Timer, Compass, Plus, Pencil, X, Check } from "lucide-react";
import { ActivityLog } from "@/types";

interface WalkingMeterProps {
  activity: ActivityLog | null;
  dateStr: string;
  userWeightKg?: number;
  userHeightCm?: number;
}

/**
 * Biomechanical & 2024 Compendium MET calculation
 * - Stride: heightCm * 0.414 / 100
 * - Duration: ~100 steps/min cadence
 * - Calories: Compendium MET 3.5 (walking ~4 km/h moderate pace)
 *   kcal = MET * weightKg * (durationMin / 60)
 */
function computeKinetics(steps: number, weightKg = 70, heightCm = 175) {
  const strideM = (heightCm * 0.414) / 100;
  const distanceKm = Number(((steps * strideM) / 1000).toFixed(2));
  const durationMin = Math.round(steps / 100);
  const calories = Math.round(3.5 * weightKg * (durationMin / 60));
  return { distanceKm, durationMin, calories };
}

export function WalkingMeter({
  activity,
  dateStr,
  userWeightKg = 70,
  userHeightCm = 175,
}: WalkingMeterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [panelMode, setPanelMode] = useState<"none" | "add" | "edit">("none");
  const [addInput, setAddInput] = useState<string>("");
  const [editInput, setEditInput] = useState<string>("");
  const [optimisticSteps, setOptimisticSteps] = useState<number>(activity?.steps || 0);

  useEffect(() => {
    setOptimisticSteps(activity?.steps || 0);
  }, [activity?.steps]);

  const currentSteps = optimisticSteps;
  const targetSteps = 6000;
  const percentage = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  // Live kinetics based on current optimistic steps
  const kinetics = computeKinetics(currentSteps, userWeightKg, userHeightCm);

  // Values for "Add Steps" preview
  const addNum = parseInt(addInput, 10) || 0;
  const addedKinetics = computeKinetics(addNum, userWeightKg, userHeightCm);

  // Values for "Edit Total" preview
  const editNum = editInput === "" ? currentSteps : parseInt(editInput, 10);
  const validEditNum = isNaN(editNum) || editNum < 0 ? currentSteps : editNum;
  const editDelta = validEditNum - currentSteps;
  const editKinetics = computeKinetics(validEditNum, userWeightKg, userHeightCm);
  const deltaDistance = Number((editKinetics.distanceKm - kinetics.distanceKm).toFixed(2));
  const deltaCalories = editKinetics.calories - kinetics.calories;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addNum <= 0) return;

    const newTotal = currentSteps + addNum;
    const newKinetics = computeKinetics(newTotal, userWeightKg, userHeightCm);

    triggerHaptic("heavy");
    setOptimisticSteps(newTotal);
    setPanelMode("none");
    setAddInput("");

    startTransition(async () => {
      await logDailyActivityAction({
        log_date: dateStr,
        steps: newTotal,
        distance_km: newKinetics.distanceKm,
        walking_duration_minutes: newKinetics.durationMin,
        estimated_calories_burned: newKinetics.calories,
        source: "manual",
      });
      router.refresh();
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(editNum) || editNum < 0) return;

    const newKinetics = computeKinetics(editNum, userWeightKg, userHeightCm);

    triggerHaptic("heavy");
    setOptimisticSteps(editNum);
    setPanelMode("none");
    setEditInput("");

    startTransition(async () => {
      await logDailyActivityAction({
        log_date: dateStr,
        steps: editNum,
        distance_km: newKinetics.distanceKm,
        walking_duration_minutes: newKinetics.durationMin,
        estimated_calories_burned: newKinetics.calories,
        source: "manual",
      });
      router.refresh();
    });
  };

  return (
    <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Add & Edit action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              WALKING &amp; STEP TRACKER
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Section 11 Physical Telemetry
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              if (panelMode === "add") {
                setPanelMode("none");
              } else {
                setPanelMode("add");
                setAddInput("");
              }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 shadow-sm ${
              panelMode === "add"
                ? "bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>ADD</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              if (panelMode === "edit") {
                setPanelMode("none");
              } else {
                setPanelMode("edit");
                setEditInput(String(currentSteps));
              }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 shadow-sm ${
              panelMode === "edit"
                ? "bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
            }`}
            title="Edit / Override Total Steps"
          >
            <Pencil className="w-3 h-3 text-cyan-400" />
            <span>EDIT</span>
          </button>
        </div>
      </div>

      {/* Mode A: ADD STEPS FORM */}
      {panelMode === "add" && (
        <form onSubmit={handleAddSubmit} className="p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold flex items-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Add Steps to Today&apos;s Total</span>
            </span>
            <button
              type="button"
              onClick={() => setPanelMode("none")}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Increment Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  const cur = parseInt(addInput, 10) || 0;
                  setAddInput(String(cur + amt));
                }}
                className="px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold hover:bg-emerald-900/80 hover:border-emerald-400 transition"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              required
              min={1}
              max={50000}
              placeholder="e.g. 1500 steps to add"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={isPending || addNum <= 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase transition disabled:opacity-50 flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>CONFIRM</span>
            </button>
          </div>

          {/* Live Preview */}
          {addNum > 0 && (
            <div className="p-2 rounded-xl bg-slate-950/90 border border-emerald-900/40 text-[10.5px] font-mono text-slate-300 flex justify-between items-center">
              <span>
                {currentSteps.toLocaleString()} + <span className="text-emerald-400 font-bold">{addNum.toLocaleString()}</span> = <span className="text-white font-bold">{(currentSteps + addNum).toLocaleString()} steps</span>
              </span>
              <span className="text-emerald-400 font-bold">
                +{addedKinetics.distanceKm} km • +{addedKinetics.calories} kcal
              </span>
            </div>
          )}
        </form>
      )}

      {/* Mode B: EDIT / OVERRIDE TOTAL FORM */}
      {panelMode === "edit" && (
        <form onSubmit={handleEditSubmit} className="p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold flex items-center gap-1">
              <Pencil className="w-3 h-3" />
              <span>Edit / Override Total Steps For Today</span>
            </span>
            <button
              type="button"
              onClick={() => setPanelMode("none")}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              required
              min={0}
              max={100000}
              placeholder="e.g. 6500"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={isPending || editInput === "" || parseInt(editInput, 10) < 0}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono uppercase transition disabled:opacity-50 flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>SET TOTAL</span>
            </button>
          </div>

          {/* Live Delta Preview */}
          {!isNaN(editNum) && editNum !== currentSteps && (
            <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[10.5px] font-mono text-slate-300 flex justify-between items-center">
              <span>
                {currentSteps.toLocaleString()} → <span className="text-cyan-400 font-bold">{validEditNum.toLocaleString()} steps</span>
                <span className={editDelta >= 0 ? " text-emerald-400 ml-1.5 font-bold" : " text-amber-400 ml-1.5 font-bold"}>
                  ({editDelta >= 0 ? `+${editDelta.toLocaleString()}` : editDelta.toLocaleString()})
                </span>
              </span>
              <span className={editDelta >= 0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {deltaDistance >= 0 ? `+${deltaDistance.toFixed(2)}` : deltaDistance.toFixed(2)} km • {deltaCalories >= 0 ? `+${deltaCalories}` : deltaCalories} kcal
              </span>
            </div>
          )}
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
          <span className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            Distance
          </span>
          <span className="text-white font-bold text-xs mt-0.5 block">
            {kinetics.distanceKm} km
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1">
            <Timer className="w-3 h-3 text-amber-400" />
            Duration
          </span>
          <span className="text-white font-bold text-xs mt-0.5 block">
            {kinetics.durationMin} min
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-red-400" />
            Calories
          </span>
          <span className="text-white font-bold text-xs mt-0.5 block">
            {kinetics.calories} kcal
          </span>
        </div>
      </div>
    </div>
  );
}
