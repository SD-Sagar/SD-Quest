"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { createInitialCharacter } from "@/store/slices/playerSlice";
import { updateEquipmentInventory } from "@/store/slices/workoutSlice";
import { triggerHaptic, calculateAge } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Shield,
  Dumbbell,
  Utensils,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
} from "lucide-react";

export default function CharacterCreationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState(1);

  // Step 1: Hunter Identity
  const [name, setName] = useState("");
  const [dob, setDob] = useState("2000-05-15");
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [fitnessExperience, setFitnessExperience] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [fitnessObjective, setFitnessObjective] = useState("Hypertrophy & Lifelong Strength");

  // Step 2: Equipment
  const [hasBench, setHasBench] = useState(true);
  const [handleWeight, setHandleWeight] = useState(2.0);
  const [plate5kgCount, setPlate5kgCount] = useState(8);   // 40 kg
  const [plate25kgCount, setPlate25kgCount] = useState(4); // 10 kg
  const [plate125kgCount, setPlate125kgCount] = useState(8); // 10 kg -> Total 60kg

  // Step 3: Diet & Bengali Nutrition
  const [sattuDailyGrams, setSattuDailyGrams] = useState(50);
  const [eggDaysPerWeek, setEggDaysPerWeek] = useState(4);
  const [monthlyBudget, setMonthlyBudget] = useState(4500);

  // Computed Age
  const age = calculateAge(dob);

  const totalPlateWeight = plate5kgCount * 5 + plate25kgCount * 2.5 + plate125kgCount * 1.25;

  const handleNext = () => {
    triggerHaptic("light");
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    triggerHaptic("light");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleAwakening = () => {
    triggerHaptic("heavy");
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    // 1. Dispatch Player Creation
    dispatch(
      createInitialCharacter({
        name: name.trim() || "Shadow Hunter",
        dob,
        heightCm: Number(heightCm),
        currentWeightKg: Number(weightKg),
        sex,
        fitnessExperience,
        fitnessObjective,
      })
    );

    // 2. Dispatch Equipment Inventory
    dispatch(
      updateEquipmentInventory({
        dumbbellHandleWeightKg: Number(handleWeight),
        hasBench,
        plates: [
          { weightKg: 5.0, count: Number(plate5kgCount) },
          { weightKg: 2.5, count: Number(plate25kgCount) },
          { weightKg: 1.25, count: Number(plate125kgCount) },
        ],
      })
    );

    // 3. Move to Command Center
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black relative">
      {/* Background Mana Aura Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-600/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl hunter-panel rounded-3xl border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
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
            Phase {step} of 4 • Set your baseline biology, equipment, and fuel parameters
          </p>

          {/* Stepper Dots */}
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

        {/* STEP 1: IDENTITY & BIOMETRICS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>STEP 1: HUNTER IDENTITY & BIOLOGY</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hunter Name / Alias *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your real name or alias (e.g. Riza)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Date of Birth (Dynamic Age Calculation) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
                  Computed Age: {age} Years Old (Ages with you automatically)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Biological Sex (For BMR & Caloric Kinetics)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Fitness Experience
                </label>
                <select
                  value={fitnessExperience}
                  onChange={(e) => setFitnessExperience(e.target.value as any)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="beginner">Beginner (Recruit Tier)</option>
                  <option value="intermediate">Intermediate (Warrior Tier)</option>
                  <option value="advanced">Advanced (Vanguard Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Objective
                </label>
                <input
                  type="text"
                  value={fitnessObjective}
                  onChange={(e) => setFitnessObjective(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PHYSICAL EQUIPMENT & PLATE INVENTORY */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Dumbbell className="w-4 h-4" />
              <span>STEP 2: AVAILABLE PHYSICAL ARSENAL (HOME GYM)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">20-in-1 Adjustable Workout Bench</span>
                <span className="text-xs text-emerald-400 font-mono font-bold">DETECTED & VERIFIED ✓</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Positions: Flat, Incline 15°, 30°, 45°, 60°, 75°, Seated 90°, and Decline.
              </p>
            </div>

            {/* Dumbbell Rods & Plate Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold uppercase">Adjustable Dumbbells + Plate Inventory</span>
                <span className="text-white font-bold">{totalPlateWeight} KG Plates Total</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    Handle (KG)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={handleWeight}
                    onChange={(e) => setHandleWeight(parseFloat(e.target.value) || 2)}
                    className="w-full text-center font-mono font-bold text-sm text-white bg-transparent"
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">Per DB Handle</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    5 KG Plates
                  </label>
                  <input
                    type="number"
                    value={plate5kgCount}
                    onChange={(e) => setPlate5kgCount(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-sm text-white bg-transparent"
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                    {plate5kgCount * 5} KG total
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    2.5 KG Plates
                  </label>
                  <input
                    type="number"
                    value={plate25kgCount}
                    onChange={(e) => setPlate25kgCount(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-sm text-white bg-transparent"
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                    {plate25kgCount * 2.5} KG total
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    1.25 KG Plates
                  </label>
                  <input
                    type="number"
                    value={plate125kgCount}
                    onChange={(e) => setPlate125kgCount(parseInt(e.target.value) || 0)}
                    className="w-full text-center font-mono font-bold text-sm text-white bg-transparent"
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                    {plate125kgCount * 1.25} KG total
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                The workout engine will exclusively generate plate combinations physically achievable
                with this exact plate inventory. No ghost weights.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: NUTRITION PROFILE & BENGALI STAPLES */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Utensils className="w-4 h-4" />
              <span>STEP 3: AFFORDABLE BENGALI FUEL & BUDGET</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <label className="text-xs font-bold text-white block">
                  Daily Sattu Serving (Grams)
                </label>
                <input
                  type="number"
                  step="10"
                  value={sattuDailyGrams}
                  onChange={(e) => setSattuDailyGrams(parseInt(e.target.value) || 50)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2 text-xs font-mono text-cyan-400 font-bold"
                />
                <span className="text-[10px] text-slate-500 block">
                  ~{(sattuDailyGrams * 0.21).toFixed(1)}g Plant Protein • High fiber & bioavailability
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <label className="text-xs font-bold text-white block">
                  Boiled Eggs Frequency (Days/Week)
                </label>
                <select
                  value={eggDaysPerWeek}
                  onChange={(e) => setEggDaysPerWeek(parseInt(e.target.value) || 4)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2 text-xs font-mono text-white"
                >
                  <option value="3">3 Days per week</option>
                  <option value="4">4 Days per week</option>
                  <option value="5">5 Days per week</option>
                  <option value="7">Everyday (7 Days)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">
                  High biological value animal protein quota
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="text-xs font-bold text-white block">
                Estimated Monthly Nutrition Budget (INR ₹)
              </label>
              <input
                type="number"
                step="500"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 4500)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2 text-xs font-mono text-emerald-400 font-bold"
              />
              <span className="text-[10px] text-slate-500 block">
                Calibrated for affordable Bengali staples (Sattu, Eggs, Rice, Dal, Local Fish)
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: AWAKENING CEREMONY CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-950/60 border-2 border-cyan-400/80 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/50">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase block">
                SYSTEM AWAKENING PROTOCOL READY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                WELCOME, HUNTER {name.toUpperCase() || "RECRUIT"}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You are entering the System at Level 1 Recruit. Your training volume, work commitments,
                nutrition, and habits will now directly dictate your character progression.
              </p>
            </div>

            {/* Profile Confirmation Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-left grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Name & Age</span>
                <span className="text-white font-bold">{name || "Hunter"} ({age} yrs)</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Rank</span>
                <span className="text-cyan-400 font-bold">RECRUIT (LVL 1)</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Equipment</span>
                <span className="text-slate-200">20-in-1 Bench + 60kg DBs</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Schedule</span>
                <span className="text-slate-200">Mon-Sat Split + 100 Skips</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Staple Fuel</span>
                <span className="text-slate-200">Sattu ({sattuDailyGrams}g) + Eggs ({eggDaysPerWeek}d/wk)</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Budget Target</span>
                <span className="text-emerald-400 font-bold">₹{monthlyBudget}/mo</span>
              </div>
            </div>

            <button
              onClick={handleAwakening}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-950 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              INITIATE AWAKENING // ENTER SYSTEM
            </button>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        {step < 4 && (
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="py-3 px-5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                PREVIOUS
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition disabled:opacity-40"
            >
              CONTINUE TO STEP {step + 1}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

