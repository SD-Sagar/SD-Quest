"use client";

import { useState } from "react";
import { createQuestAction } from "@/server/actions/quest.actions";
import { triggerHaptic } from "@/lib/utils";
import { calculateFairQuestXp, calculateFairStatYield } from "@/lib/calculations/rpg";
import { Plus, Minus, X, Shield, Clock, Calendar, Sparkles, AlertCircle } from "lucide-react";
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
  const [isDateRange, setIsDateRange] = useState(false);
  const [endDate, setEndDate] = useState(todayStr);

  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(todayStr);
  const [deadlineTime, setDeadlineTime] = useState("18:00");

  const [hasTimeWindow, setHasTimeWindow] = useState(false);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");

  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "weekdays">("none");
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday default for weekly

  const [durationMinutes, setDurationMinutes] = useState<number | string>(45);
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
    if (
      category === "meditation" &&
      (attr === "mentality" || attr === "discipline" || attr === "endurance")
    ) {
      return; // Mandatory locked attributes for Meditation Protocol
    }
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

  const handleTimeWindowChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    try {
      const [sh, sm] = newStart.split(":").map(Number);
      const [eh, em] = newEnd.split(":").map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let diff = eh * 60 + em - (sh * 60 + sm);
        if (diff <= 0) diff += 24 * 60;
        setDurationMinutes(diff);
      }
    } catch {
      // ignore
    }
  };

  const numDuration = Math.max(5, Math.min(480, Number(durationMinutes) || 45));
  const calculatedRewards = calculateFairStatYield(numDuration, difficulty, selectedAttributes);
  const calculatedXp = calculateFairQuestXp(numDuration, difficulty, priority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic("heavy");
    setLoading(true);

    try {
      let fullDeadline = null;
      if (hasDeadline || isDateRange || hasTimeWindow) {
        const targetDate = isDateRange ? endDate : deadlineDate;
        const targetTime = hasTimeWindow ? endTime : deadlineTime;
        fullDeadline = `${targetDate}T${targetTime}:00`;
      }

      let questDesc = description.trim();
      if (category === "meditation") {
        const medNote = "[MEDITATION_PROTOCOL]";
        questDesc = questDesc ? `${questDesc} • ${medNote}` : medNote;
      }
      if (hasTimeWindow) {
        const timeNote = `[Time Window: ${startTime} – ${endTime}]`;
        questDesc = questDesc ? `${questDesc} • ${timeNote}` : timeNote;
      }
      if (isDateRange) {
        const dateRangeNote = `[Campaign: ${startDate} to ${endDate}]`;
        questDesc = questDesc ? `${questDesc} • ${dateRangeNote}` : dateRangeNote;
      }

      await createQuestAction({
        title: title.trim(),
        description: questDesc || undefined,
        category,
        classification,
        start_date: startDate,
        deadline: fullDeadline,
        estimated_duration_minutes: numDuration,
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
                onChange={(e) => {
                  const val = e.target.value as QuestCategory;
                  setCategory(val);
                  if (val === "sleep") {
                    setSelectedAttributes(["mentality"]);
                    setDurationMinutes(480);
                  } else if (val === "meditation") {
                    setSelectedAttributes(["mentality", "discipline", "endurance"]);
                    setDurationMinutes(30);
                  }
                }}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="career">Career / Work</option>
                <option value="fitness">Fitness / Health</option>
                <option value="meditation">🧘 Meditation / Mindfulness</option>
                <option value="routine">Routine / Duty</option>
                <option value="education">Education / Study</option>
                <option value="household">Household</option>
                <option value="personal">Personal Life</option>
                <option value="social">Social Activity</option>
                <option value="sleep">🌙 Sleep / Stasis (Routine)</option>
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

            {/* Date Mode Toggle */}
            <div className="flex items-center gap-2 pb-1">
              <button
                type="button"
                onClick={() => setIsDateRange(false)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                  !isDateRange
                    ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                Target Date
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDateRange(true);
                  if (endDate < startDate) setEndDate(startDate);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                  isDateRange
                    ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                Date Range (From – To)
              </button>
            </div>

            {/* Date Inputs */}
            {isDateRange ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    From Date
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
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ) : (
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
            )}

            {/* Time Window (From Time to Time Within Day) */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={hasTimeWindow}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasTimeWindow(checked);
                    if (checked) {
                      handleTimeWindowChange(startTime, endTime);
                    }
                  }}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Fixed Time Window (From Time to Time)
                </span>
                {hasTimeWindow && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                    Auto-calc: {numDuration}m
                  </span>
                )}
              </label>

              {hasTimeWindow && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      From Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleTimeWindowChange(e.target.value, endTime)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      To Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleTimeWindowChange(startTime, e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
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
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-0.5 focus-within:border-cyan-400">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setDurationMinutes((prev) => Math.max(5, (Number(prev) || 45) - 5));
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  onBlur={() => {
                    const val = Math.min(480, Math.max(5, Number(durationMinutes) || 45));
                    setDurationMinutes(val);
                  }}
                  className="w-full text-center bg-transparent py-1 text-xs font-mono font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setDurationMinutes((prev) => Math.min(480, (Number(prev) || 45) + 5));
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
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
            {category === "sleep" ? (
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2">
                <span>🌙</span>
                <span>Circadian Protocol: Strictly locked to <strong>+mentality</strong> only. No other attributes can be assigned.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {category === "meditation" && (
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🧘</span>
                      <span>MEDITATION &amp; MINDFULNESS STASIS</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      • <strong>+mentality, +discipline &amp; +endurance</strong> are mandatory locked attributes.<br/>
                      • Mental fatigue purges at half the speed of pure fun.<br/>
                      • If <strong>+intelligence</strong> is attached: Physical fatigue stays <strong>0%</strong>.<br/>
                      • If physical posture stats (<strong>strength, vitality, agility</strong>) are attached: Non-linear posture fatigue builds to 85% at 30m (Level 1).
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {ALL_ATTRIBUTES.map((attr) => {
                    const isLocked =
                      category === "meditation" &&
                      (attr === "mentality" || attr === "discipline" || attr === "endurance");
                    return (
                      <button
                        type="button"
                        key={attr}
                        onClick={() => toggleAttribute(attr)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono capitalize transition flex items-center gap-1 ${
                          selectedAttributes.includes(attr)
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        } ${isLocked ? "cursor-not-allowed opacity-90 border-cyan-400" : ""}`}
                      >
                        {isLocked && <span className="text-[10px]">🔒</span>}
                        <span>+{attr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
