"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store";
import { startWorkoutSession } from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import {
  calculateDumbbellPlates,
  calculateBarbellPlates,
  calculateLegDeveloperPlates,
  getMaxSetsForRank,
  getRepCeilingForRankAndSets,
  resolveExerciseEquipmentProfile,
} from "@/lib/calculations/gym";
import {
  MASTER_EXERCISE_CATALOG,
  MasterExercise,
  getDayExercises,
  getDailyBellyProtocol,
  SUNDAY_MOBILITY_PROTOCOL,
  isExerciseCompatibleWithEquipment,
  getExerciseAttributeYield,
  isExerciseUnlocked,
} from "@/lib/data/exerciseCatalog";
import { getCustomPlanAction, saveCustomPlanAction } from "@/server/actions/player.actions";
import { getTodaysWorkoutsAction } from "@/server/actions/workout.actions";
import { ExerciseCodexModal } from "./ExerciseCodexModal";
import {
  DayOfWeek,
  EquipmentInventory,
  CustomExerciseRoutine,
  ExerciseDefinition,
  ExerciseRequiredEquipment,
  AttributeType,
  HunterRank,
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
  Flame,
  Search,
  Lock,
  Zap,
  Filter,
  Check,
  AlertTriangle,
  Minus,
  Eye,
  RotateCcw,
} from "lucide-react";

interface CustomPlanManagerProps {
  equipment: EquipmentInventory | null;
  playerRank?: HunterRank;
  playerLevel?: number;
  initialPhysicalFatigue?: number;
  initialMentalFatigue?: number;
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

const SPLIT_DAY_DETAILS: Record<DayOfWeek, { title: string; target: string; belly: string }> = {
  Monday: {
    title: "Legs & Lower Body Foundation",
    target: "Quads, Hamstrings, Glutes, Calves",
    belly: "Day A (Upper Core)",
  },
  Tuesday: {
    title: "Chest Hypertrophy & Pectoral Power",
    target: "Upper Chest, Mid Chest, Front Delts, Triceps",
    belly: "Day B (Lower Core)",
  },
  Wednesday: {
    title: "Back Width & Thickness",
    target: "Lats, Rhomboids, Trapezius, Biceps",
    belly: "Day A (Upper Core)",
  },
  Thursday: {
    title: "Shoulder Overhead Power & Width",
    target: "Lateral Deltoids, Anterior Deltoids",
    belly: "Day B (Lower Core)",
  },
  Friday: {
    title: "Deltoid Specialization & Rear Delts",
    target: "Rear Delts, Lateral Delts, Rotator Cuff",
    belly: "Day A (Upper Core)",
  },
  Saturday: {
    title: "Arms Mastery (Biceps & Triceps)",
    target: "Biceps, Triceps, Brachialis, Forearms",
    belly: "Day B (Lower Core)",
  },
  Sunday: {
    title: "Honored Rest & Mobility Sanctuary",
    target: "Zero Lifting • Parasympathetic Recovery",
    belly: "Mobility Protocol",
  },
};

const ATTRIBUTE_CHOICES: { key: AttributeType; label: string; color: string }[] = [
  { key: "strength", label: "Strength (STR)", color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40" },
  { key: "endurance", label: "Endurance (END)", color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40" },
  { key: "agility", label: "Agility (AGI)", color: "text-white border-cyan-500/40 bg-cyan-950/40" },
  { key: "discipline", label: "Discipline (DIS)", color: "text-slate-200 border-cyan-500/40 bg-cyan-950/40" },
  { key: "vitality", label: "Vitality (VIT)", color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40" },
  { key: "mentality", label: "Mentality (MEN)", color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40" },
];

export function CustomPlanManager({
  equipment,
  playerRank = "Recruit",
  playerLevel = 1,
  initialPhysicalFatigue = 0,
  initialMentalFatigue = 0,
}: CustomPlanManagerProps) {
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
  const [pickerMode, setPickerMode] = useState<"split_and_belly" | "all">("split_and_belly");
  const [hideMissingEquipment, setHideMissingEquipment] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [isCreatingNewModal, setIsCreatingNewModal] = useState(false);
  const [isTodayCustomCompleted, setIsTodayCustomCompleted] = useState(false);
  const [devUnlockOverride, setDevUnlockOverride] = useState(false);
  const [volumeNotice, setVolumeNotice] = useState<string | null>(null);

  // New Exercise Form State
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("Chest");
  const [newExAngle, setNewExAngle] = useState("Flat");
  const [newExEquipment, setNewExEquipment] = useState<ExerciseRequiredEquipment>("dumbbells");
  const [newExWeight, setNewExWeight] = useState<number | string>(10);
  const [newExSets, setNewExSets] = useState<number | string>(3);
  const [newExReps, setNewExReps] = useState<number | string>(10);
  const [newExRest, setNewExRest] = useState(60);
  const [newExSelectedAttrs, setNewExSelectedAttrs] = useState<AttributeType[]>([
    "strength",
    "discipline",
    "vitality",
  ]);

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

  // Active card selection & bottom Arsenal Forge integration
  const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);
  const [targetWeightCalc, setTargetWeightCalc] = useState<number | string>(14.0);
  const [arsenalEquipType, setArsenalEquipType] = useState<
    "dumbbells" | "dumbbells_single" | "barbell" | "ez_bar" | "cable_pulley" | "leg_developer"
  >("dumbbells");
  const [isPlateCalcExpanded, setIsPlateCalcExpanded] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isBellyExpanded, setIsBellyExpanded] = useState<boolean>(false);

  // Auto-collapse Arsenal Forge on mobile initially to prevent scroll depth bloat
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsPlateCalcExpanded(false);
    }
  }, []);

  // Exercise Codex Modal state (preview without launching)
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<MasterExercise | null>(null);
  const [selectedExerciseWeight, setSelectedExerciseWeight] = useState<number | undefined>(undefined);

  // Clear focused card if switching days
  useEffect(() => {
    setFocusedExerciseId(null);
  }, [selectedDay]);

  const targetWeightNum = Number(targetWeightCalc) || 0;
  let currentPlateSolver = {
    achievableWeightKg: targetWeightNum,
    isExact: true,
    platesPerSide: [] as { weightKg: number; count: number }[],
    summaryString: `${targetWeightNum.toFixed(1)} kg`,
  };

  if (arsenalEquipType === "dumbbells") {
    currentPlateSolver = calculateDumbbellPlates(targetWeightNum, defaultInv, true);
  } else if (arsenalEquipType === "dumbbells_single") {
    currentPlateSolver = calculateDumbbellPlates(targetWeightNum, defaultInv, false);
  } else if (arsenalEquipType === "barbell") {
    currentPlateSolver = calculateBarbellPlates(targetWeightNum, defaultInv, "straight");
  } else if (arsenalEquipType === "ez_bar") {
    currentPlateSolver = calculateBarbellPlates(targetWeightNum, defaultInv, "ez");
  } else if (arsenalEquipType === "leg_developer") {
    currentPlateSolver = calculateLegDeveloperPlates(targetWeightNum, defaultInv);
  } else if (arsenalEquipType === "cable_pulley") {
    currentPlateSolver = {
      achievableWeightKg: targetWeightNum,
      isExact: true,
      platesPerSide: [],
      summaryString: `${targetWeightNum.toFixed(1)} kg Cable / Pin Resistance`,
    };
  }

  const handleFocusRoutine = (routine: CustomExerciseRoutine) => {
    triggerHaptic("light");
    setFocusedExerciseId(routine.id);
    setTargetWeightCalc(routine.target_weight_kg);

    const match = MASTER_EXERCISE_CATALOG.find(
      (m) => m.name.toLowerCase() === routine.name.toLowerCase()
    );
    const reqEquip = routine.required_equipment || match?.required_equipment;
    const prof = resolveExerciseEquipmentProfile(
      {
        name: routine.name,
        bench_angle: routine.bench_angle,
        required_equipment: reqEquip,
      },
      routine.target_weight_kg,
      defaultInv
    );

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

  const handleArsenalWeightChange = (newWeight: number | string) => {
    triggerHaptic("light");
    setTargetWeightCalc(newWeight);
    const num = Number(newWeight);
    if (!isNaN(num) && focusedExerciseId) {
      setHasUnsavedChanges(true);
      setDayRoutines((prev) => ({
        ...prev,
        [selectedDay]: prev[selectedDay].map((routine) =>
          routine.id === focusedExerciseId
            ? { ...routine, target_weight_kg: num }
            : routine
        ),
      }));
    }
  };

  const getDefaultRoutineWeight = (routine: CustomExerciseRoutine): number => {
    const match = MASTER_EXERCISE_CATALOG.find(
      (m) => m.name.toLowerCase() === routine.name.toLowerCase()
    );
    const reqEquip = routine.required_equipment || match?.required_equipment;
    const prof = resolveExerciseEquipmentProfile(
      {
        name: routine.name,
        bench_angle: routine.bench_angle,
        required_equipment: reqEquip,
      },
      0,
      defaultInv
    );

    if (prof.isFreeHand || prof.isSkippingRope) return 0;
    if (prof.equipmentType === "leg_developer") return 15.0;
    if (prof.equipmentType === "barbell" || prof.equipmentType === "bench_and_barbell") {
      return defaultInv.barbell_weight_kg || 10.0;
    }
    if (prof.equipmentType === "ez_bar") {
      return defaultInv.ez_bar_weight_kg || 7.0;
    }
    if (prof.equipmentType === "cable_pulley") return 15.0;
    if (prof.dumbbellCount === 1) return 13.5;
    return 12.5;
  };

  const isRoutineWeightCustomized = (routine: CustomExerciseRoutine): boolean => {
    const def = getDefaultRoutineWeight(routine);
    return Math.abs(routine.target_weight_kg - def) > 0.05;
  };

  const handleResetRoutineWeight = (routineId: string) => {
    triggerHaptic("medium");
    const routine = currentList.find((r) => r.id === routineId);
    if (!routine) return;
    const defWeight = getDefaultRoutineWeight(routine);

    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((r) =>
        r.id === routineId ? { ...r, target_weight_kg: defWeight } : r
      ),
    }));

    if (focusedExerciseId === routineId) {
      setTargetWeightCalc(defWeight);
    }
  };

  const handleRoutineWeightStep = (index: number, delta: number) => {
    triggerHaptic("light");
    const routine = currentList[index];
    if (!routine) return;
    const newWeight = Math.min(100, Math.max(0, Number((routine.target_weight_kg + delta).toFixed(1))));

    const updated = [...currentList];
    updated[index] = { ...routine, target_weight_kg: newWeight };
    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({ ...prev, [selectedDay]: updated }));

    setFocusedExerciseId(routine.id);
    setTargetWeightCalc(newWeight);

    const match = MASTER_EXERCISE_CATALOG.find(
      (m) => m.name.toLowerCase() === routine.name.toLowerCase()
    );
    const reqEquip = routine.required_equipment || match?.required_equipment;
    const prof = resolveExerciseEquipmentProfile(
      {
        name: routine.name,
        bench_angle: routine.bench_angle,
        required_equipment: reqEquip,
      },
      newWeight,
      defaultInv
    );

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

  const handleOpenMovementGuide = (routine: CustomExerciseRoutine) => {
    triggerHaptic("light");
    const match = MASTER_EXERCISE_CATALOG.find(
      (m) => m.name.toLowerCase() === routine.name.toLowerCase()
    );

    if (match) {
      setSelectedExerciseForModal(match);
    } else {
      const synth: MasterExercise = {
        id: routine.id,
        name: routine.name,
        split_day: selectedDay,
        order_index: 1,
        target_muscle: routine.target_muscle,
        secondary_muscles: [],
        bench_angle: (routine.bench_angle as any) || "Flat",
        required_equipment: (routine.required_equipment as any) || "dumbbells",
        unlock_tier: "Recruit",
        unlock_level: 1,
        unlock_criteria: "Hunter Forged Movement",
        target_duration_mins: 8,
        default_sets: routine.sets,
        default_reps_min: routine.reps_target,
        default_reps_max: routine.reps_target,
        default_rest_seconds: routine.rest_seconds || 60,
        attribute_yield: routine.attributes_yield || { strength: 0.35 },
        instructions: [
          `Execute ${routine.sets} sets of ${routine.reps_target} reps targeting ${routine.target_muscle}.`,
          `Maintain strict posture with bench set to ${routine.bench_angle || "Flat"}.`,
          "Control both concentric and eccentric phases smoothly.",
        ],
        form_cues: ["Tight abdominal wall", "Neutral cervical spine", "Controlled cadence"],
        common_mistakes: ["Using momentum or bouncing", "Incomplete range of motion", "Holding breath"],
        alternatives: [],
        demo_steps: [
          {
            step: 1,
            title: "Setup & Stance",
            description: `Align on ${routine.bench_angle || "Flat"} setup with firm foot placement.`,
            coachTip: "Set tight foundation.",
          },
          {
            step: 2,
            title: "Execution",
            description: `Drive through target ${routine.target_muscle} with steady power.`,
            coachTip: "Focus on mind-muscle squeeze.",
          },
          {
            step: 3,
            title: "Safe Finish",
            description: "Rerack or return weights to floor safely under full control.",
            coachTip: "Never drop weights abruptly.",
          },
        ],
      };
      setSelectedExerciseForModal(synth);
    }
    setSelectedExerciseWeight(routine.target_weight_kg);
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    triggerHaptic("heavy");
    try {
      await saveCustomPlanAction(dayRoutines);
      setSavedSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save custom plan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Derive split and belly movements for selectedDay
  const daySplitExercises = selectedDay === "Sunday"
    ? SUNDAY_MOBILITY_PROTOCOL
    : getDayExercises(selectedDay, equipment);

  const dayBellyExercises = getDailyBellyProtocol(selectedDay);

  const todayCuratedCodex = selectedDay === "Sunday"
    ? SUNDAY_MOBILITY_PROTOCOL
    : [...daySplitExercises, ...dayBellyExercises];

  const baseCatalogList = pickerMode === "split_and_belly" ? todayCuratedCodex : MASTER_EXERCISE_CATALOG;

  const filteredCatalog = baseCatalogList.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      ex.target_muscle.toLowerCase().includes(catalogSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (hideMissingEquipment) {
      return isExerciseCompatibleWithEquipment(ex, equipment);
    }
    return true;
  });

  const handleAddFromCatalog = (exercise: MasterExercise) => {
    triggerHaptic("medium");
    const yields = getExerciseAttributeYield(exercise);
    const equipProfile = resolveExerciseEquipmentProfile(exercise, 0, defaultInv);

    let defaultWeight = 0;
    if (equipProfile.isFreeHand || equipProfile.isSkippingRope) {
      defaultWeight = 0;
    } else if (equipProfile.equipmentType === "leg_developer") {
      defaultWeight = 15.0;
    } else if (equipProfile.equipmentType === "barbell" || equipProfile.equipmentType === "bench_and_barbell") {
      defaultWeight = defaultInv.barbell_weight_kg || 10.0;
    } else if (equipProfile.equipmentType === "ez_bar") {
      defaultWeight = defaultInv.ez_bar_weight_kg || 7.0;
    } else if (equipProfile.equipmentType === "cable_pulley") {
      defaultWeight = 15.0;
    } else if (equipProfile.dumbbellCount === 1) {
      defaultWeight = 13.5;
    } else {
      defaultWeight = 12.5;
    }

    const isBelly =
      exercise.unlock_criteria?.toLowerCase().includes("daily belly") ||
      exercise.target_muscle?.toLowerCase().includes("ab") ||
      exercise.target_muscle?.toLowerCase().includes("core") ||
      exercise.target_muscle?.toLowerCase().includes("rectus");

    const newRoutine: CustomExerciseRoutine = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: exercise.name,
      target_muscle: exercise.target_muscle,
      bench_angle: exercise.bench_angle || "Flat",
      required_equipment: exercise.required_equipment,
      target_weight_kg: defaultWeight,
      sets: exercise.default_sets || 3,
      reps_target: exercise.default_reps_min || 10,
      rest_seconds: exercise.default_rest_seconds || 60,
      primary_attribute: (Object.keys(yields)[0] as AttributeType) || "strength",
      attributes_yield: yields,
      phase: isBelly ? "belly" : "core",
    };

    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newRoutine],
    }));
  };

  const handleMuscleChange = (muscle: string) => {
    setNewExMuscle(muscle);
    const m = muscle.toLowerCase();
    if (m.includes("chest")) {
      setNewExSelectedAttrs(["strength", "discipline", "vitality"]);
    } else if (m.includes("back")) {
      setNewExSelectedAttrs(["strength", "endurance", "discipline"]);
    } else if (m.includes("leg")) {
      setNewExSelectedAttrs(["strength", "vitality", "endurance"]);
    } else if (m.includes("shoulder")) {
      setNewExSelectedAttrs(["strength", "discipline", "agility"]);
    } else if (m.includes("bicep") || m.includes("tricep")) {
      setNewExSelectedAttrs(["strength", "discipline", "mentality"]);
    } else if (m.includes("core") || m.includes("ab")) {
      setNewExSelectedAttrs(["endurance", "discipline", "agility"]);
    } else {
      setNewExSelectedAttrs(["strength", "discipline"]);
    }
  };

  const handleCreateCustomExercise = () => {
    if (!newExName.trim()) return;
    triggerHaptic("heavy");

    const attrsYield: Record<string, number> = {};
    const weightPerAttr = Number((0.5 / Math.max(1, newExSelectedAttrs.length)).toFixed(2));
    newExSelectedAttrs.forEach((attr) => {
      attrsYield[attr] = weightPerAttr;
    });

    const isBelly = newExMuscle === "Core";

    const newRoutine: CustomExerciseRoutine = {
      id: `custom_forged_${Date.now()}`,
      name: newExName.trim(),
      target_muscle: newExMuscle,
      bench_angle: newExAngle,
      required_equipment: newExEquipment,
      target_weight_kg: newExEquipment === "bodyweight" ? 0 : (Number(newExWeight) || 10),
      sets: Number(newExSets) || 3,
      reps_target: Number(newExReps) || 10,
      rest_seconds: Number(newExRest) || 60,
      primary_attribute: newExSelectedAttrs[0] || "strength",
      attributes_yield: attrsYield,
      is_custom_created: true,
      phase: isBelly ? "belly" : "core",
    };

    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
    }));
  };

  const maxAllowedSets = getMaxSetsForRank(playerRank);

  const handleUpdateRoutineSets = (index: number, delta: number) => {
    triggerHaptic("light");
    const updated = [...currentList];
    const current = updated[index];
    const newSets = Math.min(maxAllowedSets, Math.max(1, current.sets + delta));

    const ceiling = getRepCeilingForRankAndSets(playerRank, newSets);
    let newReps = current.reps_target;
    if (newReps > ceiling.maxReps) {
      newReps = ceiling.maxReps;
      setVolumeNotice(`[SAFE VOLUME LOCK]: ${playerRank} rank capped at ${ceiling.maxReps} reps for ${newSets} sets.`);
      setTimeout(() => setVolumeNotice(null), 3500);
    }

    updated[index] = { ...current, sets: newSets, reps_target: newReps };
    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({ ...prev, [selectedDay]: updated }));
  };

  const handleUpdateRoutineReps = (index: number, delta: number) => {
    triggerHaptic("light");
    const updated = [...currentList];
    const current = updated[index];
    const ceiling = getRepCeilingForRankAndSets(playerRank, current.sets);
    const newReps = Math.min(ceiling.maxReps, Math.max(1, current.reps_target + delta));

    if (current.reps_target + delta > ceiling.maxReps) {
      setVolumeNotice(`[REP CEILING]: ${playerRank} limit is ${ceiling.maxReps} reps at ${current.sets} sets to prevent tendonitis.`);
      setTimeout(() => setVolumeNotice(null), 3500);
    }

    updated[index] = { ...current, reps_target: newReps };
    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({ ...prev, [selectedDay]: updated }));
  };

  const handleUpdateRoutineWeight = (index: number, delta: number) => {
    triggerHaptic("light");
    const updated = [...currentList];
    const current = updated[index];
    const newWeight = Math.min(100, Math.max(0, Number((current.target_weight_kg + delta).toFixed(1))));

    updated[index] = { ...current, target_weight_kg: newWeight };
    setHasUnsavedChanges(true);
    setDayRoutines((prev) => ({ ...prev, [selectedDay]: updated }));
  };

  const handleLaunchCustomSession = () => {
    if (currentList.length === 0 || !isSelectedDayToday) return;
    triggerHaptic("heavy");

    const sessionExercises = currentList.map((routine) => {
      const match = MASTER_EXERCISE_CATALOG.find(
        (m) => m.name.toLowerCase() === routine.name.toLowerCase()
      );

      const reqEquip = routine.required_equipment || match?.required_equipment || "dumbbells";

      const def: ExerciseDefinition = {
        id: routine.id,
        name: routine.name,
        target_muscle: routine.target_muscle,
        secondary_muscles: match?.secondary_muscles || [],
        bench_angle: routine.bench_angle || match?.bench_angle || "Flat",
        required_equipment: (reqEquip as ExerciseRequiredEquipment) || "dumbbells",
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

      const equipProfile = resolveExerciseEquipmentProfile(
        def,
        routine.target_weight_kg,
        defaultInv
      );

      return {
        definition: def,
        defaultWeightKg: equipProfile.isFreeHand || equipProfile.isSkippingRope ? 0 : (equipProfile.plateSolverResult?.achievableWeightKg ?? routine.target_weight_kg),
        plateBreakdown: equipProfile.isFreeHand
          ? "Bodyweight Calisthenics (0kg)"
          : equipProfile.isSkippingRope
          ? "Speed Skipping Rope (0kg)"
          : (equipProfile.plateSolverResult?.summaryString || `${routine.target_weight_kg}kg`),
        phase: routine.phase || "core",
      };
    });

    dispatch(
      startWorkoutSession({
        dayName: selectedDay,
        title: `Custom Split: ${selectedDay} Protocol`,
        targetMuscles: SPLIT_DAY_DETAILS[selectedDay]?.target || "Custom Routine",
        exercises: sessionExercises,
        skippingTarget: 100,
        isSingleExercise: false,
        initialPhysicalFatigue,
        initialMentalFatigue,
        equipment: defaultInv,
      })
    );
  };

  const handleLaunchSoloTrial = (routine: CustomExerciseRoutine) => {
    triggerHaptic("heavy");
    const match = MASTER_EXERCISE_CATALOG.find(
      (m) => m.name.toLowerCase() === routine.name.toLowerCase()
    );

    const reqEquip = routine.required_equipment || match?.required_equipment || "dumbbells";

    const def: ExerciseDefinition = {
      id: routine.id,
      name: routine.name,
      target_muscle: routine.target_muscle,
      secondary_muscles: match?.secondary_muscles || [],
      bench_angle: routine.bench_angle || match?.bench_angle || "Flat",
      required_equipment: (reqEquip as ExerciseRequiredEquipment) || "dumbbells",
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

    const equipProfile = resolveExerciseEquipmentProfile(
      def,
      routine.target_weight_kg,
      defaultInv
    );

    dispatch(
      startWorkoutSession({
        dayName: selectedDay,
        title: `Solo Trial: ${routine.name}`,
        targetMuscles: routine.target_muscle,
        exercises: [
          {
            definition: def,
            defaultWeightKg: equipProfile.isFreeHand || equipProfile.isSkippingRope ? 0 : (equipProfile.plateSolverResult?.achievableWeightKg ?? routine.target_weight_kg),
            plateBreakdown: equipProfile.isFreeHand
              ? "Bodyweight Calisthenics (0kg)"
              : equipProfile.isSkippingRope
              ? "Speed Skipping Rope (0kg)"
              : (equipProfile.plateSolverResult?.summaryString || `${routine.target_weight_kg}kg`),
            phase: routine.phase || "core",
          },
        ],
        skippingTarget: 0,
        isSingleExercise: true,
        initialPhysicalFatigue,
        initialMentalFatigue,
        equipment: defaultInv,
      })
    );
  };

  const splitDetail = SPLIT_DAY_DETAILS[selectedDay] || SPLIT_DAY_DETAILS.Monday;

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
              {selectedDay}: {splitDetail.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
              <span className="text-cyan-300 font-semibold">{splitDetail.target}</span>
              <span>•</span>
              <span className="text-slate-400 font-mono">Protocol Belly: {splitDetail.belly}</span>
            </div>
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

        {/* Responsive 2-Column Tactical Action Bar */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20 font-solo">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setIsCreatingNewModal(true);
            }}
            className="solo-btn py-2 px-2.5 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 truncate"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">FORGE MOVEMENT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setIsAddingFromCatalog(!isAddingFromCatalog);
            }}
            className={`solo-btn-secondary py-2 px-2.5 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 truncate ${
              isAddingFromCatalog ? "border-cyan-400 text-cyan-300 bg-cyan-950/60" : ""
            }`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{isAddingFromCatalog ? "HIDE CODEX" : "PICK FROM CODEX"}</span>
          </button>
        </div>
      </div>

      {/* Catalog Picker Drawer */}
      {isAddingFromCatalog && (
        <div className="solo-frame rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-solo font-bold text-white uppercase tracking-wider">
                SELECT MOVEMENTS FOR {selectedDay.toUpperCase()}
              </h3>
            </div>
            <button
              onClick={() => setIsAddingFromCatalog(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Mode Selector & Equipment Toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#040810] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setPickerMode("split_and_belly");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                  pickerMode === "split_and_belly"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {selectedDay.toUpperCase()} SPLIT & BELLY ({todayCuratedCodex.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setPickerMode("all");
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                  pickerMode === "all"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ALL CODEX ({MASTER_EXERCISE_CATALOG.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setHideMissingEquipment(!hideMissingEquipment);
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition flex items-center gap-1.5 ${
                hideMissingEquipment
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Toggle to hide movements that require unowned hardware"
            >
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>{hideMissingEquipment ? "HIDING UNOWNED GEAR" : "SHOWING ALL GEAR"}</span>
            </button>
          </div>

          <input
            type="text"
            placeholder={`Search ${pickerMode === "split_and_belly" ? `${selectedDay} movements or muscles` : "all 134 movements"}...`}
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-hud"
          />

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 font-hud scrollbar-thin">
            {filteredCatalog.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No movements match your criteria. Toggle &quot;SHOWING ALL GEAR&quot; or search a different term.
              </div>
            ) : (
              filteredCatalog.map((ex) => {
                const isCompatible = isExerciseCompatibleWithEquipment(ex, equipment);
                const equipProf = resolveExerciseEquipmentProfile(ex, 0, defaultInv);
                const yields = getExerciseAttributeYield(ex);

                return (
                  <div
                    key={ex.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                      isCompatible
                        ? "bg-[#070b14] border-cyan-500/20 hover:border-cyan-400"
                        : "bg-[#050810] border-amber-900/30 opacity-70"
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            setSelectedExerciseForModal(ex);
                            setSelectedExerciseWeight(0);
                          }}
                          className="font-bold text-white hover:text-cyan-300 font-solo truncate text-left flex items-center gap-1 group/item"
                          title="Preview movement guide & biomechanics"
                        >
                          <span className="truncate group-hover/item:underline underline-offset-2">{ex.name}</span>
                          <Eye className="w-3 h-3 text-cyan-400 opacity-70 group-hover/item:opacity-100 shrink-0" />
                        </button>
                        {equipProf.isFreeHand ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                            BODYWEIGHT
                          </span>
                        ) : equipProf.isSkippingRope ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
                            SKIPPING ROPE
                          </span>
                        ) : equipProf.equipmentType === "leg_developer" ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 shrink-0">
                            LEG DEVELOPER
                          </span>
                        ) : equipProf.equipmentType?.includes("barbell") ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 shrink-0">
                            BARBELL
                          </span>
                        ) : equipProf.equipmentType === "ez_bar" ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shrink-0">
                            EZ-BAR
                          </span>
                        ) : equipProf.equipmentType === "cable_pulley" ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 shrink-0">
                            CABLE
                          </span>
                        ) : equipProf.dumbbellCount === 1 ? (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
                            1× DUMBBELL
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
                            DUMBBELLS (PAIR)
                          </span>
                        )}

                        {!isCompatible && (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/90 text-amber-300 border border-amber-500/50 flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                            <span>
                              {ex.required_equipment === "barbell" || ex.required_equipment === "bench_and_barbell"
                                ? "NEEDS BARBELL"
                                : ex.required_equipment === "ez_bar"
                                ? "NEEDS EZ-BAR"
                                : ex.required_equipment === "leg_developer"
                                ? "NEEDS LEG DEVELOPER"
                                : ex.required_equipment === "cable_pulley"
                                ? "NEEDS CABLE"
                                : !defaultInv.has_bench
                                ? "NEEDS BENCH"
                                : "GEAR MISSING"}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap">
                        <span className="text-cyan-400 font-medium">{ex.target_muscle}</span>
                        <span>•</span>
                        <span>Bench: {ex.bench_angle || "Flat"}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {yields.strength && (
                            <span className="text-cyan-300">STR +{yields.strength.toFixed(2)}</span>
                          )}
                          {yields.discipline && (
                            <span className="text-slate-300">DIS +{yields.discipline.toFixed(2)}</span>
                          )}
                          {yields.endurance && (
                            <span className="text-blue-300">END +{yields.endurance.toFixed(2)}</span>
                          )}
                          {yields.agility && (
                            <span className="text-white">AGI +{yields.agility.toFixed(2)}</span>
                          )}
                          {yields.vitality && (
                            <span className="text-emerald-300">VIT +{yields.vitality.toFixed(2)}</span>
                          )}
                          {yields.mentality && (
                            <span className="text-purple-300">MEN +{yields.mentality.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCompatible ? (
                        <button
                          type="button"
                          onClick={() => handleAddFromCatalog(ex)}
                          className="solo-btn py-1 px-2.5 text-[10px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400/60 text-[9px] font-mono cursor-not-allowed"
                          title="This exercise requires hardware not enabled in Settings"
                        >
                          LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Routine Exercise Cards */}
      <div className="space-y-2.5">
        {volumeNotice && (
          <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold animate-in fade-in duration-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{volumeNotice}</span>
          </div>
        )}

        {currentList.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2 font-hud">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Custom Movements For {selectedDay}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click <strong>&quot;Pick Movements From Codex&quot;</strong> to choose from {splitDetail.target} and {splitDetail.belly}, or <strong>&quot;Create Brand-New Movement&quot;</strong>.
            </p>
          </div>
        ) : (
          (() => {
            const renderRoutineCard = (routine: CustomExerciseRoutine, idx: number, isBelly = false) => {
            const match = MASTER_EXERCISE_CATALOG.find(
              (m) => m.name.toLowerCase() === routine.name.toLowerCase()
            );
            const reqEquip = routine.required_equipment || match?.required_equipment;
            const equipProfile = resolveExerciseEquipmentProfile(
              {
                name: routine.name,
                bench_angle: routine.bench_angle,
                required_equipment: reqEquip,
              },
              routine.target_weight_kg,
              defaultInv
            );
            const solver = equipProfile.plateSolverResult || (
              equipProfile.equipmentType === "barbell" || equipProfile.equipmentType === "bench_and_barbell"
                ? calculateBarbellPlates(routine.target_weight_kg, defaultInv, "straight")
                : equipProfile.equipmentType === "ez_bar"
                ? calculateBarbellPlates(routine.target_weight_kg, defaultInv, "ez")
                : equipProfile.equipmentType === "leg_developer"
                ? calculateLegDeveloperPlates(routine.target_weight_kg, defaultInv)
                : calculateDumbbellPlates(routine.target_weight_kg, defaultInv, equipProfile.dumbbellCount !== 1)
            );

            const isFocused = focusedExerciseId === routine.id;
            const ceiling = getRepCeilingForRankAndSets(playerRank, routine.sets);
            const defaultWeight = getDefaultRoutineWeight(routine);
            const isCustomized = isRoutineWeightCustomized(routine);

            return (
              <div
                key={routine.id}
                onClick={() => handleFocusRoutine(routine)}
                className={`rounded-2xl p-3 sm:p-4 space-y-2.5 font-hud cursor-pointer transition-all border ${
                  isFocused
                    ? "border-cyan-400 bg-[#0b1324] ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.18)]"
                    : "border-cyan-500/20 bg-[#090d18] hover:border-cyan-400/50 hover:bg-[#0c1222]"
                }`}
              >
                {/* Header Row: Index, Name, Equipment/Angle Badges, Action Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 sm:gap-2.5 min-w-0 flex-1">
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isFocused
                          ? "bg-cyan-500 text-black shadow-[0_0_10px_#00e5ff]"
                          : "bg-cyan-950/80 border border-cyan-400 text-cyan-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMovementGuide(routine);
                          }}
                          className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 font-solo truncate flex items-center gap-1 group/title text-left transition"
                          title="Tap to inspect Movement Codex Guide"
                        >
                          <span className="truncate group-hover/title:underline underline-offset-2">
                            {routine.name}
                          </span>
                        </button>

                        {equipProfile.isFreeHand ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
                            BODYWEIGHT
                          </span>
                        ) : equipProfile.isSkippingRope ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
                            SKIPPING ROPE
                          </span>
                        ) : equipProfile.equipmentType === "leg_developer" ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 shrink-0">
                            LEG DEVELOPER
                          </span>
                        ) : equipProfile.equipmentType?.includes("barbell") ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 shrink-0">
                            BARBELL
                          </span>
                        ) : equipProfile.equipmentType === "ez_bar" ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shrink-0">
                            EZ-BAR
                          </span>
                        ) : equipProfile.equipmentType === "cable_pulley" ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 shrink-0">
                            CABLE
                          </span>
                        ) : equipProfile.dumbbellCount === 1 ? (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
                            1× DUMBBELL
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
                            DUMBBELLS (PAIR)
                          </span>
                        )}

                        <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shrink-0">
                          {routine.bench_angle || "Flat"}
                        </span>
                      </div>

                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate block">
                        {routine.target_muscle}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Guide, Solo Trial, Trash */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMovementGuide(routine);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition flex items-center gap-1 shadow-sm shrink-0"
                      title="View Movement Guide & Biomechanics"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[9px] sm:text-[9.5px] font-mono font-bold hidden xs:inline">GUIDE</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchSoloTrial(routine);
                      }}
                      className="px-2 sm:px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-cyan-300 transition flex items-center gap-1 font-mono font-bold text-[9px] sm:text-[10px] shadow-sm shrink-0"
                      title="Launch as single exercise Solo Trial"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden xs:inline">SOLO</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExercise(idx);
                      }}
                      className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition shrink-0"
                      title="Remove from routine"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Attribute Yield Badges */}
                <div className="flex items-center gap-1 flex-wrap">
                  {routine.attributes_yield && Object.keys(routine.attributes_yield).length > 0 ? (
                    Object.entries(routine.attributes_yield).map(([attr, val]) => (
                      <span
                        key={attr}
                        className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-mono font-bold uppercase ${
                          attr === "strength"
                            ? "bg-cyan-950/70 border border-cyan-500/40 text-cyan-300"
                            : attr === "endurance"
                            ? "bg-blue-950/70 border border-blue-500/40 text-blue-300"
                            : attr === "vitality"
                            ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                            : attr === "agility"
                            ? "bg-slate-900 border border-cyan-400/40 text-white"
                            : attr === "mentality"
                            ? "bg-purple-950/70 border border-purple-500/40 text-purple-300"
                            : "bg-cyan-950/60 border border-cyan-500/30 text-cyan-200"
                        }`}
                      >
                        {attr.slice(0, 3)} +{Number(val).toFixed(2)}
                      </span>
                    ))
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[8.5px] sm:text-[9.5px] font-mono font-bold">
                      STR +0.35
                    </span>
                  )}
                </div>

                {/* In-Line Tri-Stepper Controls */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 border-t border-cyan-500/20 text-[11px] font-mono">
                  {/* Sets Stepper */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#060a12] border border-cyan-500/20 text-center">
                    <span className="text-slate-400 block text-[8.5px] sm:text-[9px] uppercase font-hud truncate">
                      Sets (Max {maxAllowedSets})
                    </span>
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateRoutineSets(idx, -1);
                        }}
                        disabled={routine.sets <= 1}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs disabled:opacity-30 transition"
                      >
                        -
                      </button>
                      <span className="text-white font-bold min-w-5">{routine.sets}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateRoutineSets(idx, +1);
                        }}
                        disabled={routine.sets >= maxAllowedSets}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs disabled:opacity-30 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reps Stepper with Rank Ceilings */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#060a12] border border-cyan-500/20 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-slate-400 block text-[8.5px] sm:text-[9px] uppercase font-hud">Reps</span>
                      {ceiling.isRestricted && (
                        <span className="text-[7.5px] sm:text-[8px] text-cyan-400 font-bold">CAP:{ceiling.maxReps}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateRoutineReps(idx, -1);
                        }}
                        disabled={routine.reps_target <= 1}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs disabled:opacity-30 transition"
                      >
                        -
                      </button>
                      <span className="text-white font-bold min-w-5">{routine.reps_target}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateRoutineReps(idx, +1);
                        }}
                        disabled={routine.reps_target >= ceiling.maxReps}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs disabled:opacity-30 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Weight Stepper or Bodyweight Indicator */}
                  {equipProfile.isFreeHand ? (
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#060a12] border border-cyan-500/20 text-center flex flex-col justify-between">
                      <span className="text-slate-400 block text-[8.5px] sm:text-[9px] uppercase font-hud">Resistance</span>
                      <div className="mt-0.5">
                        <span className="text-emerald-300 font-bold text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                          BODYWEIGHT
                        </span>
                      </div>
                    </div>
                  ) : equipProfile.isSkippingRope ? (
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#060a12] border border-cyan-500/20 text-center flex flex-col justify-between">
                      <span className="text-slate-400 block text-[8.5px] sm:text-[9px] uppercase font-hud">Agility</span>
                      <div className="mt-0.5">
                        <span className="text-cyan-300 font-bold text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                          SPEED ROPE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-1.5 sm:p-2 rounded-xl bg-[#060a12] border border-cyan-500/20 text-center">
                      <span className="text-slate-400 block text-[8.5px] sm:text-[9px] uppercase font-hud truncate">
                        {equipProfile.equipmentType === "leg_developer"
                          ? "HORN"
                          : equipProfile.equipmentType?.includes("barbell")
                          ? "BAR"
                          : equipProfile.equipmentType === "ez_bar"
                          ? "EZ"
                          : equipProfile.equipmentType === "cable_pulley"
                          ? "CABLE"
                          : equipProfile.dumbbellCount === 1
                          ? "1×DB"
                          : "PAIR"}
                      </span>
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoutineWeightStep(idx, -1.0);
                          }}
                          disabled={routine.target_weight_kg <= 0}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs disabled:opacity-30 transition"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusRoutine(routine);
                          }}
                          className={`font-mono font-bold text-[10px] sm:text-xs min-w-7 truncate transition ${
                            isFocused ? "text-cyan-300 underline underline-offset-2" : "text-white hover:text-cyan-300"
                          }`}
                          title="Inspect & Adjust in Arsenal Forge"
                        >
                          {routine.target_weight_kg.toFixed(1)}k
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoutineWeightStep(idx, +1.0);
                          }}
                          disabled={routine.target_weight_kg >= 100}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs disabled:opacity-30 transition"
                        >
                          +
                        </button>

                        {/* Reset to Default Weight if customized by player */}
                        {isCustomized && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetRoutineWeight(routine.id);
                            }}
                            className="ml-0.5 px-1 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[7.5px] sm:text-[8.5px] font-mono font-bold flex items-center gap-0.5 transition shadow-sm shrink-0"
                            title={`Reset to Default Load (${defaultWeight.toFixed(1)}kg)`}
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>DEF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Plate Solver or Free-Hand Equipment Directive */}
                {equipProfile.isFreeHand ? (
                  <div className="text-[10px] font-mono text-emerald-300 bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center justify-between flex-wrap gap-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1 font-hud">
                      <Zap className="w-3 h-3" />
                      FREE-HAND CALISTHENICS
                    </span>
                    <span className="text-[9px] text-emerald-200/80">Zero Plates Required (100% Bodyweight)</span>
                  </div>
                ) : equipProfile.isSkippingRope ? (
                  <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center justify-between flex-wrap gap-1">
                    <span className="text-cyan-400 font-bold flex items-center gap-1 font-hud">
                      <Zap className="w-3 h-3" />
                      SPEED SKIPPING ROPE
                    </span>
                    <span className="text-[9px] text-cyan-200/80">Target: 100+ Cadence Revolutions</span>
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFocusRoutine(routine);
                    }}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border flex items-center justify-between flex-wrap gap-1 cursor-pointer transition ${
                      isFocused
                        ? "bg-cyan-950/50 border-cyan-400/60 text-cyan-300 shadow-sm"
                        : "bg-[#070b14] border-cyan-500/20 text-slate-300 hover:border-cyan-400/40"
                    }`}
                    title="Click to view & edit plate breakdown in Arsenal Forge below"
                  >
                    <span className="text-slate-400 font-hud">{equipProfile.displayName}: </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-300 font-bold">{solver.summaryString}</span>
                      <span className="text-[8px] sm:text-[8.5px] px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 uppercase font-mono font-bold">
                        FORGE ⚙
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          };

          const coreRoutines = currentList.filter((r) => r.phase !== "belly");
          const bellyRoutines = currentList.filter((r) => r.phase === "belly");

          if (bellyRoutines.length > 0) {
            return (
              <div className="space-y-4">
                {/* Phase 1: Core Custom Movements */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 font-hud">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      PHASE 1: CUSTOM SPLIT MOVEMENTS ({coreRoutines.length})
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400">
                      {splitDetail.target}
                    </span>
                  </div>
                  {coreRoutines.map((routine, idx) => renderRoutineCard(routine, idx, false))}
                </div>

                {/* Phase 2: Custom Abdominal Protocol (Collapsible Anti-Scroll Accordion) */}
                <div className="rounded-2xl border border-cyan-500/30 bg-[#070b14]/90 overflow-hidden shadow-lg transition-all font-hud">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setIsBellyExpanded(!isBellyExpanded);
                    }}
                    className="w-full p-3 sm:p-4 flex items-center justify-between gap-2.5 text-left bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-transparent hover:bg-cyan-950/60 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <Flame className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white font-solo tracking-wide group-hover:text-cyan-300 transition block">
                          PHASE 2: CUSTOM BELLY PROTOCOL ({bellyRoutines.length} MOVEMENTS)
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] text-slate-400 truncate block mt-0.5">
                          {bellyRoutines.map((b) => b.name).join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        {bellyRoutines.length} EXERCISES
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition">
                        {isBellyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>

                  {isBellyExpanded && (
                    <div className="p-3 sm:p-4 pt-2 border-t border-cyan-500/20 bg-[#05070d]/60 animate-in fade-in duration-150 space-y-3">
                      {bellyRoutines.map((routine, idx) =>
                        renderRoutineCard(routine, coreRoutines.length + idx, true)
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return currentList.map((routine, idx) => renderRoutineCard(routine, idx, false));
        })()
        )}
      </div>

      {/* Arsenal Equipment & Weight Forge Bottom Dock */}
      <div className="hunter-panel rounded-3xl border border-cyan-500/40 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              ARSENAL EQUIPMENT &amp; WEIGHT FORGE
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
              {(Number(targetWeightCalc) || 0).toFixed(1)}KG • {arsenalEquipType.toUpperCase().replace("_", " ")}
            </span>
            <button
              type="button"
              onClick={() => setIsPlateCalcExpanded(!isPlateCalcExpanded)}
              className="p-1 rounded text-slate-400 hover:text-white transition"
              title="Toggle Arsenal Forge dock"
            >
              {isPlateCalcExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {isPlateCalcExpanded && (
          <div className="space-y-3.5 pt-2 border-t border-slate-800 animate-in fade-in">
            {/* Active Focused Routine Link Banner */}
            {(() => {
              const focusedRoutine = currentList.find((r) => r.id === focusedExerciseId);
              if (!focusedRoutine) {
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>FREE CALCULATOR MODE • Tap any custom workout card above to link dynamic load</span>
                    </span>
                  </div>
                );
              }

              const focusedIndex = currentList.findIndex((r) => r.id === focusedRoutine.id);
              const match = MASTER_EXERCISE_CATALOG.find(
                (m) => m.name.toLowerCase() === focusedRoutine.name.toLowerCase()
              );
              const reqEquip = focusedRoutine.required_equipment || match?.required_equipment;
              const prof = resolveExerciseEquipmentProfile(
                {
                  name: focusedRoutine.name,
                  bench_angle: focusedRoutine.bench_angle,
                  required_equipment: reqEquip,
                },
                focusedRoutine.target_weight_kg,
                defaultInv
              );

              return (
                <div className="p-2.5 rounded-xl bg-[#0b1424] border border-cyan-400/50 flex items-center justify-between flex-wrap gap-2 shadow-sm">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        LINKED TO #{focusedIndex + 1}:
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-none">
                        {focusedRoutine.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                        {focusedRoutine.target_weight_kg.toFixed(1)}kg
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-mono">
                      {prof.isFreeHand
                        ? "Calisthenics movement (100% bodyweight)"
                        : prof.isSkippingRope
                        ? "Speed skipping rope (cadence target)"
                        : "Selecting weight or plates below updates this custom workout in real time"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRoutineWeightCustomized(focusedRoutine) && (
                      <button
                        type="button"
                        onClick={() => handleResetRoutineWeight(focusedRoutine.id)}
                        className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 hover:bg-amber-900 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 transition shadow-sm shrink-0"
                        title={`Reset ${focusedRoutine.name} to default load (${getDefaultRoutineWeight(focusedRoutine).toFixed(1)}kg)`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>RESET TO DEFAULT ({getDefaultRoutineWeight(focusedRoutine).toFixed(1)}kg)</span>
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
                    if (focusedExerciseId) {
                      const curRoutine = currentList.find((r) => r.id === focusedExerciseId);
                      if (curRoutine) {
                        const match = MASTER_EXERCISE_CATALOG.find(
                          (m) => m.name.toLowerCase() === curRoutine.name.toLowerCase()
                        );
                        const reqEquip = curRoutine.required_equipment || match?.required_equipment;
                        const prof = resolveExerciseEquipmentProfile(
                          { name: curRoutine.name, bench_angle: curRoutine.bench_angle, required_equipment: reqEquip },
                          curRoutine.target_weight_kg,
                          defaultInv
                        );
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
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider shrink-0 transition ${
                    arsenalEquipType === tab.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between flex-wrap gap-1">
              <span>
                Linked Hardware:{" "}
                <strong className="text-slate-200">
                  {arsenalEquipType === "dumbbells"
                    ? `2×${defaultInv.dumbbell_handle_weight_kg || 2.0}kg Handles (Dual Mirrored)`
                    : arsenalEquipType === "dumbbells_single"
                    ? `1×${defaultInv.dumbbell_handle_weight_kg || 2.0}kg Handle (Single Mirrored)`
                    : arsenalEquipType === "barbell"
                    ? `1×${defaultInv.barbell_weight_kg || 7.0}kg Olympic Rod`
                    : arsenalEquipType === "ez_bar"
                    ? `1×${defaultInv.ez_bar_weight_kg || 5.0}kg EZ Rod`
                    : arsenalEquipType === "leg_developer"
                    ? "Single Load Horn"
                    : "Carabiner Cable Link"}
                </strong>
              </span>
              <span className="text-cyan-400 text-[10px]">
                Plates: {defaultInv.plate_10kg_count ? `${defaultInv.plate_10kg_count}×10kg, ` : ""}
                {defaultInv.plate_5kg_count || 0}×5kg, {defaultInv.plate_2_5kg_count || 0}×2.5kg,{" "}
                {defaultInv.plate_2kg_count || 0}×2kg, {defaultInv.plate_1_25kg_count || 0}×1.25kg,{" "}
                {defaultInv.plate_1kg_count || 0}×1kg
              </span>
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
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                    Math.abs((Number(targetWeightCalc) || 0) - w) < 0.1
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
                      const cur = Number(targetWeightCalc) || 0;
                      const newW = Math.max(0, Math.round((cur - 1.0) * 10) / 10);
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
                      setTargetWeightCalc(e.target.value);
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && focusedExerciseId) {
                        setHasUnsavedChanges(true);
                        setDayRoutines((prev) => ({
                          ...prev,
                          [selectedDay]: prev[selectedDay].map((routine) =>
                            routine.id === focusedExerciseId
                              ? { ...routine, target_weight_kg: val }
                              : routine
                          ),
                        }));
                      }
                    }}
                    onBlur={() => {
                      const val = parseFloat(String(targetWeightCalc));
                      if (isNaN(val) || targetWeightCalc === "") {
                        handleArsenalWeightChange(14.0);
                      } else {
                        handleArsenalWeightChange(Math.min(120, Math.max(0, Math.round(val * 10) / 10)));
                      }
                    }}
                    className="w-16 px-2 py-1 text-center font-mono font-bold text-sm text-cyan-300 bg-slate-900 border border-cyan-500/40 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = Number(targetWeightCalc) || 0;
                      const newW = Math.round((cur + 1.0) * 10) / 10;
                      handleArsenalWeightChange(newW);
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-bold flex items-center justify-center transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 font-bold ml-1">kg</span>
                </div>
              </div>
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

      {/* Create New Exercise Modal */}
      {isCreatingNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg solo-notification-modal rounded-xl p-5 sm:p-6 shadow-2xl relative space-y-4 my-auto text-white font-hud">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-solo font-bold text-cyan-300 uppercase tracking-widest block mana-text-glow">
                  [ SYSTEM FORGE // NEW MOVEMENT ]
                </span>
                <h3 className="text-base font-bold text-white font-solo">Create Custom Exercise for {selectedDay}</h3>
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
                    onChange={(e) => handleMuscleChange(e.target.value)}
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

              {/* Equipment Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Required Equipment
                </label>
                <select
                  value={newExEquipment}
                  onChange={(e) => {
                    const eq = e.target.value as ExerciseRequiredEquipment;
                    setNewExEquipment(eq);
                    if (eq === "bodyweight") setNewExWeight(0);
                    else if (eq === "barbell" || eq === "bench_and_barbell") setNewExWeight(defaultInv.barbell_weight_kg || 10.0);
                    else if (eq === "ez_bar") setNewExWeight(defaultInv.ez_bar_weight_kg || 7.0);
                    else if (newExWeight === 0) setNewExWeight(10.0);
                  }}
                  className="w-full rounded-xl bg-[#070b14] border border-cyan-500/30 px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 font-hud"
                >
                  <option value="dumbbells">Dumbbells (Pair)</option>
                  <option value="bodyweight">Bodyweight / Free-Hand Calisthenics</option>
                  <option value="barbell">Barbell</option>
                  <option value="bench_and_barbell">Bench & Barbell</option>
                  <option value="ez_bar">EZ-Curl Bar</option>
                  <option value="cable_pulley">Cable Pulley</option>
                  <option value="leg_developer">Leg Developer Attachment</option>
                </select>
              </div>

              {/* Sets, Reps, Weight with Intelligent Rank Ceilings */}
              {(() => {
                const modalCeiling = getRepCeilingForRankAndSets(playerRank, Number(newExSets) || 1);
                return (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase">Sets (Max {maxAllowedSets})</label>
                        <div className="flex items-center bg-[#070b14] border border-cyan-500/30 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("light");
                              const next = Math.max(1, (Number(newExSets) || 1) - 1);
                              setNewExSets(next);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={maxAllowedSets}
                            value={newExSets}
                            onChange={(e) => setNewExSets(e.target.value)}
                            onBlur={() => {
                              const val = Math.min(maxAllowedSets, Math.max(1, Number(newExSets) || 1));
                              setNewExSets(val);
                              const ceil = getRepCeilingForRankAndSets(playerRank, val);
                              if (Number(newExReps) > ceil.maxReps) {
                                setNewExReps(ceil.maxReps);
                              }
                            }}
                            className="w-full text-center bg-transparent py-1 text-white text-xs font-mono font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("light");
                              const next = Math.min(maxAllowedSets, (Number(newExSets) || 1) + 1);
                              setNewExSets(next);
                              const ceil = getRepCeilingForRankAndSets(playerRank, next);
                              if (Number(newExReps) > ceil.maxReps) {
                                setNewExReps(ceil.maxReps);
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase">
                          Reps {modalCeiling.isRestricted && <span className="text-cyan-400 font-bold">(Max {modalCeiling.maxReps})</span>}
                        </label>
                        <div className="flex items-center bg-[#070b14] border border-cyan-500/30 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("light");
                              const next = Math.max(1, (Number(newExReps) || 1) - 1);
                              setNewExReps(next);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={modalCeiling.maxReps}
                            value={newExReps}
                            onChange={(e) => setNewExReps(e.target.value)}
                            onBlur={() => {
                              const val = Math.min(modalCeiling.maxReps, Math.max(1, Number(newExReps) || 1));
                              setNewExReps(val);
                            }}
                            className="w-full text-center bg-transparent py-1 text-white text-xs font-mono font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("light");
                              const next = Math.min(modalCeiling.maxReps, (Number(newExReps) || 1) + 1);
                              setNewExReps(next);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase">
                          {newExEquipment === "bodyweight" ? "Resistance" : "Weight (kg)"}
                        </label>
                        {newExEquipment === "bodyweight" ? (
                          <div className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-emerald-400 text-xs font-mono font-bold text-center">
                            BODYWEIGHT
                          </div>
                        ) : (
                          <div className="flex items-center bg-[#070b14] border border-cyan-500/30 rounded-xl p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic("light");
                                const next = Math.max(0, Math.round(((Number(newExWeight) || 0) - 1.0) * 10) / 10);
                                setNewExWeight(next);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              step="0.5"
                              value={newExWeight}
                              onChange={(e) => setNewExWeight(e.target.value)}
                              onBlur={() => {
                                const val = Math.min(120, Math.max(0, Math.round((Number(newExWeight) || 0) * 10) / 10));
                                setNewExWeight(val);
                              }}
                              className="w-full text-center bg-transparent py-1 text-white text-xs font-mono font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic("light");
                                const next = Math.min(120, Math.round(((Number(newExWeight) || 0) + 1.0) * 10) / 10);
                                setNewExWeight(next);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {modalCeiling.isRestricted && (
                      <p className="text-[10px] font-mono text-cyan-400 italic">
                        * {modalCeiling.reason}
                      </p>
                    )}
                  </div>
                );
              })()}

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
      {/* Exercise Codex Modal (Demo steps, form cues, biomechanics, unlock criteria) */}
      <ExerciseCodexModal
        exercise={selectedExerciseForModal}
        isOpen={!!selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
        isUnlocked={
          selectedExerciseForModal
            ? isExerciseUnlocked(selectedExerciseForModal, playerLevel, playerRank)
            : true
        }
        playerLevel={playerLevel}
        playerRank={playerRank}
        equipment={defaultInv}
        initialWeight={selectedExerciseWeight}
        onLaunchIndividual={(ex, weight) => {
          setSelectedExerciseForModal(null);
          const routine = currentList.find(
            (r) => r.name.toLowerCase() === ex.name.toLowerCase()
          );
          if (routine) {
            handleLaunchSoloTrial({
              ...routine,
              target_weight_kg: weight !== undefined ? weight : routine.target_weight_kg,
            });
          }
        }}
      />

      {/* Mobile Floating Sticky Save Pill */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-20 right-4 z-40 md:hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSavePlan}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono font-black text-xs uppercase shadow-[0_0_20px_rgba(0,229,255,0.4)] border border-cyan-400 flex items-center gap-2 active:scale-95 transition"
          >
            <Save className="w-4 h-4 text-cyan-200" />
            <span>{isSaving ? "SAVING..." : "SAVE ROUTINE"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
