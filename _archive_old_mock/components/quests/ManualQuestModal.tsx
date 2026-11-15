"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store";
import { addManualQuest } from "@/store/slices/questSlice";
import { triggerHaptic } from "@/lib/utils";
import { calculateFairQuestXp, calculateFairStatYield } from "@/lib/calculations/rpg";
import { AttributeType, HunterRank, QuestCategory, QuestClassification, QuestRecurrence } from "@/types";
import { X, Sparkles, Plus, Clock, ShieldCheck } from "lucide-react";

interface ManualQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: QuestCategory; label: string }[] = [
  { value: "career", label: "Career / Software Dev" },
  { value: "fitness", label: "Fitness & Training" },
  { value: "education", label: "Study & Learning" },
  { value: "routine", label: "Routine & Responsibility" },
  { value: "household", label: "Household / Errands" },
  { value: "social", label: "Social & Morale" },
  { value: "personal", label: "Personal Development" },
];

const ATTRIBUTES: { value: AttributeType; label: string; tag: string }[] = [
  { value: "strength", label: "Strength (STR)", tag: "Gym & loads" },
  { value: "endurance", label: "Endurance (END)", tag: "Stamina & cardio" },
  { value: "intelligence", label: "Intelligence (INT)", tag: "Deep cognitive focus" },
  { value: "discipline", label: "Discipline (DIS)", tag: "Consistency & grit" },
  { value: "mentality", label: "Mentality (MEN)", tag: "Stress resilience" },
  { value: "agility", label: "Agility (AGI)", tag: "Speed & reaction" },
  { value: "vitality", label: "Vitality (VIT)", tag: "Health & recovery" },
];

export function ManualQuestModal({ isOpen, onClose }: ManualQuestModalProps) {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("career");
  const [classification, setClassification] = useState<QuestClassification>("scheduled");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [recurrence, setRecurrence] = useState<QuestRecurrence>("daily");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [difficulty, setDifficulty] = useState<HunterRank>("Recruit");
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>([
    "intelligence",
    "discipline",
  ]);

  if (!isOpen) return null;

  // Live fair stat yield calculation
  const fairYield = calculateFairStatYield(durationMinutes, difficulty, selectedAttributes);
  const fairXp = calculateFairQuestXp(durationMinutes, difficulty, priority);

  const toggleAttribute = (attr: AttributeType) => {
    triggerHaptic("light");
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter((a) => a !== attr));
    } else {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic("success");
    dispatch(
      addManualQuest({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        classification,
        durationMinutes,
        recurrence,
        priority,
        difficulty,
        selectedAttributes,
        customRewards: fairYield,
        customXp: fairXp,
      })
    );

    onClose();
    setTitle("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl hunter-panel border border-slate-700 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                MANUAL QUEST FORGING
              </h2>
              <p className="text-xs text-slate-400">
                Configure duration & attached attributes fairly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Quest Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Build Auth Controller & Write Tests"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Category & Classification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Classification
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as QuestClassification)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="scheduled">Scheduled Quest</option>
                <option value="permanent">Permanent Quest</option>
                <option value="temporary">Temporary Quest</option>
              </select>
            </div>
          </div>

          {/* Duration & Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Duration (Minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <Clock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as QuestRecurrence)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="none">One-off / No repeat</option>
              </select>
            </div>
          </div>

          {/* Difficulty & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as HunterRank)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Recruit">Recruit (Entry)</option>
                <option value="Warrior">Warrior (Intermediate)</option>
                <option value="Vanguard">Vanguard (Advanced)</option>
                <option value="Spartan">Spartan (Elite)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Attached Stats Selector (Core User Requirement) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Attached Attributes (Select to Distribute)
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">
                {selectedAttributes.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ATTRIBUTES.map((attr) => {
                const isSelected = selectedAttributes.includes(attr.value);
                return (
                  <button
                    key={attr.value}
                    type="button"
                    onClick={() => toggleAttribute(attr.value)}
                    className={`text-left p-2 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-cyan-950/50 border-cyan-500/60 text-white shadow-sm shadow-cyan-950"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{attr.label}</span>
                      {isSelected && <span className="text-cyan-400">✓</span>}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {attr.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Fair Calculation HUD Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-bold text-cyan-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                ANTI-EXPLOIT FAIR YIELD PREVIEW
              </span>
              <span className="font-mono text-white font-bold">{fairXp} XP</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {Object.entries(fairYield).length > 0 ? (
                Object.entries(fairYield).map(([stat, pts]) => (
                  <span
                    key={stat}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold"
                  >
                    +{pts} {stat.toUpperCase().slice(0, 3)}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs italic">
                  Select at least one attribute to allocate stats.
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedAttributes.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50 disabled:opacity-50 transition"
            >
              <Sparkles className="w-4 h-4" />
              FORGE QUEST
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

