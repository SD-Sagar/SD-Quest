"use client";

import { useState, useEffect } from "react";
import { triggerHaptic } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  Layers,
} from "lucide-react";
import { WorkoutSession, Quest } from "@/types";

interface MonthlyTileCalendarProps {
  sessions: WorkoutSession[];
  quests?: Quest[];
}

export function MonthlyTileCalendar({ sessions, quests = [] }: MonthlyTileCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date("2026-11-01"));
  const [selectedDateStr, setSelectedDateStr] = useState("2026-11-15");
  const [todayStr, setTodayStr] = useState("2026-11-15");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    const str = now.toISOString().split("T")[0];
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

  // Map sessions by date
  const sessionsByDate: Record<string, WorkoutSession[]> = {};
  for (const s of sessions) {
    const d = s.completed_at ? s.completed_at.split("T")[0] : s.started_at.split("T")[0];
    if (!sessionsByDate[d]) sessionsByDate[d] = [];
    sessionsByDate[d].push(s);
  }

  // Map quests by deadline date or start date
  const questsByDate: Record<string, Quest[]> = {};
  for (const q of quests) {
    const d = q.deadline ? q.deadline.split("T")[0] : q.start_date;
    if (d) {
      if (!questsByDate[d]) questsByDate[d] = [];
      questsByDate[d].push(q);
    }
  }

  // Selected date details
  const selectedSessions = sessionsByDate[selectedDateStr] || [];
  const selectedQuests = questsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Calendar Header with Navigation */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight font-mono">
                {monthName} {year}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Full-Cell Monthly Tile Ledger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-500 font-bold uppercase">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Leading empty slots */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/30 opacity-20" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dayOfWeek = new Date(year, month, dayNum).getDay();
            const isRest = dayOfWeek === 0; // Sunday
            const daySessions = sessionsByDate[dateStr] || [];
            const dayQuests = questsByDate[dateStr] || [];
            const hasCompleted = daySessions.some((s) => s.status === "completed");
            const hasDueQuests = dayQuests.length > 0;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            let statusBg = "bg-slate-900/40 border-slate-800/80";
            let indicatorColor = "bg-slate-700";

            if (hasCompleted) {
              statusBg = "bg-emerald-950/40 border-emerald-500/40";
              indicatorColor = "bg-emerald-400 shadow-sm shadow-emerald-400";
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
                className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between transition-all ${statusBg} ${
                  isToday ? "ring-2 ring-cyan-400" : ""
                } ${isSelected ? "border-cyan-400 scale-[1.03]" : ""}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isToday ? "text-cyan-400" : "text-slate-300"
                    }`}
                  >
                    {dayNum}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
                </div>

                <div className="text-[9px] font-mono truncate text-left text-slate-400">
                  {hasCompleted ? (
                    <span className="text-emerald-400 font-bold">CLEARED</span>
                  ) : hasDueQuests ? (
                    <span className="text-cyan-400">{dayQuests.length} Qst</span>
                  ) : isRest ? (
                    "REST"
                  ) : (
                    ""
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Telemetry Ledger */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
            TELEMETRY FOR: {selectedDateStr}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {selectedSessions.length} WORKOUTS • {selectedQuests.length} SCHEDULED QUESTS
          </span>
        </div>

        {/* Workout Sessions on this Date */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            WORKOUT PERFORMANCE
          </span>
          {selectedSessions.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-1">
              No completed workout recorded on this date.
            </p>
          ) : (
            selectedSessions.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-white block">{s.title}</span>
                  <span className="text-slate-400 text-[11px] mt-0.5 block">
                    Duration: {s.duration_minutes}m • Skips: {s.skipping_completed} /{" "}
                    {s.skipping_target}
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">
                  {s.total_tonnage_kg.toLocaleString()} KG
                </span>
              </div>
            ))
          )}
        </div>

        {/* Scheduled Quests on this Date */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            SCHEDULED QUESTS &amp; COMMITMENTS
          </span>
          {selectedQuests.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-1">
              No specific side quests due on this date.
            </p>
          ) : (
            selectedQuests.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span
                    className={`font-bold block ${
                      q.status === "completed" ? "line-through text-slate-500" : "text-white"
                    }`}
                  >
                    {q.title}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {q.category} • {q.estimated_duration_minutes}m
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">+{q.xp_reward} XP</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
