"use client";

import { useState, useEffect, useTransition } from "react";
import { BodyMeasurement } from "@/types";
import { triggerHaptic } from "@/lib/utils";
import { Scale, Ruler, Plus, Calendar, ChevronDown, ChevronUp, History, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

interface MeasurementTrackerProps {
  measurements: BodyMeasurement[];
  onAddMeasurement: (m: Omit<BodyMeasurement, "id" | "user_id" | "created_at">) => Promise<any>;
}

export function MeasurementTracker({
  measurements,
  onAddMeasurement,
}: MeasurementTrackerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const [date, setDate] = useState("2026-11-15");

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);
  const [weightKg, setWeightKg] = useState("70");
  const [chestCm, setChestCm] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [armsCm, setArmsCm] = useState("");
  const [thighsCm, setThighsCm] = useState("");
  const [notes, setNotes] = useState("");

  const latest = measurements[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightKg);
    if (isNaN(w) || w <= 0) return;

    triggerHaptic("heavy");
    startTransition(async () => {
      await onAddMeasurement({
        date,
        weight_kg: w,
        chest_cm: chestCm ? parseFloat(chestCm) : null,
        waist_cm: waistCm ? parseFloat(waistCm) : null,
        arms_cm: armsCm ? parseFloat(armsCm) : null,
        thighs_cm: thighsCm ? parseFloat(thighsCm) : null,
        notes: notes || null,
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="solo-frame rounded-2xl p-4 sm:p-5 space-y-4 font-hud">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-solo font-bold text-white uppercase tracking-wider">
              BODY MEASUREMENTS LOG
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Section 8 • Honest Anthropometric Telemetry
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic("light");
            setIsOpen(!isOpen);
          }}
          className="solo-btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 font-mono"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>RECORD METRICS</span>
        </button>
      </div>

      {/* Latest Metrics Summary Cards */}
      {latest ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/30">
            <span className="text-[9px] text-slate-400 uppercase block font-solo">Weight</span>
            <span className="text-white font-bold text-sm tracking-tight">{latest.weight_kg} kg</span>
            <span className="text-[9px] text-cyan-400/80 block mt-0.5">{latest.date}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/30">
            <span className="text-[9px] text-slate-400 uppercase block font-solo">Chest</span>
            <span className="text-white font-bold text-sm tracking-tight">{latest.chest_cm ? `${latest.chest_cm} cm` : "—"}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Torso</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/30">
            <span className="text-[9px] text-slate-400 uppercase block font-solo">Waist</span>
            <span className="text-white font-bold text-sm tracking-tight">{latest.waist_cm ? `${latest.waist_cm} cm` : "—"}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Core</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/30">
            <span className="text-[9px] text-slate-400 uppercase block font-solo">Arms</span>
            <span className="text-white font-bold text-sm tracking-tight">{latest.arms_cm ? `${latest.arms_cm} cm` : "—"}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Flex</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#070b14] border border-cyan-500/20 text-center text-xs text-slate-400 font-mono">
          No body measurements recorded yet. Click above to record baseline.
        </div>
      )}

      {/* Creative Anti-Scroll 50-Record History Accordion */}
      {measurements.length > 0 && (
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setIsHistoryExpanded(!isHistoryExpanded);
            }}
            className="w-full p-2 rounded-xl bg-[#070b14] hover:bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs font-mono transition group"
          >
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition">
                HISTORICAL MEASUREMENT TRAJECTORY ({measurements.length} / 50 RECORDS)
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-cyan-400 group-hover:text-white transition">
              <span>{isHistoryExpanded ? "COLLAPSE ▲" : "EXPAND LOG ▼"}</span>
              {isHistoryExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {isHistoryExpanded && (
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 animate-in fade-in duration-150">
              {measurements.map((m, idx) => {
                const nextEntry = measurements[idx + 1];
                const weightDiff = nextEntry ? Number((m.weight_kg - nextEntry.weight_kg).toFixed(1)) : null;

                return (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/20 hover:border-cyan-500/50 flex items-center justify-between gap-2 text-xs font-mono transition"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-xs">{m.date}</span>
                        <span className="text-cyan-300 font-bold font-mono">
                          {m.weight_kg.toFixed(1)} KG
                        </span>
                        {weightDiff !== null && (
                          <span
                            className={`text-[10px] font-bold flex items-center gap-0.5 ${
                              weightDiff > 0
                                ? "text-cyan-300"
                                : weightDiff < 0
                                ? "text-blue-300"
                                : "text-slate-400"
                            }`}
                          >
                            {weightDiff > 0 ? (
                              <TrendingUp className="w-2.5 h-2.5 text-cyan-400" />
                            ) : weightDiff < 0 ? (
                              <TrendingDown className="w-2.5 h-2.5 text-blue-400" />
                            ) : (
                              <Minus className="w-2.5 h-2.5 text-slate-400" />
                            )}
                            {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        {m.chest_cm && <span>C: {m.chest_cm}cm</span>}
                        {m.waist_cm && <span>• W: {m.waist_cm}cm</span>}
                        {m.arms_cm && <span>• A: {m.arms_cm}cm</span>}
                        {m.thighs_cm && <span>• T: {m.thighs_cm}cm</span>}
                        {m.notes && <span className="italic text-slate-400">({m.notes})</span>}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                      #{measurements.length - idx}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Entry Modal */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#070b14] border border-cyan-500/50 space-y-3">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block font-solo">
            RECORD NEW MEASUREMENTS
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 p-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
                Weight (KG) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 p-2 text-xs text-white font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] text-slate-400 font-mono uppercase block mb-0.5">
                Chest (CM)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="optional"
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 p-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-mono uppercase block mb-0.5">
                Waist (CM)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="optional"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 p-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-mono uppercase block mb-0.5">
                Arms (CM)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="optional"
                value={armsCm}
                onChange={(e) => setArmsCm(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 p-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-mono uppercase block mb-0.5">
                Thighs (CM)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="optional"
                value={thighsCm}
                onChange={(e) => setThighsCm(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 p-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono font-bold text-slate-400 hover:text-white transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs font-mono uppercase tracking-wider transition disabled:opacity-50"
            >
              {isPending ? "SAVING..." : "COMMIT METRICS"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
