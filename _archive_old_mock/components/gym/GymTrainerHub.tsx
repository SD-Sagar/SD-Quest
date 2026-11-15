"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectSplitDay, startWorkoutForDay } from "@/store/slices/workoutSlice";
import { calculateDumbbellPlates } from "@/lib/calculations/gym";
import { triggerHaptic } from "@/lib/utils";
import { DayOfWeek, ExerciseDefinition } from "@/types";
import {
  Dumbbell,
  Play,
  Calendar,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  Sparkles,
  Shield,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

export function GymTrainerHub() {
  const dispatch = useAppDispatch();
  const { schedule, selectedSplitDay, inventory } = useAppSelector(
    (state) => state.workout
  );

  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [testWeight, setTestWeight] = useState(17.5);

  const currentPlan =
    schedule.find((p) => p.day === selectedSplitDay) || schedule[1]; // default Tuesday

  // Live test of the plate solver for any arbitrary weight
  const plateResult = calculateDumbbellPlates(testWeight, inventory, true);

  const handleStartWorkout = (day: DayOfWeek) => {
    triggerHaptic("heavy");
    dispatch(startWorkoutForDay(day));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Plate-Math Solver Dock */}
      <div className="hunter-panel rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                MAIN QUEST // STRUCTURED GYM TRAINER
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                20-IN-1 BENCH & DUMBBELL ENGINE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
              60 KG Plates Verified
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
              20-in-1 Bench
            </span>
          </div>
        </div>

        {/* Plate-Math Solver Test Strip */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              PHYSICAL PLATE-COMBINATION SOLVER
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Target Load Per Dumbbell:</span>
              <input
                type="number"
                step="0.5"
                min="2"
                max="32"
                value={testWeight}
                onChange={(e) => setTestWeight(parseFloat(e.target.value) || 2)}
                className="w-16 rounded-lg bg-slate-900 border border-cyan-500/40 text-center font-bold text-white text-xs p-1"
              />
              <span className="text-white font-bold">KG</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-300 truncate">
              {plateResult.summaryString}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                plateResult.isExact
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                  : "bg-amber-950 text-amber-400 border border-amber-500/40"
              }`}
            >
              {plateResult.isExact ? "EXACT MATCH" : `${plateResult.achievableWeightKg} KG ACHIEVABLE`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monday-to-Saturday Training Schedule Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            WEEKLY TRAINING SPLIT (MON - SUN)
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            ANATOMICALLY OPTIMIZED FOR ROTATOR-CUFF LONGEVITY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {schedule.map((dayPlan) => {
            const isSelected = selectedSplitDay === dayPlan.day;
            return (
              <button
                key={dayPlan.day}
                onClick={() => {
                  triggerHaptic("light");
                  dispatch(selectSplitDay(dayPlan.day));
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-950/60 border-cyan-500/60 shadow-md shadow-cyan-950 ring-1 ring-cyan-400"
                    : "hunter-panel border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-mono font-black ${
                      isSelected ? "text-cyan-400" : "text-white"
                    }`}
                  >
                    {dayPlan.day.slice(0, 3).toUpperCase()}
                  </span>
                  {dayPlan.isRestDay ? (
                    <span className="text-[9px] font-mono text-slate-500 uppercase">REST</span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">
                      {dayPlan.exercises.length} EX
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  {dayPlan.isRestDay ? "Active Recovery" : dayPlan.title.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Day Workout Deep-Dive & Exercises */}
      <div className="hunter-panel rounded-3xl p-5 sm:p-6 border border-cyan-500/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {currentPlan.day.toUpperCase()} SCHEDULE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentPlan.targetMuscles}
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-1">
              {currentPlan.title}
            </h3>
          </div>

          {!currentPlan.isRestDay ? (
            <button
              onClick={() => handleStartWorkout(currentPlan.day)}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-[0.98] shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              START {currentPlan.day.toUpperCase()} SESSION
            </button>
          ) : (
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Honored Recovery Day • No Workout Scheduled
            </span>
          )}
        </div>

        {/* Exercises List */}
        {!currentPlan.isRestDay && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
              PRESCRIBED EXERCISE SEQUENCE ({currentPlan.exercises.length} MOVEMENTS)
            </span>

            {currentPlan.exercises.map((ex, index) => {
              const isExpanded = expandedExerciseId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
                >
                  <div
                    onClick={() => {
                      triggerHaptic("light");
                      setExpandedExerciseId(isExpanded ? null : ex.id);
                    }}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/90 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white tracking-tight truncate">
                          {ex.name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400 mt-0.5">
                          {ex.benchAngle && (
                            <span className="text-cyan-300 font-semibold">
                              Bench: {ex.benchAngle}
                            </span>
                          )}
                          <span>
                            {ex.defaultSets} Sets × {ex.defaultRepsMin}–{ex.defaultRepsMax} Reps
                          </span>
                          <span>{ex.defaultRestSeconds}s Rest</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? "rotate-180 text-cyan-400" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Instructions, Form Cues, Common Mistakes, Alternatives */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono block mb-1">
                          Technique Execution Guidance
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {ex.instructions.map((ins, i) => (
                            <li key={i}>{ins}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block mb-1">
                            Form Cues
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                            {ex.formCues.map((cue, i) => (
                              <li key={i}>{cue}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-red-400 uppercase font-mono block mb-1">
                            Common Mistakes to Avoid
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                            {ex.commonMistakes.map((mis, i) => (
                              <li key={i}>{mis}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {ex.alternatives && ex.alternatives.length > 0 && (
                        <div className="pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-400">
                          <span className="text-slate-500 font-bold uppercase mr-1">
                            Alternatives:
                          </span>
                          <span>{ex.alternatives.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

