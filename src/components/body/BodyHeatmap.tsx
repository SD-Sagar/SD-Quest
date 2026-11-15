"use client";

import { useState } from "react";
import { triggerHaptic } from "@/lib/utils";
import { Sparkles, Trophy } from "lucide-react";

export type MuscleId =
  | "chest"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "upper_back"
  | "lower_back"
  | "abs"
  | "obliques"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";

interface MuscleInfo {
  name: string;
  weeklySets: number;
  optimalWeeklySetsTarget: number;
  totalTonnageKg: number;
  recoveryPercent: number;
  personalRecord: string;
}

const MUSCLE_DEFAULTS: Record<MuscleId, MuscleInfo> = {
  chest: { name: "Pectorals (Chest)", weeklySets: 9, optimalWeeklySetsTarget: 12, totalTonnageKg: 3420, recoveryPercent: 75, personalRecord: "Incline DB Press 17.5kg × 11 reps" },
  front_delts: { name: "Front Deltoids", weeklySets: 6, optimalWeeklySetsTarget: 8, totalTonnageKg: 1800, recoveryPercent: 80, personalRecord: "Seated DB Press 12.5kg × 10 reps" },
  side_delts: { name: "Side (Lateral) Deltoids", weeklySets: 8, optimalWeeklySetsTarget: 14, totalTonnageKg: 950, recoveryPercent: 70, personalRecord: "DB Lateral Raise 7.5kg × 14 reps" },
  rear_delts: { name: "Rear Deltoids", weeklySets: 6, optimalWeeklySetsTarget: 12, totalTonnageKg: 680, recoveryPercent: 90, personalRecord: "Bent-Over DB Fly 7.5kg × 15 reps" },
  biceps: { name: "Biceps Brachii", weeklySets: 8, optimalWeeklySetsTarget: 12, totalTonnageKg: 1280, recoveryPercent: 85, personalRecord: "Incline DB Curl 12.5kg × 10 reps" },
  triceps: { name: "Triceps Brachii", weeklySets: 6, optimalWeeklySetsTarget: 12, totalTonnageKg: 1100, recoveryPercent: 80, personalRecord: "Overhead DB Extension 12.5kg × 12 reps" },
  forearms: { name: "Forearms & Grip", weeklySets: 4, optimalWeeklySetsTarget: 8, totalTonnageKg: 740, recoveryPercent: 95, personalRecord: "DB Wrist Curl 10kg × 15 reps" },
  upper_back: { name: "Upper Back & Lats", weeklySets: 10, optimalWeeklySetsTarget: 14, totalTonnageKg: 2850, recoveryPercent: 85, personalRecord: "One-Arm DB Row 22.5kg × 10 reps" },
  lower_back: { name: "Lower Back (Erectors)", weeklySets: 4, optimalWeeklySetsTarget: 8, totalTonnageKg: 1200, recoveryPercent: 100, personalRecord: "DB Romanian Deadlift 20kg × 10 reps" },
  abs: { name: "Abdominals", weeklySets: 6, optimalWeeklySetsTarget: 10, totalTonnageKg: 0, recoveryPercent: 85, personalRecord: "Hanging / Lying Leg Raises 3 × 15" },
  obliques: { name: "Obliques", weeklySets: 4, optimalWeeklySetsTarget: 8, totalTonnageKg: 0, recoveryPercent: 90, personalRecord: "Side Plank Hold 60s" },
  glutes: { name: "Gluteals", weeklySets: 6, optimalWeeklySetsTarget: 10, totalTonnageKg: 1900, recoveryPercent: 95, personalRecord: "DB Bulgarian Split Squat 15kg × 10 reps" },
  quads: { name: "Quadriceps", weeklySets: 8, optimalWeeklySetsTarget: 12, totalTonnageKg: 2400, recoveryPercent: 90, personalRecord: "Goblet DB Squat 25kg × 12 reps" },
  hamstrings: { name: "Hamstrings", weeklySets: 6, optimalWeeklySetsTarget: 10, totalTonnageKg: 1600, recoveryPercent: 95, personalRecord: "DB Romanian Deadlift 22.5kg × 10 reps" },
  calves: { name: "Calves & Achillean Tendons", weeklySets: 7, optimalWeeklySetsTarget: 12, totalTonnageKg: 850, recoveryPercent: 80, personalRecord: "100 Skips Unbroken + Single-leg DB Calf 15kg" },
};

export function BodyHeatmap() {
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleId>("chest");

  const selectedMuscle = MUSCLE_DEFAULTS[selectedMuscleId];

  const handleSelect = (id: MuscleId) => {
    triggerHaptic("light");
    setSelectedMuscleId(id);
  };

  const getMuscleFill = (id: MuscleId) => {
    const isSelected = selectedMuscleId === id;
    const stroke = isSelected ? "stroke-cyan-300 stroke-[2.5]" : "stroke-slate-700/80 stroke-[1.2]";
    const m = MUSCLE_DEFAULTS[id];

    if (m.weeklySets >= m.optimalWeeklySetsTarget) {
      return `fill-purple-600/60 ${stroke} hover:fill-purple-500/80`;
    }
    if (m.weeklySets > 0) {
      return `fill-cyan-500/50 ${stroke} hover:fill-cyan-400/70`;
    }
    return `fill-slate-900/80 ${stroke} hover:fill-slate-800`;
  };

  return (
    <div className="space-y-4">
      {/* Front / Back Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveView("front");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeView === "front"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ANTERIOR (FRONT)
          </button>
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveView("back");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeView === "back"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            POSTERIOR (BACK)
          </button>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          TAP MUSCLE FOR TELEMETRY
        </span>
      </div>

      {/* Anatomy Map Card */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-[280px] h-[340px] relative">
          <svg viewBox="0 0 200 360" className="w-full h-full drop-shadow-2xl cursor-pointer">
            {/* Silhouette Outline */}
            <path
              d="M 100 20 C 110 20 115 30 115 42 C 115 50 110 56 100 56 C 90 56 85 50 85 42 C 85 30 90 20 100 20 Z"
              className="fill-slate-950 stroke-slate-800 stroke-[1.5]"
            />

            {activeView === "front" ? (
              <g>
                <path d="M 94 56 L 106 56 L 108 68 L 92 68 Z" className="fill-slate-900 stroke-slate-800" />
                {/* Front Delts */}
                <path d="M 68 70 C 60 72 54 85 55 98 C 62 98 67 92 70 82 Z" className={getMuscleFill("front_delts")} onClick={() => handleSelect("front_delts")} />
                <path d="M 132 70 C 140 72 146 85 145 98 C 138 98 133 92 130 82 Z" className={getMuscleFill("front_delts")} onClick={() => handleSelect("front_delts")} />
                {/* Chest */}
                <path d="M 72 74 C 85 73 98 78 98 98 C 88 102 74 100 70 88 Z" className={getMuscleFill("chest")} onClick={() => handleSelect("chest")} />
                <path d="M 128 74 C 115 73 102 78 102 98 C 112 102 126 100 130 88 Z" className={getMuscleFill("chest")} onClick={() => handleSelect("chest")} />
                {/* Biceps */}
                <path d="M 54 100 C 50 110 50 125 56 135 C 62 130 63 118 60 102 Z" className={getMuscleFill("biceps")} onClick={() => handleSelect("biceps")} />
                <path d="M 146 100 C 150 110 150 125 144 135 C 138 130 137 118 140 102 Z" className={getMuscleFill("biceps")} onClick={() => handleSelect("biceps")} />
                {/* Forearms */}
                <path d="M 54 138 C 48 150 44 168 47 185 C 53 185 57 165 60 142 Z" className={getMuscleFill("forearms")} onClick={() => handleSelect("forearms")} />
                <path d="M 146 138 C 152 150 156 168 153 185 C 147 185 143 165 140 142 Z" className={getMuscleFill("forearms")} onClick={() => handleSelect("forearms")} />
                {/* Abs */}
                <path d="M 88 104 L 112 104 L 110 145 L 90 145 Z" className={getMuscleFill("abs")} onClick={() => handleSelect("abs")} />
                {/* Obliques */}
                <path d="M 76 106 C 78 120 78 135 86 146 L 86 106 Z" className={getMuscleFill("obliques")} onClick={() => handleSelect("obliques")} />
                <path d="M 124 106 C 122 120 122 135 114 146 L 114 106 Z" className={getMuscleFill("obliques")} onClick={() => handleSelect("obliques")} />
                {/* Quads */}
                <path d="M 76 158 C 72 180 70 215 76 245 C 86 245 94 220 96 160 Z" className={getMuscleFill("quads")} onClick={() => handleSelect("quads")} />
                <path d="M 124 158 C 128 180 130 215 124 245 C 114 245 106 220 104 160 Z" className={getMuscleFill("quads")} onClick={() => handleSelect("quads")} />
                {/* Calves */}
                <path d="M 75 258 C 72 275 73 305 78 325 L 90 325 C 92 300 90 275 86 258 Z" className={getMuscleFill("calves")} onClick={() => handleSelect("calves")} />
                <path d="M 125 258 C 128 275 127 305 122 325 L 110 325 C 108 300 110 275 114 258 Z" className={getMuscleFill("calves")} onClick={() => handleSelect("calves")} />
              </g>
            ) : (
              <g>
                {/* Upper Back */}
                <path d="M 80 68 C 95 62 105 62 120 68 L 126 105 C 105 112 95 112 74 105 Z" className={getMuscleFill("upper_back")} onClick={() => handleSelect("upper_back")} />
                {/* Rear Delts */}
                <path d="M 66 70 C 58 74 54 85 58 98 C 65 96 70 88 74 78 Z" className={getMuscleFill("rear_delts")} onClick={() => handleSelect("rear_delts")} />
                <path d="M 134 70 C 142 74 146 85 142 98 C 135 96 130 88 126 78 Z" className={getMuscleFill("rear_delts")} onClick={() => handleSelect("rear_delts")} />
                {/* Triceps */}
                <path d="M 55 102 C 50 112 50 128 56 136 C 62 130 63 118 60 104 Z" className={getMuscleFill("triceps")} onClick={() => handleSelect("triceps")} />
                <path d="M 145 102 C 150 112 150 128 144 136 C 138 130 137 118 140 104 Z" className={getMuscleFill("triceps")} onClick={() => handleSelect("triceps")} />
                {/* Lower Back */}
                <path d="M 86 112 L 114 112 L 110 148 L 90 148 Z" className={getMuscleFill("lower_back")} onClick={() => handleSelect("lower_back")} />
                {/* Glutes */}
                <path d="M 76 150 C 72 165 72 182 85 190 C 96 190 98 175 97 150 Z" className={getMuscleFill("glutes")} onClick={() => handleSelect("glutes")} />
                <path d="M 124 150 C 128 165 128 182 115 190 C 104 190 102 175 103 150 Z" className={getMuscleFill("glutes")} onClick={() => handleSelect("glutes")} />
                {/* Hamstrings */}
                <path d="M 76 195 C 72 215 72 235 78 248 C 88 248 94 225 96 195 Z" className={getMuscleFill("hamstrings")} onClick={() => handleSelect("hamstrings")} />
                <path d="M 124 195 C 128 215 128 235 122 248 C 112 248 106 225 104 195 Z" className={getMuscleFill("hamstrings")} onClick={() => handleSelect("hamstrings")} />
                {/* Calves Back */}
                <path d="M 75 258 C 70 278 72 308 78 325 L 90 325 C 94 300 92 275 86 258 Z" className={getMuscleFill("calves")} onClick={() => handleSelect("calves")} />
                <path d="M 125 258 C 130 278 128 308 122 325 L 110 325 C 106 300 108 275 114 258 Z" className={getMuscleFill("calves")} onClick={() => handleSelect("calves")} />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Selected Muscle Telemetry Card */}
      <div className="hunter-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/40 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              MUSCLE TELEMETRY & STIMULUS
            </span>
            <h3 className="text-base font-black text-white tracking-tight">
              {selectedMuscle.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">RECOVERY STATUS</span>
            <span className="text-xs font-mono font-black text-cyan-300">
              {selectedMuscle.recoveryPercent}% RECOVERED
            </span>
          </div>
        </div>

        {/* Volume Progress */}
        <div className="space-y-1.5 my-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Weekly Working Sets</span>
            <span className="text-white font-bold">
              {selectedMuscle.weeklySets} / {selectedMuscle.optimalWeeklySetsTarget} Sets
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (selectedMuscle.weeklySets / selectedMuscle.optimalWeeklySetsTarget) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Personal Record */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0 text-xs">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">
              Current Recorded PR
            </span>
            <span className="text-slate-200 font-medium truncate block font-mono">
              {selectedMuscle.personalRecord}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

