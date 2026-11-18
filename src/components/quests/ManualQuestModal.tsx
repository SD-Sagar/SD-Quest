"use client";

import { useState } from "react";
import { createQuestAction } from "@/server/actions/quest.actions";
import { triggerHaptic } from "@/lib/utils";
import { calculateFairQuestXp, calculateFairStatYield } from "@/lib/calculations/rpg";
import { Plus, X, Shield, Clock, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { QuestCategory, QuestClassification, HunterRank, AttributeType } from "@/types";

interface ManualQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_ATTRIBUTES: AttributeType[] = [
  "strength",
  "endurance",
  "intelligence",
  "discipline",
  "mentality",
  "agility",
  "vitality",
];

const DAYS_OF_WEEK = [
  { day: "Sun", val: 0 },
  { day: "Mon", val: 1 },
  { day: "Tue", val: 2 },
  { day: "Wed", val: 3 },
  { day: "Thu", val: 4 },
  { day: "Fri", val: 5 },
  { day: "Sat", val: 6 },
];

export function ManualQuestModal({ isOpen, onClose }: ManualQuestModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("career");
  const [classification, setClassification] = useState<QuestClassification>("scheduled");

  // Date and Timing state
  const [startDate, setStartDate] = useState(todayStr);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(todayStr);
  const [deadlineTime, setDeadlineTime] = useState("18:00");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "weekdays">("none");
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday default for weekly

  const [durationMinutes, setDurationMinutes] = useState(45);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [difficulty, setDifficulty] = useState<HunterRank>("Recruit");
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>([
    "discipline",
    "intelligence",
  ]);
  const [isFun, setIsFun] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleAttribute = (attr: AttributeType) => {
    triggerHaptic("light");
    if (selectedAttributes.includes(attr)) {
      if (selectedAttributes.length > 1) {
        setSelectedAttributes(selectedAttributes.filter((a) => a !== attr));
      }
    } else {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const toggleDay = (dayVal: number) => {
    triggerHaptic("light");
    if (selectedDays.includes(dayVal)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayVal));
      }
    } else {
      setSelectedDays([...selectedDays, dayVal].sort());
    }
  };

  const handleQuickPreset = (preset: "today" | "tomorrow" | "weekend") => {
    triggerHaptic("light");
    const d = new Date();
    if (preset === "tomorrow") {
      d.setDate(d.getDate() + 1);
    } else if (preset === "weekend") {
      const day = d.getDay();
      const diff = 6 - day; // Next Saturday
      d.setDate(d.getDate() + (diff <= 0 ? diff + 7 : diff));
    }
    const iso = d.toISOString().split("T")[0];
    setStartDate(iso);
    setDeadlineDate(iso);
    setHasDeadline(true);
    setRecurrence("none");
    setClassification("scheduled");
  };

  const calculatedRewards = calculateFairStatYield(durationMinutes, difficulty, selectedAttributes);
  const calculatedXp = calculateFairQuestXp(durationMinutes, difficulty, priority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic("heavy");
    setLoading(true);

    try {
      const fullDeadline = hasDeadline ? `${deadlineDate}T${deadlineTime}:00` : null;

      await createQuestAction({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        classification,
        start_date: startDate,
        deadline: fullDeadline,
        estimated_duration_minutes: durationMinutes,
        recurrence,
        recurrence_days:
          recurrence === "daily"
            ? [0, 1, 2, 3, 4, 5, 6]
            : recurrence === "weekdays"
            ? [1, 2, 3, 4, 5]
            : recurrence === "weekly"
            ? selectedDays
            : [],
        priority,
        difficulty,
        attribute_rewards: calculatedRewards,
        xp_reward: calculatedXp,
        is_manual: true,
        is_fun: isFun,
      });

      onClose();
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl hunter-panel border border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4 relative text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">MANUAL QUEST FORGE</h2>
              <p className="text-xs text-slate-400">
                Date-based objective, scheduling &amp; transparent rewards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Quest Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architect PostgreSQL Schema & Multi-Tenancy"
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-semibold"
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
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="career">Career / Work</option>
                <option value="fitness">Fitness / Health</option>
                <option value="routine">Routine / Duty</option>
                <option value="education">Education / Study</option>
                <option value="household">Household</option>
                <option value="personal">Personal Life</option>
                <option value="social">Social Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Classification
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as QuestClassification)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="scheduled">Scheduled Quest</option>
                <option value="temporary">Temporary One-Off</option>
                <option value="permanent">Permanent Habit</option>
              </select>
            </div>
          </div>

          {/* DATE & CALENDAR SCHEDULING CONTROLS */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Calendar className="w-4 h-4" />
                DATE &amp; SCHEDULING CONTROLS
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickPreset("today")}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset("tomorrow")}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset("weekend")}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white"
                >
                  Weekend
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="none">One-Time Date Quest</option>
                  <option value="daily">Daily Habit (Every day)</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekly">Weekly on Specific Days</option>
                </select>
              </div>
            </div>

            {/* Weekly Days Selector if Weekly */}
            {recurrence === "weekly" && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Repeat On Days of Week:
                </span>
                <div className="flex gap-1.5">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      type="button"
                      key={d.val}
                      onClick={() => toggleDay(d.val)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition ${
                        selectedDays.includes(d.val)
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/60"
                          : "bg-slate-950 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={(e) => setHasDeadline(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="font-semibold">Set Target Deadline / Due Time</span>
              </label>

              {hasDeadline && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration & Difficulty */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Duration (Min)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 15)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-2 py-2 text-xs text-white capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-2 py-2 text-xs text-white capitalize"
              >
                <option value="Recruit">Recruit</option>
                <option value="Warrior">Warrior</option>
                <option value="Vanguard">Vanguard</option>
                <option value="Spartan">Spartan</option>
              </select>
            </div>
          </div>

          {/* Influenced Attributes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Attributes Yielded
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ATTRIBUTES.map((attr) => (
                <button
                  type="button"
                  key={attr}
                  onClick={() => toggleAttribute(attr)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono capitalize transition ${
                    selectedAttributes.includes(attr)
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  +{attr}
                </button>
              ))}
            </div>
          </div>

          {/* Fun & Recreational Protocol Toggle */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">🎮</span>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                    INCLUDE FUN / RECREATIONAL PROTOCOL
                  </span>
                  <span className="text-[10.5px] text-slate-400 block font-hud">
                    {isFun
                      ? "Recreational task: Fatigue is nearly null; accumulates 70% slower for linked stats."
                      : "Standard task: Normal fatigue accumulation based on exertion."}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setIsFun(!isFun);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                  isFun
                    ? "bg-purple-500/25 text-purple-300 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "bg-slate-950 text-slate-400 border border-slate-700 hover:text-white"
                }`}
              >
                <span>{isFun ? "FUN ENABLED" : "STANDARD"}</span>
              </button>
            </div>
          </div>

          {/* Live Rewards Forecast */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                System Output
              </span>
              <span className="font-bold text-cyan-400 font-mono text-sm">
                +{calculatedXp} Player XP
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">
                Stat Rewards
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {Object.entries(calculatedRewards)
                  .map(([k, v]) => `+${v} ${k.slice(0, 3)}`)
                  .join(" • ")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 disabled:opacity-50"
          >
            {loading ? "ENCRYPTING ONTO SYSTEM..." : "FORGE QUEST ONTO CALENDAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
