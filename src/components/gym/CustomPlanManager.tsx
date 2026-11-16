"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store";
import { startWorkoutSession } from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import { calculateDumbbellPlates } from "@/lib/calculations/gym";
import { MASTER_EXERCISE_CATALOG, MasterExercise } from "@/lib/data/exerciseCatalog";
import { getCustomPlanAction, saveCustomPlanAction } from "@/server/actions/player.actions";
import { getTodaysWorkoutsAction } from "@/server/actions/workout.actions";
import {
  DayOfWeek,
  EquipmentInventory,
  CustomExerciseRoutine,
  ExerciseDefinition,
  AttributeType,
} from "@/types";
import {
  Dumbbell,
  Plus,
  Trash2,
  Play,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  Search,
  Lock,
} from "lucide-react";

interface CustomPlanManagerProps {
  equipment: EquipmentInventory | null;
}

const DEFAULT_DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ATTRIBUTE_CHOICES: { key: AttributeType; label: string; color: string }[] = [
  { key: "strength", label: "Strength (STR)", color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40" },
  { key: "endurance", label: "Endurance (END)", color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40" },
  { key: "agility", label: "Agility (AGI)", color: "text-white border-cyan-500/40 bg-cyan-950/40" },
  { key: "discipline", label: "Discipline (DIS)", color: "text-slate-200 border-cyan-500/40 bg-cyan-950/40" },
  { key: "vitality", label: "Vitality (VIT)", color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40" },
  { key: "mentality", label: "Mentality (MEN)", color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40" },
];

export function CustomPlanManager({ equipment }: CustomPlanManagerProps) {
  const dispatch = useAppDispatch();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");
  const [dayRoutines, setDayRoutines] = useState<Record<DayOfWeek, CustomExerciseRoutine[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAddingFromCatalog, setIsAddingFromCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [isCreatingNewModal, setIsCreatingNewModal] = useState(false);
  const [isTodayCustomCompleted, setIsTodayCustomCompleted] = useState(false);
  const [devUnlockOverride, setDevUnlockOverride] = useState(false);

  // New Exercise Form State
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("Chest");
  const [newExAngle, setNewExAngle] = useState("Flat");
  const [newExWeight, setNewExWeight] = useState(10);
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);
  const [newExRest, setNewExRest] = useState(60);
  const [newExSelectedAttrs, setNewExSelectedAttrs] = useState<AttributeType[]>(["strength"]);

  const todayDayName = (new Date().toLocaleDateString("en-US", { weekday: "long" }) as DayOfWeek);
  const isSelectedDayToday = selectedDay === todayDayName;

  const defaultInv: EquipmentInventory = equipment || {
    id: "default",
    user_id: "default",
    has_bench: true,
    bench_positions: [
      "Flat",
      "Incline 15°",
      "Incline 30°",
      "Incline 45°",
      "Incline 60°",
      "Incline 75°",
      "Seated 90°",
      "Decline",
    ],
    dumbbell_handle_weight_kg: 2.0,
    plate_5kg_count: 8,
    plate_2_5kg_count: 4,
    plate_2kg_count: 4,
    plate_1_25kg_count: 8,
    plate_1kg_count: 4,
    custom_plates: [],
    updated_at: new Date().toISOString(),
  };

  useEffect(() => {
    async function loadCustomPlan() {
      setIsLoading(true);
      try {
        const plan = await getCustomPlanAction();
        if (plan && plan.plan_data) {
          setDayRoutines({
            Monday: plan.plan_data.Monday || [],
            Tuesday: plan.plan_data.Tuesday || [],
            Wednesday: plan.plan_data.Wednesday || [],
            Thursday: plan.plan_data.Thursday || [],
            Friday: plan.plan_data.Friday || [],
            Saturday: plan.plan_data.Saturday || [],
            Sunday: plan.plan_data.Sunday || [],
          });
        }
      } catch (err) {
        console.error("Failed to load custom plan:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomPlan();
  }, []);

  useEffect(() => {
    async function checkTodayCustomCompleted() {
      try {
        const workouts = await getTodaysWorkoutsAction();
        const completed = workouts.some(
          (w) =>
            w.split_day === todayDayName &&
            !w.title?.toLowerCase().startsWith("solo trial") &&
            !w.notes?.includes("[SOLO_TRIAL]") &&
            !w.notes?.includes("[SINGLE_EXERCISE]")
        );
        setIsTodayCustomCompleted(completed);
      } catch (err) {
        console.error("Failed to check completed status:", err);
      }
    }
    checkTodayCustomCompleted();
  }, [todayDayName]);

  const currentList = dayRoutines[selectedDay] || [];

  const handleSavePlan = async () => {
    setIsSaving(true);
    triggerHaptic("heavy");
    try {
      await saveCustomPlanAction(dayRoutines);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save custom plan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFromCatalog = (exercise: MasterExercise) => {
    triggerHaptic("medium");
    const newRoutine: CustomExerciseRoutine = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: exercise.name,
      target_muscle: exercise.target_muscle,
      bench_angle: exercise.bench_angle || "Flat",
      target_weight_kg: 10,
      sets: exercise.default_sets || 3,
      reps_target: exercise.default_reps_min || 10,
      rest_seconds: 60,
      attributes_yield: exercise.attribute_yield || { strength: 0.35 },
    };

    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newRoutine],
    }));
  };

  const handleCreateCustomExercise = () => {
    if (!newExName.trim()) return;
    triggerHaptic("heavy");

    const attrsYield: Record<string, number> = {};
    const weightPerAttr = Number((0.5 / Math.max(1, newExSelectedAttrs.length)).toFixed(2));
    newExSelectedAttrs.forEach((attr) => {
      attrsYield[attr] = weightPerAttr;
    });

    const newRoutine: CustomExerciseRoutine = {
      id: `custom_forged_${Date.now()}`,
      name: newExName.trim(),
      target_muscle: newExMuscle,
      bench_angle: newExAngle,
      target_weight_kg: Number(newExWeight) || 10,
      sets: Number(newExSets) || 3,
      reps_target: Number(newExReps) || 10,
      rest_seconds: Number(newExRest) || 60,
      attributes_yield: attrsYield,
    };

    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newRoutine],
    }));

    setNewExName("");
    setIsCreatingNewModal(false);
  };

  const toggleAttributeSelection = (attr: AttributeType) => {
    triggerHaptic("light");
    if (newExSelectedAttrs.includes(attr)) {
      if (newExSelectedAttrs.length > 1) {
        setNewExSelectedAttrs(newExSelectedAttrs.filter((a) => a !== attr));
      }
    } else {
      setNewExSelectedAttrs([...newExSelectedAttrs, attr]);
    }
  };

  const handleRemoveExercise = (index: number) => {
    triggerHaptic("light");
    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
    }));
  };

  const handleLaunchCustomSession = () => {
    if (currentList.length === 0 || !isSelectedDayToday) return;
    triggerHaptic("heavy");

    const sessionExercises = currentList.map((routine) => {
      const match = MASTER_EXERCISE_CATALOG.find(
        (m) => m.name.toLowerCase() === routine.name.toLowerCase()
      );

      const def: ExerciseDefinition = {
        id: routine.id,
        name: routine.name,
        target_muscle: routine.target_muscle,
        secondary_muscles: match?.secondary_muscles || [],
        bench_angle: routine.bench_angle || match?.bench_angle || "Flat",
        required_equipment: match?.required_equipment || "dumbbells",
        instructions: match?.instructions || [
          "Execute reps with strict form and full range of motion.",
        ],
        form_cues: match?.form_cues || ["Maintain tight core"],
        common_mistakes: match?.common_mistakes || ["Rushing the tempo"],
        alternatives: match?.alternatives || [],
        default_sets: routine.sets,
        default_reps_min: routine.reps_target,
        default_reps_max: routine.reps_target,
        default_rest_seconds: routine.rest_seconds,
        attributes_yield: routine.attributes_yield,
      };

      const solver = calculateDumbbellPlates(routine.target_weight_kg, defaultInv, true);

      return {
        definition: def,
        defaultWeightKg: solver.achievableWeightKg,
        plateBreakdown: solver.summaryString,
      };
    });

    dispatch(
      startWorkoutSession({
        dayName: selectedDay,
        title: `Custom Split: ${selectedDay} Protocol`,
        targetMuscles: "Custom Routine",
        exercises: sessionExercises,
        skippingTarget: 100,
        isSingleExercise: false,
      })
    );
  };

  const handleLaunchSoloTrial = (routine: CustomExerciseRoutine) => {
    triggerHaptic("heavy");
    const match = MASTER_EXERCISE_CATALOG.find(
      (m) => m.name.toLowerCase() === routine.name.toLowerCase()
    );

    const def: ExerciseDefinition = {
      id: routine.id,
      name: routine.name,
      target_muscle: routine.target_muscle,
      secondary_muscles: match?.secondary_muscles || [],
      bench_angle: routine.bench_angle || match?.bench_angle || "Flat",
      required_equipment: match?.required_equipment || "dumbbells",
      instructions: match?.instructions || [
        "Execute reps with strict form and full range of motion.",
      ],
      form_cues: match?.form_cues || ["Maintain tight core"],
      common_mistakes: match?.common_mistakes || ["Rushing the tempo"],
      alternatives: match?.alternatives || [],
      default_sets: routine.sets,
      default_reps_min: routine.reps_target,
      default_reps_max: routine.reps_target,
      default_rest_seconds: routine.rest_seconds,
      attributes_yield: routine.attributes_yield,
    };

    const solver = calculateDumbbellPlates(routine.target_weight_kg, defaultInv, true);

    dispatch(
      startWorkoutSession({
        dayName: selectedDay,
        title: `Solo Trial: ${routine.name}`,
        targetMuscles: routine.target_muscle,
        exercises: [
          {
            definition: def,
            defaultWeightKg: solver.achievableWeightKg,
            plateBreakdown: solver.summaryString,
          },
        ],
        skippingTarget: 0,
        isSingleExercise: true,
      })
    );
  };

  const filteredCatalog = MASTER_EXERCISE_CATALOG.filter((ex) =>
    ex.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    ex.target_muscle.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Split Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-hud">
        {DEFAULT_DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = dayRoutines[day]?.length || 0;
          const isToday = todayDayName === day;

          return (
            <button
              key={day}
              onClick={() => {
                triggerHaptic("light");
                setSelectedDay(day);
                setIsAddingFromCatalog(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                  : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <span>{day.slice(0, 3).toUpperCase()}{isToday ? " ★" : ""}</span>
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/50 text-[10px] text-cyan-300 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Overview Header & Actions */}
      <div className="solo-frame rounded-2xl p-4 sm:p-5 space-y-3 font-hud">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase tracking-widest font-solo">
                CUSTOM FORGE // {selectedDay.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentList.length} Custom Movements Configured
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mana-text-glow font-solo">
              {selectedDay} Hunter Routine
            </h2>
            <p className="text-xs text-slate-400">
              Create brand-new exercises or select from the codex. All changes persist to cloud.
            </p>
          </div>

          {/* Save & Launch Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePlan}
              className={`solo-btn-secondary py-2 px-3 text-xs ${
                savedSuccess ? "border-cyan-400 text-cyan-300" : ""
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? "PERSISTED ◆" : isSaving ? "SAVING..." : "SAVE ROUTINE"}</span>
            </button>

            {!isSelectedDayToday ? (
              <div className="px-3 py-2 rounded-xl bg-[#070b14] border border-cyan-500/30 text-slate-400 font-mono text-[11px] font-bold uppercase text-center flex items-center justify-center gap-1.5 font-hud">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>LOCKED // ONLY [{todayDayName.toUpperCase()}] CAN BE STARTED FULL</span>
              </div>
            ) : isTodayCustomCompleted && !devUnlockOverride ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                <span className="px-3 py-2 rounded-xl bg-cyan-950/70 border border-cyan-400 text-cyan-300 font-mono text-[11px] font-bold uppercase text-center flex items-center justify-center gap-1.5 font-hud">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SESSION COMPLETED</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    setDevUnlockOverride(true);
                  }}
                  className="solo-btn-secondary py-1.5 px-2.5 text-[10px]"
                >
                  DEV OVERRIDE
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={currentList.length === 0}
                onClick={handleLaunchCustomSession}
                className="solo-btn py-2.5 px-4 text-xs font-solo disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>START CUSTOM SESSION ◆</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons to Add Exercises */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setIsCreatingNewModal(true);
            }}
            className="solo-btn py-2 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE BRAND-NEW MOVEMENT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setIsAddingFromCatalog(!isAddingFromCatalog);
            }}
            className="solo-btn-secondary py-2 px-3 text-xs"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>PICK FROM 134-MOVEMENT CODEX</span>
          </button>
        </div>
      </div>

      {/* Catalog Picker Drawer */}
      {isAddingFromCatalog && (
        <div className="solo-frame rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-solo font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              SELECT MOVEMENT FROM SYSTEM CODEX
            </h3>
            <button
              onClick={() => setIsAddingFromCatalog(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Search movement or muscle group..."
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-hud"
          />

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-hud">
            {filteredCatalog.slice(0, 20).map((ex) => (
              <div
                key={ex.id}
                className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/20 hover:border-cyan-400 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{ex.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ex.target_muscle} • Bench: {ex.bench_angle || "Flat"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddFromCatalog(ex)}
                  className="solo-btn py-1 px-2.5 text-[10px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Exercise Cards */}
      <div className="space-y-2.5">
        {currentList.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2 font-hud">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Custom Movements For {selectedDay}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click <strong>&quot;Create Brand-New Movement&quot;</strong> or <strong>&quot;Pick From Codex&quot;</strong> to forge your personalized training split.
            </p>
          </div>
        ) : (
          currentList.map((routine, idx) => {
            const solver = calculateDumbbellPlates(routine.target_weight_kg, defaultInv, true);

            return (
              <div
                key={routine.id}
                className="solo-frame rounded-xl p-3.5 space-y-2.5 font-hud"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-white block font-solo">{routine.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {routine.target_muscle} • Bench: {routine.bench_angle || "Flat"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Solo Trial Play Button */}
                    <button
                      type="button"
                      onClick={() => handleLaunchSoloTrial(routine)}
                      className="solo-btn py-1 px-2.5 text-[10px]"
                      title="Launch as single exercise Solo Trial"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>SOLO TRIAL ◆</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Attribute Yield Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {routine.attributes_yield ? (
                    Object.entries(routine.attributes_yield).map(([attr, val]) => (
                      <span
                        key={attr}
                        className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase"
                      >
                        {attr.slice(0, 3)} +{Number(val).toFixed(2)}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                      STR +0.35
                    </span>
                  )}
                </div>

                {/* In-Line Tweaks */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-cyan-500/20 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-[#070b14] border border-cyan-500/20 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase font-hud">Sets</span>
                    <span className="text-white font-bold">{routine.sets} Sets</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#070b14] border border-cyan-500/20 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase font-hud">Reps</span>
                    <span className="text-white font-bold">{routine.reps_target} Reps</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#070b14] border border-cyan-500/20 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase font-hud">Weight</span>
                    <span className="text-cyan-300 font-bold">{routine.target_weight_kg} kg</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 bg-[#070b14] px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-500 font-hud">Plate Solver: </span>
                  <span>{solver.summaryString}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Exercise Modal */}
      {isCreatingNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solo-notification-modal rounded-xl p-5 sm:p-6 shadow-2xl relative space-y-4 my-auto text-white font-hud">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-solo font-bold text-cyan-300 uppercase tracking-widest block mana-text-glow">
                  [ SYSTEM FORGE // NEW MOVEMENT ]
                </span>
                <h3 className="text-base font-bold text-white font-solo">Create Custom Exercise</h3>
              </div>
              <button
                onClick={() => setIsCreatingNewModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Movement Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incline Twisting Hex Press"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs font-hud"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Primary Muscle
                  </label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 font-hud"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Legs">Legs</option>
                    <option value="Biceps">Biceps</option>
                    <option value="Triceps">Triceps</option>
                    <option value="Core">Core / Abs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Bench Position
                  </label>
                  <select
                    value={newExAngle}
                    onChange={(e) => setNewExAngle(e.target.value)}
                    className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 font-hud"
                  >
                    <option value="Flat">Flat</option>
                    <option value="Incline 15°">Incline 15°</option>
                    <option value="Incline 30°">Incline 30°</option>
                    <option value="Incline 45°">Incline 45°</option>
                    <option value="Incline 60°">Incline 60°</option>
                    <option value="Incline 75°">Incline 75°</option>
                    <option value="Seated 90°">Seated 90°</option>
                    <option value="Decline">Decline</option>
                    <option value="Floor / Standing">Floor / Standing</option>
                  </select>
                </div>
              </div>

              {/* Sets, Reps, Weight */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newExSets}
                    onChange={(e) => setNewExSets(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3 py-1.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newExReps}
                    onChange={(e) => setNewExReps(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3 py-1.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3 py-1.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* RPG Yield Selection */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5">
                  Attributes Yielded
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ATTRIBUTE_CHOICES.map((attr) => {
                    const isSelected = newExSelectedAttrs.includes(attr.key);
                    return (
                      <button
                        key={attr.key}
                        type="button"
                        onClick={() => toggleAttributeSelection(attr.key)}
                        className={`p-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-between ${
                          isSelected
                            ? "bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                            : "bg-[#070b14] border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>{attr.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewModal(false)}
                  className="solo-btn-secondary flex-1 py-2 text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleCreateCustomExercise}
                  className="solo-btn flex-1 py-2 text-xs font-solo"
                >
                  FORGE MOVEMENT ◆
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
