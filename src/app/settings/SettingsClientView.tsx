"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHunterSettingsAction, logoutAction } from "@/server/actions/auth.actions";
import {
  activateMedicalSanctuaryAction,
  deactivateMedicalSanctuaryAction,
} from "@/server/actions/player.actions";
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
  Minus,
  Plus,
  Clock,
  Activity,
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

  // Medical Sanctuary states
  const [isSanctuaryActive, setIsSanctuaryActive] = useState(
    profile.condition === "medical_sanctuary"
  );
  const [sanctuaryExpiresAt, setSanctuaryExpiresAt] = useState<string | null>(
    profile.medical_sanctuary_expires_at ?? null
  );
  const [sanctuaryReason, setSanctuaryReason] = useState("Muscle strain / physical recovery");
  const [sanctuaryDays, setSanctuaryDays] = useState<number>(0); // 0 = Indefinite until toggled off
  const [isSanctuaryPending, startSanctuaryTransition] = useTransition();

  // Telemetry & Fatigue Display Mode states
  const [questFatigueMode, setQuestFatigueMode] = useState<"log" | "live">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sd_fatigue_mode_quests") as any) || "live";
    }
    return "live";
  });
  const [gymFatigueMode, setGymFatigueMode] = useState<"log" | "live">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sd_fatigue_mode_gym") as any) || "log";
    }
    return "log";
  });

  // Gym Arsenal states
  const [hasBench, setHasBench] = useState(equipment?.has_bench ?? true);
  const [hasBarbell, setHasBarbell] = useState(equipment?.has_barbell ?? false);
  const [barbellWeight, setBarbellWeight] = useState<number | string>(equipment?.barbell_weight_kg ?? 7.0);
  const [hasEzBar, setHasEzBar] = useState(equipment?.has_ez_bar ?? false);
  const [ezBarWeight, setEzBarWeight] = useState<number | string>(equipment?.ez_bar_weight_kg ?? 5.0);
  const [hasCablePulley, setHasCablePulley] = useState(equipment?.has_cable_pulley ?? false);
  const [hasLegDeveloper, setHasLegDeveloper] = useState(equipment?.has_leg_developer ?? false);
  const [handleWeight, setHandleWeight] = useState<number | string>(equipment?.dumbbell_handle_weight_kg ?? 2.0);
  const [plate10kgCount, setPlate10kgCount] = useState<number | string>(equipment?.plate_10kg_count ?? 0);
  const [plate5kgCount, setPlate5kgCount] = useState<number | string>(equipment?.plate_5kg_count ?? 8);
  const [plate25kgCount, setPlate25kgCount] = useState<number | string>(equipment?.plate_2_5kg_count ?? 4);
  const [plate2kgCount, setPlate2kgCount] = useState<number | string>(equipment?.plate_2kg_count ?? 4);
  const [plate125kgCount, setPlate125kgCount] = useState<number | string>(equipment?.plate_1_25kg_count ?? 8);
  const [plate1kgCount, setPlate1kgCount] = useState<number | string>(equipment?.plate_1kg_count ?? 4);

  // Nutrition states
  const [monthlyBudgetInr, setMonthlyBudgetInr] = useState<number | string>(
    nutritionTargets?.monthly_budget_inr ?? 4500
  );

  const totalPlateWeight =
    (Number(plate10kgCount) || 0) * 10 +
    (Number(plate5kgCount) || 0) * 5 +
    (Number(plate25kgCount) || 0) * 2.5 +
    (Number(plate2kgCount) || 0) * 2 +
    (Number(plate125kgCount) || 0) * 1.25 +
    (Number(plate1kgCount) || 0) * 1;

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
        if (typeof window !== "undefined") {
          localStorage.setItem("sd_fatigue_mode_quests", questFatigueMode);
          localStorage.setItem("sd_fatigue_mode_gym", gymFatigueMode);
        }
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

  const handleActivateSanctuary = () => {
    triggerHaptic("heavy");
    startSanctuaryTransition(async () => {
      const res = await activateMedicalSanctuaryAction({
        reason: sanctuaryReason.trim() || "Medical recovery & injury rehabilitation",
        days: sanctuaryDays > 0 ? sanctuaryDays : undefined,
      });
      if (res.success) {
        setIsSanctuaryActive(true);
        setSanctuaryExpiresAt("expiresAt" in res ? (res.expiresAt ?? null) : null);
        setSuccessMsg(true);
        triggerHaptic("success");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to activate Medical Sanctuary.");
        triggerHaptic("warning");
      }
    });
  };

  const handleDeactivateSanctuary = () => {
    triggerHaptic("heavy");
    startSanctuaryTransition(async () => {
      const res = await deactivateMedicalSanctuaryAction();
      if (res.success) {
        setIsSanctuaryActive(false);
        setSanctuaryExpiresAt(null);
        setSuccessMsg(true);
        triggerHaptic("success");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to deactivate Medical Sanctuary.");
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

        {/* Telemetry & Fatigue Display Engine Configuration */}
        <div className="hunter-panel rounded-3xl border border-cyan-500/30 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>TELEMETRY &amp; FATIGUE DISPLAY ENGINE</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Configure whether fatigue meters stream live in active/minimized capsules or log purely upon objective completion. Both modes evaluate identical biological formulas without divergence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">QUEST TELEMETRY HUD</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setQuestFatigueMode((prev) => (prev === "live" ? "log" : "live"));
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition ${
                    questFatigueMode === "live"
                      ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                      : "bg-slate-950 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  {questFatigueMode === "live" ? "● LIVE STREAMING" : "LOG-BASED"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {questFatigueMode === "live"
                  ? "Streams live fatigue & overtime XP counters in floating capsules and active stopwatch."
                  : "Fatigue delta calculated and applied upon quest submission."}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">GYM FATIGUE HUD</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setGymFatigueMode((prev) => (prev === "live" ? "log" : "live"));
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition ${
                    gymFatigueMode === "live"
                      ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                      : "bg-slate-950 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  {gymFatigueMode === "live" ? "● LIVE STREAMING" : "LOG-BASED"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {gymFatigueMode === "live"
                  ? "Displays live exertion meters in floating capsule and resting views."
                  : "Fatigue updates strictly during rest timer upon set completion."}
              </p>
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
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white block">Straight Barbell Rod</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Bar Weight:</span>
                    <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setBarbellWeight((prev) => Math.max(1, Math.round(((Number(prev) || 7) - 0.5) * 10) / 10));
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="30"
                        value={barbellWeight}
                        onChange={(e) => setBarbellWeight(e.target.value)}
                        onBlur={() => {
                          if (barbellWeight === "" || isNaN(Number(barbellWeight))) {
                            setBarbellWeight(7.0);
                          } else {
                            setBarbellWeight(Math.max(1, Math.min(30, Math.round(Number(barbellWeight) * 10) / 10)));
                          }
                        }}
                        className="w-8 text-center text-[11px] font-mono font-bold text-cyan-400 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setBarbellWeight((prev) => Math.min(30, Math.round(((Number(prev) || 7) + 0.5) * 10) / 10));
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">KG</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasBarbell(!hasBarbell);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition shrink-0 ${
                    hasBarbell
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                      : "bg-red-950/40 text-red-400 border-red-500/40"
                  }`}
                >
                  {hasBarbell ? "EQUIPPED ✓" : "MISSING ✕"}
                </button>
              </div>

              {/* Curly Rod (EZ Bar) */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white block">Curly Rod (EZ Bar)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Bar Weight:</span>
                    <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setEzBarWeight((prev) => Math.max(1, Math.round(((Number(prev) || 5) - 0.5) * 10) / 10));
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="30"
                        value={ezBarWeight}
                        onChange={(e) => setEzBarWeight(e.target.value)}
                        onBlur={() => {
                          if (ezBarWeight === "" || isNaN(Number(ezBarWeight))) {
                            setEzBarWeight(5.0);
                          } else {
                            setEzBarWeight(Math.max(1, Math.min(30, Math.round(Number(ezBarWeight) * 10) / 10)));
                          }
                        }}
                        className="w-8 text-center text-[11px] font-mono font-bold text-cyan-400 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setEzBarWeight((prev) => Math.min(30, Math.round(((Number(prev) || 5) + 0.5) * 10) / 10));
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">KG</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setHasEzBar(!hasEzBar);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition shrink-0 ${
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
                {/* DB Handle */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    DB Handle (KG)
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setHandleWeight((prev) => Math.max(0, Math.round(((Number(prev) || 2) - 0.5) * 10) / 10));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={handleWeight}
                      onChange={(e) => setHandleWeight(e.target.value)}
                      onBlur={() => {
                        if (handleWeight === "" || isNaN(Number(handleWeight))) {
                          setHandleWeight(2.0);
                        } else {
                          setHandleWeight(Math.max(0, Math.min(20, Math.round(Number(handleWeight) * 10) / 10)));
                        }
                      }}
                      className="w-10 text-center text-xs font-black font-mono text-cyan-400 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setHandleWeight((prev) => Math.min(20, Math.round(((Number(prev) || 2) + 0.5) * 10) / 10));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 10KG Plates */}
                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-1">
                  <label className="text-[10px] text-cyan-300 uppercase font-mono block">
                    10KG Plates
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-cyan-500/20">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate10kgCount((prev) => Math.max(0, (Number(prev) || 0) - 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={plate10kgCount}
                      onChange={(e) => setPlate10kgCount(e.target.value)}
                      onBlur={() => {
                        if (plate10kgCount === "" || isNaN(Number(plate10kgCount))) {
                          setPlate10kgCount(0);
                        } else {
                          setPlate10kgCount(Math.max(0, Math.min(20, Math.floor(Number(plate10kgCount)))));
                        }
                      }}
                      className="w-8 text-center text-xs font-black font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate10kgCount((prev) => Math.min(20, (Number(prev) || 0) + 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5KG Plates */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    5KG Plates
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate5kgCount((prev) => Math.max(0, (Number(prev) || 0) - 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={plate5kgCount}
                      onChange={(e) => setPlate5kgCount(e.target.value)}
                      onBlur={() => {
                        if (plate5kgCount === "" || isNaN(Number(plate5kgCount))) {
                          setPlate5kgCount(0);
                        } else {
                          setPlate5kgCount(Math.max(0, Math.min(20, Math.floor(Number(plate5kgCount)))));
                        }
                      }}
                      className="w-8 text-center text-xs font-black font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate5kgCount((prev) => Math.min(20, (Number(prev) || 0) + 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2.5KG Plates */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    2.5KG Plates
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate25kgCount((prev) => Math.max(0, (Number(prev) || 0) - 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={plate25kgCount}
                      onChange={(e) => setPlate25kgCount(e.target.value)}
                      onBlur={() => {
                        if (plate25kgCount === "" || isNaN(Number(plate25kgCount))) {
                          setPlate25kgCount(0);
                        } else {
                          setPlate25kgCount(Math.max(0, Math.min(20, Math.floor(Number(plate25kgCount)))));
                        }
                      }}
                      className="w-8 text-center text-xs font-black font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate25kgCount((prev) => Math.min(20, (Number(prev) || 0) + 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2KG Plates */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    2KG Plates
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate2kgCount((prev) => Math.max(0, (Number(prev) || 0) - 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={plate2kgCount}
                      onChange={(e) => setPlate2kgCount(e.target.value)}
                      onBlur={() => {
                        if (plate2kgCount === "" || isNaN(Number(plate2kgCount))) {
                          setPlate2kgCount(0);
                        } else {
                          setPlate2kgCount(Math.max(0, Math.min(20, Math.floor(Number(plate2kgCount)))));
                        }
                      }}
                      className="w-8 text-center text-xs font-black font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate2kgCount((prev) => Math.min(20, (Number(prev) || 0) + 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 1.25KG Plates */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    1.25KG Plates
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate125kgCount((prev) => Math.max(0, (Number(prev) || 0) - 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={plate125kgCount}
                      onChange={(e) => setPlate125kgCount(e.target.value)}
                      onBlur={() => {
                        if (plate125kgCount === "" || isNaN(Number(plate125kgCount))) {
                          setPlate125kgCount(0);
                        } else {
                          setPlate125kgCount(Math.max(0, Math.min(20, Math.floor(Number(plate125kgCount)))));
                        }
                      }}
                      className="w-8 text-center text-xs font-black font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate125kgCount((prev) => Math.min(20, (Number(prev) || 0) + 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 1KG Plates */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block">
                    1KG Plates
                  </label>
                  <div className="flex items-center justify-between bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate1kgCount((prev) => Math.max(0, (Number(prev) || 0) - 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={plate1kgCount}
                      onChange={(e) => setPlate1kgCount(e.target.value)}
                      onBlur={() => {
                        if (plate1kgCount === "" || isNaN(Number(plate1kgCount))) {
                          setPlate1kgCount(0);
                        } else {
                          setPlate1kgCount(Math.max(0, Math.min(20, Math.floor(Number(plate1kgCount)))));
                        }
                      }}
                      className="w-8 text-center text-xs font-black font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setPlate1kgCount((prev) => Math.min(20, (Number(prev) || 0) + 1));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

      {/* HONORABLE MEDICAL SANCTUARY // INJURY & RECOVERY PROTOCOL */}
      <div
        className={`hunter-panel rounded-2xl sm:rounded-3xl border transition-all duration-300 p-4 sm:p-6 space-y-4 ${
          isSanctuaryActive
            ? "border-cyan-400/80 bg-gradient-to-b from-[#061426] to-[#040912] shadow-[0_0_30px_rgba(0,229,255,0.2)]"
            : "border-slate-800 bg-[#080c16]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isSanctuaryActive
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#00e5ff]"
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block font-solo">
                THE SYSTEM // SANCTUARY PROTOCOL
              </span>
              <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight">
                Honorable Medical Sanctuary
              </h3>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            {isSanctuaryActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                ACTIVE PROTECTION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                STANDBY / INACTIVE
              </span>
            )}
          </div>
        </div>

        {isSanctuaryActive ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Sanctuary Protocol Active — Hunter Account Safeguarded</span>
              </div>
              <p className="text-[11px] text-cyan-300/80 leading-relaxed font-hud">
                Your active streaks are frozen in time with zero decay. You are completely immune from missed daily directive penalties, Chicken status debuffs, and level demotions while resting and rehabilitating.
              </p>
              {sanctuaryExpiresAt && (
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled Expiration: {new Date(sanctuaryExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isSanctuaryPending}
              onClick={handleDeactivateSanctuary}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 hover:text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] active:scale-98 disabled:opacity-50"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{isSanctuaryPending ? "DEACTIVATING PROTOCOL..." : "⚡ DEACTIVATE SANCTUARY & RESUME HUNT"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Facing illness, physical injury, surgery, or emergency travel? Engage Medical Sanctuary to pause all daily requirements without losing your streak, rank, or character level.
            </p>

            {/* Reason Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-mono block">
                Quick Reason / Diagnosis:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Fever / Flu Recovery",
                  "Muscle Strain / Sprain",
                  "Joint / Tendon Pain",
                  "Surgery / Medical Rest",
                  "Travel / Emergency",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setSanctuaryReason(preset);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition border ${
                      sanctuaryReason === preset
                        ? "bg-cyan-950 border-cyan-400 text-cyan-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Custom Input */}
            <div className="space-y-1">
              <input
                type="text"
                value={sanctuaryReason}
                onChange={(e) => setSanctuaryReason(e.target.value)}
                placeholder="Reason for medical pause..."
                className="w-full bg-[#04060a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none transition"
              />
            </div>

            {/* Duration Options */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-mono block">
                Protected Duration:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { label: "Indefinite", days: 0 },
                  { label: "3 Days", days: 3 },
                  { label: "7 Days", days: 7 },
                  { label: "14 Days", days: 14 },
                  { label: "30 Days", days: 30 },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setSanctuaryDays(opt.days);
                    }}
                    className={`py-2 px-2 rounded-xl text-[10px] font-mono text-center transition border ${
                      sanctuaryDays === opt.days
                        ? "bg-cyan-950 border-cyan-400 text-cyan-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isSanctuaryPending}
              onClick={handleActivateSanctuary}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-cyan-500/60 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 hover:text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>{isSanctuaryPending ? "ENACTING SANCTUARY..." : "🛡️ ENGAGE MEDICAL SANCTUARY PROTOCOL"}</span>
            </button>
          </div>
        )}
      </div>

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
