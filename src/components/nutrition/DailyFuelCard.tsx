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
  Zap,
  AlertTriangle,
  Skull,
  Clock,
  Sparkles,
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

interface GroupedFuelLog {
  key: string;
  food_name: string;
  serving_size: string;
  count: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logIds: string[];
}

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
    triggerHaptic("medium");
    startTransition(async () => {
      await deleteMealLogAction(logId);
    });
  };

  // Group identical items (e.g. Boiled Eggs x3) to prevent endless vertical pile-up
  const groupedLogs: GroupedFuelLog[] = logs.reduce((acc: GroupedFuelLog[], log) => {
    const key = `${log.food_name}__${log.serving_size}`;
    const existing = acc.find((g) => g.key === key);
    if (existing) {
      existing.count += 1;
      existing.totalCalories += log.calories;
      existing.totalProtein = Number((existing.totalProtein + Number(log.protein_g)).toFixed(1));
      existing.totalCarbs = Number((existing.totalCarbs + Number(log.carbs_g)).toFixed(1));
      existing.totalFat = Number((existing.totalFat + Number(log.fat_g)).toFixed(1));
      existing.logIds.push(log.id);
    } else {
      acc.push({
        key,
        food_name: log.food_name,
        serving_size: log.serving_size,
        count: 1,
        totalCalories: log.calories,
        totalProtein: Number(Number(log.protein_g).toFixed(1)),
        totalCarbs: Number(Number(log.carbs_g).toFixed(1)),
        totalFat: Number(Number(log.fat_g).toFixed(1)),
        logIds: [log.id],
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-5">
      {/* 1. POISON DEBUFF ACTIVE BANNER (Solo Leveling Notification Style) */}
      {poisonInfo.isPoisoned && (
        <div className="solo-notification-modal rounded-2xl p-4 sm:p-5 space-y-2 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300">
              <Skull className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <span className="text-xs font-solo font-bold text-cyan-300 uppercase tracking-wider block mana-text-glow">
                SYSTEM TOXIN DETECTED // POISON DEBUFF ACTIVE
              </span>
              <span className="text-[11px] font-hud text-slate-300">
                Hepatic clearance remaining: <strong>{poisonInfo.formattedString}</strong>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-hud text-slate-300 border-t border-cyan-500/30">
            <div>
              ◆ <strong>Status Effect:</strong> -35% XP Reducer across all progress
            </div>
            <div>
              ◆ <strong>Clearance Horizon:</strong> Scaled by Hunter Rank ({profile?.rank || "Recruit"})
            </div>
          </div>
        </div>
      )}

      {/* 2. RECENT CONSUMPTION CONFIRMATION POP */}
      {recentlyLoggedName && (
        <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-hud flex items-center justify-between shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Logged: <strong>{recentlyLoggedName}</strong></span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase font-solo">Persisted ◆</span>
        </div>
      )}

      {/* 3. DAILY NUTRITION FUEL & MACROS METRIC CARD */}
      <div className="solo-frame rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-solo flex items-center gap-1.5">
                <span className="text-cyan-400">◆</span> NUTRITION FUEL &amp; MACRO MATRIX
              </h3>
              <span className="text-[10px] text-slate-400 font-hud">
                Dynamic Physical Telemetry Balance
              </span>
            </div>
          </div>
        </div>

        {/* 4 Macro Progress Bars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-hud">
          {/* Calories */}
          <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-slate-400 text-[11px]">Calories</span>
              <span className="text-white font-bold">{totalCalories} / {targetCal}</span>
            </div>
            <div className="h-1.5 w-full bg-[#05070c] rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#00e5ff]"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Target: {targetCal} kcal</span>
          </div>

          {/* Protein */}
          <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-slate-400 text-[11px]">Protein</span>
              <span className="text-cyan-300 font-bold">{totalProtein} / {targetProt}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#05070c] rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#00e5ff]"
                style={{ width: `${protPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Target: {targetProt}g</span>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-slate-400 text-[11px]">Carbs</span>
              <span className="text-white font-bold">{totalCarbs}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#05070c] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalCarbs / 250) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Glycogen &amp; Fiber</span>
          </div>

          {/* Fats */}
          <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-slate-400 text-[11px]">Lipids / Fat</span>
              <span className="text-slate-200 font-bold">{totalFat}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#05070c] rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalFat / 65) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Lipid Matrix</span>
          </div>
        </div>

        {/* Energy Telemetry Balance Bar */}
        <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/25 space-y-2 font-hud">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold uppercase">Daily Telemetry Balance</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              {energyBalance.netCaloricBalance >= 0 ? `+${energyBalance.netCaloricBalance}` : energyBalance.netCaloricBalance} kcal ({energyBalance.status.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Food Intake</span>
              <span className="text-white font-bold">{totalCalories} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Gym Burn</span>
              <span className="text-cyan-400 font-bold">{workoutCalories} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Walking Burn</span>
              <span className="text-white font-bold">{walkingCalories} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[10px] text-slate-500">Resting BMR</span>
              <span className="text-slate-300 font-bold">{energyBalance.bmrCalories} kcal</span>
            </div>
          </div>

          {energyBalance.visceralFatRisk && (
            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-hud flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Surplus Advisory: Caloric surplus exceeds +350 kcal. Minimize refined sugars and carbonated syrups.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. FOOD SELECTION ENVIRONMENT */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-hud">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("clean_staples");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "clean_staples"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>FITNESS FUEL ({CLEAN_STAPLE_FOODS.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("traditional_meals");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "traditional_meals"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-cyan-400" />
            <span>DAILY STAPLES ({TRADITIONAL_MEAL_FOODS.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("beverages_toxins");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "beverages_toxins"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-cyan-400" />
            <span>BEVERAGES &amp; LIQUOR ({BEVERAGE_TOXIN_FOODS.length})</span>
          </button>
        </div>

        {/* Render Tab 1: Clean Fitness Fuel */}
        {activeTab === "clean_staples" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {CLEAN_STAPLE_FOODS.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#070b14] border border-cyan-500/25 hover:border-cyan-400/60 transition flex flex-col justify-between gap-2.5 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                      FITNESS FUEL
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors font-solo">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-snug font-hud">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-300 flex-wrap">
                    <span className="text-white font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.proteinG}g P</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.carbsG}g C</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.fatG}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className="w-full solo-btn py-2 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CONSUME 1 PORTION</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render Tab 2: Daily Life Staples */}
        {activeTab === "traditional_meals" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {TRADITIONAL_MEAL_FOODS.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#070b14] border border-cyan-500/25 hover:border-cyan-400/60 transition flex flex-col justify-between gap-2.5 group"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                    DAILY STAPLE
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors font-solo">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-snug font-hud">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-300 flex-wrap">
                    <span className="text-white font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.proteinG}g P</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.carbsG}g C</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.fatG}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className="w-full solo-btn py-2 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CONSUME 1 PORTION</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render Tab 3: Beverages & Liquor */}
        {activeTab === "beverages_toxins" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {BEVERAGE_TOXIN_FOODS.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#070b14] border border-cyan-500/25 hover:border-cyan-400/60 transition flex flex-col justify-between gap-2.5 group"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                    <Skull className="w-3 h-3 text-cyan-400" />
                    {item.isPoisonous ? "POISON DEBUFF" : "LIQUID CALORIES"}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors font-solo">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-snug font-hud">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-300 flex-wrap">
                    <span className="text-white font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{item.proteinG}g P</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.carbsG}g C</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.fatG}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className="w-full solo-btn-secondary py-2 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CONSUME 1 PORTION</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. TODAY'S CONSUMED FUEL LEDGER (Clamped & Grouped Anti-Scroll) */}
      <div className="solo-frame rounded-2xl p-4 space-y-3 font-hud">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-solo font-bold text-white uppercase tracking-wider">
              CONSUMED FUEL MANIFEST ({logs.length} ITEMS)
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {totalCalories} kcal Total
          </span>
        </div>

        {groupedLogs.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#070b14]/70 border border-dashed border-slate-800 space-y-1.5">
            <Utensils className="w-5 h-5 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No fuel logged yet for today. Use the one-tap options above to log your meals.
            </p>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
            {groupedLogs.map((group) => (
              <div
                key={group.key}
                className="p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/25 flex items-center justify-between gap-2.5 text-xs font-mono group hover:border-cyan-400/50 transition"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white font-solo text-xs truncate">
                      {group.food_name}
                    </span>
                    {group.count > 1 && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-black text-[10px]">
                        × {group.count}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({group.serving_size} each)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                    <span className="text-white font-bold">{group.totalCalories} kcal</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{group.totalProtein}g P</span>
                    <span>•</span>
                    <span className="text-slate-300">{group.totalCarbs}g C</span>
                    <span>•</span>
                    <span className="text-slate-300">{group.totalFat}g F</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(group.logIds[group.logIds.length - 1])}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 transition shrink-0"
                  title="Undo 1 Portion"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
