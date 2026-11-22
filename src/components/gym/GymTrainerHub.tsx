"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  startWorkoutSession,
  restoreWorkoutSession,
  updateCurrentSetWeight,
} from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import {
  calculateDumbbellPlates,
  calculateBarbellPlates,
  calculateLegDeveloperPlates,
  getRankVolumeWarning,
  calculateExtraWorkoutXpMultiplier,
  resolveExerciseEquipmentProfile,
} from "@/lib/calculations/gym";
import { calculateCircadianAwakeStatus } from "@/lib/calculations/fatigue";
import {
  MasterExercise,
  getDayExercises,
  getDailyBellyProtocol,
  SUNDAY_MOBILITY_PROTOCOL,
  isExerciseUnlocked,
  getRotatedSplitExercises,
  getCurrentWeekRotationIndex,
  getExerciseAttributeYield,
} from "@/lib/data/exerciseCatalog";
import { getActiveSessionAction, clearActiveSessionAction } from "@/server/actions/player.actions";
import { getTodaysWorkoutsAction } from "@/server/actions/workout.actions";
import { ExerciseCodexModal } from "./ExerciseCodexModal";
import { CustomPlanManager } from "./CustomPlanManager";
import {
  EquipmentInventory,
  ExerciseDefinition,
  DayOfWeek,
  HunterRank,
  Profile,
} from "@/types";
import {
  Dumbbell,
  Play,
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Lock,
  Unlock,
  Clock,
  Zap,
  CheckCircle2,
  Award,
  Sliders,
  HeartPulse,
  Flame,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Moon,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Eye,
} from "lucide-react";

const SPLIT_SCHEDULE: { day: DayOfWeek; title: string; subtitle: string; isRest: boolean }[] = [
  { day: "Monday", title: "Legs & Lower Body Foundation", subtitle: "Quads, Hamstrings, Glutes, Calves", isRest: false },
  { day: "Tuesday", title: "Chest Hypertrophy & Pectoral Power", subtitle: "Upper Chest, Mid Chest, Front Delts, Triceps", isRest: false },
  { day: "Wednesday", title: "Back Width & Thickness", subtitle: "Lats, Rhomboids, Trapezius, Biceps", isRest: false },
  { day: "Thursday", title: "Shoulder Overhead Power & Width", subtitle: "Lateral Deltoids, Anterior Deltoids", isRest: false },
  { day: "Friday", title: "Deltoid Specialization & Rear Delts", subtitle: "Rear Delts, Lateral Delts, Rotator Cuff", isRest: false },
  { day: "Saturday", title: "Arms Mastery (Biceps & Triceps)", subtitle: "Biceps, Triceps, Brachialis, Forearms", isRest: false },
  { day: "Sunday", title: "Honored Rest & Mobility Sanctuary", subtitle: "Zero Lifting • Parasympathetic Recovery & Vagus Reset", isRest: true },
];

interface GymTrainerHubProps {
  equipment: EquipmentInventory | null;
  exerciseCatalog: ExerciseDefinition[];
  playerLevel: number;
  playerRank: HunterRank;
  initialCompletedSessions?: any[];
  initialActiveSession?: any | null;
  profile?: Profile | null;
}

export function GymTrainerHub({
  equipment,
  exerciseCatalog,
  playerLevel = 1,
  playerRank = "Recruit",
  initialCompletedSessions = [],
  initialActiveSession = null,
  profile = null,
}: GymTrainerHubProps) {
  const dispatch = useAppDispatch();

  // Mode Switch: System vs Custom
  const [workoutMode, setWorkoutMode] = useState<"system" | "custom">("system");

  // Auto-detect current weekday
  const currentDayIndex = new Date().getDay();
  const dayNames: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayNames[currentDayIndex];

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayName);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<MasterExercise | null>(null);
  const [arsenalEquipType, setArsenalEquipType] = useState<
    "dumbbells" | "dumbbells_single" | "barbell" | "ez_bar" | "cable_pulley" | "leg_developer"
  >("dumbbells");
  const [targetWeightCalc, setTargetWeightCalc] = useState(15.0);
  const [exerciseWeightMap, setExerciseWeightMap] = useState<Record<string, number>>({});
  const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [showFullLibrary, setShowFullLibrary] = useState(false);
  const [savedUnfinishedSession, setSavedUnfinishedSession] = useState<any | null>(initialActiveSession || null);
  const [todaysCompletedSessions, setTodaysCompletedSessions] = useState<any[]>(initialCompletedSessions || []);
  const [devUnlockOverride, setDevUnlockOverride] = useState(false);
  const [soloTrialPrompt, setSoloTrialPrompt] = useState<{
    exerciseName: string;
    caloriesBurned: number;
    tonnageKg: number;
    xp: number;
  } | null>(null);
  const [isMobileCompactView, setIsMobileCompactView] = useState(false);
  const [isPlateCalcExpanded, setIsPlateCalcExpanded] = useState(false);
  const [isProtocolIntelOpen, setIsProtocolIntelOpen] = useState(false);

  const sessionState = ((profile?.active_session_state as any) || {});
  const isCurrentlySleeping = Boolean(
    sessionState.is_sleeping ||
    sessionState.category === "sleep" ||
    sessionState.session_id === "system-compulsory-sleep-stasis" ||
    sessionState.type === "sleep"
  );
  const circadian = calculateCircadianAwakeStatus({
    lastSleepStartedAt: profile?.last_sleep_started_at || sessionState.last_sleep_started_at,
    lastSleepCompletedAt: profile?.last_sleep_completed_at || sessionState.last_sleep_completed_at,
    rollingSleepMinutes: profile?.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes,
    isCurrentlySleeping,
    frozenAwakeHours: sessionState.frozen_awake_hours,
    createdAt: profile?.created_at,
  });
  const isCircadianLocked = !devUnlockOverride && circadian.isPhysicalTrainingLocked;
  const [warningModalData, setWarningModalData] = useState<{
    title: string;
    message: string;
    pendingExercise?: MasterExercise;
    pendingWeight?: number;
  } | null>(null);

  // Sync initial props or refresh from Supabase
  useEffect(() => {
    if (initialActiveSession !== undefined) {
      setSavedUnfinishedSession(initialActiveSession);
    }
  }, [initialActiveSession]);

  useEffect(() => {
    if (initialCompletedSessions !== undefined) {
      setTodaysCompletedSessions(initialCompletedSessions);
    }
  }, [initialCompletedSessions]);

  useEffect(() => {
    getActiveSessionAction().then((saved) => {
      if (saved?.isActive && saved?.status !== "completed") {
        setSavedUnfinishedSession(saved);
      }
    }).catch(() => { });

    getTodaysWorkoutsAction().then((sessions) => {
      setTodaysCompletedSessions(sessions || []);
    }).catch(() => { });

    const handleWorkoutCompleted = (e: any) => {
      const session = e.detail?.session || e.detail;
      if (session) {
        setTodaysCompletedSessions((prev) => [session, ...prev]);
        setSavedUnfinishedSession(null);
      }
      // Reset all exercise weights back to system prescribed plan after workout session completes
      setExerciseWeightMap({});
      setFocusedExerciseId(null);
      if (e.detail?.isSingleExercise) {
        setSoloTrialPrompt({
          exerciseName: e.detail.exerciseName || "Movement Trial",
          caloriesBurned: e.detail.caloriesBurned || 0,
          tonnageKg: e.detail.tonnageKg || 0,
          xp: e.detail.xp || 25,
        });
        setTimeout(() => {
          setSoloTrialPrompt(null);
        }, 6500);
      }
    };
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    return () => window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
  }, []);

  const currentSplit = SPLIT_SCHEDULE.find((s) => s.day === selectedDay) || SPLIT_SCHEDULE[1];
  const dayExercises = getDayExercises(selectedDay, equipment);
  const bellyExercises = getDailyBellyProtocol(selectedDay);
  const isSunday = selectedDay === "Sunday";

  // A full split is completed only by a full training session, NOT a single exercise solo trial
  const isFullSplitSession = (s: any) =>
    !s.title?.toLowerCase().startsWith("solo trial") &&
    !s.notes?.includes("[SOLO_TRIAL]") &&
    !s.notes?.includes("[SINGLE_EXERCISE]");

  const isTodayCompleted = todaysCompletedSessions.length > 0 && todaysCompletedSessions.some(
    (s) => s.split_day === todayName && isFullSplitSession(s)
  );

  // If today's workout is already completed, automatically purge any leftover in-progress session
  useEffect(() => {
    if (isTodayCompleted && savedUnfinishedSession) {
      clearActiveSessionAction().catch(() => { });
      setSavedUnfinishedSession(null);
    }
  }, [isTodayCompleted, savedUnfinishedSession]);

  const completedExerciseNames = new Set(
    todaysCompletedSessions.flatMap((s) =>
      (s.workout_set_logs || []).map((l: any) => l.exercise_name?.toLowerCase())
    )
  );

  const defaultInv: EquipmentInventory = equipment || {
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

  const activeWorkoutUi = useAppSelector((state) => state.workoutUi);
  const isWorkoutActive = activeWorkoutUi.isActive;
  const currentWorkoutExercise = activeWorkoutUi.exercises[activeWorkoutUi.currentExerciseIndex];
  const currentWorkoutSetIndex = activeWorkoutUi.currentSetIndex;

  // Whenever an active workout session ends, exits, or completes, reset all weights back to system plan
  const wasWorkoutActiveRef = useRef(false);
  useEffect(() => {
    if (wasWorkoutActiveRef.current && !activeWorkoutUi.isActive) {
      setExerciseWeightMap({});
      setFocusedExerciseId(null);
    }
    wasWorkoutActiveRef.current = activeWorkoutUi.isActive;
  }, [activeWorkoutUi.isActive]);

  let currentPlateSolver = {
    achievableWeightKg: targetWeightCalc,
    isExact: true,
    platesPerSide: [] as { weightKg: number; count: number }[],
    summaryString: `${targetWeightCalc.toFixed(1)} kg`,
  };

  if (arsenalEquipType === "dumbbells") {
    currentPlateSolver = calculateDumbbellPlates(targetWeightCalc, defaultInv, true);
  } else if (arsenalEquipType === "dumbbells_single") {
    currentPlateSolver = calculateDumbbellPlates(targetWeightCalc, defaultInv, false);
  } else if (arsenalEquipType === "barbell") {
    currentPlateSolver = calculateBarbellPlates(targetWeightCalc, defaultInv, "straight");
  } else if (arsenalEquipType === "ez_bar") {
    currentPlateSolver = calculateBarbellPlates(targetWeightCalc, defaultInv, "ez");
  } else if (arsenalEquipType === "leg_developer") {
    currentPlateSolver = calculateLegDeveloperPlates(targetWeightCalc, defaultInv);
  } else if (arsenalEquipType === "cable_pulley") {
    currentPlateSolver = {
      achievableWeightKg: targetWeightCalc,
      isExact: true,
      platesPerSide: [],
      summaryString: `${targetWeightCalc.toFixed(1)} kg Cable / Pin Resistance`,
    };
  }

  const plateSolver = currentPlateSolver;

  const getSystemPrescribedWeight = (ex: MasterExercise): number => {
    const prof = resolveExerciseEquipmentProfile(ex, 0, defaultInv);
    if (prof.isFreeHand || prof.isSkippingRope) return 0;
    return prof.plateSolverResult?.achievableWeightKg ?? (prof.dumbbellCount === 1 ? 15.0 : 12.5);
  };

  const getExerciseWeight = (ex: MasterExercise): number => {
    if (exerciseWeightMap[ex.id] !== undefined) {
      return exerciseWeightMap[ex.id];
    }
    return getSystemPrescribedWeight(ex);
  };

  const isExerciseWeightCustomized = (ex: MasterExercise): boolean => {
    if (exerciseWeightMap[ex.id] === undefined) return false;
    const sys = getSystemPrescribedWeight(ex);
    return Math.abs(exerciseWeightMap[ex.id] - sys) > 0.05;
  };

  const handleResetExerciseWeight = (ex: MasterExercise) => {
    triggerHaptic("medium");
    setExerciseWeightMap((prev) => {
      const next = { ...prev };
      delete next[ex.id];
      return next;
    });
    const sys = getSystemPrescribedWeight(ex);
    if (focusedExerciseId === ex.id) {
      setTargetWeightCalc(sys);
    }
  };

  const handleExerciseWeightStep = (ex: MasterExercise, delta: number) => {
    triggerHaptic("light");
    const currentW = getExerciseWeight(ex);
    const newW = Math.max(0, Math.round((currentW + delta) * 10) / 10);
    setExerciseWeightMap((prev) => ({ ...prev, [ex.id]: newW }));
    setFocusedExerciseId(ex.id);
    setTargetWeightCalc(newW);

    const prof = resolveExerciseEquipmentProfile(ex, newW, defaultInv);
    if (prof.equipmentType === "leg_developer") {
      setArsenalEquipType("leg_developer");
    } else if (prof.equipmentType === "barbell" || prof.equipmentType === "bench_and_barbell") {
      setArsenalEquipType("barbell");
    } else if (prof.equipmentType === "ez_bar") {
      setArsenalEquipType("ez_bar");
    } else if (prof.equipmentType === "cable_pulley") {
      setArsenalEquipType("cable_pulley");
    } else if (prof.dumbbellCount === 1) {
      setArsenalEquipType("dumbbells_single");
    } else {
      setArsenalEquipType("dumbbells");
    }
  };

  const handleFocusExercise = (ex: MasterExercise) => {
    triggerHaptic("light");
    setFocusedExerciseId(ex.id);
    const w = getExerciseWeight(ex);
    setTargetWeightCalc(w);

    const prof = resolveExerciseEquipmentProfile(ex, w, defaultInv);
    if (prof.equipmentType === "leg_developer") {
      setArsenalEquipType("leg_developer");
    } else if (prof.equipmentType === "barbell" || prof.equipmentType === "bench_and_barbell") {
      setArsenalEquipType("barbell");
    } else if (prof.equipmentType === "ez_bar") {
      setArsenalEquipType("ez_bar");
    } else if (prof.equipmentType === "cable_pulley") {
      setArsenalEquipType("cable_pulley");
    } else if (prof.dumbbellCount === 1) {
      setArsenalEquipType("dumbbells_single");
    } else {
      setArsenalEquipType("dumbbells");
    }
    setIsPlateCalcExpanded(true);
  };

  const handleArsenalWeightChange = (newWeight: number) => {
    triggerHaptic("light");
    setTargetWeightCalc(newWeight);
    if (focusedExerciseId) {
      setExerciseWeightMap((prev) => ({ ...prev, [focusedExerciseId]: newWeight }));
    }
  };

  const handleApplyToActiveSet = () => {
    triggerHaptic("success");
    dispatch(
      updateCurrentSetWeight({
        weightKg: currentPlateSolver.achievableWeightKg,
        plateBreakdown: currentPlateSolver.summaryString,
      })
    );
    setAppliedFeedback(
      `✓ APPLIED ${currentPlateSolver.achievableWeightKg}KG TO SET ${currentWorkoutSetIndex + 1}`
    );
    setTimeout(() => setAppliedFeedback(null), 3000);
  };

  // Dynamic Bi-Weekly Rotation (Week A vs Week B) & Level-Scaled Sets/Reps
  const weekRotation = getCurrentWeekRotationIndex(); // 0 = Week A, 1 = Week B
  const dynamicSkippingTarget = 100 + (playerLevel - 1) * 10;
  const rotatedCoreExercises = getRotatedSplitExercises(selectedDay, playerLevel, playerRank, 5, equipment);

  const curatedSessionList: (MasterExercise & { phase: "core" | "belly" })[] = [
    ...rotatedCoreExercises.map((ex) => ({ ...ex, phase: "core" as const })),
    ...bellyExercises.map((ex) => ({ ...ex, phase: "belly" as const })),
  ];

  // Target workout duration
  const totalTargetMinutes = curatedSessionList.reduce(
    (acc, curr) => acc + (curr.target_duration_mins || 7),
    0
  );

  const handleLaunchSession = () => {
    if (selectedDay !== todayName) {
      triggerHaptic("warning");
      return;
    }
    triggerHaptic("heavy");

    const sessionExercises = curatedSessionList.map((masterEx) => {
      const def: ExerciseDefinition = {
        id: masterEx.id,
        name: masterEx.name,
        target_muscle: masterEx.target_muscle,
        secondary_muscles: masterEx.secondary_muscles,
        bench_angle: masterEx.bench_angle,
        required_equipment: masterEx.required_equipment,
        instructions: masterEx.instructions,
        form_cues: masterEx.form_cues,
        common_mistakes: masterEx.common_mistakes,
        alternatives: masterEx.alternatives,
        default_sets: masterEx.default_sets,
        default_reps_min: masterEx.default_reps_min,
        default_reps_max: masterEx.default_reps_max,
        default_rest_seconds: masterEx.default_rest_seconds,
      };

      const customWeight = getExerciseWeight(masterEx);
      const equipProfile = resolveExerciseEquipmentProfile(masterEx, customWeight, defaultInv);
      const wasDoneEarlier = completedExerciseNames.has(masterEx.name.toLowerCase());

      return {
        definition: def,
        defaultWeightKg: equipProfile.isFreeHand || equipProfile.isSkippingRope ? 0 : (equipProfile.plateSolverResult?.achievableWeightKg ?? customWeight),
        plateBreakdown: equipProfile.isFreeHand
          ? "Bodyweight Calisthenics (0kg)"
          : equipProfile.isSkippingRope
            ? "Speed Skipping Rope (0kg)"
            : (equipProfile.plateSolverResult?.summaryString || `${customWeight}kg`),
        phase: masterEx.phase,
        isPreCompleted: wasDoneEarlier,
      };
    });

    dispatch(
      startWorkoutSession({
        dayName: currentSplit.day,
        title: `${currentSplit.day}: ${currentSplit.title}`,
        targetMuscles: currentSplit.subtitle,
        skippingTarget: dynamicSkippingTarget,
        playerWeightKg: profile?.weight_kg || 70,
        playerHeightCm: profile?.height_cm || 175,
        playerLevel: profile?.current_level || 1,
        playerRank: profile?.rank || "Recruit",
        initialPhysicalFatigue: profile?.physical_fatigue || 0,
        initialMentalFatigue: profile?.mental_fatigue || 0,
        equipment: defaultInv,
        exercises: sessionExercises,
      })
    );
  };

  const executeIndividualExercise = (exercise: MasterExercise, customWeight?: number) => {
    const targetWeight = customWeight !== undefined ? customWeight : getExerciseWeight(exercise);
    const equipProfile = resolveExerciseEquipmentProfile(exercise, targetWeight, defaultInv);
    const def: ExerciseDefinition = {
      id: exercise.id,
      name: exercise.name,
      target_muscle: exercise.target_muscle,
      secondary_muscles: exercise.secondary_muscles,
      bench_angle: exercise.bench_angle,
      required_equipment: exercise.required_equipment,
      instructions: exercise.instructions,
      form_cues: exercise.form_cues,
      common_mistakes: exercise.common_mistakes,
      alternatives: exercise.alternatives,
      default_sets: exercise.default_sets,
      default_reps_min: exercise.default_reps_min,
      default_reps_max: exercise.default_reps_max,
      default_rest_seconds: exercise.default_rest_seconds,
    };

    const isAnotherDay = selectedDay !== todayName;
    const isExtra = isTodayCompleted || isAnotherDay;
    const multiplier = isExtra ? calculateExtraWorkoutXpMultiplier(todaysCompletedSessions.length) : 1.0;

    dispatch(
      startWorkoutSession({
        dayName: currentSplit.day,
        title: `Solo Trial: ${exercise.name}`,
        targetMuscles: exercise.target_muscle,
        skippingTarget: 0,
        isSingleExercise: true,
        isExtraWorkout: isExtra,
        extraWorkoutMultiplier: multiplier,
        playerWeightKg: profile?.weight_kg || 70,
        playerHeightCm: profile?.height_cm || 175,
        playerLevel: profile?.current_level || 1,
        playerRank: profile?.rank || "Recruit",
        initialPhysicalFatigue: profile?.physical_fatigue || 0,
        initialMentalFatigue: profile?.mental_fatigue || 0,
        equipment: defaultInv,
        exercises: [
          {
            definition: def,
            defaultWeightKg: equipProfile.isFreeHand || equipProfile.isSkippingRope ? 0 : (equipProfile.plateSolverResult?.achievableWeightKg ?? targetWeight),
            plateBreakdown: equipProfile.isFreeHand
              ? "Bodyweight Calisthenics (0kg)"
              : equipProfile.isSkippingRope
                ? "Speed Skipping Rope (0kg)"
                : (equipProfile.plateSolverResult?.summaryString || `${targetWeight}kg`),
            phase: "core",
          },
        ],
      })
    );
  };

  const handleLaunchIndividualExercise = (exercise: MasterExercise, targetWeight?: number) => {
    triggerHaptic("medium");
    const totalSetsToday = todaysCompletedSessions.reduce((acc, s) => acc + (s.workout_set_logs?.length || 0), 0);
    const isAnotherDay = selectedDay !== todayName;
    const isExtra = isTodayCompleted || isAnotherDay;

    const warning = getRankVolumeWarning({
      playerRank,
      playerLevel,
      totalSetsToday,
      isExtraWorkout: isExtra,
      exerciseName: exercise.name,
    });

    if (warning.severity === "hazard" || warning.severity === "caution" || (isAnotherDay && isTodayCompleted)) {
      setWarningModalData({
        title: isAnotherDay
          ? `CROSS-DAY PROTOCOL // ${playerRank.toUpperCase()} ADVISORY`
          : warning.title,
        message: isAnotherDay
          ? `You are selecting ${exercise.name} from ${selectedDay}'s split while today is ${todayName}. ${isTodayCompleted
            ? `Today's quota is already completed. Overworking this movement will count as a Solo Trial, but increases central nervous fatigue for a Level ${playerLevel} ${playerRank}.`
            : `This will execute as an isolated Solo Trial and will NOT mark today's full ${todayName} protocol complete.`
          }`
          : warning.message,
        pendingExercise: exercise,
        pendingWeight: targetWeight,
      });
      return;
    }

    executeIndividualExercise(exercise, targetWeight);
  };

  const handleResumeSavedSession = () => {
    if (!savedUnfinishedSession) return;
    triggerHaptic("heavy");
    dispatch(restoreWorkoutSession(savedUnfinishedSession));
    setSavedUnfinishedSession(null);
  };

  const handleDiscardSavedSession = async () => {
    await clearActiveSessionAction();
    setSavedUnfinishedSession(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. TWO INDEPENDENT WORKOUT MODES (SYSTEM PLAN | CUSTOM PLAN) - STICKY ON MOBILE & PC */}
      <div className="sticky top-0 md:top-16 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 bg-[#07080b]/92 backdrop-blur-xl border-b border-cyan-950/40 shadow-xl shadow-black/40 transition-all">
        <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800 shadow-xl">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setWorkoutMode("system");
            }}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-2 ${workoutMode === "system"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/60 shadow-lg shadow-cyan-950/50"
              : "text-slate-400 hover:text-white"
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>SYSTEM PLAN (AI CURATED)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setWorkoutMode("custom");
            }}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-2 ${workoutMode === "custom"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-950/50"
              : "text-slate-400 hover:text-white"
              }`}
          >
            <Sliders className="w-4 h-4" />
            <span>CUSTOM PLAN (HUNTER FORGED)</span>
          </button>
        </div>
      </div>

      {/* Solo Trial Completion System Toast */}
      {soloTrialPrompt && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/60 flex items-center justify-between gap-3 shadow-xl shadow-cyan-950/60 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  SYSTEM DIRECTIVE // SOLO TRIAL CONQUERED
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  VERIFIED ✓
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{soloTrialPrompt.exerciseName}</h4>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-0.5">
                <span className="text-orange-400 font-bold">+{soloTrialPrompt.caloriesBurned} kcal expelled</span>
                <span>•</span>
                <span className="text-cyan-400 font-bold">{Math.round(soloTrialPrompt.tonnageKg)}kg moved</span>
                <span>•</span>
                <span className="text-purple-400 font-bold">+{soloTrialPrompt.xp} XP</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSoloTrialPrompt(null)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Unfinished Session Notification Banner (Solo Leveling Notification Style) */}
      {savedUnfinishedSession && !isTodayCompleted && (
        <div className="solo-notification-modal rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
            <div>
              <span className="text-xs font-solo font-bold text-cyan-300 block uppercase mana-text-glow">
                [ UNFINISHED WORKOUT SESSION {savedUnfinishedSession.dayName ? `(${savedUnfinishedSession.dayName.toUpperCase()})` : "PERSISTED"} ]
              </span>
              <span className="text-[11px] text-slate-300 font-hud">
                {savedUnfinishedSession.title} ({savedUnfinishedSession.exercises?.length || 0} exercises)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDiscardSavedSession}
              className="solo-btn-secondary py-1.5 px-3 text-xs"
            >
              DISCARD
            </button>
            <button
              onClick={handleResumeSavedSession}
              className="solo-btn py-1.5 px-4 text-xs"
            >
              RESUME WORKOUT ◆
            </button>
          </div>
        </div>
      )}

      {/* Render CUSTOM PLAN environment if active */}
      {workoutMode === "custom" ? (
        <CustomPlanManager
          equipment={equipment}
          playerRank={playerRank}
          playerLevel={playerLevel}
          initialPhysicalFatigue={profile?.physical_fatigue || 0}
          initialMentalFatigue={profile?.mental_fatigue || 0}
        />
      ) : (
        /* SYSTEM PLAN ENVIRONMENT */
        <>
          {/* Split Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SPLIT_SCHEDULE.map((item) => {
              const isToday = item.day === todayName;
              const isSelected = selectedDay === item.day;

              return (
                <button
                  key={item.day}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedDay(item.day);
                  }}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${isSelected
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/60 shadow-lg shadow-cyan-950/50"
                    : "bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                >
                  {isToday && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                  <span>{item.day.slice(0, 3).toUpperCase()}</span>
                  {item.isRest && <span className="text-[10px] text-amber-400">★ REST</span>}
                </button>
              );
            })}
          </div>

          {/* SUNDAY RULE: ZERO WORKOUTS — HONORED REST & MOBILITY SANCTUARY */}
          {isSunday ? (
            <div className="space-y-6">
              <div className="hunter-panel rounded-3xl border border-amber-500/40 p-6 sm:p-8 space-y-4 text-center relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                  <HeartPulse className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 uppercase tracking-widest">
                    ZERO WORKOUTS SCHEDULED // MANDATORY SANCTUARY
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mana-text-glow">
                    SUNDAY: HONORED REST & MOBILITY SANCTUARY
                  </h2>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Growth does not occur while lifting; it occurs during biological recovery. Muscle glycogen replenishment, central nervous system restoration, and connective tissue repair are required to prevent burnout.
                  </p>
                </div>

                {/* Rest compliance rewards */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto flex items-center justify-around text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">RECOVERY COMPLIANCE</span>
                    <span className="text-emerald-400 font-bold">+100% Streak Safe</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">SANCTUARY REWARD</span>
                    <span className="text-purple-400 font-bold">+0.30 Vitality / Mentality</span>
                  </div>
                </div>
              </div>

              {/* Sunday Restorative Protocols (6 movements) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    RESTORATIVE MOBILITY &amp; VAGUS BREATHING FLOW (6 PROTOCOLS)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Tap for guided flow</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUNDAY_MOBILITY_PROTOCOL.map((ex, i) => (
                    <div
                      key={ex.id}
                      onClick={() => {
                        triggerHaptic("light");
                        setSelectedExerciseForModal(ex);
                      }}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-black text-amber-400">#{i + 1}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{ex.name}</span>
                          <span className="text-[10px] text-slate-400">{ex.target_muscle}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MONDAY - SATURDAY TRAINING VIEW */
            <>
              {/* Day Overview Banner & Target Completion Time */}
              <div className="hunter-panel rounded-3xl border border-cyan-500/40 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 uppercase tracking-widest">
                        {currentSplit.day} PROTOCOL
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300">
                        {curatedSessionList.length} PRESCRIBED MOVEMENTS
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                        ROTATION: {weekRotation === 0 ? "WEEK A (COMPOUND FOCUS)" : "WEEK B (ANGLE & HYPERTROPHY)"}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mana-text-glow">
                      {currentSplit.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">{currentSplit.subtitle}</p>
                  </div>

                  {/* Target Time & Speed Bonus Badge & Mobile Info Icon */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shrink-0">
                      <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">
                          TARGET DURATION
                        </span>
                        <span className="text-sm font-mono font-black text-white">
                          {totalTargetMinutes} Minutes
                        </span>
                      </div>
                    </div>

                    {/* Mobile Protocol Intel Info Button (Pulsing [ ⓘ ]) */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setIsProtocolIntelOpen(true);
                      }}
                      className="md:hidden w-11 h-11 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-400/80 text-cyan-300 flex items-center justify-center animate-pulse shadow-[0_0_12px_rgba(0,229,255,0.4)] shrink-0 transition"
                      title="View Daily Belly Protocol & Swift Hunter Bonus"
                      aria-label="View Protocol Intel"
                    >
                      <Info className="w-5 h-5 text-cyan-300" />
                    </button>
                  </div>
                </div>

                {/* Desktop 2-in-1 Compact Modifiers Grid (Half Size, Side-by-Side in Single Line) */}
                <div className="hidden md:grid md:grid-cols-2 gap-2.5">
                  {/* Daily Belly Protocol Indicator */}
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          DAILY BELLY:{" "}
                          <span className="text-cyan-400">
                            {selectedDay === "Monday" || selectedDay === "Wednesday" || selectedDay === "Friday"
                              ? "DAY A // UPPER"
                              : "DAY B // LOWER"}
                          </span>
                        </span>
                        <span className="text-[10.5px] text-slate-400 block truncate">
                          {bellyExercises.map((b) => b.name).join(", ")}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono font-bold text-cyan-300 bg-cyan-900/60 px-2 py-0.5 rounded-lg shrink-0 border border-cyan-500/30">
                      INCLUDED
                    </span>
                  </div>

                  {/* Swift Hunter Intensity Bonus */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5 min-w-0">
                    <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block truncate">
                        SWIFT HUNTER INTENSITY BONUS
                      </span>
                      <p className="text-slate-300 text-[10.5px] truncate">
                        Complete before <strong className="text-white">{totalTargetMinutes}m</strong> for{" "}
                        <span className="text-cyan-400 font-bold">+35 Extra XP</span> &amp;{" "}
                        <span className="text-white font-bold">+0.20 AGI</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Protocol Intel Modal (Triggered by pulsing [ ⓘ ] button) */}
                {isProtocolIntelOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md bg-[#090d18] border border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,229,255,0.25)] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                            <Info className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white font-hud tracking-wide">
                              PROTOCOL INTEL &amp; MODIFIERS
                            </h3>
                            <span className="text-[10px] font-mono text-cyan-400">
                              {currentSplit.title}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            setIsProtocolIntelOpen(false);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          aria-label="Close"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Daily Belly Protocol */}
                        <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs font-bold text-white">
                                DAILY BELLY PROTOCOL
                              </span>
                            </div>
                            <span className="text-[9.5px] font-mono font-bold text-cyan-300 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40">
                              INCLUDED
                            </span>
                          </div>
                          <div className="text-[11px] text-cyan-300 font-mono font-bold">
                            {selectedDay === "Monday" || selectedDay === "Wednesday" || selectedDay === "Friday"
                              ? "DAY A // UPPER BELLY FOCUS"
                              : "DAY B // LOWER BELLY FOCUS"}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Appended to session: {bellyExercises.map((b) => b.name).join(", ")}
                          </p>
                        </div>

                        {/* Swift Hunter Intensity Bonus */}
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              SWIFT HUNTER INTENSITY BONUS
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Complete all sets and click <strong>"Complete Workout"</strong> before{" "}
                            <strong className="text-cyan-400">{totalTargetMinutes} minutes</strong> to claim early finish bonuses:
                          </p>
                          <div className="flex items-center gap-2 pt-1 font-mono text-[10.5px]">
                            <span className="px-2 py-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold">
                              +35 Extra XP
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-950 border border-cyan-500/40 text-white font-bold">
                              +0.20 Agility
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setIsProtocolIntelOpen(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/60 text-white font-bold text-xs uppercase tracking-wider transition shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                      >
                        Close Intel
                      </button>
                    </div>
                  </div>
                )}

                {/* Start Workout Button or Locked + Dev Override */}
                {selectedDay !== todayName ? (
                  <div className="w-full py-4 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 font-mono text-xs text-center flex flex-col items-center justify-center gap-1.5 shadow-inner">
                    <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span>FUTURE PROTOCOL LOCKED // ONLY {todayName.toUpperCase()} CAN BE ENTERED AS FULL SPLIT</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Inspect biomechanics or launch individual Solo Trials from the codex below.
                    </span>
                  </div>
                ) : isCircadianLocked ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="w-full py-4 px-4 rounded-2xl bg-red-950/80 border border-red-500/70 text-red-200 font-mono text-xs text-center flex flex-col items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                      <div className="flex items-center gap-2 font-bold text-red-300 uppercase tracking-wider animate-pulse">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span>CIRCADIAN BIOMECHANICAL LOCKOUT</span>
                      </div>
                      <p className="text-[11px] text-red-300/90 font-sans max-w-md leading-relaxed">
                        {circadian.isExhaustionLockout
                          ? `Awake for ${circadian.hoursAwakeLive.toFixed(1)}h (exceeded 26h limit). High-load resistance training is locked to prevent motor failure and cardiac strain. Enter bed or log sleep to restore biomechanical capacity.`
                          : `Cumulative sleep is only ${(circadian.cumulativeSleepMinutes / 60).toFixed(1)}h (minimum 4.0h required in 26h window). Complete an afternoon recovery nap or sleep session to unlock training.`}
                      </p>
                      <Link
                        href="/quests"
                        className="mt-1 px-4 py-2 rounded-xl bg-red-900/90 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider border border-red-500/60 transition flex items-center gap-2 shadow"
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>ENTER RESTORATIVE STASIS // SLEEP PROTOCOL</span>
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("heavy");
                        setDevUnlockOverride(true);
                      }}
                      className="w-full solo-btn-secondary py-2 text-[11px]"
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>DEV OVERRIDE // BYPASS CIRCADIAN LOCKOUT FOR TESTING</span>
                    </button>
                  </div>
                ) : isTodayCompleted && !devUnlockOverride ? (
                  <div className="space-y-2 pt-1">
                    <div className="w-full py-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>TODAY'S TRAINING QUOTA COMPLETED // SYSTEM LOCKED</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("medium");
                        setDevUnlockOverride(true);
                      }}
                      className="w-full solo-btn-secondary py-2 text-[11px]"
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>DEV OVERRIDE // UNLOCK TODAY'S SESSION FOR TESTING</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLaunchSession}
                    className="w-full solo-btn py-3.5 text-xs font-solo"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START {currentSplit.day.toUpperCase()} TRAINING SESSION ◆</span>
                  </button>
                )}
              </div>

              {/* Curated Today's Session Pathway */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      TODAY'S PRESCRIBED WORKOUT ({curatedSessionList.length} MOVEMENTS)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setIsMobileCompactView(!isMobileCompactView);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:text-white transition flex items-center gap-1"
                    >
                      {isMobileCompactView ? "⊞ DETAILED VIEW" : "≡ COMPACT VIEW"}
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      Tap movement for guide
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                  {curatedSessionList.map((ex, i) => {
                    const currentWeight = getExerciseWeight(ex);
                    const systemWeight = getSystemPrescribedWeight(ex);
                    const isCustomized = isExerciseWeightCustomized(ex);
                    const prof = resolveExerciseEquipmentProfile(ex, currentWeight, defaultInv);
                    const isFocused = focusedExerciseId === ex.id;

                    return (
                      <div
                        key={ex.id}
                        onClick={() => {
                          triggerHaptic("light");
                          handleFocusExercise(ex);
                        }}
                        className={`${isMobileCompactView ? "p-2.5 sm:p-3" : "p-3.5 sm:p-4"
                          } rounded-2xl bg-[#090d18] border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${isFocused
                            ? "border-cyan-400 bg-[#0b1324] shadow-[0_0_15px_rgba(0,229,255,0.18)] ring-1 ring-cyan-400/50"
                            : "border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0c1222]"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono font-black text-xs shrink-0 transition flex items-center justify-center ${isFocused
                            ? "bg-cyan-500 text-black shadow-[0_0_10px_#00e5ff]"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/20"
                            }`}>
                            #{i + 1}
                          </div>

                          <div className="min-w-0 space-y-0.5 sm:space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic("light");
                                  setSelectedExerciseForModal(ex);
                                }}
                                className="text-left text-xs sm:text-sm font-bold text-white hover:text-cyan-300 truncate max-w-[150px] sm:max-w-none transition flex items-center gap-1 group/title"
                                title="View Movement Guide & Biomechanics"
                              >
                                <span className="truncate group-hover/title:underline underline-offset-2">{ex.name}</span>
                              </button>
                              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shrink-0">
                                {ex.bench_angle}
                              </span>
                              {prof.isFreeHand ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shrink-0">
                                  BODYWEIGHT
                                </span>
                              ) : prof.isSkippingRope ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shrink-0">
                                  SKIPPING ROPE
                                </span>
                              ) : prof.equipmentType === "leg_developer" ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-500/40 shrink-0">
                                  LEG DEVELOPER
                                </span>
                              ) : prof.equipmentType?.includes("barbell") ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-500/40 shrink-0">
                                  BARBELL
                                </span>
                              ) : prof.equipmentType === "ez_bar" ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 shrink-0">
                                  EZ-BAR
                                </span>
                              ) : prof.equipmentType === "cable_pulley" ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40 shrink-0">
                                  CABLE
                                </span>
                              ) : prof.dumbbellCount === 1 ? (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shrink-0">
                                  1× DUMBBELL
                                </span>
                              ) : (
                                <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shrink-0">
                                  DUMBBELLS (PAIR)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 flex-wrap">
                              <span className="truncate">{ex.target_muscle}</span>
                              <span>•</span>
                              <span className="shrink-0 font-mono">
                                {ex.default_sets}S × {ex.default_reps_min}-{ex.default_reps_max}R
                              </span>

                              {/* Interactive Inline Weight Stepper on Weighted Cards */}
                              {!prof.isFreeHand && !prof.isSkippingRope && (
                                <div
                                  className="inline-flex items-center gap-1 bg-[#040810] border border-cyan-500/40 rounded-lg px-1.5 py-0.5 font-mono shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleExerciseWeightStep(ex, -1.0)}
                                    className="w-4 h-4 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold flex items-center justify-center transition"
                                    title="Decrease load 1kg"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFocusExercise(ex)}
                                    className={`px-1 text-[10px] sm:text-[11px] font-bold font-mono transition flex items-center gap-1 ${isFocused
                                      ? "text-cyan-300 underline underline-offset-2"
                                      : "text-slate-200 hover:text-cyan-300"
                                      }`}
                                    title="Inspect exact plate recipe in Arsenal Forge"
                                  >
                                    <span>{currentWeight.toFixed(1)}kg</span>
                                    <span className="text-[8px] text-cyan-400/80">
                                      {prof.equipmentType === "leg_developer"
                                        ? "HORN"
                                        : prof.equipmentType?.includes("barbell")
                                          ? "BAR"
                                          : prof.equipmentType === "ez_bar"
                                            ? "EZ"
                                            : prof.equipmentType === "cable_pulley"
                                              ? "CABLE"
                                              : prof.dumbbellCount === 1
                                                ? "1×DB"
                                                : "PAIR"}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExerciseWeightStep(ex, 1.0)}
                                    className="w-4 h-4 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold flex items-center justify-center transition"
                                    title="Increase load 1kg"
                                  >
                                    +
                                  </button>

                                  {/* Reset to System Plan if customized by player */}
                                  {isCustomized && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetExerciseWeight(ex)}
                                      className="ml-0.5 px-1 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold flex items-center gap-0.5 transition shadow-sm"
                                      title={`Reset to System Plan (${systemWeight.toFixed(1)}kg)`}
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" />
                                      <span>SYS</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* RPG Attribute Yield Badges - Shown in detailed view or desktop */}
                            {!isMobileCompactView && (() => {
                              const yields = getExerciseAttributeYield(ex);
                              return (
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  {yields.strength && (
                                    <span className="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[8px] sm:text-[9px] font-mono font-bold">
                                      STR +{yields.strength.toFixed(2)}
                                    </span>
                                  )}
                                  {yields.discipline && (
                                    <span className="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[8px] sm:text-[9px] font-mono font-bold">
                                      DIS +{yields.discipline.toFixed(2)}
                                    </span>
                                  )}
                                  {yields.endurance && (
                                    <span className="px-1 py-0.2 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[8px] sm:text-[9px] font-mono font-bold">
                                      END +{yields.endurance.toFixed(2)}
                                    </span>
                                  )}
                                  {yields.agility && (
                                    <span className="px-1 py-0.2 rounded bg-slate-900 border border-cyan-400/30 text-cyan-200 text-[8px] sm:text-[9px] font-mono font-bold">
                                      AGI +{yields.agility.toFixed(2)}
                                    </span>
                                  )}
                                  {yields.vitality && (
                                    <span className="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[8px] sm:text-[9px] font-mono font-bold">
                                      VIT +{yields.vitality.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                          {/* View Codex Guide Button without starting workout */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic("light");
                              setSelectedExerciseForModal(ex);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 shadow-sm"
                            title="View Movement Guide & Instructions"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9.5px] font-mono font-bold hidden xs:inline">GUIDE</span>
                          </button>

                          {completedExerciseNames.has(ex.name.toLowerCase()) ? (
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-400/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl flex items-center gap-1 shadow-sm shadow-cyan-950">
                              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                              <span className="hidden xs:inline">DONE</span>
                            </span>
                          ) : (isTodayCompleted && selectedDay === todayName) ? (
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 bg-slate-900/80 border border-slate-700/60 px-2 py-0.5 rounded-xl flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-slate-400" />
                              <span className="hidden xs:inline">SKIP</span>
                            </span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl">
                              ACTIVE
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchIndividualExercise(ex, getExerciseWeight(ex));
                            }}
                            className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition shadow-sm"
                            title="Launch Individual Solo Trial"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic("light");
                              setSelectedExerciseForModal(ex);
                            }}
                            className="p-1 text-slate-500 hover:text-cyan-400 transition"
                            title="View Movement Guide"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expandable: Explore All 20 Master Exercises for Today */}
              <div className="hunter-panel rounded-3xl border border-slate-800 p-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowFullLibrary(!showFullLibrary)}
                  className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-cyan-400" />
                    <span>EXPLORE COMPLETE {currentSplit.day.toUpperCase()} CODEX ({dayExercises.length} MOVEMENTS)</span>
                  </div>
                  {showFullLibrary ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showFullLibrary && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <p className="text-[11px] text-slate-400">
                      These are the verified equipment &amp; bodyweight movements for this training day. Tap any movement to inspect biomechanics, bench angle, and unlock criteria.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                      {dayExercises.map((ex) => {
                        const unlocked = isExerciseUnlocked(ex, playerLevel, playerRank);
                        return (
                          <div
                            key={ex.id}
                            onClick={() => {
                              triggerHaptic("light");
                              setSelectedExerciseForModal(ex);
                            }}
                            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${unlocked
                              ? "bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-200"
                              : "bg-slate-950 border-slate-900 opacity-60 text-slate-500"
                              }`}
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{ex.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                                <span>Bench: {ex.bench_angle}</span>
                                <span>•</span>
                                <span className="text-cyan-300">
                                  {resolveExerciseEquipmentProfile(ex, 15, equipment).displayName}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {unlocked && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLaunchIndividualExercise(ex);
                                  }}
                                  className="p-1 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                                  title="Launch Solo Trial"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                              )}
                              {unlocked ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ARSENAL EQUIPMENT & WEIGHT FORGE (Collapsible Anti-Scroll) */}
          <div className="solo-frame rounded-2xl p-4 sm:p-5 space-y-4 font-hud">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setIsPlateCalcExpanded(!isPlateCalcExpanded);
              }}
              className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-300 group"
            >
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <span className="text-white group-hover:text-cyan-300 transition">
                  ARSENAL EQUIPMENT & WEIGHT FORGE
                </span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="text-xs font-mono font-bold">
                  {currentPlateSolver.achievableWeightKg.toFixed(1)}kg • {arsenalEquipType.toUpperCase().replace("_", " ")}
                </span>
                {isPlateCalcExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isPlateCalcExpanded && (
              <div className="pt-2 border-t border-cyan-500/20 space-y-3.5 animate-in fade-in duration-150">
                {/* Linked Exercise Banner if an exercise card is currently selected */}
                {(() => {
                  const focusedEx = focusedExerciseId
                    ? curatedSessionList.find((e) => e.id === focusedExerciseId) ||
                    dayExercises.find((e) => e.id === focusedExerciseId)
                    : null;

                  if (!focusedEx) return null;
                  const curW = getExerciseWeight(focusedEx);
                  const sysW = getSystemPrescribedWeight(focusedEx);
                  const isCust = isExerciseWeightCustomized(focusedEx);

                  return (
                    <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-400/60 flex items-center justify-between gap-2 flex-wrap animate-in fade-in">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        <span className="text-xs font-mono font-bold text-white truncate">
                          LINKED TO MOVEMENT: <strong className="text-cyan-300">{focusedEx.name}</strong> ({curW.toFixed(1)}kg)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCust && (
                          <button
                            type="button"
                            onClick={() => handleResetExerciseWeight(focusedEx)}
                            className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 hover:bg-amber-900 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 transition shadow-sm"
                            title={`Reset ${focusedEx.name} to original System Plan (${sysW.toFixed(1)}kg)`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>RESET TO SYSTEM ({sysW.toFixed(1)}kg)</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            setFocusedExerciseId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 text-[10px] font-mono shrink-0 transition"
                          title="Unlink and use as independent calculator"
                        >
                          ✕ Free Mode
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Equipment Type Mode Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: "dumbbells" as const, label: "DB (PAIR)" },
                    { id: "dumbbells_single" as const, label: "1× DB (SINGLE)" },
                    { id: "barbell" as const, label: "BARBELL" },
                    { id: "ez_bar" as const, label: "EZ-BAR" },
                    { id: "cable_pulley" as const, label: "CABLE PULLEY" },
                    { id: "leg_developer" as const, label: "LEG DEVELOPER" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setArsenalEquipType(tab.id);
                        if (tab.id === "barbell" && targetWeightCalc < (defaultInv.barbell_weight_kg || 7.0)) {
                          handleArsenalWeightChange(25.0);
                        } else if (tab.id === "dumbbells" && targetWeightCalc > 30.0) {
                          handleArsenalWeightChange(15.0);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider shrink-0 transition ${arsenalEquipType === tab.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Equipment Type Mode Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: "dumbbells" as const, label: "DB (PAIR)" },
                    { id: "dumbbells_single" as const, label: "1× DB (SINGLE)" },
                    { id: "barbell" as const, label: "BARBELL" },
                    { id: "ez_bar" as const, label: "EZ-BAR" },
                    { id: "cable_pulley" as const, label: "CABLE PULLEY" },
                    { id: "leg_developer" as const, label: "LEG DEVELOPER" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setArsenalEquipType(tab.id);
                        if (focusedExerciseId) {
                          const focusedEx = curatedSessionList.find((e) => e.id === focusedExerciseId);
                          if (focusedEx) {
                            const prof = resolveExerciseEquipmentProfile(focusedEx, 0, defaultInv);
                            const isMatch =
                              (tab.id === "dumbbells" && prof.equipmentType === "dumbbells" && prof.dumbbellCount !== 1) ||
                              (tab.id === "dumbbells_single" && prof.dumbbellCount === 1) ||
                              (tab.id === "barbell" && (prof.equipmentType === "barbell" || prof.equipmentType === "bench_and_barbell")) ||
                              (tab.id === "ez_bar" && prof.equipmentType === "ez_bar") ||
                              (tab.id === "leg_developer" && prof.equipmentType === "leg_developer") ||
                              (tab.id === "cable_pulley" && prof.equipmentType === "cable_pulley");
                            if (!isMatch) {
                              setFocusedExerciseId(null);
                            }
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider shrink-0 transition ${arsenalEquipType === tab.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(arsenalEquipType === "dumbbells"
                    ? [6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0, 30.0]
                    : arsenalEquipType === "dumbbells_single"
                      ? [6.5, 8.5, 10.5, 11.5, 12.5, 13.5, 14.0, 15.0, 16.5, 18.5, 20.0, 22.0, 25.0]
                      : arsenalEquipType === "barbell"
                        ? [10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 60.0]
                        : arsenalEquipType === "ez_bar"
                          ? [8.0, 10.0, 12.0, 15.0, 18.0, 20.0, 25.0, 30.0]
                          : arsenalEquipType === "cable_pulley"
                            ? [5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 50.0]
                            : [5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0]
                  ).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleArsenalWeightChange(w)}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-mono font-bold transition ${Math.abs(targetWeightCalc - w) < 0.1
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                        }`}
                    >
                      {w}kg
                    </button>
                  ))}
                </div>

                {/* Custom Weight Stepper & Direct Typing Input */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                      Custom Load:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const newW = Math.max(0, Math.round((targetWeightCalc - 1.0) * 10) / 10);
                          handleArsenalWeightChange(newW);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-bold flex items-center justify-center transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="120"
                        value={targetWeightCalc}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) handleArsenalWeightChange(val);
                        }}
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-sm text-cyan-300 bg-slate-900 border border-cyan-500/40 rounded-lg focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newW = Math.round((targetWeightCalc + 1.0) * 10) / 10;
                          handleArsenalWeightChange(newW);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-bold flex items-center justify-center transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono text-slate-400 font-bold ml-1">kg</span>
                    </div>
                  </div>

                  {/* Active Workout Direct Apply Button */}
                  {isWorkoutActive && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleApplyToActiveSet}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)] transition"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-200" />
                        <span>APPLY TO CURRENT SET</span>
                      </button>
                      {appliedFeedback && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold animate-in fade-in">
                          {appliedFeedback}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Plate Breakdown Card */}
                <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/25 font-mono text-xs flex items-center justify-between flex-wrap gap-2">
                  <span className="text-slate-400 font-bold">
                    {arsenalEquipType.toUpperCase().replace("_", " ")} Breakdown:
                  </span>
                  <span className="text-cyan-400 font-bold">{currentPlateSolver.summaryString}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )
      }

      {/* Exercise Codex Modal (Demo, form cues, bench angle, unlock criteria) */}
      <ExerciseCodexModal
        exercise={selectedExerciseForModal}
        isOpen={!!selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
        isUnlocked={
          selectedExerciseForModal
            ? isExerciseUnlocked(selectedExerciseForModal, playerLevel, playerRank)
            : false
        }
        playerLevel={playerLevel}
        playerRank={playerRank}
        equipment={defaultInv}
        initialWeight={selectedExerciseForModal ? getExerciseWeight(selectedExerciseForModal) : 15.0}
        onLaunchIndividual={handleLaunchIndividualExercise}
      />

      {/* Rank Volume Warning Modal (Solo Leveling Notification Modal) */}
      {
        warningModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="max-w-md w-full solo-notification-modal rounded-xl p-6 space-y-4 shadow-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[10px] font-solo font-bold text-cyan-300 uppercase tracking-widest block mana-text-glow">
                    [ SYSTEM ADVISORY // {playerRank.toUpperCase()} RANK ]
                  </span>
                  <h3 className="text-base font-bold text-white font-solo">{warningModalData.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-hud bg-[#070b14] p-3 rounded-xl border border-cyan-500/30">
                {warningModalData.message}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWarningModalData(null)}
                  className="solo-btn-secondary py-2 px-3 text-xs"
                >
                  ABORT TRIAL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ex = warningModalData.pendingExercise;
                    const wt = warningModalData.pendingWeight;
                    setWarningModalData(null);
                    if (ex) executeIndividualExercise(ex, wt);
                  }}
                  className="solo-btn py-2 px-4 text-xs"
                >
                  PROCEED OVERRIDE ◆
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
