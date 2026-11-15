"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store";
import { startWorkoutSession } from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import { calculateDumbbellPlates } from "@/lib/calculations/gym";
import { MASTER_EXERCISE_CATALOG, MasterExercise } from "@/lib/data/exerciseCatalog";
import { getCustomPlanAction, saveCustomPlanAction } from "@/server/actions/player.actions";
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
];

const BENCH_ANGLES = [
  "Flat",
  "Incline 15°",
  "Incline 30°",
  "Incline 45°",
  "Incline 60°",
  "Incline 75°",
  "Seated 90°",
  "Decline",
  "Floor / Standing",
];

const RPG_ATTRIBUTES: { key: AttributeType; label: string; color: string }[] = [
  { key: "strength", label: "Strength (STR)", color: "text-red-400 border-red-500/40 bg-red-950/40" },
  { key: "discipline", label: "Discipline (DIS)", color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40" },
  { key: "endurance", label: "Endurance (END)", color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40" },
  { key: "agility", label: "Agility (AGI)", color: "text-amber-400 border-amber-500/40 bg-amber-950/40" },
  { key: "vitality", label: "Vitality (VIT)", color: "text-blue-400 border-blue-500/40 bg-blue-950/40" },
  { key: "mentality", label: "Mentality (MEN)", color: "text-purple-400 border-purple-500/40 bg-purple-950/40" },
  { key: "intelligence", label: "Intelligence (INT)", color: "text-indigo-400 border-indigo-500/40 bg-indigo-950/40" },
];

export function CustomPlanManager({ equipment }: CustomPlanManagerProps) {
  const dispatch = useAppDispatch();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");
  const [dayRoutines, setDayRoutines] = useState<Record<string, CustomExerciseRoutine[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [isAddingFromCatalog, setIsAddingFromCatalog] = useState(false);
  const [isCreatingNewModal, setIsCreatingNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Custom Exercise Form State
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("");
  const [newExAngle, setNewExAngle] = useState("Flat");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(15.0);
  const [newExRest, setNewExRest] = useState(60);
  const [newExSelectedAttrs, setNewExSelectedAttrs] = useState<AttributeType[]>(["strength", "discipline"]);

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

  // Cross-device load from Supabase (ZERO localStorage)
  useEffect(() => {
    getCustomPlanAction()
      .then((saved) => {
        if (saved && typeof saved === "object") {
          setDayRoutines((prev) => ({ ...prev, ...saved }));
        }
      })
      .catch((err) => console.error("Failed to load custom plan from Supabase:", err));
  }, []);

  const currentList = dayRoutines[selectedDay] || [];

  const handleSavePlan = async () => {
    triggerHaptic("heavy");
    setIsSaving(true);
    try {
      await saveCustomPlanAction(dayRoutines);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save custom plan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFromCatalog = (master: MasterExercise) => {
    triggerHaptic("medium");
    const newRoutine: CustomExerciseRoutine = {
      id: `${master.id}-${Date.now()}`,
      name: master.name,
      target_muscle: master.target_muscle,
      bench_angle: master.bench_angle,
      sets: master.default_sets || 3,
      reps_target: master.default_reps_min || 10,
      target_weight_kg: 15.0,
      rest_seconds: master.default_rest_seconds || 60,
      primary_attribute: "strength",
      attributes_yield: { strength: 0.35, discipline: 0.20 },
    };

    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newRoutine],
    }));
    setIsAddingFromCatalog(false);
    setSearchQuery("");
  };

  const handleCreateBrandNewExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName || !newExMuscle) return;

    triggerHaptic("heavy");

    const yields: Partial<Record<AttributeType, number>> = {};
    for (const attr of newExSelectedAttrs) {
      yields[attr] = 0.25;
    }

    const brandNewRoutine: CustomExerciseRoutine = {
      id: `custom-created-${Date.now()}`,
      name: newExName.trim(),
      target_muscle: newExMuscle.trim(),
      bench_angle: newExAngle,
      sets: Number(newExSets) || 3,
      reps_target: Number(newExReps) || 10,
      target_weight_kg: Number(newExWeight) || 15.0,
      rest_seconds: Number(newExRest) || 60,
      primary_attribute: newExSelectedAttrs[0] || "strength",
      attributes_yield: yields,
      is_custom_created: true,
    };

    setDayRoutines((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), brandNewRoutine],
    }));

    // Reset Form
    setNewExName("");
    setNewExMuscle("");
    setNewExAngle("Flat");
    setNewExSets(3);
    setNewExReps(10);
    setNewExWeight(15.0);
    setNewExRest(60);
    setNewExSelectedAttrs(["strength", "discipline"]);
    setIsCreatingNewModal(false);
  };

  const handleToggleAttribute = (attr: AttributeType) => {
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

  const handleUpdateRoutine = (
    index: number,
    field: keyof CustomExerciseRoutine,
    value: any
  ) => {
    setDayRoutines((prev) => {
      const updated = [...prev[selectedDay]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [selectedDay]: updated };
    });
  };

  const handleLaunchCustomSession = () => {
    if (currentList.length === 0) return;
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
        phase: "core" as const,
      };
    });

    dispatch(
      startWorkoutSession({
        dayName: selectedDay,
        title: `Custom ${selectedDay}: Personal Training Plan`,
        targetMuscles: currentList.map((r) => r.target_muscle).slice(0, 3).join(", "),
        skippingTarget: 100,
        exercises: sessionExercises,
      })
    );
  };

  const filteredCatalog = MASTER_EXERCISE_CATALOG.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.target_muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DEFAULT_DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = dayRoutines[day]?.length || 0;

          return (
            <button
              key={day}
              onClick={() => {
                triggerHaptic("light");
                setSelectedDay(day);
                setIsAddingFromCatalog(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-950/50"
                  : "bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <span>{day.slice(0, 3).toUpperCase()}</span>
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-500/30 text-[10px] text-purple-300 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Overview Header & Actions */}
      <div className="hunter-panel rounded-3xl border border-purple-500/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 uppercase tracking-widest">
                CUSTOM FORGE // {selectedDay.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentList.length} Custom Movements Configured
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mana-text-glow">
              {selectedDay} Hunter Routine
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Create brand-new exercises or select from the codex. All changes persist across all devices.
            </p>
          </div>

          {/* Save & Launch Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePlan}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                savedSuccess
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                  : "bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? "PERSISTED TO CLOUD ✓" : isSaving ? "SAVING..." : "SAVE ROUTINE"}</span>
            </button>

            <button
              type="button"
              disabled={currentList.length === 0}
              onClick={handleLaunchCustomSession}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-black uppercase shadow-lg shadow-purple-950 transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START CUSTOM SESSION</span>
            </button>
          </div>
        </div>

        {/* Action Buttons to Add Exercises */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setIsCreatingNewModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-bold font-mono transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE BRAND-NEW MOVEMENT &amp; ASSIGN ATTRIBUTES</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setIsAddingFromCatalog(!isAddingFromCatalog);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>PICK FROM 134-MOVEMENT CODEX</span>
          </button>
        </div>
      </div>

      {/* Catalog Picker Drawer */}
      {isAddingFromCatalog && (
        <div className="hunter-panel rounded-3xl border border-cyan-500/40 p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              SELECT MOVEMENT FROM 134-MOVEMENT MASTER CODEX
            </span>
            <button
              onClick={() => setIsAddingFromCatalog(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exercise name or muscle (e.g. Chest, Incline, Biceps)..."
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {filteredCatalog.slice(0, 16).map((master) => (
              <button
                key={master.id}
                type="button"
                onClick={() => handleAddFromCatalog(master)}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 block">
                    {master.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {master.target_muscle} • Bench: {master.bench_angle}
                  </span>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BRAND-NEW MOVEMENT CREATOR MODAL */}
      {isCreatingNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg hunter-panel rounded-3xl border border-purple-500/60 p-6 sm:p-7 shadow-2xl relative space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  CUSTOM FORGE // PROTOCOL CREATOR
                </span>
                <h3 className="text-lg font-black text-white">Create Brand-New Movement</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBrandNewExercise} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Incline Preacher Dumbbell Curl"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Target Muscle Group
                  </label>
                  <input
                    type="text"
                    required
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    placeholder="e.g. Biceps & Brachialis"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    20-in-1 Bench Position
                  </label>
                  <select
                    value={newExAngle}
                    onChange={(e) => setNewExAngle(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    {BENCH_ANGLES.map((angle) => (
                      <option key={angle} value={angle}>
                        {angle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newExSets}
                    onChange={(e) => setNewExSets(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newExReps}
                    onChange={(e) => setNewExReps(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Rest (s)
                  </label>
                  <input
                    type="number"
                    step={15}
                    min={15}
                    value={newExRest}
                    onChange={(e) => setNewExRest(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-mono text-center"
                  />
                </div>
              </div>

              {/* RPG ATTRIBUTE ALLOCATION SELECTOR */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  Select Awarded RPG Attributes (Multi-Select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {RPG_ATTRIBUTES.map((attr) => {
                    const isSelected = newExSelectedAttrs.includes(attr.key);
                    return (
                      <button
                        key={attr.key}
                        type="button"
                        onClick={() => handleToggleAttribute(attr.key)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold transition border ${
                          isSelected
                            ? attr.color + " shadow"
                            : "bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {attr.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase shadow-lg shadow-purple-950"
                >
                  FORGE MOVEMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routine Exercise List for Today */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-slate-800 text-center space-y-2">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Custom Movements For {selectedDay}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click <strong>"Create Brand-New Movement"</strong> or <strong>"Pick From Codex"</strong> to forge your personalized training split.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((routine, idx) => {
              const solver = calculateDumbbellPlates(routine.target_weight_kg, defaultInv, true);

              return (
                <div
                  key={routine.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-mono font-black text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-white block">{routine.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {routine.target_muscle} • Bench: {routine.bench_angle || "Flat"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attribute Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {routine.attributes_yield ? (
                      Object.entries(routine.attributes_yield).map(([attr, val]) => (
                        <span
                          key={attr}
                          className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase"
                        >
                          {attr.slice(0, 3)} +{Number(val).toFixed(2)}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold">
                        STR +0.35
                      </span>
                    )}
                  </div>

                  {/* In-Line Quick Tweaks (Sets, Reps, Weight) */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px] uppercase">Sets</span>
                      <span className="text-white font-bold">{routine.sets} Sets</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px] uppercase">Reps</span>
                      <span className="text-white font-bold">{routine.reps_target} Reps</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px] uppercase">Weight</span>
                      <span className="text-purple-300 font-bold">{routine.target_weight_kg} kg</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500">Plate Solver: </span>
                    <span>{solver.summaryString}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
