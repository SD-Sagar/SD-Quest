"use client";

import { useState, useTransition, useMemo } from "react";
import {
  logPresetMealAction,
  deleteMealLogAction,
  addCustomFoodAction,
  deleteCustomFoodAction,
  hidePresetFoodAction,
  unhidePresetFoodAction,
} from "@/server/actions/nutrition.actions";
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
  ChevronDown,
  ChevronUp,
  EyeOff,
  RotateCcw,
  X,
  PlusCircle,
  Wine,
  Coffee,
  ShieldAlert,
} from "lucide-react";

interface DailyFuelCardProps {
  logs: NutritionLog[];
  targets: DailyNutritionTargets | null;
  foodCatalog?: FoodItem[];
  hiddenPresetIds?: string[];
  profile: Profile | null;
  activity: ActivityLog | null;
  completedWorkouts?: WorkoutSession[];
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
  foodCatalog = [],
  hiddenPresetIds = [],
  profile,
  activity,
  completedWorkouts = [],
  dateStr,
}: DailyFuelCardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<FoodTab>("clean_staples");
  const [recentlyLoggedName, setRecentlyLoggedName] = useState<string | null>(null);
  const [isLedgerCollapsed, setIsLedgerCollapsed] = useState(false);

  // User Custom Foods & Hidden Presets state (synced with optimistic updates)
  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() =>
    foodCatalog.filter((f) => f.user_id !== null && f.category !== "__hidden_preset__")
  );
  const [hiddenIds, setHiddenIds] = useState<string[]>(hiddenPresetIds);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageHiddenOpen, setIsManageHiddenOpen] = useState(false);

  // Add Item Form State
  const [formName, setFormName] = useState("");
  const [formServing, setFormServing] = useState("");
  const [formCalories, setFormCalories] = useState("");
  const [formProtein, setFormProtein] = useState("");
  const [formCarbs, setFormCarbs] = useState("");
  const [formFat, setFormFat] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsPoisonous, setFormIsPoisonous] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Category matching helper
  const matchesCategory = (category: string, tab: FoodTab): boolean => {
    if (tab === "clean_staples") {
      return category === "clean_staple" || category === "clean_staples" || category === "staple";
    }
    if (tab === "traditional_meals") {
      return category === "traditional_meal" || category === "traditional_meals" || category === "meal";
    }
    if (tab === "beverages_toxins") {
      return (
        category === "beverage_toxin" ||
        category === "beverages_toxins" ||
        category === "beverage_poison" ||
        category === "beverage" ||
        category === "drink"
      );
    }
    return false;
  };

  // Base presets mapped by active tab
  const activeTabPresets: PresetFoodItem[] = useMemo(() => {
    if (activeTab === "clean_staples") return CLEAN_STAPLE_FOODS;
    if (activeTab === "traditional_meals") return TRADITIONAL_MEAL_FOODS;
    return BEVERAGE_TOXIN_FOODS;
  }, [activeTab]);

  // Visible vs Hidden presets
  const visiblePresets = useMemo(() => {
    return activeTabPresets.filter((p) => !hiddenIds.includes(p.id));
  }, [activeTabPresets, hiddenIds]);

  const hiddenPresetsForCurrentTab = useMemo(() => {
    return activeTabPresets.filter((p) => hiddenIds.includes(p.id));
  }, [activeTabPresets, hiddenIds]);

  // Custom items for active tab
  const customItemsForCurrentTab: PresetFoodItem[] = useMemo(() => {
    return customFoods
      .filter((f) => matchesCategory(f.category, activeTab))
      .map((f) => {
        const isPoisonous = f.is_poisonous || f.category === "beverage_poison";
        return {
          id: `custom_${f.id}`,
          name: f.name,
          category:
            activeTab === "clean_staples"
              ? "clean_staple"
              : activeTab === "traditional_meals"
              ? "traditional_meal"
              : "beverage_toxin",
          servingSize: f.default_serving,
          calories: f.calories,
          proteinG: Number(f.protein_g),
          carbsG: Number(f.carbs_g),
          fatG: Number(f.fat_g),
          estimatedCostInr: Math.round(Number(f.approx_cost_inr) || 0),
          isPoisonous,
          description:
            f.description ||
            (activeTab === "clean_staples"
              ? "Hunter-forged high bioavailability performance fuel."
              : activeTab === "traditional_meals"
              ? "Hunter-forged traditional daily nourishment."
              : isPoisonous
              ? "System toxin. Triggers [POISON DEBUFF] with hepatic clearance."
              : "Refreshing liquid hydration. Relieves neurological & physical fatigue."),
          isCustom: true,
          customFoodId: f.id,
        };
      });
  }, [customFoods, activeTab]);

  // Combined active food cards
  const activeItemsList = useMemo(() => {
    return [...customItemsForCurrentTab, ...visiblePresets];
  }, [customItemsForCurrentTab, visiblePresets]);

  // Tab Item Counts
  const countsByTab = useMemo(() => {
    const calcCount = (tab: FoodTab, presets: PresetFoodItem[]) => {
      const visible = presets.filter((p) => !hiddenIds.includes(p.id)).length;
      const custom = customFoods.filter((f) => matchesCategory(f.category, tab)).length;
      return visible + custom;
    };
    return {
      clean_staples: calcCount("clean_staples", CLEAN_STAPLE_FOODS),
      traditional_meals: calcCount("traditional_meals", TRADITIONAL_MEAL_FOODS),
      beverages_toxins: calcCount("beverages_toxins", BEVERAGE_TOXIN_FOODS),
    };
  }, [hiddenIds, customFoods]);

  // Consume action
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
        category: item.category,
      });
    });
  };

  // Hide preset food (optimistic)
  const handleHidePreset = (presetId: string) => {
    triggerHaptic("light");
    setHiddenIds((prev) => [...prev, presetId]);
    startTransition(async () => {
      await hidePresetFoodAction(presetId);
    });
  };

  // Unhide preset food (optimistic)
  const handleUnhidePreset = (presetId: string) => {
    triggerHaptic("medium");
    setHiddenIds((prev) => prev.filter((id) => id !== presetId));
    startTransition(async () => {
      await unhidePresetFoodAction(presetId);
    });
  };

  // Delete custom food (optimistic)
  const handleDeleteCustom = (customFoodId: string) => {
    triggerHaptic("heavy");
    setCustomFoods((prev) => prev.filter((f) => f.id !== customFoodId));
    startTransition(async () => {
      await deleteCustomFoodAction(customFoodId);
    });
  };

  // Create custom food submit
  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Item name is required.");
      return;
    }
    if (!formServing.trim()) {
      setFormError("1-Tap portion/serving size is required (e.g. 1 scoop, 1 bowl).");
      return;
    }
    const cals = parseInt(formCalories, 10);
    if (isNaN(cals) || cals < 0) {
      setFormError("Please enter valid calories (>= 0).");
      return;
    }

    setFormError(null);
    triggerHaptic("medium");

    const categoryMap: Record<FoodTab, "clean_staple" | "traditional_meal" | "beverage_toxin"> = {
      clean_staples: "clean_staple",
      traditional_meals: "traditional_meal",
      beverages_toxins: "beverage_toxin",
    };

    const targetCategory = categoryMap[activeTab];
    const isPoison = activeTab === "beverages_toxins" ? formIsPoisonous : false;

    startTransition(async () => {
      const created = await addCustomFoodAction({
        name: formName.trim(),
        category: targetCategory,
        serving_size: formServing.trim(),
        calories: cals,
        protein_g: parseFloat(formProtein) || 0,
        carbs_g: parseFloat(formCarbs) || 0,
        fat_g: parseFloat(formFat) || 0,
        cost_inr: parseFloat(formCost) || 0,
        description: formDescription.trim() || undefined,
        is_poisonous: isPoison,
      });

      if (created) {
        setCustomFoods((prev) => [created, ...prev]);
      }
      setIsAddModalOpen(false);
      resetForm();
    });
  };

  const resetForm = () => {
    setFormName("");
    setFormServing("");
    setFormCalories("");
    setFormProtein("");
    setFormCarbs("");
    setFormFat("");
    setFormCost("");
    setFormDescription("");
    setFormIsPoisonous(false);
    setFormError(null);
  };

  const handleDelete = (logId: string) => {
    triggerHaptic("medium");
    startTransition(async () => {
      await deleteMealLogAction(logId);
    });
  };

  // Group identical items in ledger
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
    <div className="space-y-4 sm:space-y-5">
      {/* 1. POISON DEBUFF BANNER */}
      {poisonInfo.isPoisoned && (
        <div className="solo-notification-modal rounded-2xl p-3.5 sm:p-5 space-y-2 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 shrink-0">
              <Skull className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-solo font-bold text-cyan-300 uppercase tracking-wider block mana-text-glow truncate">
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

      {/* 2. RECENT CONSUMPTION TOAST */}
      {recentlyLoggedName && (
        <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-hud flex items-center justify-between shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">
              Logged: <strong>{recentlyLoggedName}</strong>
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase font-solo shrink-0">
            Persisted ◆
          </span>
        </div>
      )}

      {/* 3. DAILY NUTRITION FUEL & MACROS METRIC CARD */}
      <div className="solo-frame rounded-2xl p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-hud">
          {/* Calories */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono text-[11px]">
              <span className="text-slate-400">Calories</span>
              <span className="text-white font-bold">
                {totalCalories} / {targetCal}
              </span>
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
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono text-[11px]">
              <span className="text-slate-400">Protein</span>
              <span className="text-cyan-300 font-bold">
                {totalProtein} / {targetProt}g
              </span>
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
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono text-[11px]">
              <span className="text-slate-400">Carbs</span>
              <span className="text-white font-bold">{totalCarbs}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#05070c] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalCarbs / 250) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Glycogen &amp; Fuel</span>
          </div>

          {/* Fats */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-1.5">
            <div className="flex justify-between items-baseline font-mono text-[11px]">
              <span className="text-slate-400">Lipids / Fat</span>
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
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#070b14] border border-cyan-500/25 space-y-2 font-hud">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5 text-xs text-white">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold uppercase text-[11px] sm:text-xs">Daily Energy Balance</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              {energyBalance.netCaloricBalance >= 0 ? `+${energyBalance.netCaloricBalance}` : energyBalance.netCaloricBalance} kcal ({energyBalance.status.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] sm:text-[11px] font-mono text-slate-400">
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[9px] text-slate-500">Food Intake</span>
              <span className="text-white font-bold">{totalCalories} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[9px] text-slate-500">Gym Burn</span>
              <span className="text-cyan-400 font-bold">{workoutCalories} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[9px] text-slate-500">Walking Burn</span>
              <span className="text-white font-bold">{walkingCalories} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="block text-[9px] text-slate-500">Resting BMR</span>
              <span className="text-slate-300 font-bold">{energyBalance.bmrCalories} kcal</span>
            </div>
          </div>

          {energyBalance.visceralFatRisk && (
            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-[11px] font-hud flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Surplus Advisory: Caloric surplus exceeds +350 kcal. Minimize refined sugars and syrups.</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. FOOD SELECTION ENVIRONMENT */}
      <div className="space-y-3">
        {/* Category Tabs (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-hud">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("clean_staples");
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "clean_staples"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>FITNESS FUEL ({countsByTab.clean_staples})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("traditional_meals");
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "traditional_meals"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-cyan-400" />
            <span>DAILY STAPLES ({countsByTab.traditional_meals})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("beverages_toxins");
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "beverages_toxins"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] font-solo"
                : "bg-[#070b14] text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-cyan-400" />
            <span>BEVERAGES &amp; LIQUOR ({countsByTab.beverages_toxins})</span>
          </button>
        </div>

        {/* Section Action Toolbar (Add Food + Manage Hidden) */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-cyan-500/20 font-hud">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            {activeTab === "clean_staples" && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">Performance protein &amp; clean nourishment</span>
                <span className="xs:hidden">Fitness Fuel</span>
              </>
            )}
            {activeTab === "traditional_meals" && (
              <>
                <Utensils className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">Authentic daily staples &amp; curries</span>
                <span className="xs:hidden">Daily Staples</span>
              </>
            )}
            {activeTab === "beverages_toxins" && (
              <>
                <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">Drinks relieve fatigue • Liquor inflicts poison</span>
                <span className="xs:hidden">Hydration &amp; Spirits</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Manage Hidden Button */}
            {hiddenPresetsForCurrentTab.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setIsManageHiddenOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition"
                title="Restore hidden default foods"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>RESTORE ({hiddenPresetsForCurrentTab.length})</span>
              </button>
            )}

            {/* Add Custom Food Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400 hover:bg-cyan-900 text-cyan-300 hover:text-white text-[11px] font-bold font-solo flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.2)] transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeTab === "beverages_toxins" ? "+ ADD DRINK" : "+ ADD FOOD"}</span>
            </button>
          </div>
        </div>

        {/* Food Items Grid (Responsive 1 col mobile, 2 col tablet/laptop, 3 col desktop) */}
        {activeItemsList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#070b14]/70 border border-dashed border-slate-800 space-y-2 font-hud">
            <Utensils className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No visible items in this section. Add a custom item or restore hidden default foods.
            </p>
            {hiddenPresetsForCurrentTab.length > 0 && (
              <button
                type="button"
                onClick={() => setIsManageHiddenOpen(true)}
                className="solo-btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restore Hidden Items ({hiddenPresetsForCurrentTab.length})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {activeItemsList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#070b14] border border-cyan-500/25 hover:border-cyan-400/60 transition flex flex-col justify-between gap-2.5 group relative"
              >
                <div className="space-y-1.5">
                  {/* Top Badge & Action Row */}
                  <div className="flex items-center justify-between gap-1">
                    {/* Badge */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.isCustom ? (
                        <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          HUNTER FORGED
                        </span>
                      ) : activeTab === "clean_staples" ? (
                        <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                          FITNESS FUEL
                        </span>
                      ) : activeTab === "traditional_meals" ? (
                        <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                          DAILY STAPLE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          {item.isPoisonous ? (
                            <>
                              <Skull className="w-2.5 h-2.5 text-red-400" />
                              <span className="text-red-300">POISON DEBUFF</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-2.5 h-2.5 text-cyan-400" />
                              <span>REFRESHING</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Hide or Delete action */}
                    {item.isCustom && item.customFoodId ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDeleteCustom(item.customFoodId!)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition shrink-0"
                        title="Delete this custom item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleHidePreset(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-amber-400 hover:bg-amber-950/40 transition shrink-0"
                        title="Hide item from daily view (can restore anytime)"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Serving */}
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors font-solo leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-cyan-400/90 font-mono">
                    Serving: {item.servingSize}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-snug font-hud line-clamp-2">
                    {item.description}
                  </p>

                  {/* Macro Pills */}
                  <div className="flex items-center gap-1.5 pt-0.5 text-[10px] font-mono text-slate-300 flex-wrap">
                    <span className="text-white font-bold bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.calories} kcal
                    </span>
                    <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {item.proteinG}g P
                    </span>
                    <span className="text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.carbsG}g C
                    </span>
                    <span className="text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.fatG}g F
                    </span>
                    {item.estimatedCostInr > 0 && (
                      <span className="text-slate-500 text-[9px]">
                        ₹{item.estimatedCostInr}
                      </span>
                    )}
                  </div>
                </div>

                {/* 1-Tap Consume Button */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConsumeItem(item)}
                  className={`w-full py-2.5 text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                    item.isPoisonous
                      ? "solo-btn-secondary border-red-500/50 text-red-300 hover:border-red-400 hover:bg-red-950/40"
                      : "solo-btn"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CONSUME 1 PORTION</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. TODAY'S CONSUMED FUEL LEDGER */}
      <div className="solo-frame rounded-2xl p-3.5 sm:p-4 space-y-3 font-hud">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-solo font-bold text-white uppercase tracking-wider">
              CONSUMED FUEL MANIFEST ({logs.length} ITEMS)
            </h4>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-cyan-300">
              {totalCalories} kcal Total
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setIsLedgerCollapsed(!isLedgerCollapsed);
              }}
              className="solo-btn-secondary py-1 px-2.5 text-[10px] flex items-center gap-1"
            >
              <span>{isLedgerCollapsed ? "EXPAND" : "COLLAPSE"}</span>
              {isLedgerCollapsed ? (
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              ) : (
                <ChevronUp className="w-3 h-3 text-cyan-400" />
              )}
            </button>
          </div>
        </div>

        {isLedgerCollapsed ? (
          <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">
              Logged Fuel Intake: <strong className="text-cyan-400">{totalCalories} kcal</strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              {totalProtein}g P • {totalCarbs}g C • {totalFat}g F
            </span>
          </div>
        ) : groupedLogs.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#070b14]/70 border border-dashed border-slate-800 space-y-1.5">
            <Utensils className="w-5 h-5 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No fuel logged yet for today. Use the one-tap options above to log your meals.
            </p>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2 animate-in fade-in duration-150">
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

      {/* 6. MODAL: ADD CUSTOM FUEL / DRINK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#090d16] border border-cyan-500/40 p-4 sm:p-6 space-y-4 shadow-[0_0_30px_rgba(0,229,255,0.25)] text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-solo">
                    FORGE NEW FUEL //{" "}
                    {activeTab === "clean_staples"
                      ? "FITNESS FUEL"
                      : activeTab === "traditional_meals"
                      ? "DAILY STAPLE"
                      : "BEVERAGE & TOXIN"}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-hud">
                    Add custom item with precise 1-tap portion telemetry
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-hud flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateCustomFood} className="space-y-3 font-hud">
              {/* Item Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === "clean_staples"
                      ? "e.g. Whey Protein Isolate Shake"
                      : activeTab === "traditional_meals"
                      ? "e.g. Chicken Rice with Dal"
                      : "e.g. Green Tea / Craft Beer"
                  }
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* 1-Tap Serving Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  1-Tap Portion / Serving Size *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 scoop (33g), 1 bowl (200g), 1 cup (250ml)"
                  value={formServing}
                  onChange={(e) => setFormServing(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* 4 Macros Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="120"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#050811] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-cyan-300 uppercase mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="24.0"
                    value={formProtein}
                    onChange={(e) => setFormProtein(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#050811] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-300 uppercase mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="3.0"
                    value={formCarbs}
                    onChange={(e) => setFormCarbs(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#050811] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="1.5"
                    value={formFat}
                    onChange={(e) => setFormFat(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#050811] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Cost & Optional Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Estimated Cost (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Notes / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Post-workout quick absorption"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050811] border border-cyan-500/30 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* BEVERAGES SECTION SPECIAL: Poison / Alcohol Toggle */}
              {activeTab === "beverages_toxins" && (
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                  <span className="block text-[11px] font-bold text-white uppercase font-solo">
                    BEVERAGE SYSTEM BEHAVIOR
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      onClick={() => setFormIsPoisonous(false)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition ${
                        !formIsPoisonous
                          ? "bg-cyan-950/80 border-cyan-400 text-cyan-200"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <strong className="block text-white text-[11px]">Refreshing Beverage</strong>
                        <span className="text-[10px] text-slate-400">
                          Relieves Mental &amp; Physical Fatigue
                        </span>
                      </div>
                    </label>

                    <label
                      onClick={() => setFormIsPoisonous(true)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition ${
                        formIsPoisonous
                          ? "bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Skull className="w-4 h-4 text-red-400 shrink-0" />
                      <div>
                        <strong className="block text-red-300 text-[11px]">Alcohol / Spirit</strong>
                        <span className="text-[10px] text-slate-400">
                          Applies Poison Debuff (-35% XP)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="solo-btn-secondary py-2 px-4 text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="solo-btn py-2 px-5 text-xs font-solo font-bold"
                >
                  {isPending ? "FORGING..." : "SAVE & ADD FUEL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: MANAGE HIDDEN PRESETS */}
      {isManageHiddenOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#090d16] border border-cyan-500/40 p-4 sm:p-6 space-y-4 shadow-[0_0_30px_rgba(0,229,255,0.25)] text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-solo">
                    RESTORE HIDDEN ITEMS ({hiddenPresetsForCurrentTab.length})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-hud">
                    Unhide default foods to bring them back to your daily matrix
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageHiddenOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden items list */}
            {hiddenPresetsForCurrentTab.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-hud">
                No items are currently hidden in this section.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {hiddenPresetsForCurrentTab.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#070b14] border border-slate-800 flex items-center justify-between gap-3 text-xs font-hud"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-solo text-xs truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({item.servingSize})
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.calories} kcal • {item.proteinG}g P • {item.carbsG}g C • {item.fatG}g F
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleUnhidePreset(item.id)}
                      className="solo-btn py-1.5 px-3 text-[11px] font-solo flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>RESTORE</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => setIsManageHiddenOpen(false)}
                className="solo-btn-secondary py-2 px-4 text-xs font-hud"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
