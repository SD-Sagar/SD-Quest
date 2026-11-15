"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store";
import { startWorkoutSession, restoreWorkoutSession } from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import { calculateDumbbellPlates } from "@/lib/calculations/gym";
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
import { ExerciseCodexModal } from "./ExerciseCodexModal";
import { ActiveWorkoutModal } from "./ActiveWorkoutModal";
import { CustomPlanManager } from "./CustomPlanManager";
import {
  EquipmentInventory,
  ExerciseDefinition,
  DayOfWeek,
  HunterRank,
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
}

export function GymTrainerHub({
  equipment,
  exerciseCatalog,
  playerLevel = 1,
  playerRank = "Recruit",
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
  const [targetWeightCalc, setTargetWeightCalc] = useState(15.0);
  const [showFullLibrary, setShowFullLibrary] = useState(false);
  const [savedUnfinishedSession, setSavedUnfinishedSession] = useState<any | null>(null);

  // Check for saved unfinished session in Supabase (Cross-device, NO localStorage)
  useEffect(() => {
    getActiveSessionAction().then((saved) => {
      if (saved?.isActive && saved?.status !== "completed") {
        setSavedUnfinishedSession(saved);
      }
    }).catch(() => {});
  }, []);

  const currentSplit = SPLIT_SCHEDULE.find((s) => s.day === selectedDay) || SPLIT_SCHEDULE[1];
  const dayExercises = getDayExercises(selectedDay);
  const bellyExercises = getDailyBellyProtocol(selectedDay);
  const isSunday = selectedDay === "Sunday";

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

  const plateSolver = calculateDumbbellPlates(targetWeightCalc, defaultInv, true);

  // Dynamic Bi-Weekly Rotation (Week A vs Week B) & Level-Scaled Sets/Reps
  const weekRotation = getCurrentWeekRotationIndex(); // 0 = Week A, 1 = Week B
  const dynamicSkippingTarget = 100 + (playerLevel - 1) * 10;
  const rotatedCoreExercises = getRotatedSplitExercises(selectedDay, playerLevel, playerRank, 5);

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

      const solver = calculateDumbbellPlates(15.0, defaultInv, true);
      return {
        definition: def,
        defaultWeightKg: solver.achievableWeightKg,
        plateBreakdown: solver.summaryString,
        phase: masterEx.phase,
      };
    });

    dispatch(
      startWorkoutSession({
        dayName: currentSplit.day,
        title: `${currentSplit.day}: ${currentSplit.title}`,
        targetMuscles: currentSplit.subtitle,
        skippingTarget: dynamicSkippingTarget,
        exercises: sessionExercises,
      })
    );
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
      {/* 1. TWO INDEPENDENT WORKOUT MODES (SYSTEM PLAN | CUSTOM PLAN) */}
      <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800 shadow-xl">
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            setWorkoutMode("system");
          }}
          className={`flex-1 py-3 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-2 ${
            workoutMode === "system"
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
          className={`flex-1 py-3 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-2 ${
            workoutMode === "custom"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-950/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>CUSTOM PLAN (HUNTER FORGED)</span>
        </button>
      </div>

      {/* Unfinished Session Notification Banner */}
      {savedUnfinishedSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 block uppercase">
                UNFINISHED WORKOUT SESSION PERSISTED
              </span>
              <span className="text-[11px] text-slate-300">
                {savedUnfinishedSession.title} ({savedUnfinishedSession.exercises?.length || 0} exercises)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardSavedSession}
              className="px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-400 hover:text-white"
            >
              DISCARD
            </button>
            <button
              onClick={handleResumeSavedSession}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase shadow transition"
            >
              RESUME WORKOUT
            </button>
          </div>
        </div>
      )}

      {/* Render CUSTOM PLAN environment if active */}
      {workoutMode === "custom" ? (
        <CustomPlanManager equipment={equipment} />
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
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
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

                  {/* Target Time & Speed Bonus Badge */}
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
                </div>

                {/* Daily Belly Protocol Indicator */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        DAILY BELLY PROTOCOL:{" "}
                        <span className="text-cyan-400">
                          {selectedDay === "Monday" || selectedDay === "Wednesday" || selectedDay === "Friday"
                            ? "DAY A // UPPER BELLY"
                            : "DAY B // LOWER BELLY"}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Appended to session: {bellyExercises.map((b) => b.name).join(", ")}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-900/60 px-2.5 py-1 rounded-xl shrink-0">
                    INCLUDED
                  </span>
                </div>

                {/* Speed / Intensity Bonus Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-purple-950/40 border border-cyan-500/30 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-amber-300 uppercase tracking-wider block">
                      SWIFT HUNTER INTENSITY BONUS
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Complete all sets and click <strong>"Complete Workout"</strong> before{" "}
                      <strong>{totalTargetMinutes} minutes</strong> to claim early finish bonuses (
                      <span className="text-cyan-400 font-bold">+35 Extra XP</span> &amp;{" "}
                      <span className="text-purple-400 font-bold">+0.20 Agility</span>).
                    </p>
                  </div>
                </div>

                {/* Start Workout Button */}
                <button
                  onClick={handleLaunchSession}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                  <span>START {currentSplit.day.toUpperCase()} TRAINING SESSION</span>
                </button>
              </div>

              {/* Curated Today's Session Pathway */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    TODAY'S PRESCRIBED WORKOUT ({curatedSessionList.length} MOVEMENTS)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Tap any movement for step-by-step form guide
                  </span>
                </div>

                <div className="space-y-2.5">
                  {curatedSessionList.map((ex, i) => (
                    <div
                      key={ex.id}
                      onClick={() => {
                        triggerHaptic("light");
                        setSelectedExerciseForModal(ex);
                      }}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-xs shrink-0">
                          #{i + 1}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">{ex.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                              Bench: {ex.bench_angle}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{ex.target_muscle}</span>
                            <span>•</span>
                            <span>
                              {ex.default_sets} Sets × {ex.default_reps_min}-{ex.default_reps_max} Reps
                            </span>
                          </div>

                          {/* RPG Attribute Yield Badges */}
                          {(() => {
                            const yields = getExerciseAttributeYield(ex);
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                {yields.strength && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-950/70 border border-red-500/30 text-red-300 text-[9px] font-mono font-bold">
                                    STR +{yields.strength.toFixed(2)}
                                  </span>
                                )}
                                {yields.discipline && (
                                  <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono font-bold">
                                    DIS +{yields.discipline.toFixed(2)}
                                  </span>
                                )}
                                {yields.endurance && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold">
                                    END +{yields.endurance.toFixed(2)}
                                  </span>
                                )}
                                {yields.agility && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[9px] font-mono font-bold">
                                    AGI +{yields.agility.toFixed(2)}
                                  </span>
                                )}
                                {yields.vitality && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-300 text-[9px] font-mono font-bold">
                                    VIT +{yields.vitality.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                          ACTIVE SET
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  ))}
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
                    <span>EXPLORE COMPLETE {currentSplit.day.toUpperCase()} CODEX (20 MOVEMENTS)</span>
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
                      These are the 20 verified dumbbell &amp; bodyweight movements for this training day. Tap any movement to inspect biomechanics, bench angle, and unlock criteria.
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
                            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              unlocked
                                ? "bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-200"
                                : "bg-slate-950 border-slate-900 opacity-60 text-slate-500"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{ex.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Bench: {ex.bench_angle} • {ex.target_muscle}
                              </span>
                            </div>
                            {unlocked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 60KG Home Dumbbell Plate Calculator Quick Widget */}
          <div className="hunter-panel rounded-3xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  60KG ARSENAL DUMBBELL PLATE CALCULATOR
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {plateSolver.achievableWeightKg.toFixed(2)} kg / dumbbell
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Select target dumbbell weight to instantly view exact symmetric plate loading for your 20-in-1 bench setup ($8\times 5$kg, $4\times 2.5$kg, $4\times 2$kg, $8\times 1.25$kg, $4\times 1$kg):
            </p>

            <div className="flex flex-wrap gap-2">
              {[6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    triggerHaptic("light");
                    setTargetWeightCalc(w);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    Math.abs(targetWeightCalc - w) < 0.1
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between">
              <span className="text-slate-400">Dumbbell Breakdown:</span>
              <span className="text-cyan-400 font-bold">{plateSolver.summaryString}</span>
            </div>
          </div>
        </>
      )}

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
      />

      {/* Active Workout Session Modal */}
      <ActiveWorkoutModal />
    </div>
  );
}
