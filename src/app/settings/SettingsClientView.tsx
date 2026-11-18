"use client";

import { useState, useTransition } from "react";
import { updateHunterSettingsAction, logoutAction } from "@/server/actions/auth.actions";
import { triggerHaptic } from "@/lib/utils";
import { Profile, EquipmentInventory, DailyNutritionTargets } from "@/types";
import {
  Shield,
  Dumbbell,
  Utensils,
  CheckCircle2,
  Briefcase,
  BookOpen,
  DollarSign,
  Save,
  Layers,
  LogOut,
} from "lucide-react";

interface SettingsClientViewProps {
  profile: Profile;
  equipment: EquipmentInventory | null;
  nutritionTargets: DailyNutritionTargets | null;
}

export function SettingsClientView({
  profile,
  equipment,
  nutritionTargets,
}: SettingsClientViewProps) {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states
  const [name, setName] = useState(profile.name);
  const [activeMainQuest, setActiveMainQuest] = useState(profile.active_main_quest || "fitness");
  const [fitnessObjective, setFitnessObjective] = useState(profile.fitness_objective || "");

  // Gym Arsenal states
  const [hasBench, setHasBench] = useState(equipment?.has_bench ?? true);
  const [handleWeight, setHandleWeight] = useState(equipment?.dumbbell_handle_weight_kg ?? 2.0);
  const [plate5kgCount, setPlate5kgCount] = useState(equipment?.plate_5kg_count ?? 8);
  const [plate25kgCount, setPlate25kgCount] = useState(equipment?.plate_2_5kg_count ?? 4);
  const [plate2kgCount, setPlate2kgCount] = useState(equipment?.plate_2kg_count ?? 4);
  const [plate125kgCount, setPlate125kgCount] = useState(equipment?.plate_1_25kg_count ?? 8);
  const [plate1kgCount, setPlate1kgCount] = useState(equipment?.plate_1kg_count ?? 4);

  // Nutrition states
  const [monthlyBudgetInr, setMonthlyBudgetInr] = useState(
    nutritionTargets?.monthly_budget_inr ?? 4500
  );

  const totalPlateWeight =
    plate5kgCount * 5 +
    plate25kgCount * 2.5 +
    plate2kgCount * 2 +
    plate125kgCount * 1.25 +
    plate1kgCount * 1;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("heavy");
    setSuccessMsg(false);

    startTransition(async () => {
      const res = await updateHunterSettingsAction({
        name: name.trim(),
        activeMainQuest,
        fitnessObjective,
        hasBench,
        dumbbellHandleWeightKg: Number(handleWeight),
        plate5kgCount: Number(plate5kgCount),
        plate25kgCount: Number(plate25kgCount),
        plate2kgCount: Number(plate2kgCount),
        plate125kgCount: Number(plate125kgCount),
        plate1kgCount: Number(plate1kgCount),
        monthlyBudgetInr: Number(monthlyBudgetInr),
      });

      if (res.success) {
        setSuccessMsg(true);
        triggerHaptic("success");
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>System ledger updated successfully. Changes applied across all modules.</span>
        </div>
      )}

      {/* Domain Selection */}
      <div className="hunter-panel rounded-3xl border border-cyan-500/30 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>ACTIVE MAIN QUEST SELECTION</span>
        </div>

        <p className="text-xs text-slate-400">
          Your active Main Quest dictates the primary dashboard command centre. You can shift priorities whenever your life season changes.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "fitness", label: "Fitness & Gym", icon: Dumbbell },
            { id: "career", label: "Career & Tech", icon: Briefcase },
            { id: "education", label: "Study & Academics", icon: BookOpen },
            { id: "finance", label: "Finance & Wealth", icon: DollarSign },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeMainQuest === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  triggerHaptic("light");
                  setActiveMainQuest(item.id);
                }}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-sm"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Hunter Name / Alias
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Life / Fitness Objective
            </label>
            <input
              type="text"
              value={fitnessObjective}
              onChange={(e) => setFitnessObjective(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 20-in-1 Bench & 60KG Plates Arsenal */}
      <div className="hunter-panel rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Dumbbell className="w-4 h-4" />
            <span>HOME GYM ARSENAL &amp; 60KG INVENTORY</span>
          </div>
          <span className="text-xs font-mono text-white font-bold">{totalPlateWeight} KG Total</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">20-in-1 Adjustable Bench</span>
            <span className="text-[11px] text-slate-400">
              Enables Flat, Incline (15°-75°), Seated 90°, and Decline movements
            </span>
          </div>
          <input
            type="checkbox"
            checked={hasBench}
            onChange={(e) => setHasBench(e.target.checked)}
            className="w-5 h-5 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              Bar Weight (KG)
            </label>
            <input
              type="number"
              step="0.5"
              value={handleWeight}
              onChange={(e) => setHandleWeight(parseFloat(e.target.value) || 2)}
              className="w-full text-center text-sm font-black font-mono text-cyan-400 bg-transparent focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              5KG Plates
            </label>
            <input
              type="number"
              value={plate5kgCount}
              onChange={(e) => setPlate5kgCount(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              2.5KG Plates
            </label>
            <input
              type="number"
              value={plate25kgCount}
              onChange={(e) => setPlate25kgCount(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              2KG Plates
            </label>
            <input
              type="number"
              value={plate2kgCount}
              onChange={(e) => setPlate2kgCount(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              1.25KG Plates
            </label>
            <input
              type="number"
              value={plate125kgCount}
              onChange={(e) => setPlate125kgCount(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              1KG Plates
            </label>
            <input
              type="number"
              value={plate1kgCount}
              onChange={(e) => setPlate1kgCount(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Fuel & Budget - display set to null per design to preserve logic */}
      {false && (
        <div className="hunter-panel rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>DAILY NUTRITION &amp; BUDGET CONTROL</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Monthly Food Budget (INR ₹)
            </label>
            <input
              type="number"
              step="100"
              value={monthlyBudgetInr}
              onChange={(e) => setMonthlyBudgetInr(parseInt(e.target.value, 10) || 4500)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-cyan-400 font-mono font-bold"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isPending ? "ENCRYPTING CHANGES..." : "SAVE HUNTER CONFIGURATION"}</span>
      </button>
    </form>

    {/* System Access & Session Management (Unified Logout for PC & Mobile) */}
    <div className="hunter-panel rounded-3xl border border-red-950/60 bg-[#090b12] p-5 sm:p-6 space-y-4">
      <div>
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
          SYSTEM ACCESS // SESSION CONTROL
        </span>
        <h3 className="text-sm font-bold text-slate-200 mt-0.5">
          Hunter Session &amp; Authentication
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Signed in as <span className="text-cyan-400 font-mono font-bold">{profile.name}</span> ({profile.rank} • LVL {profile.current_level})
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 font-mono">
          Terminate session on this device
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            onClick={() => triggerHaptic("heavy")}
            className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 hover:border-red-400 text-red-300 font-mono text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>TERMINATE SESSION</span>
          </button>
        </form>
      </div>
    </div>
  </div>
);
}

