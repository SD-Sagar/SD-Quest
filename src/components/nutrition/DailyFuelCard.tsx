"use client";

import { useState, useTransition } from "react";
import { logPresetMealAction, deleteMealLogAction } from "@/server/actions/nutrition.actions";
import { triggerHaptic } from "@/lib/utils";
import {
  CLEAN_STAPLE_FOODS,
  TRADITIONAL_MEAL_FOODS,
  BEVERAGE_TOXIN_FOODS,
  PresetFoodItem,
  getRemainingPoisonTime,
  calculateDailyEnergyBalance,
} from "@/lib/calculations/nutrition";
import { calculateStepsCalories } from "@/lib/calculations/gym";
import {
  NutritionLog,
  DailyNutritionTargets,
  FoodItem,
  Profile,
  ActivityLog,
  WorkoutSession,
} from "@/types";
import {
  Utensils,
  Plus,
  Trash2,
  Flame,
  Zap,
  AlertTriangle,
  Skull,
  ShieldAlert,
  Droplets,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface DailyFuelCardProps {
  logs: NutritionLog[];
  targets: DailyNutritionTargets | null;
  foodCatalog: FoodItem[];
  profile: Profile | null;
  activity: ActivityLog | null;
  completedWorkouts: WorkoutSession[];
  dateStr: string;
}

type FoodTab = "clean_staples" | "traditional_meals" | "beverages_toxins";

export function DailyFuelCard({
  logs,
  targets,
  foodCatalog,
  profile,
  activity,
  completedWorkouts = [],
  dateStr,
}: DailyFuelCardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<FoodTab>("clean_staples");
  const [recentlyLoggedName, setRecentlyLoggedName] = useState<string | null>(null);

  // Compute Daily Nutrient Totals
  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const totalProtein = Number(logs.reduce((sum, l) => sum + Number(l.protein_g), 0).toFixed(1));
  const totalCarbs = Number(logs.reduce((sum, l) => sum + Number(l.carbs_g), 0).toFixed(1));
  const totalFat = Number(logs.reduce((sum, l) => sum + Number(l.fat_g), 0).toFixed(1));
  const totalCost = logs.reduce((sum, l) => sum + Number(l.cost_inr), 0);

  const targetCal = targets?.target_calories || 2200;
  const targetProt = targets?.target_protein_g || 110;
  const calPercent = Math.min(100, Math.round((totalCalories / targetCal) * 100));
  const protPercent = Math.min(100, Math.round((totalProtein / targetProt) * 100));

  // Workout & Physical Telemetry
  const workoutCalories = completedWorkouts.reduce((acc, w) => acc + (w.calories_burned || 0), 0);
  const stepsTelemetry = calculateStepsCalories(
    activity?.steps || 0,
    profile?.weight_kg || 70,
    profile?.height_cm || 175
  );
  const walkingCalories = stepsTelemetry.caloriesBurned;

  // Net Caloric Balance Engine
  const energyBalance = calculateDailyEnergyBalance({
    consumedCalories: totalCalories,
    workoutCalories,
    walkingCalories,
    weightKg: profile?.weight_kg || 70,
    heightCm: profile?.height_cm || 175,
    age: 25,
    sex: profile?.sex || "male",
  });

  // Poison Status Check
  const poisonInfo = getRemainingPoisonTime(profile?.poison_expires_at);

  const handleConsumeItem = (item: PresetFoodItem) => {
    triggerHaptic(item.isPoisonous ? "heavy" : "medium");
    setRecentlyLoggedName(item.name);
    setTimeout(() => setRecentlyLoggedName(null), 2500);

    startTransition(async () => {
      await logPresetMealAction({
        log_date: dateStr,
        food_name: item.name,
        serving_size: item.servingSize,
        calories: item.calories,
        protein_g: item.proteinG,
        carbs_g: item.carbsG,
        fat_g: item.fatG,
        cost_inr: item.estimatedCostInr,
        isPoisonous: item.isPoisonous,
      });
    });
  };

  const handleDelete = (logId: string) => {
    triggerHaptic("light");
    startTransition(async () => {
      await deleteMealLogAction(logId);
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. POISON DEBUFF ACTIVE BANNER */}
      {poisonInfo.isPoisoned && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-purple-950/90 border border-purple-500/60 shadow-xl shadow-purple-950/50 space-y-2 relative overflow-hidden animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-900/80 border border-purple-400/50 text-purple-300">
              <Skull className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-xs font-mono font-black text-purple-300 uppercase tracking-wider block">
                SYSTEM TOXIN DETECTED // POISON DEBUFF ACTIVE
              </span>
              <span className="text-[11px] font-mono text-purple-200">
                Hepatic clearance remaining: <strong>{poisonInfo.formattedString}</strong>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-purple-300/90 border-t border-purple-800/40">
            <div>
              • <strong>Status Effect:</strong> -35% XP Reducer across all progress
            </div>
            <div>
              • <strong>Clearance Horizon:</strong> Scaled by Hunter Rank ({profile?.rank || "Recruit"})
            </div>
          </div>
        </div>
      )}

      {/* 2. RECENT CONSUMPTION CONFIRMATION POP */}
      {recentlyLoggedName && (
        <div className="p-3 rounded-2xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Successfully logged: <strong>{recentlyLoggedName}</strong></span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase">Persisted ✓</span>
        </div>
      )}

      {/* 3. DAILY NUTRITION FUEL & MACROS METRIC CARD */}
      <div className="hunter-panel rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                DAILY NUTRITION FUEL &amp; MACROS
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-Life Fuel Intake • Dynamic Physical Telemetry Balance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-xl">
              ₹{totalCost.toFixed(0)} Spent Today
            </span>
          </div>
        </div>

        {/* 4 Macro Progress Bars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {/* Calories */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[11px]">Calories</span>
              <span className="text-amber-400 font-bold">{totalCalories} / {targetCal}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Target: {targetCal} kcal</span>
          </div>

          {/* Protein */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[11px]">Protein</span>
              <span className="text-cyan-400 font-bold">{totalProtein} / {targetProt}g</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${protPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Target: {targetProt}g</span>
          </div>

          {/* Carbs */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[11px]">Carbohydrates</span>
              <span className="text-blue-400 font-bold">{totalCarbs}g</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalCarbs / 250) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Glycogen &amp; Fiber</span>
          </div>

          {/* Fats */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[11px]">Fats</span>
              <span className="text-purple-400 font-bold">{totalFat}g</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalFat / 65) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Lipid Matrix</span>
          </div>
        </div>

        {/* 4. NET ENERGY EXPENDITURE BALANCE MATRIX */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white uppercase">Daily Energy Telemetry (Intake vs Output)</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                energyBalance.status === "deficit"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                  : energyBalance.status === "surplus"
                  ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {energyBalance.netCaloricBalance >= 0 ? `+${energyBalance.netCaloricBalance}` : energyBalance.netCaloricBalance} kcal ({energyBalance.status.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Food Intake</span>
              <span className="text-white font-bold">{totalCalories} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Gym Burn</span>
              <span className="text-cyan-400 font-bold">{workoutCalories} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Walking Burn</span>
              <span className="text-emerald-400 font-bold">{walkingCalories} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Resting BMR</span>
              <span className="text-purple-400 font-bold">{energyBalance.bmrCalories} kcal</span>
            </div>
          </div>

          {energyBalance.visceralFatRisk && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Surplus warning: Caloric surplus exceeds +350 kcal. Minimize refined sugars and cold drinks to prevent visceral lipid accumulation.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 5. FOOD SELECTION ENVIRONMENT */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("clean_staples");
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "clean_staples"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-lg shadow-cyan-950/50"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>CLEAN FITNESS FUEL ({CLEAN_STAPLE_FOODS.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("traditional_meals");
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "traditional_meals"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-950/50"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>DAILY LIFE STAPLES ({TRADITIONAL_MEAL_FOODS.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("beverages_toxins");
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "beverages_toxins"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-950/50"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Skull className="w-4 h-4 text-purple-400" />
            <span>LIQUOR &amp; COLD DRINKS ({BEVERAGE_TOXIN_FOODS.length})</span>
          </button>
        </div>

        {/* Render Tab 1: Clean Fitness Fuel */}
        {activeTab === "clean_staples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CLEAN_STAPLE_FOODS.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between gap-3 shadow-md group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                      FITNESS FUEL
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{item.estimatedCostInr}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-300 flex-wrap">
                    <span className="text-amber-400 font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.proteinG}g P</span>
                    <span>•</span>
                    <span className="text-blue-400">{item.carbsG}g C</span>
                    <span>•</span>
                    <span className="text-purple-400">{item.fatG}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className="w-full py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ONE-TAP CONSUME</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render Tab 2: Daily Life Household Staples */}
        {activeTab === "traditional_meals" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TRADITIONAL_MEAL_FOODS.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between gap-3 shadow-md group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      HOUSEHOLD STAPLE
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{item.estimatedCostInr}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-300 flex-wrap">
                    <span className="text-amber-400 font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.proteinG}g P</span>
                    <span>•</span>
                    <span className="text-blue-400">{item.carbsG}g C</span>
                    <span>•</span>
                    <span className="text-purple-400">{item.fatG}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className="w-full py-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ONE-TAP CONSUME</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render Tab 3: Liquor & Famous Cold Drinks */}
        {activeTab === "beverages_toxins" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BEVERAGE_TOXIN_FOODS.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-slate-900/90 border transition flex flex-col justify-between gap-3 shadow-md group ${
                  item.isPoisonous
                    ? "border-purple-500/50 hover:border-purple-400 bg-purple-950/10"
                    : "border-slate-800 hover:border-orange-500/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    {item.isPoisonous ? (
                      <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950 border border-purple-500/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Skull className="w-3 h-3 text-purple-400" />
                        POISONOUS TOXIN
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-950/60 border border-orange-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        HIGH SUGAR SURPLUS
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{item.estimatedCostInr}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-300 flex-wrap">
                    <span className="text-amber-400 font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.proteinG}g P</span>
                    <span>•</span>
                    <span className="text-blue-400">{item.carbsG}g C</span>
                    <span>•</span>
                    <span className="text-purple-400">{item.fatG}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    item.isPoisonous
                      ? "bg-purple-950/80 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/50"
                      : "bg-orange-950/80 hover:bg-orange-500 hover:text-black text-orange-300 border border-orange-500/40"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{item.isPoisonous ? "LOG ALCOHOL (TRIGGER DEBUFF)" : "LOG COLD DRINK (SURPLUS)"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. TODAY'S CONSUMED FUEL LEDGER */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              TODAY'S FUEL CONSUMPTION LEDGER ({logs.length} ITEMS)
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {totalCalories} kcal Total
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 space-y-2">
            <Utensils className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs font-mono text-slate-400">
              No fuel logged yet for today. Use the one-tap options above to log your meals.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono group hover:border-slate-700 transition"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white truncate">{log.food_name}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({log.serving_size})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    <span className="text-amber-400 font-bold">{log.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{log.protein_g}g P</span>
                    <span>•</span>
                    <span className="text-blue-400">{log.carbs_g}g C</span>
                    <span>•</span>
                    <span className="text-purple-400">{log.fat_g}g F</span>
                    <span>•</span>
                    <span className="text-emerald-400">₹{log.cost_inr}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(log.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition shrink-0"
                  title="Remove Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
