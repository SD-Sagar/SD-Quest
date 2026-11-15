"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectDate, navigateMonth } from "@/store/slices/calendarSlice";
import { triggerHaptic } from "@/lib/utils";
import { CalendarDayEntry, CalendarDayStatus } from "@/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sparkles,
  Dumbbell,
  Droplet,
  Flame,
  FileDown,
} from "lucide-react";

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const WEEKDAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface MonthlyTileCalendarProps {
  onOpenReportModal?: () => void;
}

export function MonthlyTileCalendar({ onOpenReportModal }: MonthlyTileCalendarProps) {
  const dispatch = useAppDispatch();
  const { currentYear, currentMonth, selectedDate, days } = useAppSelector(
    (state) => state.calendar
  );

  const selectedEntry = days[selectedDate] || null;

  // Compute calendar grid for current year and month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Monthly statistics calculation
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const currentMonthEntries = Object.values(days).filter((d) =>
    d.date.startsWith(monthPrefix)
  );
  const greenDaysCount = currentMonthEntries.filter((d) => d.status === "green").length;
  const restDaysCount = currentMonthEntries.filter((d) => d.status === "neutral").length;
  const totalLogged = currentMonthEntries.length || 1;
  const consistencyPercent = Math.round((greenDaysCount / Math.max(1, totalLogged - restDaysCount)) * 100);

  const handleTileClick = (dateStr: string) => {
    triggerHaptic("light");
    dispatch(selectDate(dateStr));
  };

  const getTileClasses = (entry?: CalendarDayEntry, isToday?: boolean, isSelected?: boolean) => {
    let base = "relative p-2 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer min-h-[60px] sm:min-h-[70px] ";

    if (isSelected) {
      base += "ring-2 ring-cyan-400 ";
    }

    if (!entry) {
      return base + "bg-slate-900/40 border-slate-800/80 text-slate-600 hover:border-slate-700";
    }

    switch (entry.status) {
      case "green":
        return base + "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/40";
      case "half_green":
        return base + "bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-500/30 text-emerald-400";
      case "red":
        return base + "bg-red-950/40 border-red-500/40 text-red-300 shadow-sm shadow-red-950/40";
      case "neutral":
        return base + "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Month Header & Navigation */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                MONTHLY PROGRESS ARCHIVE
              </span>
              <h2 className="text-base font-black text-white tracking-tight">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenReportModal && (
              <button
                onClick={() => {
                  triggerHaptic("light");
                  onOpenReportModal();
                }}
                className="px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 hover:bg-cyan-900/60 text-xs font-mono font-bold flex items-center gap-1 transition"
                title="Download CSV or PDF Monthly Report"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerHaptic("light");
                dispatch(navigateMonth("prev"));
              }}
              className="p-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:text-cyan-400 text-slate-400 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                dispatch(navigateMonth("next"));
              }}
              className="p-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:text-cyan-400 text-slate-400 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monthly Summary Statistics */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Consistency</span>
            <span className="text-emerald-400 font-black text-sm">{consistencyPercent}%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Full Green</span>
            <span className="text-white font-black text-sm">{greenDaysCount} Days</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Rest Days</span>
            <span className="text-cyan-400 font-black text-sm">{restDaysCount} Honored</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Gym Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/50 border border-emerald-400" />
            Half Green
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            Honored Rest
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            Missed
          </span>
        </div>
      </div>

      {/* 2. Full-Cell Monthly Tile Calendar Grid */}
      <div className="hunter-panel rounded-3xl p-4 sm:p-5 border border-slate-800">
        {/* Weekday column headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {WEEKDAY_HEADERS.map((day) => (
            <span key={day} className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty offset tiles */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[60px] opacity-20 pointer-events-none" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
              dayNum
            ).padStart(2, "0")}`;
            const entry = days[dateStr];
            const isToday = dateStr === "2026-11-12";
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => handleTileClick(dateStr)}
                className={getTileClasses(entry, isToday, isSelected)}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday ? "text-cyan-400 underline underline-offset-2" : "text-slate-300"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {entry?.status === "green" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  {entry?.status === "neutral" && (
                    <Moon className="w-2.5 h-2.5 text-slate-500" />
                  )}
                  {entry?.status === "red" && (
                    <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                  )}
                </div>

                <div className="mt-1 text-[8px] font-mono truncate">
                  {entry?.gymWorkoutCompleted && (
                    <span className="text-emerald-400 font-bold block">GYM ✓</span>
                  )}
                  {entry?.status === "neutral" && (
                    <span className="text-slate-500 block">REST</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Date Detail Inspection Card */}
      {selectedEntry ? (
        <div className="hunter-panel rounded-3xl p-5 border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                DATE TELEMETRY INSPECTION
              </span>
              <h3 className="text-base font-black text-white tracking-tight">
                {selectedEntry.date}
              </h3>
            </div>

            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl uppercase border ${
                selectedEntry.status === "green"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                  : selectedEntry.status === "neutral"
                  ? "bg-slate-900 border-slate-700 text-slate-300"
                  : selectedEntry.status === "half_green"
                  ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                  : "bg-red-950/60 border-red-500/40 text-red-400"
              }`}
            >
              {selectedEntry.status === "green"
                ? "FULL GREEN DAY"
                : selectedEntry.status === "neutral"
                ? "HONORED REST DAY"
                : selectedEntry.status === "half_green"
                ? "HALF GREEN"
                : "MISSED COMMITMENT"}
            </span>
          </div>

          {/* Details list */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                Gym Workout:
              </span>
              <span className={selectedEntry.gymWorkoutCompleted ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {selectedEntry.gymWorkoutCompleted ? "COMPLETED ✓" : "None Scheduled"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Daily Skipping:
              </span>
              <span className={selectedEntry.skippingCompleted ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {selectedEntry.skippingCompleted ? "100 Skips Done ✓" : "Off"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                Hydration Target:
              </span>
              <span className={selectedEntry.waterTargetMet ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {selectedEntry.waterTargetMet ? "3,000 ML Met ✓" : "Incomplete"}
              </span>
            </div>

            {selectedEntry.notes && (
              <div className="pt-2 border-t border-slate-800 text-slate-300 italic text-[11px]">
                &ldquo;{selectedEntry.notes}&rdquo;
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
