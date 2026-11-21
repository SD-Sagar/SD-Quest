"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHunterSettingsAction, logoutAction } from "@/server/actions/auth.actions";
import { triggerHaptic } from "@/lib/utils";
import { Profile, EquipmentInventory, DailyNutritionTargets } from "@/types";
import {
  Shield,
  Dumbbell,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  BookOpen,
  DollarSign,
  Save,
  Layers,
  LogOut,
  Sparkles,
  Check,
  X,
  Compass,
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(profile.name);
  const [activeMainQuest, setActiveMainQuest] = useState(profile.active_main_quest || "fitness");
  const [fitnessObjective, setFitnessObjective] = useState(profile.fitness_objective || "");
  const [enableGym, setEnableGym] = useState(
    profile.enable_gym !== undefined ? profile.enable_gym : (profile.active_main_quest === "fitness")
  );

  // Gym Arsenal states
  const [hasBench, setHasBench] = useState(equipment?.has_bench ?? true);
  const [hasBarbell, setHasBarbell] = useState(equipment?.has_barbell ?? false);
  const [barbellWeight, setBarbellWeight] = useState(equipment?.barbell_weight_kg ?? 7.0);
  const [hasEzBar, setHasEzBar] = useState(equipment?.has_ez_bar ?? false);
  const [ezBarWeight, setEzBarWeight] = useState(equipment?.ez_bar_weight_kg ?? 5.0);
  const [hasCablePulley, setHasCablePulley] = useState(equipment?.has_cable_pulley ?? false);
  const [hasLegDeveloper, setHasLegDeveloper] = useState(equipment?.has_leg_developer ?? false);
  const [handleWeight, setHandleWeight] = useState(equipment?.dumbbell_handle_weight_kg ?? 2.0);
  const [plate10kgCount, setPlate10kgCount] = useState(equipment?.plate_10kg_count ?? 0);
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
    plate10kgCount * 10 +
    plate5kgCount * 5 +
    plate25kgCount * 2.5 +
    plate2kgCount * 2 +
    plate125kgCount * 1.25 +
    plate1kgCount * 1;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("heavy");
    setSuccessMsg(false);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateHunterSettingsAction({
        name: name.trim(),
        activeMainQuest,
        enableGym,
        fitnessObjective,
        hasBench,
        hasBarbell,
        barbellWeightKg: Number(barbellWeight),
        hasEzBar,
        ezBarWeightKg: Number(ezBarWeight),
        hasCablePulley,
        hasLegDeveloper,
        dumbbellHandleWeightKg: Number(handleWeight),
        plate10kgCount: Number(plate10kgCount),
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
        router.refresh();
        setTimeout(() => setSuccessMsg(false), 3500);
      } else {
        setErrorMsg(res.error || "Failed to update hunter settings.");
        triggerHaptic("warning");
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

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
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
                    if (item.id === "fitness") {
                      setEnableGym(true);
                    }
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

        {/* Master Gym System Module Toggle */}
        <div className="hunter-panel rounded-3xl border border-cyan-500/30 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Dumbbell className="w-4 h-4" />
              <span>GYM COMPANION &amp; PHYSICAL TRAINING MODULE</span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setEnableGym(!enableGym);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 ${
                enableGym
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm shadow-emerald-950"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              {enableGym ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>{enableGym ? "GYM ACTIVE" : "GYM DISABLED"}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {enableGym
              ? "The Gym Companion is currently active. The workout planner appears in your navigation and daily system quest card. You can configure your equipment below or rely on bodyweight calisthenics."
              : "Gym tracking is currently disabled. Navigation links to the Gym module will be hidden and your dashboard command center will focus entirely on your primary quest and routine habits."}
          </p>
        </div>

        {/* Equipment Arsenal & Plate Inventory (Shown when Gym is Active) */}
        {enableGym && (
          <div className="hunter-panel rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>EQUIPMENT ARSENAL &amp; 20-IN-1 BENCH FORGE</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Toggle items you currently own. Missing items will automatically be hidden from your split.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-xl shrink-0">
                {totalPlateWeight} KG Plates Total
              </span>
            </div>

            {/* Apparatus Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bench */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">20-in-1 Workout Bench</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Flat, Incline (15°-75°), Seated 90°, Decline
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasBench(!hasBench);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                    hasBench
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                      : "bg-red-950/40 text-red-400 border-red-500/40"
                  }`}
                >
                  {hasBench ? "EQUIPPED ✓" : "MISSING ✕"}
                </button>
              </div>

              {/* Straight Barbell Rod */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Straight Barbell Rod</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">Bar Weight:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={barbellWeight}
                      onChange={(e) => setBarbellWeight(parseFloat(e.target.value) || 7)}
                      className="w-12 text-center text-[11px] font-mono font-bold text-cyan-400 bg-slate-950 rounded border border-slate-700 px-1 py-0.5"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">KG</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasBarbell(!hasBarbell);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                    hasBarbell
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                      : "bg-red-950/40 text-red-400 border-red-500/40"
                  }`}
                >
                  {hasBarbell ? "EQUIPPED ✓" : "MISSING ✕"}
                </button>
              </div>

              {/* Curly Rod (EZ Bar) */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Curly Rod (EZ Bar)</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">Bar Weight:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={ezBarWeight}
                      onChange={(e) => setEzBarWeight(parseFloat(e.target.value) || 5)}
                      className="w-12 text-center text-[11px] font-mono font-bold text-cyan-400 bg-slate-950 rounded border border-slate-700 px-1 py-0.5"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">KG</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasEzBar(!hasEzBar);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                    hasEzBar
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                      : "bg-red-950/40 text-red-400 border-red-500/40"
                  }`}
                >
                  {hasEzBar ? "EQUIPPED ✓" : "MISSING ✕"}
                </button>
              </div>

              {/* Back Pull Chain / Pulley */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Back Pull Chain / Cable</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Lat Pulldown &amp; Cable Pulley Attachment
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasCablePulley(!hasCablePulley);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                    hasCablePulley
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                      : "bg-red-950/40 text-red-400 border-red-500/40"
                  }`}
                >
                  {hasCablePulley ? "EQUIPPED ✓" : "MISSING ✕"}
                </button>
              </div>

              {/* Bench Leg Developer (Extension & Curl) */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Bench Leg Developer</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Plate-Loaded Leg Extension &amp; Hamstring Curl Attachment
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasLegDeveloper(!hasLegDeveloper);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                    hasLegDeveloper
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                      : "bg-red-950/40 text-red-400 border-red-500/40"
                  }`}
                >
                  {hasLegDeveloper ? "EQUIPPED ✓" : "MISSING ✕"}
                </button>
              </div>
            </div>

            {/* Weight Plate Inventory */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase block">
                Adjustable Plates Inventory
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    DB Handle (KG)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={handleWeight}
                    onChange={(e) => setHandleWeight(parseFloat(e.target.value) || 2)}
                    className="w-full text-center text-sm font-black font-mono text-cyan-400 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40">
                  <label className="text-[10px] text-cyan-300 uppercase font-mono block mb-1">
                    10KG Plates
                  </label>
                  <input
                    type="number"
                    value={plate10kgCount}
                    onChange={(e) => setPlate10kgCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
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

            {!hasBench && !hasBarbell && !hasEzBar && !hasCablePulley && totalPlateWeight === 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  No physical equipment marked active. The System will automatically deploy the complete Free-Hand Calisthenics split.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Save Configuration Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "ENCRYPTING CHANGES..." : "SAVE HUNTER CONFIGURATION"}</span>
        </button>
      </form>

      {/* System Access & Session Management */}
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

      {/* FLOATING SYSTEM TOAST (ALWAYS VISIBLE REGARDLESS OF SCROLL POSITION) */}
      {successMsg && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-3 rounded-2xl bg-[#05070c]/95 border border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.4)] backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-400">
            <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block font-solo">
              SYSTEM CONFIGURATION APPLIED
            </span>
            <p className="text-xs text-white font-hud truncate">
              System ledger updated successfully. Changes applied across all modules.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-3 rounded-2xl bg-[#05070c]/95 border border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-red-950 border border-red-500 text-red-400">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block font-solo">
              SYSTEM REJECTION
            </span>
            <p className="text-xs text-white font-hud truncate">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
