"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { addBodyMeasurement } from "@/store/slices/bodySlice";
import { updateProfile } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import { Ruler, Plus, Calendar, Scale, ChevronDown, Check } from "lucide-react";

export function MeasurementTracker() {
  const dispatch = useAppDispatch();
  const measurements = useAppSelector((state) => state.body.measurements);
  const player = useAppSelector((state) => state.player);

  const [isLogging, setIsLogging] = useState(false);
  const [weightKg, setWeightKg] = useState(player.currentWeightKg || 70);
  const [chestCm, setChestCm] = useState(98);
  const [waistCm, setWaistCm] = useState(81);
  const [armsCm, setArmsCm] = useState(34.5);
  const [thighsCm, setThighsCm] = useState(55);
  const [calvesCm, setCalvesCm] = useState(36);
  const [notes, setNotes] = useState("");

  const latest = measurements[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("success");

    dispatch(
      addBodyMeasurement({
        date: new Date().toISOString().split("T")[0],
        weightKg: Number(weightKg),
        chestCm: Number(chestCm),
        waistCm: Number(waistCm),
        armsCm: Number(armsCm),
        thighsCm: Number(thighsCm),
        calvesCm: Number(calvesCm),
        notes: notes.trim() || undefined,
      })
    );

    // Sync weight with player profile
    dispatch(updateProfile({ currentWeightKg: Number(weightKg) }));

    setIsLogging(false);
    setNotes("");
  };

  return (
    <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              PHYSICAL DIMENSIONS
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              BODY MEASUREMENTS
            </h3>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic("light");
            setIsLogging(!isLogging);
          }}
          className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-400 text-xs font-bold font-mono flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          {isLogging ? "CANCEL" : "LOG ENTRY"}
        </button>
      </div>

      {/* Measurement Log Form */}
      {isLogging && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Weight (KG)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Chest (CM)
              </label>
              <input
                type="number"
                step="0.5"
                value={chestCm}
                onChange={(e) => setChestCm(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Waist (CM)
              </label>
              <input
                type="number"
                step="0.5"
                value={waistCm}
                onChange={(e) => setWaistCm(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Arms (CM)
              </label>
              <input
                type="number"
                step="0.5"
                value={armsCm}
                onChange={(e) => setArmsCm(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Thighs (CM)
              </label>
              <input
                type="number"
                step="0.5"
                value={thighsCm}
                onChange={(e) => setThighsCm(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Calves (CM)
              </label>
              <input
                type="number"
                step="0.5"
                value={calvesCm}
                onChange={(e) => setCalvesCm(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-cyan-950 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            COMMIT MEASUREMENT ENTRY
          </button>
        </form>
      )}

      {/* Latest Metrics Grid */}
      {latest && (
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Weight</span>
            <span className="text-white font-bold text-sm">{latest.weightKg} kg</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Waist</span>
            <span className="text-cyan-400 font-bold text-sm">{latest.waistCm} cm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Arms</span>
            <span className="text-purple-400 font-bold text-sm">{latest.armsCm} cm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Chest</span>
            <span className="text-white font-bold text-sm">{latest.chestCm} cm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Thighs</span>
            <span className="text-white font-bold text-sm">{latest.thighsCm} cm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Calves</span>
            <span className="text-white font-bold text-sm">{latest.calvesCm} cm</span>
          </div>
        </div>
      )}
    </div>
  );
}

