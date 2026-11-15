"use client";

import { useState, useEffect, useTransition } from "react";
import { BodyMeasurement } from "@/types";
import { triggerHaptic } from "@/lib/utils";
import { Scale, Ruler, Plus, Calendar } from "lucide-react";
import { BodyRepository } from "@/server/repositories/body.repository";
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
    <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              BODY MEASUREMENTS LOG
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Section 8 • Honest Anthropometric Telemetry
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>RECORD METRICS</span>
        </button>
      </div>

      {/* Latest Metrics Summary Cards */}
      {latest ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block">Weight</span>
            <span className="text-white font-bold text-sm">{latest.weight_kg} kg</span>
            <span className="text-[9px] text-slate-500 block">{latest.date}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block">Chest</span>
            <span className="text-white font-bold text-sm">{latest.chest_cm || "—"} cm</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block">Waist</span>
            <span className="text-white font-bold text-sm">{latest.waist_cm || "—"} cm</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block">Arms</span>
            <span className="text-white font-bold text-sm">{latest.arms_cm || "—"} cm</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
          No body measurements recorded yet. Click above to record baseline.
        </div>
      )}

      {/* Entry Modal */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3">
          <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono font-bold"
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {isPending ? "SAVING..." : "COMMIT METRICS"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
