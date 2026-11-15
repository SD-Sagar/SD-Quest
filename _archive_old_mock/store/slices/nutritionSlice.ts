import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LoggedMealItem {
  id: string;
  name: string;
  mealType: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  approxCostInr?: number;
  isVerified: boolean;
  timeLogged: string;
}

export interface BengaliFoodPreset {
  id: string;
  name: string;
  defaultServing: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  approxCostInr: number;
  category: "staple" | "lunch" | "dinner" | "snack";
}

export const BENGALI_FOOD_PRESETS: BengaliFoodPreset[] = [
  {
    id: "preset-sattu-sharbat",
    name: "Chana Sattu (Water + Lemon + Salt)",
    defaultServing: "50g (2 tbsp)",
    calories: 205,
    proteinGrams: 10.5,
    carbsGrams: 32.0,
    fatGrams: 2.5,
    approxCostInr: 12,
    category: "staple",
  },
  {
    id: "preset-boiled-egg",
    name: "Boiled Whole Egg",
    defaultServing: "1 large egg",
    calories: 74,
    proteinGrams: 6.3,
    carbsGrams: 0.5,
    fatGrams: 5.0,
    approxCostInr: 7,
    category: "staple",
  },
  {
    id: "preset-black-coffee",
    name: "Black Coffee (Unsweetened)",
    defaultServing: "1 cup (200ml)",
    calories: 4,
    proteinGrams: 0.3,
    carbsGrams: 0.2,
    fatGrams: 0.0,
    approxCostInr: 5,
    category: "staple",
  },
  {
    id: "preset-bengali-lunch-fish",
    name: "Bengali Lunch (Bhat + Machher Jhol + Dal + Shobji)",
    defaultServing: "1 plate (150g rice, 1 pc fish, 1 bowl dal, veg)",
    calories: 580,
    proteinGrams: 28.5,
    carbsGrams: 78.0,
    fatGrams: 14.0,
    approxCostInr: 65,
    category: "lunch",
  },
  {
    id: "preset-bengali-dinner-chicken",
    name: "Bengali Dinner (Bhat/Roti + Murgir Jhol + Dal)",
    defaultServing: "1 plate (100g chicken, rice/roti, dal)",
    calories: 620,
    proteinGrams: 34.0,
    carbsGrams: 72.0,
    fatGrams: 16.0,
    approxCostInr: 75,
    category: "dinner",
  },
  {
    id: "preset-roti-dal-dim",
    name: "Roti (3) + Bengali Dal + Dim Bhaja/Poached",
    defaultServing: "3 handmade rotis, 1 egg, 1 bowl dal",
    calories: 480,
    proteinGrams: 19.0,
    carbsGrams: 64.0,
    fatGrams: 12.0,
    approxCostInr: 30,
    category: "dinner",
  },
];

interface NutritionState {
  targetCalories: number;
  targetProteinGrams: number;
  weeklyEggQuotaDays: number; // e.g. 4 days/week
  monthlyBudgetInr: number;
  // Today's Staples
  sattuGramsTotal: number;
  boiledEggsCountTotal: number;
  coffeeCupsTotal: number;
  // Today's Meal Logs
  loggedMeals: LoggedMealItem[];
}

const initialMealLogs: LoggedMealItem[] = [
  {
    id: "meal-morning-sattu",
    name: "Chana Sattu Drink (50g)",
    mealType: "Breakfast",
    calories: 205,
    proteinGrams: 10.5,
    carbsGrams: 32.0,
    fatGrams: 2.5,
    approxCostInr: 12,
    isVerified: true,
    timeLogged: "08:30",
  },
  {
    id: "meal-coffee-1",
    name: "Black Coffee",
    mealType: "Breakfast",
    calories: 4,
    proteinGrams: 0.3,
    carbsGrams: 0.2,
    fatGrams: 0.0,
    approxCostInr: 5,
    isVerified: true,
    timeLogged: "09:00",
  },
  {
    id: "meal-lunch-fish",
    name: "Bengali Lunch (Bhat + Rui Machher Jhol + Dal)",
    mealType: "Lunch",
    calories: 580,
    proteinGrams: 28.5,
    carbsGrams: 78.0,
    fatGrams: 14.0,
    approxCostInr: 65,
    isVerified: false, // Estimated traditional recipe
    timeLogged: "13:30",
  },
];

const initialState: NutritionState = {
  targetCalories: 2200,
  targetProteinGrams: 110,
  weeklyEggQuotaDays: 4,
  monthlyBudgetInr: 4500,
  sattuGramsTotal: 50,
  boiledEggsCountTotal: 2,
  coffeeCupsTotal: 1,
  loggedMeals: initialMealLogs,
};

export const nutritionSlice = createSlice({
  name: "nutrition",
  initialState,
  reducers: {
    quickLogSattu: (state, action: PayloadAction<number>) => {
      const grams = action.payload || 50;
      state.sattuGramsTotal += grams;

      // 50g sattu = ~205 kcal, ~10.5g protein, ~32g carbs, ~2.5g fat, ~₹12
      const ratio = grams / 50;
      state.loggedMeals.push({
        id: `sattu-${Date.now()}`,
        name: `Chana Sattu (${grams}g)`,
        mealType: "Snack",
        calories: Math.round(205 * ratio),
        proteinGrams: Number((10.5 * ratio).toFixed(1)),
        carbsGrams: Number((32.0 * ratio).toFixed(1)),
        fatGrams: Number((2.5 * ratio).toFixed(1)),
        approxCostInr: Math.round(12 * ratio),
        isVerified: true,
        timeLogged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },

    quickLogBoiledEgg: (state, action: PayloadAction<number>) => {
      const count = action.payload || 1;
      state.boiledEggsCountTotal += count;

      // 1 egg = ~74 kcal, ~6.3g protein, ~5g fat, ~₹7
      state.loggedMeals.push({
        id: `egg-${Date.now()}`,
        name: `Boiled Egg (${count} pcs)`,
        mealType: "Snack",
        calories: 74 * count,
        proteinGrams: Number((6.3 * count).toFixed(1)),
        carbsGrams: 0.5 * count,
        fatGrams: 5.0 * count,
        approxCostInr: 7 * count,
        isVerified: true,
        timeLogged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },

    quickLogCoffee: (state) => {
      state.coffeeCupsTotal += 1;
      state.loggedMeals.push({
        id: `coffee-${Date.now()}`,
        name: "Black Coffee",
        mealType: "Snack",
        calories: 4,
        proteinGrams: 0.3,
        carbsGrams: 0.2,
        fatGrams: 0.0,
        approxCostInr: 5,
        isVerified: true,
        timeLogged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },

    logCustomMeal: (state, action: PayloadAction<Omit<LoggedMealItem, "id" | "timeLogged">>) => {
      state.loggedMeals.push({
        id: `custom-meal-${Date.now()}`,
        ...action.payload,
        timeLogged: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    },

    removeMealItem: (state, action: PayloadAction<string>) => {
      state.loggedMeals = state.loggedMeals.filter((m) => m.id !== action.payload);
    },

    setTargets: (
      state,
      action: PayloadAction<{ targetCalories?: number; targetProteinGrams?: number; budget?: number }>
    ) => {
      if (action.payload.targetCalories) state.targetCalories = action.payload.targetCalories;
      if (action.payload.targetProteinGrams) state.targetProteinGrams = action.payload.targetProteinGrams;
      if (action.payload.budget) state.monthlyBudgetInr = action.payload.budget;
    },
  },
});

export const {
  quickLogSattu,
  quickLogBoiledEgg,
  quickLogCoffee,
  logCustomMeal,
  removeMealItem,
  setTargets,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;

