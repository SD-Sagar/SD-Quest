"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeCharacterAction } from "@/server/actions/auth.actions";
import { triggerHaptic, calculateAge } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Shield,
  Dumbbell,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Award,
  AlertCircle,
  Briefcase,
  BookOpen,
  DollarSign,
  Compass,
} from "lucide-react";
import { FitnessExperience } from "@/types";

export default function CharacterCreationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Hunter Identity & Biometrics + Main Quest
  const [name, setName] = useState("");
  const [activeMainQuest, setActiveMainQuest] = useState("fitness");
  const [enableGym, setEnableGym] = useState(true);
  const [dob, setDob] = useState("2000-01-01");
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [fitnessExperience, setFitnessExperience] = useState<FitnessExperience>("beginner");
  const [fitnessObjective, setFitnessObjective] = useState("Hypertrophy & Lifelong Physical Conditioning");

  // Step 2: Available Equipment (20-in-1 bench + 60kg plates)
  const [hasBench, setHasBench] = useState(true);
  const [handleWeight, setHandleWeight] = useState(2.0);
  const [plate5kgCount, setPlate5kgCount] = useState(8); // 40 kg
  const [plate25kgCount, setPlate25kgCount] = useState(4); // 10 kg
  const [plate2kgCount, setPlate2kgCount] = useState(4); // 8 kg
  const [plate125kgCount, setPlate125kgCount] = useState(4); // 5 kg
  const [plate1kgCount, setPlate1kgCount] = useState(4); // 4 kg -> Total ~67kg (or configured by user)

  // Step 3: Affordable Bengali Fuel & Budget
  const [sattuDailyGrams, setSattuDailyGrams] = useState(50);
  const [boiledEggsWeeklyDays, setBoiledEggsWeeklyDays] = useState(4);
  const [monthlyBudgetInr, setMonthlyBudgetInr] = useState(4500);

  const [age, setAge] = useState(25);
  useEffect(() => {
    setAge(calculateAge(dob));
  }, [dob]);

  const totalPlateWeight =
    plate5kgCount * 5 +
    plate25kgCount * 2.5 +
    plate2kgCount * 2 +
    plate125kgCount * 1.25 +
    plate1kgCount * 1;

  const handleNext = () => {
    triggerHaptic("light");
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    triggerHaptic("light");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleAwakening = async () => {
    triggerHaptic("heavy");
    setLoading(true);
    setError(null);

    try {
      const result = await initializeCharacterAction({
        name: name.trim() || "Awakened Hunter",
        activeMainQuest,
        enableGym,
        dob,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        sex,
        fitnessExperience,
        fitnessObjective,
        hasBench: enableGym ? hasBench : false,
        dumbbellHandleWeightKg: Number(handleWeight),
        plate5kgCount: enableGym ? Number(plate5kgCount) : 0,
        plate25kgCount: enableGym ? Number(plate25kgCount) : 0,
        plate2kgCount: enableGym ? Number(plate2kgCount) : 0,
        plate125kgCount: enableGym ? Number(plate125kgCount) : 0,
        plate1kgCount: enableGym ? Number(plate1kgCount) : 0,
        sattuDailyGrams: Number(sattuDailyGrams),
        boiledEggsWeeklyDays: Number(boiledEggsWeeklyDays),
        monthlyBudgetInr: Number(monthlyBudgetInr),
      });

      if (result.error) {
        setError(result.error);
        triggerHaptic("warning");
        setLoading(false);
        return;
      }

      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.5 },
      });

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to complete awakening protocol.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex items-center justify-center p-3 sm:p-4 selection:bg-cyan-500 selection:text-black relative">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-600/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl hunter-panel rounded-3xl border border-cyan-500/40 p-5 sm:p-8 shadow-2xl relative z-10 space-y-5 text-slate-200">
        {/* Header */}
        <div className="text-center space-y-1 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="text-[11px] font-mono font-black tracking-widest text-cyan-400 uppercase">
              THE SYSTEM // AWAKENING CEREMONY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mana-text-glow">
            FORGE YOUR HUNTER PROFILE
          </h1>
          <p className="text-xs text-slate-400">
            Phase {step} of 4 • Set your baseline identity, main quest domain &amp; fuel
          </p>

          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-cyan-400 shadow-sm shadow-cyan-400"
                    : s < step
                    ? "w-3 bg-cyan-700"
                    : "w-3 bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY, MAIN QUEST & BIOMETRICS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>STEP 1: HUNTER IDENTITY &amp; MAIN QUEST DOMAIN</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hunter Name / Alias *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name or hunter alias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            {/* Choose Primary Main Quest Focus */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Your Active Main Quest (Can be changed anytime)
              </label>
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
                        if (item.id === "fitness") setEnableGym(true);
                      }}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
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
            </div>

            {/* Enable Home Gym Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Activate Home Gym Companion
                </span>
                <span className="text-[11px] text-slate-400">
                  Include 20-in-1 bench &amp; 60kg plates calculator on dashboard
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableGym}
                onChange={(e) => setEnableGym(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Date of Birth (Dynamic Age) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
                  Chronological Age: {age} Years Old (Ages with you dynamically)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Biological Sex (For BMR &amp; Energy Kinetics)
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Height (CM)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Current Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HOME GYM ARSENAL (OR SKIP IF DISABLED) */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Dumbbell className="w-4 h-4" />
              <span>STEP 2: AVAILABLE PHYSICAL ARSENAL (HOME GYM)</span>
            </div>

            {!enableGym ? (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Compass className="w-8 h-8 text-cyan-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Home Gym Companion Inactive</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You selected <strong>{activeMainQuest.toUpperCase()}</strong> as your primary quest domain. Home gym tracking is optional and can be enabled anytime from Hunter Settings.
                </p>
                <button
                  type="button"
                  onClick={() => setEnableGym(true)}
                  className="text-xs text-cyan-400 font-bold underline pt-2"
                >
                  Enable Home Gym Instead
                </button>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">20-in-1 Adjustable Workout Bench</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">DETECTED ✓</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Positions: Flat, Incline 15°, 30°, 45°, 60°, 75°, Seated 90°, and Decline.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold uppercase">Adjustable Dumbbells + Plate Inventory</span>
                    <span className="text-white font-bold">{totalPlateWeight} KG Plates Total</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        Handle (KG)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={handleWeight}
                        onChange={(e) => setHandleWeight(parseFloat(e.target.value) || 2)}
                        className="w-full text-center text-sm font-black font-mono text-cyan-400 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        5KG Plates (Count)
                      </label>
                      <input
                        type="number"
                        value={plate5kgCount}
                        onChange={(e) => setPlate5kgCount(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        2.5KG Plates (Count)
                      </label>
                      <input
                        type="number"
                        value={plate25kgCount}
                        onChange={(e) => setPlate25kgCount(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        2KG Plates (Count)
                      </label>
                      <input
                        type="number"
                        value={plate2kgCount}
                        onChange={(e) => setPlate2kgCount(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        1.25KG Plates (Count)
                      </label>
                      <input
                        type="number"
                        value={plate125kgCount}
                        onChange={(e) => setPlate125kgCount(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center text-sm font-black font-mono text-white bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        1KG Plates (Count)
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
              </>
            )}
          </div>
        )}

        {/* STEP 3: NUTRITION & BUDGET */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Utensils className="w-4 h-4" />
              <span>STEP 3: AFFORDABLE BENGALI FUEL &amp; BUDGET TARGETS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Monthly Food Budget (INR ₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={monthlyBudgetInr}
                  onChange={(e) => setMonthlyBudgetInr(parseInt(e.target.value) || 4500)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-cyan-400 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">
                  Strictly realistic, affordable student/developer budget
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Daily Chana Sattu (Grams)
                </label>
                <input
                  type="number"
                  step="10"
                  value={sattuDailyGrams}
                  onChange={(e) => setSattuDailyGrams(parseInt(e.target.value) || 50)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">
                  ~205 kcal, 10.5g protein per 50g (~₹12)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY & AWAKENING */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>STEP 4: FINAL SYSTEM INITIALIZATION LEDGER</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hunter Alias:</span>
                <span className="font-bold text-white">{name || "Awakened Hunter"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Main Quest:</span>
                <span className="font-bold text-cyan-400 uppercase">{activeMainQuest}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Gym Module:</span>
                <span className="font-bold text-white">{enableGym ? "Active (60kg Arsenal)" : "Inactive"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Baseline Level:</span>
                <span className="font-bold text-cyan-400">Level 1 (Recruit)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attributes (The 7 Stats):</span>
                <span className="font-bold text-emerald-400">10.00 pts each (70 total)</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold hover:text-white flex items-center gap-1.5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              PREVIOUS
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-cyan-950"
            >
              NEXT PHASE
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleAwakening}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-xl shadow-cyan-950 disabled:opacity-50 animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "INITIALIZING HUNTER LEDGER..." : "COMMENCE AWAKENING PROTOCOL"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
