"use client";

import { useState } from "react";
import { MasterExercise } from "@/lib/data/exerciseCatalog";
import { EquipmentInventory, HunterRank } from "@/types";
import { calculateDumbbellPlates } from "@/lib/calculations/gym";
import { triggerHaptic } from "@/lib/utils";
import {
  X,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Dumbbell,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  Info,
  Shield,
  Layers,
} from "lucide-react";

interface ExerciseCodexModalProps {
  exercise: MasterExercise | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  playerLevel: number;
  playerRank: HunterRank;
  equipment: EquipmentInventory | null;
  onSelectForWorkout?: (exercise: MasterExercise) => void;
}

export function ExerciseCodexModal({
  exercise,
  isOpen,
  onClose,
  isUnlocked,
  playerLevel,
  playerRank,
  equipment,
  onSelectForWorkout,
}: ExerciseCodexModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [calcWeight, setCalcWeight] = useState(15.0);

  if (!isOpen || !exercise) return null;

  const defaultInv: EquipmentInventory = equipment || {
    id: "default",
    user_id: "user",
    has_bench: true,
    bench_positions: [],
    dumbbell_handle_weight_kg: 2.0,
    plate_5kg_count: 8,
    plate_2_5kg_count: 4,
    plate_1_25kg_count: 8,
    custom_plates: [],
    updated_at: new Date().toISOString(),
  };

  const plateSolver = calculateDumbbellPlates(calcWeight, defaultInv, true);
  const currentStep = exercise.demo_steps[activeStepIndex] || exercise.demo_steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl hunter-panel border border-cyan-500/40 p-5 sm:p-6 shadow-2xl relative space-y-5 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 uppercase tracking-widest">
                {exercise.split_day} • EXERCISE #{exercise.order_index}
              </span>
              {isUnlocked ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 inline-flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {exercise.unlock_tier.toUpperCase()} TIER (LVL {exercise.unlock_level})
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mana-text-glow">
              {exercise.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-semibold">{exercise.target_muscle}</span>
              <span>•</span>
              <span className="text-slate-400">Bench: {exercise.bench_angle}</span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Banner if not yet unlocked */}
        {!isUnlocked && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-4 h-4 shrink-0" />
              <span>ROOKIE TO SPARTAN PROGRESSION GATE</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
              {exercise.unlock_criteria}.
            </p>
            <p className="text-[11px] text-slate-400">
              Current Status: Level {playerLevel} ({playerRank} Rank). You can preview the full form guidance, bench angle, and plate math now, but this movement unlocks once you achieve the required strength and joint conditioning.
            </p>
          </div>
        )}

        {/* Interactive 3-Step Demo Guide (Fitness Coach style) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              INTERACTIVE FORM & EXECUTION GUIDE
            </span>
            <span className="text-xs font-mono text-cyan-400">
              Step {activeStepIndex + 1} of {exercise.demo_steps.length}
            </span>
          </div>

          {/* Step Display Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center justify-center">
                  {currentStep.step}
                </span>
                {currentStep.title}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => {
                    triggerHaptic("light");
                    setActiveStepIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={activeStepIndex === exercise.demo_steps.length - 1}
                  onClick={() => {
                    triggerHaptic("light");
                    setActiveStepIndex((prev) => Math.min(exercise.demo_steps.length - 1, prev + 1));
                  }}
                  className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {currentStep.description}
            </p>

            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Coach Cue:</strong> {currentStep.coachTip}
              </span>
            </div>
          </div>
        </div>

        {/* Equipment & 20-in-1 Bench Setup */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              20-in-1 BENCH ANGLE
            </span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>{exercise.bench_angle}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              TARGET WORKOUT TIME
            </span>
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{exercise.target_duration_mins} Minutes ({exercise.default_sets} Sets)</span>
            </div>
          </div>
        </div>

        {/* Live Plate Math Solver for this Exercise */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              60kg HOME GYM PLATE BREAKDOWN
            </span>
            <div className="flex items-center gap-1.5">
              {[10, 15, 17.5, 20].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    triggerHaptic("light");
                    setCalcWeight(w);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition ${
                    calcWeight === w
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-xs flex items-center justify-between">
            <span className="text-cyan-400 font-bold">{plateSolver.achievableWeightKg.toFixed(2)} kg / dumbbell</span>
            <span className="text-slate-300">{plateSolver.summaryString}</span>
          </div>
        </div>

        {/* Pro Form Cues vs Common Mistakes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              KEY FORM CUES
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {exercise.form_cues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/20 space-y-2">
            <span className="font-bold text-rose-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              MISTAKES TO AVOID
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {exercise.common_mistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-400 shrink-0 font-bold">✗</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
          <button
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            CLOSE
          </button>
          {isUnlocked && onSelectForWorkout && (
            <button
              onClick={() => {
                triggerHaptic("heavy");
                onSelectForWorkout(exercise);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-cyan-950"
            >
              <span>ADD TO ACTIVE SESSION</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

