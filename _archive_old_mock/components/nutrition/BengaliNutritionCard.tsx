"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  quickLogSattu,
  quickLogBoiledEgg,
  quickLogCoffee,
  logCustomMeal,
  removeMealItem,
  BENGALI_FOOD_PRESETS,
} from "@/store/slices/nutritionSlice";
import { addAttributePoints } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import {
  Utensils,
  Plus,
  Coffee,
  Egg,
  Flame,
  Trash2,
  Sparkles,
  ShieldAlert,
  IndianRupee,
  Layers,
} from "lucide-react";

export function BengaliNutritionCard() {
  const dispatch = useAppDispatch();
  const {
    targetCalories,
    targetProteinGrams,
    sattuGramsTotal,
    boiledEggsCountTotal,
    coffeeCupsTotal,
    loggedMeals,
  } = useAppSelector((state) => state.nutrition);

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState(400);
  const [customProtein, setCustomProtein] = useState(20);
  const [customCost, setCustomCost] = useState(45);
  const [customMealType, setCustomMealType] = useState<"Breakfast" | "Lunch" | "Snack" | "Dinner">("Lunch");

  // Calculate totals
  const totalCalories = loggedMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = Number(loggedMeals.reduce((sum, m) => sum + m.proteinGrams, 0).toFixed(1));
  const totalCostInr = loggedMeals.reduce((sum, m) => sum + (m.approxCostInr || 0), 0);

  const caloriePct = Math.min(100, Math.round((totalCalories / targetCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / targetProteinGrams) * 100));
  const costPerGramProtein = totalProtein > 0 ? (totalCostInr / totalProtein).toFixed(2) : "0.00";

  const handleSattuTap = () => {
    triggerHaptic("medium");
    dispatch(quickLogSattu(50));
    dispatch(addAttributePoints({ vitality: 0.05 }));
  };

  const handleEggTap = () => {
    triggerHaptic("medium");
    dispatch(quickLogBoiledEgg(1));
    dispatch(addAttributePoints({ vitality: 0.05 }));
  };

  const handleCoffeeTap = () => {
    triggerHaptic("light");
    dispatch(quickLogCoffee());
  };

  const handleAddPreset = (preset: typeof BENGALI_FOOD_PRESETS[0]) => {
    triggerHaptic("success");
    dispatch(
      logCustomMeal({
        name: preset.name,
        mealType: preset.category === "dinner" ? "Dinner" : preset.category === "lunch" ? "Lunch" : "Snack",
        calories: preset.calories,
        proteinGrams: preset.proteinGrams,
        carbsGrams: preset.carbsGrams,
        fatGrams: preset.fatGrams,
        approxCostInr: preset.approxCostInr,
        isVerified: false,
      })
    );
    dispatch(addAttributePoints({ vitality: 0.1 }));
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    triggerHaptic("success");
    dispatch(
      logCustomMeal({
        name: customName.trim(),
        mealType: customMealType,
        calories: Number(customCalories),
        proteinGrams: Number(customProtein),
        carbsGrams: 30,
        fatGrams: 10,
        approxCostInr: Number(customCost),
        isVerified: false,
      })
    );

    setShowAddCustom(false);
    setCustomName("");
  };

  return (
    <div className="space-y-4">
      {/* 1. Daily Fuel & Macro Gauges */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                BENGALI NUTRITION ENGINE
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                DAILY METABOLIC FUEL
              </h3>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">PROTEIN EFFICIENCY</span>
            <span className="text-cyan-400 font-bold">₹{costPerGramProtein}/g</span>
          </div>
        </div>

        {/* Protein Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 font-medium">PROTEIN TARGET</span>
            <span className="text-white font-bold">
              {totalProtein} / {targetProteinGrams}g ({proteinPct}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Calories Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 font-medium">CALORIE INTAKE</span>
            <span className="text-slate-300 font-bold">
              {totalCalories} / {targetCalories} kcal ({caloriePct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-orange-400 rounded-full transition-all duration-300"
              style={{ width: `${caloriePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. High-Yield Affordable Staples Quick-Dock */}
      <div className="hunter-panel rounded-3xl p-4 sm:p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            AFFORDABLE STAPLE LOGGERS
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">1-TAP IMMEDIATE LOG</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {/* Sattu Card */}
          <button
            onClick={handleSattuTap}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-left transition active:scale-95 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Sattu</span>
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="my-1.5">
              <span className="text-lg font-black font-mono text-white block">
                {sattuGramsTotal}g
              </span>
              <span className="text-[10px] text-slate-400 block">+50g (10.5g Prot)</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">~₹12 / serving</span>
          </button>

          {/* Boiled Egg Card */}
          <button
            onClick={handleEggTap}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 text-left transition active:scale-95 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Eggs</span>
              <Egg className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="my-1.5">
              <span className="text-lg font-black font-mono text-white block">
                {boiledEggsCountTotal} pcs
              </span>
              <span className="text-[10px] text-slate-400 block">+1 Egg (6.3g Prot)</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">~₹7 / egg</span>
          </button>

          {/* Coffee Card */}
          <button
            onClick={handleCoffeeTap}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 text-left transition active:scale-95 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Coffee</span>
              <Coffee className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="my-1.5">
              <span className="text-lg font-black font-mono text-white block">
                {coffeeCupsTotal} cups
              </span>
              <span className="text-[10px] text-slate-400 block">+1 Cup (Black)</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Alertness boost</span>
          </button>
        </div>
      </div>

      {/* 3. Bengali Meal Presets */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            BENGALI MEAL PRESETS
          </span>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Plus className="w-3 h-3" />
            {showAddCustom ? "CLOSE CUSTOM" : "+ CUSTOM MEAL"}
          </button>
        </div>

        {/* Custom Meal Form */}
        {showAddCustom && (
          <form onSubmit={handleCreateCustom} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 space-y-2.5">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Meal Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Handmade Roti + Dim Bhurji"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Cost (₹)
                </label>
                <input
                  type="number"
                  value={customCost}
                  onChange={(e) => setCustomCost(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider"
            >
              Add To Daily Diary
            </button>
          </form>
        )}

        {/* Presets List */}
        <div className="space-y-2">
          {BENGALI_FOOD_PRESETS.filter((p) => p.category === "lunch" || p.category === "dinner").map((preset) => (
            <div
              key={preset.id}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {preset.calories} kcal • {preset.proteinGrams}g Protein • ~₹{preset.approxCostInr}
                </span>
              </div>
              <button
                onClick={() => handleAddPreset(preset)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono font-bold transition"
              >
                + LOG
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Today's Logged Items Diary */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          TODAY&apos;S CONSUMPTION DIARY
        </span>

        {loggedMeals.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No food items logged today yet.</p>
        ) : (
          <div className="space-y-2">
            {loggedMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200 truncate">{meal.name}</span>
                    {!meal.isVerified && (
                      <span className="text-[9px] text-amber-400/80 font-mono bg-amber-950/40 px-1 rounded">
                        ESTIMATED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {meal.calories} kcal • {meal.proteinGrams}g Prot • {meal.timeLogged}
                  </span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic("light");
                    dispatch(removeMealItem(meal.id));
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                  title="Remove Item"
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

