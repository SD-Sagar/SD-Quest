"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeCharacterAction, logoutAction } from "@/server/actions/auth.actions";
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
  Droplets,
  Footprints,
  Check,
  X,
  LogOut,
  Minus,
  Plus,
  Moon,
  Clock,
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
  const [heightCm, setHeightCm] = useState<number | string>(175);
  const [weightKg, setWeightKg] = useState<number | string>(70);
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [fitnessExperience, setFitnessExperience] = useState<FitnessExperience>("beginner");
  const [fitnessObjective, setFitnessObjective] = useState("Hypertrophy & Lifelong Physical Conditioning");

  // Step 2: Available Equipment (20-in-1 bench + rods + plates or calisthenics)
  const [hasBench, setHasBench] = useState(true);
  const [hasBarbell, setHasBarbell] = useState(true);
  const [barbellWeight, setBarbellWeight] = useState<number | string>(7.0);
  const [hasEzBar, setHasEzBar] = useState(true);
  const [ezBarWeight, setEzBarWeight] = useState<number | string>(5.0);
  const [hasCablePulley, setHasCablePulley] = useState(true);
  const [hasLegDeveloper, setHasLegDeveloper] = useState(true);
  const [handleWeight, setHandleWeight] = useState<number | string>(2.0);
  const [plate10kgCount, setPlate10kgCount] = useState<number | string>(2); // 20 kg
  const [plate5kgCount, setPlate5kgCount] = useState<number | string>(8); // 40 kg
  const [plate25kgCount, setPlate25kgCount] = useState<number | string>(4); // 10 kg
  const [plate2kgCount, setPlate2kgCount] = useState<number | string>(4); // 8 kg
  const [plate125kgCount, setPlate125kgCount] = useState<number | string>(4); // 5 kg
  const [plate1kgCount, setPlate1kgCount] = useState<number | string>(4); // 4 kg
  const [isCalisthenicsOnly, setIsCalisthenicsOnly] = useState(false);

  // Step 3: Baseline Routine Habits & Fuel (Professional & clean)
  const [initialSleepHours, setInitialSleepHours] = useState<number | string>(7.5);
  const [initialWakeUpTime, setInitialWakeUpTime] = useState("07:30");
  const [monthlyBudgetInr, setMonthlyBudgetInr] = useState<number | string>(4500);
  const [dailyWaterLitres, setDailyWaterLitres] = useState<number | string>(3.5);
  const [dailyStepTarget, setDailyStepTarget] = useState<number | string>(8000);
  const [boiledEggsWeeklyDays, setBoiledEggsWeeklyDays] = useState<number | string>(4);

  const [age, setAge] = useState(25);
  useEffect(() => {
    setAge(calculateAge(dob));
  }, [dob]);

  const totalPlateWeight = isCalisthenicsOnly
    ? 0
    : (Number(plate10kgCount) || 0) * 10 +
      (Number(plate5kgCount) || 0) * 5 +
      (Number(plate25kgCount) || 0) * 2.5 +
      (Number(plate2kgCount) || 0) * 2 +
      (Number(plate125kgCount) || 0) * 1.25 +
      (Number(plate1kgCount) || 0) * 1;

  const handleNext = () => {
    triggerHaptic("light");
    if (step === 1 && !enableGym) {
      setStep(3); // Skip equipment step if gym is disabled
    } else {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrev = () => {
    triggerHaptic("light");
    if (step === 3 && !enableGym) {
      setStep(1); // Return directly to identity step if gym was bypassed
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
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
        hasBench: enableGym && !isCalisthenicsOnly ? hasBench : false,
        dumbbellHandleWeightKg: Number(handleWeight),
        hasBarbell: enableGym && !isCalisthenicsOnly ? hasBarbell : false,
        barbellWeightKg: Number(barbellWeight),
        hasEzBar: enableGym && !isCalisthenicsOnly ? hasEzBar : false,
        ezBarWeightKg: Number(ezBarWeight),
        hasCablePulley: enableGym && !isCalisthenicsOnly ? hasCablePulley : false,
        hasLegDeveloper: enableGym && !isCalisthenicsOnly ? hasLegDeveloper : false,
        plate10kgCount: enableGym && !isCalisthenicsOnly ? Number(plate10kgCount) : 0,
        plate5kgCount: enableGym && !isCalisthenicsOnly ? Number(plate5kgCount) : 0,
        plate25kgCount: enableGym && !isCalisthenicsOnly ? Number(plate25kgCount) : 0,
        plate2kgCount: enableGym && !isCalisthenicsOnly ? Number(plate2kgCount) : 0,
        plate125kgCount: enableGym && !isCalisthenicsOnly ? Number(plate125kgCount) : 0,
        plate1kgCount: enableGym && !isCalisthenicsOnly ? Number(plate1kgCount) : 0,
        boiledEggsWeeklyDays: Number(boiledEggsWeeklyDays),
        monthlyBudgetInr: Number(monthlyBudgetInr),
        initialSleepHours: Number(initialSleepHours) || 7.5,
        initialWakeUpTime: initialWakeUpTime || "07:30",
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

  const currentDisplayPhase = !enableGym
    ? step === 1
      ? 1
      : step === 3
      ? 2
      : 3
    : step;
  const totalDisplayPhases = !enableGym ? 3 : 4;

  return (
    <div className="min-h-[100dvh] bg-[#07080b] text-slate-100 flex items-center justify-center p-3 sm:p-4 selection:bg-cyan-500 selection:text-black relative">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-600/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl hunter-panel rounded-3xl border border-cyan-500/40 p-4 sm:p-7 shadow-2xl relative z-10 space-y-4 sm:space-y-5 text-slate-200">
        {/* Top Utility Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-red-400 font-mono font-bold transition bg-slate-900/80 hover:bg-red-950/40 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-red-500/40 group"
              title="Sign out and return to login screen"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Login</span>
            </button>
          </form>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="text-[10px] sm:text-[11px] font-mono font-black tracking-widest text-cyan-400 uppercase">
              THE SYSTEM // AWAKENING CEREMONY
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-1 pb-1">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mana-text-glow">
            FORGE YOUR HUNTER PROFILE
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Phase {currentDisplayPhase} of {totalDisplayPhases} • Set baseline identity, quest domain &amp; habits
          </p>

          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {(enableGym ? [1, 2, 3, 4] : [1, 3, 4]).map((s) => (
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
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY, MAIN QUEST & BIOMETRICS */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>STEP 1: HUNTER IDENTITY &amp; MAIN QUEST DOMAIN</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Hunter Name / Alias *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name or hunter alias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            {/* Choose Primary Main Quest Focus */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Active Main Quest Domain
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
                        if (item.id === "fitness") {
                          setEnableGym(true);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-sm"
                          : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Gym Prompt for Non-Fitness Quests */}
            {activeMainQuest !== "fitness" ? (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      Include Gym Training Routine?
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Workouts &amp; strength progression alongside {activeMainQuest}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setEnableGym(true);
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 ${
                      enableGym
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>YES</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setEnableGym(false);
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 ${
                      !enableGym
                        ? "bg-slate-800 text-slate-200 border-slate-600 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>NO</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300 font-mono">
                <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Primary Quest: Full Physical Conditioning &amp; Arsenal Activated</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Date of Birth (Dynamic Age) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                  Age: {age} Years Old (Ages dynamically)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Biological Sex (Energy Kinetics)
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
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
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-1 focus-within:border-cyan-500 transition">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setHeightCm((prev) => Math.max(100, (Number(prev) || 175) - 1));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
                    title="Decrease height"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    onBlur={() => {
                      if (heightCm === "" || isNaN(Number(heightCm))) {
                        setHeightCm(175);
                      } else {
                        setHeightCm(Math.max(100, Math.min(250, Math.round(Number(heightCm)))));
                      }
                    }}
                    className="w-full text-center text-sm font-bold font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setHeightCm((prev) => Math.min(250, (Number(prev) || 175) + 1));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
                    title="Increase height"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Current Weight (KG)
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-1 focus-within:border-cyan-500 transition">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setWeightKg((prev) => Math.max(30, Math.round(((Number(prev) || 70) - 0.5) * 10) / 10));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
                    title="Decrease weight"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    onBlur={() => {
                      if (weightKg === "" || isNaN(Number(weightKg))) {
                        setWeightKg(70);
                      } else {
                        setWeightKg(Math.max(30, Math.min(250, Math.round(Number(weightKg) * 10) / 10)));
                      }
                    }}
                    className="w-full text-center text-sm font-bold font-mono text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setWeightKg((prev) => Math.min(250, Math.round(((Number(prev) || 70) + 0.5) * 10) / 10));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
                    title="Increase weight"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PHYSICAL ARSENAL (20-IN-1 BENCH, RODS, PLATES & CALISTHENICS) */}
        {step === 2 && enableGym && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Dumbbell className="w-4 h-4" />
                <span>STEP 2: AVAILABLE PHYSICAL ARSENAL</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  setIsCalisthenicsOnly(!isCalisthenicsOnly);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold border transition self-start sm:self-auto ${
                  isCalisthenicsOnly
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm"
                    : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                {isCalisthenicsOnly ? "✓ Bodyweight Calisthenics Mode" : "Switch to Free-Hand Calisthenics"}
              </button>
            </div>

            {isCalisthenicsOnly ? (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/30 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Pure Bodyweight Calisthenics Mode Active</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Zero weights or bench required. The System will configure progressive bodyweight splits (Push-Ups, Pike Press, Inverted Rows, Squats, and Core Protocols) with bi-weekly variation and level unlocks.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCalisthenicsOnly(false)}
                  className="text-xs text-cyan-400 font-bold underline pt-2 block mx-auto"
                >
                  Configure Weight Equipment Instead
                </button>
              </div>
            ) : (
              <>
                {/* 20-in-1 Bench & Apparatus Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Bench */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">20-in-1 Workout Bench</span>
                      <span className="text-[10px] text-slate-400 font-mono">Flat, Incline, Decline, Seated</span>
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
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-white block">Straight Barbell Rod</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">Weight:</span>
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
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-white block">Curly Rod (EZ Bar)</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">Weight:</span>
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
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Back Pull Chain / Cable</span>
                      <span className="text-[10px] text-slate-400 font-mono">Lat &amp; Cable Pulley Attachment</span>
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
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Bench Leg Developer</span>
                      <span className="text-[10px] text-slate-400 font-mono">Plate-Loaded Leg Extension &amp; Curl Attachment</span>
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

                {/* Plates & Dumbbells */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold uppercase">Weight Plates &amp; Dumbbell Handles</span>
                    <span className="text-white font-bold">{totalPlateWeight} KG Plates Total</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* DB Handle */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
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
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-1">
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
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
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
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
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
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
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
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
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
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
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
              </>
            )}
          </div>
        )}

        {/* STEP 3: BASELINE ROUTINE HABITS, FUEL & CIRCADIAN CALIBRATION */}
        {step === 3 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Utensils className="w-4 h-4" />
              <span>STEP 3: BASELINE ROUTINE HABITS &amp; CIRCADIAN CALIBRATION</span>
            </div>

            {/* MANDATORY CIRCADIAN SLEEP INITIALIZATION */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Circadian Sleep Baseline</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full self-start sm:self-auto">
                  AWAKENING TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Initializes your biological 26h awake timer and grants verified restorative sleep credit so physical training and quests are unlocked immediately.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Last Night Sleep Duration */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Last Night Sleep Duration
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setInitialSleepHours((prev) => Math.max(4, Math.round(((Number(prev) || 7.5) - 0.5) * 10) / 10));
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.5"
                        min="4"
                        max="14"
                        value={initialSleepHours}
                        onChange={(e) => setInitialSleepHours(e.target.value)}
                        onBlur={() => {
                          if (initialSleepHours === "" || isNaN(Number(initialSleepHours))) {
                            setInitialSleepHours(7.5);
                          } else {
                            setInitialSleepHours(Math.max(4, Math.min(14, Math.round(Number(initialSleepHours) * 10) / 10)));
                          }
                        }}
                        className="w-12 text-center text-sm font-mono font-bold text-cyan-400 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs font-mono text-slate-400">Hours</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setInitialSleepHours((prev) => Math.min(14, Math.round(((Number(prev) || 7.5) + 0.5) * 10) / 10));
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Wake-Up Time */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Wake-Up Time Today
                  </span>
                  <div className="flex items-center h-8 px-2 bg-slate-900 rounded-lg border border-slate-700/60 focus-within:border-cyan-500">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
                    <input
                      type="time"
                      value={initialWakeUpTime}
                      onChange={(e) => setInitialWakeUpTime(e.target.value)}
                      className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Monthly Budget */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Monthly Food Budget</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">₹{monthlyBudgetInr}</span>
                </div>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 focus-within:border-emerald-500/50">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setMonthlyBudgetInr((prev) => Math.max(500, (Number(prev) || 4500) - 250));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Decrease budget"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-slate-500 font-mono text-xs mr-1">₹</span>
                    <input
                      type="number"
                      step="250"
                      min="500"
                      max="100000"
                      value={monthlyBudgetInr}
                      onChange={(e) => setMonthlyBudgetInr(e.target.value)}
                      onBlur={() => {
                        if (monthlyBudgetInr === "" || isNaN(Number(monthlyBudgetInr))) {
                          setMonthlyBudgetInr(4500);
                        } else {
                          setMonthlyBudgetInr(Math.max(500, Math.min(100000, Math.round(Number(monthlyBudgetInr)))));
                        }
                      }}
                      className="w-24 text-center text-sm text-cyan-400 font-mono font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setMonthlyBudgetInr((prev) => Math.min(100000, (Number(prev) || 4500) + 250));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Increase budget"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  High-protein staples &amp; cellular recovery allocation
                </span>
              </div>

              {/* Daily Water Target */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span>Daily Hydration Target</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{dailyWaterLitres} L</span>
                </div>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 focus-within:border-cyan-500/50">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setDailyWaterLitres((prev) => Math.max(1, Math.round(((Number(prev) || 3.5) - 0.25) * 100) / 100));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Decrease water"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 flex items-center justify-center">
                    <input
                      type="number"
                      step="0.25"
                      min="1"
                      max="10"
                      value={dailyWaterLitres}
                      onChange={(e) => setDailyWaterLitres(e.target.value)}
                      onBlur={() => {
                        if (dailyWaterLitres === "" || isNaN(Number(dailyWaterLitres))) {
                          setDailyWaterLitres(3.5);
                        } else {
                          setDailyWaterLitres(Math.max(1, Math.min(10, Math.round(Number(dailyWaterLitres) * 100) / 100)));
                        }
                      }}
                      className="w-20 text-center text-sm text-cyan-400 font-mono font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-slate-500 font-mono text-xs ml-1">L</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setDailyWaterLitres((prev) => Math.min(10, Math.round(((Number(prev) || 3.5) + 0.25) * 100) / 100));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Increase water"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Metabolic kinetics &amp; cellular recovery hydration
                </span>
              </div>

              {/* Daily Step Target */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Footprints className="w-4 h-4 text-amber-400" />
                    <span>Daily Walking Target</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">{dailyStepTarget} steps</span>
                </div>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 focus-within:border-amber-500/50">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setDailyStepTarget((prev) => Math.max(1000, (Number(prev) || 8000) - 500));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Decrease step target"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 flex items-center justify-center">
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      max="50000"
                      value={dailyStepTarget}
                      onChange={(e) => setDailyStepTarget(e.target.value)}
                      onBlur={() => {
                        if (dailyStepTarget === "" || isNaN(Number(dailyStepTarget))) {
                          setDailyStepTarget(8000);
                        } else {
                          setDailyStepTarget(Math.max(1000, Math.min(50000, Math.round(Number(dailyStepTarget)))));
                        }
                      }}
                      className="w-24 text-center text-sm text-cyan-400 font-mono font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-slate-500 font-mono text-xs ml-1">steps</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setDailyStepTarget((prev) => Math.min(50000, (Number(prev) || 8000) + 500));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Increase step target"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Baseline NEAT calorie expenditure &amp; endurance
                </span>
              </div>

              {/* Boiled Eggs Weekly Days */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Utensils className="w-4 h-4 text-yellow-400" />
                    <span>Boiled Eggs Protocol</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-yellow-400">{boiledEggsWeeklyDays} days/wk</span>
                </div>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 focus-within:border-yellow-500/50">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setBoiledEggsWeeklyDays((prev) => Math.max(0, (Number(prev) || 4) - 1));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Decrease days"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 flex items-center justify-center">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={boiledEggsWeeklyDays}
                      onChange={(e) => setBoiledEggsWeeklyDays(e.target.value)}
                      onBlur={() => {
                        if (boiledEggsWeeklyDays === "" || isNaN(Number(boiledEggsWeeklyDays))) {
                          setBoiledEggsWeeklyDays(4);
                        } else {
                          setBoiledEggsWeeklyDays(Math.max(0, Math.min(7, Math.round(Number(boiledEggsWeeklyDays)))));
                        }
                      }}
                      className="w-16 text-center text-sm text-cyan-400 font-mono font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-slate-500 font-mono text-xs ml-1">days</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setBoiledEggsWeeklyDays((prev) => Math.min(7, (Number(prev) || 4) + 1));
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95"
                    title="Increase days"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Complete bio-available protein foundation
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
                <span className="text-slate-400">Circadian Baseline:</span>
                <span className="font-bold text-cyan-300">{initialSleepHours}h Sleep (Woke at {initialWakeUpTime})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Gym Module:</span>
                <span className="font-bold text-white">
                  {!enableGym
                    ? "Inactive (Dedicated to Main Quest)"
                    : isCalisthenicsOnly
                    ? "Active (Bodyweight Calisthenics)"
                    : `Active (${totalPlateWeight}kg Plates + Equipment)`}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Baseline Level:</span>
                <span className="font-bold text-cyan-400">Level 1 (Recruit)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attributes (The 7 Stats):</span>
                <span className="font-bold text-emerald-400">1.00 pts each (All Active)</span>
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
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-red-950/40 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                BACK TO LOGIN
              </button>
            </form>
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
