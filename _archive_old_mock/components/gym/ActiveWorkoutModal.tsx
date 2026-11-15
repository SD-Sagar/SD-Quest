"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  completeCurrentSet,
  tickRestTimer,
  adjustRestTimer,
  skipRestTimer,
  completeSkippingObjective,
  finishWorkout,
  discardWorkout,
} from "@/store/slices/workoutSlice";
import { addXp, addAttributePoints } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  X,
  Dumbbell,
  Clock,
  CheckCircle2,
  Trophy,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
} from "lucide-react";

export function ActiveWorkoutModal() {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.workout.activeSession);

  // Local inputs for the active set
  const [inputWeight, setInputWeight] = useState(17.5);
  const [inputReps, setInputReps] = useState(10);
  const [inputRpe, setInputRpe] = useState(8);
  const [skipsCount, setSkipsCount] = useState(100);
  const [showInstructions, setShowInstructions] = useState(false);

  // Sync inputs with current set target when exercise or set changes
  useEffect(() => {
    if (session && session.exercises[session.currentExerciseIndex]) {
      const ex = session.exercises[session.currentExerciseIndex];
      const set = ex.sets[session.currentSetIndex];
      if (set) {
        setInputWeight(set.actualWeightKg);
        setInputReps(set.actualReps);
        setInputRpe(set.rpe || 8);
      }
    }
  }, [session?.currentExerciseIndex, session?.currentSetIndex]);

  // Live Rest Timer interval tick
  useEffect(() => {
    if (!session || !session.restTimerActive) return;

    const interval = setInterval(() => {
      dispatch(tickRestTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.restTimerActive, dispatch]);

  if (!session) return null;

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const currentSet = currentExercise?.sets[session.currentSetIndex];

  const handleSetComplete = () => {
    triggerHaptic("success");
    dispatch(
      completeCurrentSet({
        actualWeightKg: Number(inputWeight),
        actualReps: Number(inputReps),
        rpe: Number(inputRpe),
      })
    );
  };

  const handleFinishWorkout = () => {
    triggerHaptic("heavy");
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    dispatch(finishWorkout());
    // Award RPG Progression Rewards
    dispatch(addXp(250));
    dispatch(
      addAttributePoints({
        strength: 0.4,
        discipline: 0.25,
        agility: 0.15,
        vitality: 0.1,
      })
    );
  };

  // RESTING HUD VIEW
  if (session.status === "resting") {
    const minutes = Math.floor(session.restTimerSeconds / 60);
    const seconds = session.restTimerSeconds % 60;
    const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <div className="w-full max-w-md hunter-panel rounded-3xl border border-cyan-500/40 p-6 text-center shadow-2xl relative overflow-hidden">
          {/* Mana glow */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-6">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 animate-spin text-cyan-400" />
              SYSTEM REST PROTOCOL
            </span>
            <span>NEXT: SET {session.currentSetIndex + 1}</span>
          </div>

          {/* Countdown Clock */}
          <div className="my-6">
            <div className="w-44 h-44 mx-auto rounded-full border-4 border-cyan-500/30 flex flex-col items-center justify-center bg-cyan-950/20 shadow-lg shadow-cyan-950">
              <span className="text-4xl font-black font-mono tracking-tight text-white mana-text-glow">
                {timeDisplay}
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">
                Rest Phase
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mb-6">
            Breathe deeply. Your muscles are replenishing adenosine triphosphate (ATP).
          </p>

          {/* Quick timer adjustments */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHaptic("light");
                dispatch(adjustRestTimer(30));
              }}
              className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:border-slate-600 transition"
            >
              +30 SECONDS
            </button>
            <button
              onClick={() => {
                triggerHaptic("medium");
                dispatch(skipRestTimer());
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-black text-white hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-950/50"
            >
              SKIP REST
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DUNGEON CLEARED VIEW
  if (session.status === "completed") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <div className="w-full max-w-md hunter-panel rounded-3xl border border-cyan-400/60 p-6 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-cyan-500/20 to-blue-600/30 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-950">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mana-text-glow">
            DUNGEON CLEARED!
          </h2>
          <p className="text-xs text-cyan-400 font-mono font-bold mt-1 uppercase tracking-widest">
            {session.title}
          </p>

          <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">TOTAL TONNAGE MOVED</span>
              <span className="font-mono font-black text-white text-sm">
                {session.totalTonnageKg.toLocaleString()} KG
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">SKIPPING OBJECTIVE</span>
              <span className="font-mono font-bold text-emerald-400">
                {session.skippingObjective.completed ? "COMPLETED (100+)" : "PENDING"}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">CALENDAR STATUS</span>
              <span className="text-emerald-400 font-bold font-mono">FULL GREEN DAY</span>
            </div>
          </div>

          {/* Acquired Rewards Plate */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 mb-6 text-left">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block mb-2">
              REWARDS ACQUIRED
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
              <span className="px-2 py-1 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/40">
                +250 XP
              </span>
              <span className="px-2 py-1 rounded bg-red-950/60 text-red-300 border border-red-500/40">
                +0.40 STR
              </span>
              <span className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
                +0.25 DIS
              </span>
              <span className="px-2 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-500/40">
                +0.15 AGI
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic("medium");
              dispatch(discardWorkout());
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-black text-white hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-950"
          >
            CONFIRM & RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE EXERCISE & SET LOGGING VIEW
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl hunter-panel border border-slate-700 p-5 shadow-2xl relative">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
                ACTIVE INSTANCE — {session.dayName}
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {session.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm("Discard active session?")) {
                dispatch(discardWorkout());
              }
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Exercise Details */}
        {currentExercise && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    EXERCISE {session.currentExerciseIndex + 1} OF {session.exercises.length}
                  </span>
                  <h3 className="text-base font-black text-white tracking-tight">
                    {currentExercise.definition.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-medium">
                      {currentExercise.definition.benchAngle || "Flat"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Target: {currentExercise.definition.targetMuscle}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Expandable Form Guidance */}
              {showInstructions && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <p className="font-bold text-cyan-400">Form Instructions:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    {currentExercise.definition.instructions.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Equipment Plate-Math Solver Breakdown Card */}
            {currentSet?.plateCombinationDesc && (
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-2.5 text-xs">
                <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-cyan-300 block text-[11px] uppercase tracking-wide">
                    Plate Solver Setup (Per Dumbbell)
                  </span>
                  <span className="text-slate-300 font-mono text-[11px] truncate block">
                    {currentSet.plateCombinationDesc}
                  </span>
                </div>
              </div>
            )}

            {/* Set Logger Card */}
            <div className="p-4 rounded-2xl hunter-panel border border-cyan-500/40 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase mb-3">
                <span>SET {session.currentSetIndex + 1} OF {currentExercise.sets.length}</span>
                <span className="text-cyan-400 font-mono">
                  {currentExercise.definition.defaultRestSeconds}S REST AUTO-TRIGGERS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                {/* Weight Input */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-lg font-black font-mono text-white bg-transparent focus:outline-none"
                  />
                </div>

                {/* Reps Input */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Reps Target
                  </label>
                  <input
                    type="number"
                    value={inputReps}
                    onChange={(e) => setInputReps(parseInt(e.target.value) || 0)}
                    className="w-full text-center text-lg font-black font-mono text-cyan-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* RPE Input */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    RPE (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={inputRpe}
                    onChange={(e) => setInputRpe(parseFloat(e.target.value) || 8)}
                    className="w-full text-center text-lg font-black font-mono text-amber-400 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Complete Set Button */}
              <button
                onClick={handleSetComplete}
                className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                COMPLETE SET & START REST TIMER
              </button>
            </div>

            {/* Skipping & Conditioning Module */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  DAILY SKIPPING OBJECTIVE
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Target: 100 Skips • Jump Rope
                </span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  dispatch(completeSkippingObjective(100));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                  session.skippingObjective.completed
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {session.skippingObjective.completed ? "✓ 100 SKIPS DONE" : "LOG 100 SKIPS"}
              </button>
            </div>

            {/* Finish Workout CTA */}
            <button
              onClick={handleFinishWorkout}
              className="w-full py-3 rounded-xl border border-slate-700 hover:border-cyan-500 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              FINISH & CLAIM DUNGEON REWARDS
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

