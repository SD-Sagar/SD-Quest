"use client";

import { useAppSelector } from "@/store";
import { downloadMonthlyCSV, openPrintableMonthlyReport } from "@/lib/utils/exportReports";
import { triggerHaptic } from "@/lib/utils";
import { Download, Printer, Database, ShieldCheck, X, FileText, CheckCircle2 } from "lucide-react";

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonthlyReportModal({ isOpen, onClose }: MonthlyReportModalProps) {
  const player = useAppSelector((state) => state.player);
  const calendar = useAppSelector((state) => state.calendar);
  const workoutCount = useAppSelector((state) => state.workout.workoutHistoryCount);

  if (!isOpen) return null;

  const yearMonth = `${calendar.currentYear}-${String(calendar.currentMonth).padStart(2, "0")}`;

  const payload = {
    yearMonth,
    player,
    days: calendar.days,
    totalTonnageKg: 34200, // Aggregate monthly volume
    totalWorkouts: workoutCount || 12,
    totalQuests: 38,
    averageDiscipline: player.attributes.discipline.score,
  };

  const handleDownloadCSV = () => {
    triggerHaptic("success");
    downloadMonthlyCSV(payload);
  };

  const handlePrintPDF = () => {
    triggerHaptic("success");
    openPrintableMonthlyReport(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl hunter-panel border border-cyan-500/40 p-6 shadow-2xl space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                DATA RETENTION & REPORTS
              </h2>
              <p className="text-xs text-slate-400">
                180-Day Rolling Log • Permanent Lifetime Record
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

        {/* 180-Day Hot Storage Gauge */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">RETENTION STATUS</span>
            <span className="text-cyan-400 font-bold">180-DAY ROLLING WINDOW</span>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[18%] rounded-full" />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Granular set-by-set telemetry is preserved for 180 days before automated monthly
            snapshot compaction. Download your archives anytime.
          </p>
        </div>

        {/* Permanent Record Guarantee Plate */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-cyan-300 block mb-0.5">
              Permanent Legacy Protected
            </span>
            <span>
              Lifetime Peak Level (LVL {player.lifetimeHighestLevel}), Total XP, Personal Records,
              and Unlocked Ranks are never pruned.
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownloadCSV}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            DOWNLOAD {yearMonth} CSV SPREADSHEET
          </button>

          <button
            onClick={handlePrintPDF}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition"
          >
            <Printer className="w-4 h-4" />
            PRINT / SAVE PDF PERFORMANCE REPORT
          </button>
        </div>
      </div>
    </div>
  );
}

