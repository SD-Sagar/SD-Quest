"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  confirmStartExercise,
  tickSetupTimer,
  adjustSetupTimer,
  completeActiveSet,
  skipExerciseWithPenalty,
  abandonSession,
  skipPreCompletedMovement,
  redoPreCompletedMovementForBonus,
  tickTimer,
  adjustTimer,
  skipTimer,
  logSkips,
  finishSkippingPhase,
  swapCurrentExercise,
  endSession,
} from "@/store/slices/workoutUiSlice";
import { finishWorkoutAction } from "@/server/actions/workout.actions";
import { saveActiveSessionAction, clearActiveSessionAction } from "@/server/actions/player.actions";
import { triggerHaptic } from "@/lib/utils";
import {
  playSetCompleteSound,
  playTimerCompleteSound,
  playLevelUpSound,
} from "@/lib/audio/soundEffects";
import {
  calculateDumbbellPlates,
  calculateAccurateWorkoutCalories,
} from "@/lib/calculations/gym";
import confetti from "canvas-confetti";
import {
  X,
  Dumbbell,
  Clock,
  CheckCircle2,
  Trophy,
  Info,
  ChevronRight,
  Flame,
  Zap,
  Layers,
  Award,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Plus,
  Minus,
  OctagonAlert,
  Sparkles,
} from "lucide-react";
import { DayOfWeek, EquipmentInventory, Profile } from "@/types";

interface ActiveWorkoutModalProps {
  userProfile?: Profile | null;
}

export function ActiveWorkoutModal({ userProfile }: ActiveWorkoutModalProps = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.workoutUi);
  const [isPending, startTransition] = useTransition();

  // Local inputs for current set
  const [inputWeight, setInputWeight] = useState(15.0);
  const [inputReps, setInputReps] = useState(10);
  const [inputRpe, setInputRpe] = useState(8);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSkipConfirmModal, setShowSkipConfirmModal] = useState(false);
  const [showAbandonConfirmModal, setShowAbandonConfirmModal] = useState(false);
  const [completedDebriefData, setCompletedDebriefData] = useState<{
    caloriesBurned: number;
    tonnageKg: number;
    totalXp: number;
    breakdown?: {
      exerciseName: string;
      setsCount: number;
      tonnageKg: number;
      caloriesBurned: number;
    }[];
  } | null>(null);

  const [skipsCountInput, setSkipsCountInput] = useState(100);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const currentSet = currentExercise?.sets[session.currentSetIndex];

  // Default inventory for plate solver
  const defaultInv: EquipmentInventory = {
    id: "default",
    user_id: "user",
    has_bench: true,
    bench_positions: [],
    dumbbell_handle_weight_kg: 2.0,
    plate_5kg_count: 8,
    plate_2_5kg_count: 4,
    plate_2kg_count: 4,
    plate_1_25kg_count: 8,
    plate_1kg_count: 4,
    custom_plates: [],
    updated_at: new Date().toISOString(),
  };

  const dynamicPlates = calculateDumbbellPlates(inputWeight, defaultInv, true);

  // Flattened sets for accurate calorie calculation
  const allPerformedSets = session.exercises.flatMap((ex) =>
    ex.sets.map((s) => ({
      weightKg: s.weightKg,
      reps: s.reps,
      exerciseName: ex.definition.name,
      targetMuscle: ex.definition.target_muscle,
    }))
  );

  const accurateCal = calculateAccurateWorkoutCalories({
    durationSeconds: elapsedSeconds,
    heightCm: userProfile?.height_cm || 175,
    weightKg: userProfile?.weight_kg || 70,
    playerLevel: userProfile?.current_level || 1,
    playerRank: userProfile?.rank || "Recruit",
    sets: allPerformedSets,
    skippingCount: session.skippingCompleted,
  });

  // Sync inputs with current set target when set changes
  useEffect(() => {
    if (currentSet) {
      setInputWeight(currentSet.weightKg);
      setInputReps(currentSet.reps);
      setInputRpe(currentSet.rpe || 8);
    }
  }, [session.currentExerciseIndex, session.currentSetIndex, currentSet]);

  // Elapsed workout time clock
  useEffect(() => {
    if (!session.isActive || session.status === "completed") return;
    const interval = setInterval(() => {
      if (session.startedAtTimestamp) {
        setElapsedSeconds(Math.floor((Date.now() - session.startedAtTimestamp) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session.isActive, session.status, session.startedAtTimestamp]);

  // Rest countdown ticker & sound alert
  useEffect(() => {
    if (!session.restTimerActive) return;
    const interval = setInterval(() => {
      if (session.restTimerSeconds === 1) {
        playTimerCompleteSound();
        triggerHaptic("heavy");
      }
      dispatch(tickTimer());
    }, 1000);
    return () => clearInterval(interval);
  }, [session.restTimerActive, session.restTimerSeconds, dispatch]);

  // Setup countdown ticker
  useEffect(() => {
    if (!session.setupTimerActive) return;
    const interval = setInterval(() => {
      if (session.setupTimerSeconds === 1) {
        playTimerCompleteSound();
        triggerHaptic("medium");
      }
      dispatch(tickSetupTimer());
    }, 1000);
    return () => clearInterval(interval);
  }, [session.setupTimerActive, session.setupTimerSeconds, dispatch]);

  // Sync skipping target to input
  useEffect(() => {
    if (session.skippingTarget) {
      setSkipsCountInput(session.skippingTarget);
    }
  }, [session.skippingTarget]);

  // Cross-device persistence to Supabase (ZERO localStorage)
  useEffect(() => {
    if (session.isActive && session.status !== "completed") {
      saveActiveSessionAction(session).catch(() => {});
    } else if (session.status === "completed") {
      clearActiveSessionAction().catch(() => {});
    }
  }, [session]);

  if (!session.isActive && !completedDebriefData) return null;

  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecsRem = elapsedSeconds % 60;
  const elapsedDisplay = `${String(elapsedMins).padStart(2, "0")}:${String(elapsedSecsRem).padStart(2, "0")}`;

  const handleSetComplete = () => {
    triggerHaptic("success");
    playSetCompleteSound();

    const isLastSetOfSingle =
      session.isSingleExercise &&
      session.currentSetIndex + 1 >= (currentExercise?.sets.length || 0);

    dispatch(
      completeActiveSet({
        actualWeightKg: Number(inputWeight),
        actualReps: Number(inputReps),
        rpe: Number(inputRpe),
      })
    );

    if (isLastSetOfSingle) {
      handleFinishWorkout(0);
    }
  };

  const handleConfirmSkipExercise = () => {
    setShowSkipConfirmModal(false);
    triggerHaptic("warning");
    if (session.isSingleExercise) {
      clearActiveSessionAction().catch(() => {});
      dispatch(abandonSession());
      return;
    }
    dispatch(skipExerciseWithPenalty());
  };

  const handleEmergencyAbandon = async () => {
    setShowAbandonConfirmModal(false);
    triggerHaptic("heavy");

    // If already in skipping phase, we preserve the core workout progress!
    if (session.phase !== "skipping") {
      await clearActiveSessionAction().catch(() => {});
    }
    dispatch(abandonSession());
  };

  const handleFinishWorkout = (finalSkips: number) => {
    triggerHaptic("heavy");
    playLevelUpSound();
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
    });

    const completedEarly = (Date.now() - session.startedAtTimestamp) / 60000 <= session.targetDurationMinutes;

    // Flatten all performed sets for server persistence
    const performedSets = session.exercises.flatMap((ex) =>
      ex.sets.map((s) => ({
        exercise_name: ex.definition.name,
        target_muscle: ex.definition.target_muscle,
        set_number: s.setNumber,
        weight_kg: s.weightKg,
        reps: s.reps,
        rpe: s.rpe,
        bench_angle: s.benchAngle || null,
        plate_breakdown: s.plateBreakdown || null,
        completed: s.completed,
      }))
    );

    startTransition(async () => {
      const res = await finishWorkoutAction({
        splitDay: session.dayName as DayOfWeek,
        title: session.title,
        targetMuscles: session.targetMuscles,
        durationMinutes: Math.max(1, elapsedMins),
        targetDurationMinutes: session.targetDurationMinutes,
        completedEarly,
        skippingTarget: session.isSingleExercise ? 0 : session.skippingTarget,
        skippingCompleted: session.isSingleExercise ? 0 : finalSkips,
        skippedCount: session.skippedCount,
        caloriesBurned: accurateCal.totalCaloriesBurned,
        isExtraWorkout: session.isExtraWorkout,
        extraWorkoutMultiplier: session.extraWorkoutMultiplier,
        isSingleExercise: session.isSingleExercise,
        sets: performedSets,
      });

      if (session.isSingleExercise) {
        window.dispatchEvent(
          new CustomEvent("workoutCompleted", {
            detail: {
              session: res?.session,
              isSingleExercise: true,
              exerciseName: session.exercises[0]?.definition.name,
              caloriesBurned: accurateCal.totalCaloriesBurned,
              tonnageKg: accurateCal.tonnageMovedKg,
              xp: res?.rpgRewards?.xpGained || 25,
            },
          })
        );
        dispatch(endSession());
        await clearActiveSessionAction().catch(() => {});
        router.refresh();
        return;
      }

      setCompletedDebriefData({
        caloriesBurned: accurateCal.totalCaloriesBurned,
        tonnageKg: accurateCal.tonnageMovedKg,
        totalXp: res?.rpgRewards?.xpGained || 85,
        breakdown: accurateCal.exerciseBreakdown,
      });

      window.dispatchEvent(
        new CustomEvent("workoutCompleted", {
          detail: {
            session: res?.session,
            isSingleExercise: false,
          },
        })
      );

      dispatch(endSession());
      router.refresh();
    });
  };

  // ---------------------------------------------------------------------------
  // SCREEN: POST-WORKOUT HUNTER DEBRIEF MODAL (Solo Leveling Notification Popup)
  // ---------------------------------------------------------------------------
  if (completedDebriefData) {
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        <div className="w-full max-w-md solo-notification-modal rounded-xl p-6 sm:p-7 space-y-4 text-center shadow-2xl text-white relative">
          <div className="w-14 h-14 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_15px_#00e5ff]">
            <Trophy className="w-7 h-7 fill-current" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-solo font-bold text-cyan-300 uppercase tracking-widest block mana-text-glow">
              [ NOTIFICATION // DIRECTIVE CONQUERED ]
            </span>
            <h2 className="text-xl font-bold text-white tracking-wider font-solo white-text-glow">
              HUNTER SESSION DEBRIEF
            </h2>
            <p className="text-xs text-slate-300 font-hud">
              Biomechanical work logged and persisted to cloud.
            </p>
          </div>

          {/* Telemetry Stats Grid */}
          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase block font-hud">KCAL EXPELLED</span>
              <span className="text-base font-black text-white">
                {completedDebriefData.caloriesBurned}
              </span>
              <span className="text-[9px] text-slate-400 block font-hud">kcal</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase block font-hud">TONNAGE MOVED</span>
              <span className="text-base font-black text-cyan-400">
                {completedDebriefData.tonnageKg}
              </span>
              <span className="text-[9px] text-slate-400 block font-hud">kg</span>
            </div>
            <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase block font-hud">XP HARVESTED</span>
              <span className="text-base font-black text-cyan-300">
                +{completedDebriefData.totalXp}
              </span>
              <span className="text-[9px] text-slate-400 block font-hud">XP</span>
            </div>
          </div>

          {/* Individual Movement Calorie & Tonnage Breakdown */}
          {completedDebriefData.breakdown && completedDebriefData.breakdown.length > 0 && (
            <div className="space-y-1.5 text-left pt-1 font-hud">
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="uppercase tracking-wider font-bold">MOVEMENTS WORKLOAD BREAKDOWN</span>
                <span>{completedDebriefData.breakdown.length} Movements</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {completedDebriefData.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#070b14] border border-cyan-500/20 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-white font-bold block truncate">{item.exerciseName}</span>
                      <span className="text-[10px] text-slate-400">
                        {item.setsCount} sets • {item.tonnageKg} kg moved
                      </span>
                    </div>
                    <span className="text-cyan-400 font-bold text-xs shrink-0 pl-2">
                      +{item.caloriesBurned} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setCompletedDebriefData(null);
              router.refresh();
            }}
            className="w-full solo-btn py-3 text-xs font-solo"
          >
            RETURN TO COMMAND HUB ◆
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1. SCREEN: EQUIPMENT SETUP & TRANSITION MODE
  // ---------------------------------------------------------------------------
  if (session.status === "setup" && currentExercise) {
    const isBellyPhase = currentExercise.phase === "belly";
    const benchAngle = currentExercise.definition.bench_angle || "Flat";
    const setupMins = Math.floor(session.setupTimerSeconds / 60);
    const setupSecs = session.setupTimerSeconds % 60;
    const setupDisplay = `${String(setupMins).padStart(2, "0")}:${String(setupSecs).padStart(2, "0")}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
        <div className="w-full max-w-lg hunter-panel rounded-3xl border border-cyan-500/50 p-6 sm:p-8 shadow-2xl relative space-y-5 my-auto">
          {/* Top Bar with Phase Badge & Emergency Stop */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {session.isSingleExercise
                ? "FOCUSED SINGLE MOVEMENT TRIAL"
                : isBellyPhase
                ? "PHASE 2: DAILY BELLY PROTOCOL"
                : "PHASE 1: CORE SPLIT"}{" "}
              • {session.currentExerciseIndex + 1}/{session.exercises.length}
            </span>

            <button
              type="button"
              onClick={() => setShowAbandonConfirmModal(true)}
              className="px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/60 text-[10px] font-mono font-bold flex items-center gap-1 transition"
            >
              <OctagonAlert className="w-3 h-3" />
              <span>EMERGENCY STOP</span>
            </button>
          </div>

          {/* Pre-Completed Movement Smart Banner (Solo Leveling System Style) */}
          {currentExercise.isPreCompleted && (
            <div className="p-3.5 rounded-xl bg-[#070b14] border border-cyan-400 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-solo">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>[ INTELLIGENT SYSTEM RECOGNITION ]</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug font-hud">
                You already completed <strong>{currentExercise.definition.name}</strong> earlier today. Choose your path:
              </p>
              <div className="flex gap-2 pt-1 font-hud">
                <button
                  type="button"
                  onClick={() => dispatch(skipPreCompletedMovement())}
                  className="solo-btn-secondary flex-1 py-2 text-xs"
                >
                  CREDIT DONE (SKIP)
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(redoPreCompletedMovementForBonus({ bonusMultiplier: 0.25 }))}
                  className="solo-btn flex-1 py-2 text-xs"
                >
                  RE-DO (+0.25x BONUS) ◆
                </button>
              </div>
            </div>
          )}

          {/* Exercise Title */}
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-black text-white tracking-tight mana-text-glow">
              {currentExercise.definition.name}
            </h2>
            <p className="text-xs text-cyan-400 font-mono font-semibold">
              Target: {currentExercise.definition.target_muscle}
            </p>
          </div>

          {/* 60s Setup Timer Ring */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-500/40 flex flex-col items-center justify-center bg-cyan-950/20 shadow-lg shadow-cyan-950">
              <span className="text-3xl font-black font-mono tracking-tight text-white mana-text-glow">
                {setupDisplay}
              </span>
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">
                Setup Timer
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => dispatch(adjustSetupTimer(30))}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 hover:border-slate-500"
              >
                +30s More
              </button>
            </div>
          </div>

          {/* Physical Equipment Guidance Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>EQUIPMENT SETUP DIRECTIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">20-in-1 Bench Position</span>
                <span className="text-sm font-black text-amber-400">{benchAngle}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Weight / Hand</span>
                <span className="text-sm font-black text-cyan-400">{currentSet?.weightKg || 15} kg</span>
              </div>
            </div>

            {/* Plate Solver Recipe */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">Dumbbell Loading Recipe:</span>
              <span>{dynamicPlates.summaryString}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("heavy");
                dispatch(confirmStartExercise());
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START WORKOUT // I AM READY</span>
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="hover:text-cyan-400 flex items-center gap-1 font-mono"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showInstructions ? "Hide Technique Guide" : "View Technique Guide"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSkipConfirmModal(true)}
                className="text-red-400/80 hover:text-red-300 flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Skip Exercise (-15 XP Penalty)</span>
              </button>
            </div>
          </div>

          {/* Form instructions toggle */}
          {showInstructions && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300 animate-in fade-in">
              <span className="font-bold text-white block">Technique & Breathing Cues:</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                {currentExercise.definition.instructions.slice(0, 3).map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-red-500/50 p-6 space-y-4 text-center shadow-2xl">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto animate-bounce" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                THE SYSTEM WARNS YOU
              </h3>
              <p className="text-xs text-slate-300">
                Skipping this exercise will incur an immediate penalty of <span className="text-red-400 font-bold">-15 XP</span> and <span className="text-red-400 font-bold">-0.10 Discipline</span>.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkipConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300"
                >
                  KEEP LIFTING
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSkipExercise}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg shadow-red-950"
                >
                  CONFIRM SKIP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Stop Confirmation Modal */}
        {showAbandonConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-red-500/60 p-6 space-y-4 text-center shadow-2xl">
              <OctagonAlert className="w-10 h-10 text-red-400 mx-auto animate-pulse" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                EMERGENCY STOP PROTOCOL
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {session.phase === "skipping"
                  ? "Your core lifting sets are already completed and will be preserved! You can return directly to the Skipping Challenge later."
                  : "Stopping now will reset today's session progress, allowing you to start freshly from the beginning later."}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAbandonConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300"
                >
                  RESUME WORKOUT
                </button>
                <button
                  type="button"
                  onClick={handleEmergencyAbandon}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg shadow-red-950"
                >
                  STOP SESSION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. SCREEN: RESTING BETWEEN SETS OF SAME EXERCISE
  // ---------------------------------------------------------------------------
  if (session.status === "resting") {
    const minutes = Math.floor(session.restTimerSeconds / 60);
    const seconds = session.restTimerSeconds % 60;
    const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="w-full max-w-md hunter-panel rounded-3xl border border-cyan-500/40 p-6 text-center shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 animate-spin text-cyan-400" />
              REST PROTOCOL ACTIVE
            </span>
            <span>NEXT: SET {session.currentSetIndex + 1} OF {currentExercise?.sets.length}</span>
          </div>

          <div className="my-4">
            <div className="w-40 h-40 mx-auto rounded-full border-4 border-cyan-500/40 flex flex-col items-center justify-center bg-cyan-950/20 shadow-lg shadow-cyan-950">
              <span className="text-4xl font-black font-mono tracking-tight text-white mana-text-glow">
                {timeDisplay}
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">
                Replenishing ATP
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between font-mono">
            <span className="text-slate-400">Total Elapsed: {elapsedDisplay}</span>
            <span className="text-orange-400 font-bold">
              ~{accurateCal.totalCaloriesBurned} kcal Expelled
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHaptic("light");
                dispatch(adjustTimer(30));
              }}
              className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:border-slate-600 transition"
            >
              +30 SECONDS
            </button>
            <button
              onClick={() => {
                triggerHaptic("medium");
                dispatch(skipTimer());
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-black text-white hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-950/50"
            >
              RESUME SET
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. SCREEN: PHASE 3 COMPULSORY SKIPPING CHALLENGE (Solo Leveling System Trial)
  // ---------------------------------------------------------------------------
  if (session.status === "skipping") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="w-full max-w-md solo-notification-modal rounded-xl p-6 sm:p-7 shadow-2xl relative space-y-5 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-[10px] font-solo font-bold tracking-widest uppercase mx-auto">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            [ PHASE 3: COMPULSORY SKIPPING PROTOCOL ]
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-wider font-solo white-text-glow">
              FINAL SYSTEM TRIAL
            </h2>
            <p className="text-xs text-slate-300 font-hud">
              Target: {session.skippingTarget} Skips (+Agility &amp; Endurance Yield)
            </p>
          </div>

          {/* Stepper / Input */}
          <div className="p-5 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-3 font-hud">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">
              Skips Conquered
            </span>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setSkipsCountInput(Math.max(0, skipsCountInput - 10))}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/40 text-white font-bold text-lg hover:border-cyan-300 flex items-center justify-center font-mono"
              >
                -10
              </button>
              <span className="text-4xl font-black font-mono text-cyan-400 mana-text-glow">
                {skipsCountInput}
              </span>
              <button
                type="button"
                onClick={() => setSkipsCountInput(skipsCountInput + 10)}
                className="w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/40 text-white font-bold text-lg hover:border-cyan-300 flex items-center justify-center font-mono"
              >
                +10
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              dispatch(logSkips(skipsCountInput));
              dispatch(finishSkippingPhase());
              handleFinishWorkout(skipsCountInput);
            }}
            className="w-full solo-btn py-3 text-xs font-solo"
          >
            <Trophy className="w-4 h-4 fill-current" />
            <span>{isPending ? "SYSTEM LOGGING SESSION..." : "CLAIM VICTORY & HARVEST XP ◆"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. SCREEN: ACTIVE LIFTING SET MODE
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg hunter-panel rounded-3xl border border-cyan-500/50 p-5 sm:p-7 shadow-2xl relative space-y-5 my-auto">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
              {session.isSingleExercise
                ? "FOCUSED TRIAL"
                : currentExercise?.phase === "belly"
                ? "PHASE 2: DAILY BELLY"
                : "PHASE 1: CORE SPLIT"}{" "}
              • {session.dayName}
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              {currentExercise?.definition.name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[9px] text-slate-400 block font-hud">KCAL</span>
              <span className="text-xs font-bold text-cyan-400">~{accurateCal.totalCaloriesBurned}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAbandonConfirmModal(true)}
              className="p-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/60"
            >
              <OctagonAlert className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Set Progress Checklist */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SET PROGRESSION</span>
            <span className="text-cyan-400 font-bold">
              SET {session.currentSetIndex + 1} OF {currentExercise?.sets.length}
            </span>
          </div>
          <div className="flex gap-1.5">
            {currentExercise?.sets.map((s, idx) => (
              <div
                key={idx}
                className={`flex-1 py-1.5 rounded-lg text-center font-mono text-[10px] font-bold border transition ${
                  s.completed
                    ? "bg-cyan-950/80 border-cyan-500 text-cyan-300"
                    : idx === session.currentSetIndex
                    ? "bg-cyan-500/20 border-cyan-400 text-white animate-pulse"
                    : "bg-slate-950 border-slate-800 text-slate-600"
                }`}
              >
                {s.completed ? "✓" : `S${idx + 1}`}
              </div>
            ))}
          </div>
        </div>

        {/* Set Controls (Weight & Reps Steppers) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weight Stepper */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Weight / Hand (kg)
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setInputWeight(Math.max(0, inputWeight - 1.0))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
              >
                -
              </button>
              <span className="text-2xl font-black font-mono text-white min-w-16">
                {inputWeight}
              </span>
              <button
                type="button"
                onClick={() => setInputWeight(inputWeight + 1.0)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Reps Stepper */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Reps Count
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setInputReps(Math.max(1, inputReps - 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
              >
                -
              </button>
              <span className="text-2xl font-black font-mono text-cyan-400 min-w-16">
                {inputReps}
              </span>
              <button
                type="button"
                onClick={() => setInputReps(inputReps + 1)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Plate Recipe Display */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="text-slate-500">Plate Solver:</span>
          <span className="text-slate-300">{dynamicPlates.summaryString}</span>
        </div>

        {/* Action: Log Set Completed */}
        <button
          type="button"
          onClick={handleSetComplete}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-950 transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>
            {session.currentSetIndex + 1 === currentExercise?.sets.length
              ? session.isSingleExercise
                ? "COMPLETE SOLO TRIAL"
                : "COMPLETE FINAL SET & ADVANCE"
              : `LOG SET ${session.currentSetIndex + 1} COMPLETE`}
          </span>
        </button>

        {/* Bottom Options */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="hover:text-cyan-400 flex items-center gap-1 font-mono text-[11px]"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Form Guidance</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSkipConfirmModal(true)}
            className="text-red-400/80 hover:text-red-300 font-mono text-[11px]"
          >
            Skip Exercise (-15 XP Penalty)
          </button>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-red-500/50 p-6 space-y-4 text-center shadow-2xl">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto animate-bounce" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                THE SYSTEM WARNS YOU
              </h3>
              <p className="text-xs text-slate-300">
                Skipping this exercise will incur an immediate penalty of <span className="text-red-400 font-bold">-15 XP</span> and <span className="text-red-400 font-bold">-0.10 Discipline</span>.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkipConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300"
                >
                  KEEP LIFTING
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSkipExercise}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg shadow-red-950"
                >
                  CONFIRM SKIP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Stop Confirmation Modal */}
        {showAbandonConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-red-500/60 p-6 space-y-4 text-center shadow-2xl">
              <OctagonAlert className="w-10 h-10 text-red-400 mx-auto animate-pulse" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                EMERGENCY STOP PROTOCOL
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {session.phase === "skipping"
                  ? "Your core lifting sets are already completed and will be preserved! You can return directly to the Skipping Challenge later."
                  : "Stopping now will reset today's session progress, allowing you to start freshly from the beginning later."}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAbandonConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300"
                >
                  RESUME WORKOUT
                </button>
                <button
                  type="button"
                  onClick={handleEmergencyAbandon}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg shadow-red-950"
                >
                  STOP SESSION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
