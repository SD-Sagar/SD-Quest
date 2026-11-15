"use client";

import { useTransition } from "react";
import { logMealAction, deleteMealLogAction } from "@/server/actions/nutrition.actions";
import { triggerHaptic } from "@/lib/utils";
import { Utensils, Plus, Trash2, ShieldCheck, Flame, Egg, Coffee, Sparkles } from "lucide-react";
import { NutritionLog, DailyNutritionTargets, FoodItem } from "@/types";

interface BengaliNutritionCardProps {
  logs: NutritionLog[];
  targets: DailyNutritionTargets | null;
  foodCatalog: FoodItem[];
  dateStr: string;
}

export function BengaliNutritionCard({
  logs,
  targets,
  foodCatalog,
  dateStr,
}: BengaliNutritionCardProps) {
  const [isPending, startTransition] = useTransition();

  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const totalProtein = Number(logs.reduce((sum, l) => sum + Number(l.protein_g), 0).toFixed(1));
  const totalCost = logs.reduce((sum, l) => sum + Number(l.cost_inr), 0);

  const targetCal = targets?.target_calories || 2200;
  const targetProt = targets?.target_protein_g || 110;
  const calPercent = Math.min(100, Math.round((totalCalories / targetCal) * 100));
  const protPercent = Math.min(100, Math.round((totalProtein / targetProt) * 100));

  // Quick logging helpers for staples
  const handleQuickLogSattu = () => {
    triggerHaptic("medium");
    startTransition(async () => {
      await logMealAction({
        log_date: dateStr,
        meal_type: "morning_snack",
        food_name: "Chana Sattu Drink (50g)",
        serving_size: "50g in water with lemon",
        calories: 205,
        protein_g: 10.5,
        carbs_g: 32.0,
        fat_g: 2.5,
        cost_inr: 12.0,
        is_verified: true,
      });
    });
  };

  const handleQuickLogEgg = () => {
    triggerHaptic("medium");
    startTransition(async () => {
      await logMealAction({
        log_date: dateStr,
        meal_type: "breakfast",
        food_name: "Boiled Whole Egg (1 pc)",
        serving_size: "1 large boiled egg",
        calories: 74,
        protein_g: 6.3,
        carbs_g: 0.5,
        fat_g: 5.0,
        cost_inr: 7.0,
        is_verified: true,
      });
    });
  };

  const handleQuickLogCoffee = () => {
    triggerHaptic("light");
    startTransition(async () => {
      await logMealAction({
        log_date: dateStr,
        meal_type: "morning_snack",
        food_name: "Black Coffee (Unsweetened)",
        serving_size: "1 cup (200ml)",
        calories: 4,
        protein_g: 0.3,
        carbs_g: 0.2,
        fat_g: 0.0,
        cost_inr: 5.0,
        is_verified: true,
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
    <div className="space-y-5">
      {/* Target Progress Card */}
      <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                AFFORDABLE BENGALI FUEL
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Budget: ₹{targets?.monthly_budget_inr || 4500}/mo • High Bioavailability
              </span>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400">
            ₹{totalCost.toFixed(0)} Spent Today
          </span>
        </div>

        {/* Macros Progress Bars */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Calories</span>
              <span className="text-white font-bold">{totalCalories} / {targetCal} kcal</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Protein</span>
              <span className="text-cyan-400 font-bold">{totalProtein} / {targetProt}g</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: `${protPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick One-Tap Staple Loggers */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            ONE-TAP BENGALI STAPLE LOGGERS
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleQuickLogSattu}
              disabled={isPending}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition disabled:opacity-50"
            >
              <span className="text-[10px] font-bold text-cyan-400 block font-mono">
                + SATTU (50G)
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                10.5g P • ₹12
              </span>
            </button>

            <button
              onClick={handleQuickLogEgg}
              disabled={isPending}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition disabled:opacity-50"
            >
              <span className="text-[10px] font-bold text-amber-400 block font-mono">
                + BOILED EGG
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                6.3g P • ₹7
              </span>
            </button>

            <button
              onClick={handleQuickLogCoffee}
              disabled={isPending}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition disabled:opacity-50"
            >
              <span className="text-[10px] font-bold text-slate-300 block font-mono">
                + BLACK COFFEE
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                4 kcal • ₹5
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Logged Items Ledger */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          TODAY&apos;S CONSUMED FUEL LOGS
        </h3>

        {logs.length === 0 ? (
          <div className="p-6 text-center rounded-2xl hunter-panel border border-slate-800 text-slate-500 text-xs">
            No fuel logged today yet. Tap a staple above!
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl hunter-panel border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.food_name}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {log.meal_type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                    {log.calories} kcal • {log.protein_g}g Protein • ₹{log.cost_inr}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition"
                  title="Remove log"
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

