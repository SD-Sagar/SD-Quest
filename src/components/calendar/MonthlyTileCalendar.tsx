"use client";

import { useState, useEffect } from "react";
import { triggerHaptic } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Dumbbell,
  Layers,
  Zap,
} from "lucide-react";
import { WorkoutSession, Quest } from "@/types";

interface MonthlyTileCalendarProps {
  sessions: WorkoutSession[];
  quests?: Quest[];
}

function getFormattedDuration(s: WorkoutSession): string {
  const durationMatch = s.notes?.match(/\[DURATION:(\d+)s\]/);
  if (durationMatch) {
    const totalSecs = parseInt(durationMatch[1], 10);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  }
  return `${s.duration_minutes}m`;
}

function getLocalDateString(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_SPLIT_HINTS: Record<number, string> = {
  0: "REST",
  1: "CHEST",
  2: "BACK",
  3: "LEGS",
  4: "SHOULDERS",
  5: "ARMS",
  6: "FULL BODY",
};

export function MonthlyTileCalendar({ sessions, quests = [] }: MonthlyTileCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getLocalDateString(new Date()));
  const [todayStr, setTodayStr] = useState<string>(() => getLocalDateString(new Date()));
  const [isTelemetryCollapsed, setIsTelemetryCollapsed] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    const str = getLocalDateString(now);
    setSelectedDateStr(str);
    setTodayStr(str);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 to 11

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    triggerHaptic("light");
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    triggerHaptic("light");
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  // Map sessions by local date
  const sessionsByDate: Record<string, WorkoutSession[]> = {};
  for (const s of sessions) {
    const raw = s.completed_at || s.started_at;
    if (raw) {
      const d = getLocalDateString(raw);
      if (!sessionsByDate[d]) sessionsByDate[d] = [];
      sessionsByDate[d].push(s);
    }
  }

  // Map quests by deadline date, start date, or recurring multi-day calendar attachment
  const questsByDate: Record<string, Quest[]> = {};

  const isQuestCompletedOnDate = (q: Quest, targetDateStr: string) => {
    const isRecurring = Boolean(q.recurrence && q.recurrence !== "none");
    if (!isRecurring) {
      return q.status === "completed";
    }
    const doneDate =
      q.last_completed_date ||
      (q.completed_at ? (q.completed_at.includes("T") ? getLocalDateString(q.completed_at) : q.completed_at.split("T")[0]) : null);
    return doneDate === targetDateStr;
  };

  for (const q of quests) {
    const isRecurring = Boolean(q.recurrence && q.recurrence !== "none");
    const completedDate =
      q.last_completed_date ||
      (q.completed_at ? (q.completed_at.includes("T") ? getLocalDateString(q.completed_at) : q.completed_at.split("T")[0]) : null);

    // If completed on a specific day, ensure it is recorded on that date
    if (completedDate) {
      if (!questsByDate[completedDate]) questsByDate[completedDate] = [];
      if (!questsByDate[completedDate].some((existing) => existing.id === q.id)) {
        questsByDate[completedDate].push(q);
      }
    }

    if (isRecurring) {
      const qStart = q.start_date || "2000-01-01";
      const qEnd = q.deadline ? (q.deadline.includes("T") ? q.deadline.split("T")[0] : q.deadline) : "2099-12-31";

      // Attach to every scheduled day within the viewed month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dow = new Date(year, month, day).getDay();

        if (dateStr < qStart || dateStr > qEnd) continue;

        let isScheduled = false;
        if (q.recurrence === "daily") {
          isScheduled = true;
        } else if (q.recurrence === "weekdays") {
          isScheduled = dow >= 1 && dow <= 5;
        } else if (q.recurrence === "weekly") {
          if (Array.isArray(q.recurrence_days) && q.recurrence_days.length > 0) {
            isScheduled = q.recurrence_days.includes(dow);
          } else if (q.start_date) {
            isScheduled = new Date(q.start_date + "T00:00:00").getDay() === dow;
          }
        }

        if (isScheduled) {
          if (!questsByDate[dateStr]) questsByDate[dateStr] = [];
          if (!questsByDate[dateStr].some((existing) => existing.id === q.id)) {
            questsByDate[dateStr].push(q);
          }
        }
      }
    } else {
      const raw = q.deadline || q.start_date;
      if (raw) {
        const d = raw.includes("T") ? getLocalDateString(raw) : raw;
        if (!questsByDate[d]) questsByDate[d] = [];
        if (!questsByDate[d].some((existing) => existing.id === q.id)) {
          questsByDate[d].push(q);
        }
      }
    }
  }

  // Selected date details
  const selectedSessions = sessionsByDate[selectedDateStr] || [];
  const selectedQuests = questsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calendar Header with Navigation */}
      <div className="hunter-panel rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 border border-slate-800 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight font-mono truncate">
                {monthName} {year}
              </h2>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden xs:inline block truncate">
                Full-Cell Monthly Tile Ledger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                const now = new Date();
                setCurrentDate(now);
                setSelectedDateStr(getLocalDateString(now));
              }}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono text-[9px] sm:text-[10px] font-bold hover:bg-cyan-900/40 transition"
              title="Jump to Today"
            >
              TODAY
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
              aria-label="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <span key={day}>
              <span className="inline sm:hidden">{["S", "M", "T", "W", "T", "F", "S"][idx]}</span>
              <span className="hidden sm:inline">{day}</span>
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {/* Leading empty slots */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-13 sm:h-16 rounded-lg sm:rounded-xl bg-slate-950/30 opacity-20" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dayOfWeek = new Date(year, month, dayNum).getDay();
            const isRest = dayOfWeek === 0; // Sunday
            const daySessions = sessionsByDate[dateStr] || [];
            const dayQuests = questsByDate[dateStr] || [];
            const completedSession = daySessions.find((s) => s.status === "completed");
            const hasCompleted = Boolean(completedSession);
            const completedQuestsOnDay = dayQuests.filter((q) => isQuestCompletedOnDate(q, dateStr));
            const hasDueQuests = dayQuests.length > 0;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;
            const splitHint = DEFAULT_SPLIT_HINTS[dayOfWeek] || "";

            // User Rule: Streak qualified if Main Quest completed AND >= 1 other challenge completed.
            // Full white fill if ALL challenges completed on that day.
            const hasAllCompleted = hasCompleted && completedQuestsOnDay.length >= 2;
            const hasStreakQualified = hasCompleted && (completedQuestsOnDay.length >= 1 || isRest);

            let statusBg = "bg-slate-900/40 border-slate-800/80";
            let indicatorColor = "bg-slate-700";

            if (hasAllCompleted) {
              // Solid luminous white fill
              statusBg = "bg-white text-black font-black border-white shadow-[0_0_18px_rgba(255,255,255,0.7)]";
              indicatorColor = "bg-black";
            } else if (hasStreakQualified || hasCompleted) {
              // Mild translucent white fill
              statusBg = "bg-white/15 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.18)]";
              indicatorColor = "bg-white/90 shadow-[0_0_8px_#ffffff]";
            } else if (hasDueQuests) {
              statusBg = "bg-cyan-950/30 border-cyan-500/30";
              indicatorColor = "bg-cyan-400";
            } else if (isRest) {
              statusBg = "bg-slate-900/60 border-slate-800/60";
              indicatorColor = "bg-slate-600";
            }

            return (
              <button
                key={dateStr}
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedDateStr(dateStr);
                }}
                className={`h-13 sm:h-16 rounded-lg sm:rounded-xl border p-1 sm:p-1.5 flex flex-col justify-between transition-all overflow-hidden ${statusBg} ${
                  isToday ? "ring-2 ring-cyan-400" : ""
                } ${isSelected ? "border-cyan-400 scale-[1.03] z-10" : ""}`}
              >
                <div className="flex justify-between items-center w-full leading-none">
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono font-bold ${
                      hasAllCompleted
                        ? "text-black font-black"
                        : isToday
                        ? "text-cyan-400"
                        : isSelected
                        ? "text-white"
                        : "text-slate-300"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday ? (
                    <>
                      <span className={`hidden sm:inline text-[7.5px] font-mono font-black uppercase px-1 rounded animate-pulse ${hasAllCompleted ? "bg-black text-white" : "bg-cyan-950/80 text-cyan-300 border border-cyan-400"}`}>
                        TODAY
                      </span>
                      <span className={`sm:hidden w-1.5 h-1.5 rounded-full ${hasAllCompleted ? "bg-black" : "bg-cyan-400 shadow-[0_0_6px_#00e5ff]"} animate-pulse`} />
                    </>
                  ) : (
                    <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${indicatorColor}`} />
                  )}
                </div>

                <div className="text-[7px] sm:text-[8.5px] font-mono truncate text-left w-full space-y-0.5 leading-tight">
                  {hasAllCompleted ? (
                    <div className="truncate text-black">
                      <span className="font-black block truncate leading-none">
                        <span className="inline sm:hidden">★ CLEAR</span>
                        <span className="hidden sm:inline">CLEARED ★</span>
                      </span>
                      <span className="text-[6.5px] sm:text-[7.5px] text-slate-800 truncate block uppercase font-bold leading-tight">
                        {completedSession?.split_day ? completedSession.split_day.split(" ")[0] : splitHint}
                      </span>
                    </div>
                  ) : hasStreakQualified || hasCompleted ? (
                    <div className="truncate text-white">
                      <span className="font-bold block truncate text-white leading-none">
                        <span className="inline sm:hidden">{hasStreakQualified ? "STRK" : "DONE"}</span>
                        <span className="hidden sm:inline">{hasStreakQualified ? "STREAK" : "CLEARED"}</span>
                      </span>
                      <span className="text-[6.5px] sm:text-[7.5px] text-slate-300 truncate block uppercase leading-tight">
                        {completedSession?.split_day ? completedSession.split_day.split(" ")[0] : splitHint}
                      </span>
                    </div>
                  ) : (
                    <div className="truncate">
                      {hasDueQuests && (
                        <span className="text-cyan-400 font-semibold block truncate leading-none">
                          <span className="inline sm:hidden">{dayQuests.length}Q</span>
                          <span className="hidden sm:inline">{dayQuests.length} Qst</span>
                        </span>
                      )}
                      <span className={`text-[6.5px] sm:text-[8px] block truncate uppercase leading-tight ${isRest ? "text-slate-500 font-bold" : "text-slate-500/80"}`}>
                        {splitHint}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Telemetry Ledger (Collapsible / Expandable) */}
      <div className="solo-frame rounded-2xl p-3 sm:p-5 space-y-3 font-hud">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/20 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-solo font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
              <span>TELEMETRY: {selectedDateStr}</span>
              {selectedDateStr === todayStr && (
                <span className="text-cyan-400 font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/50">
                  TODAY
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-[10px] font-mono text-slate-400">
              {selectedSessions.length} SESSIONS • {selectedQuests.length} QUESTS
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setIsTelemetryCollapsed(!isTelemetryCollapsed);
              }}
              className="solo-btn-secondary py-1 px-2 text-[9px] sm:text-[10px] flex items-center gap-1 shrink-0"
            >
              <span>{isTelemetryCollapsed ? "EXPAND" : "COLLAPSE"}</span>
              {isTelemetryCollapsed ? (
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              ) : (
                <ChevronUp className="w-3 h-3 text-cyan-400" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsed State Summary Badge */}
        {isTelemetryCollapsed ? (
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
            <span className="text-slate-300">
              Total Volume Moved:{" "}
              <strong className="text-cyan-400">
                {selectedSessions
                  .reduce((acc, s) => acc + (s.total_tonnage_kg || 0), 0)
                  .toLocaleString()}{" "}
                KG
              </strong>
            </span>
            <span className="text-slate-400 text-[10px] sm:text-[11px]">
              {selectedSessions.length} Workouts • {selectedQuests.length} Quests
            </span>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Workout Sessions on this Date */}
            <div className="space-y-2">
              <span className="text-[10px] font-solo font-bold text-slate-300 uppercase tracking-wider block">
                ◆ WORKOUT PERFORMANCE ({selectedSessions.length})
              </span>
              {selectedSessions.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-1">
                  No completed workout recorded on this date.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {selectedSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-xs font-mono hover:border-cyan-400/50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white block font-solo text-xs truncate">{s.title}</span>
                        <span className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5 block font-hud">
                          Duration: {getFormattedDuration(s)} • ~{s.calories_burned || 0} kcal • Skips: {s.skipping_completed} /{" "}
                          {s.skipping_target}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-bold font-mono text-xs sm:text-sm self-end sm:self-auto shrink-0">
                        {s.total_tonnage_kg.toLocaleString()} KG
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {selectedSessions.length > 0 && (
                <p className="text-[9px] text-slate-500 font-mono italic text-center pt-0.5">
                  *Calorie telemetry calculated using 2024 Adult Compendium of Physical Activities MET classifications.
                </p>
              )}
            </div>

            {/* Scheduled Quests on this Date */}
            <div className="space-y-2 pt-2 border-t border-cyan-500/20">
              <span className="text-[10px] font-solo font-bold text-slate-300 uppercase tracking-wider block">
                ◆ SCHEDULED QUESTS &amp; COMMITMENTS ({selectedQuests.length})
              </span>
              {selectedQuests.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-1">
                  No specific side quests due on this date.
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {selectedQuests.map((q) => {
                    const isDone = isQuestCompletedOnDate(q, selectedDateStr);
                    return (
                      <div
                        key={q.id}
                        className="p-2 sm:p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/20 flex items-center justify-between text-xs font-mono gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className={`font-bold block truncate ${
                              isDone ? "line-through text-slate-500" : "text-white"
                            }`}
                          >
                            {q.title}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 capitalize font-hud block">
                            {q.category} • {q.estimated_duration_minutes}m
                          </span>
                        </div>
                        <span className="text-cyan-300 font-bold font-mono text-[11px] sm:text-xs shrink-0">
                          {isDone ? "✓ COMPLETED" : `+${q.xp_reward} XP`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
