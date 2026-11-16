/**
 * SD-Quest: Comprehensive Nutrition, Daily Fuel, and System Toxin Engine
 * Implements:
 * 1. Clean Fitness Fuel Staples (Eggs, Sattu, Black Coffee, Dalia, Sprouted Moong)
 * 2. Traditional Household Daily Staples (From food.txt - Authentic macros, zero "Bengali" text)
 * 3. Liquor & Cold Drinks (Toxins, Empty Calories, and Level-Scaled Poison Debuffs)
 * 4. Net Energy Balance & Visceral Fat Telemetry
 */

export interface PresetFoodItem {
  id: string;
  name: string;
  category: "clean_staple" | "traditional_meal" | "beverage_toxin";
  servingSize: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  estimatedCostInr: number;
  isPoisonous?: boolean;
  isHighSugarSurplus?: boolean;
  description: string;
}

/**
 * Section 1: Clean Fitness Fuel Staples
 * High-bioavailability, clean protein and sustained energy sources
 */
export const CLEAN_STAPLE_FOODS: PresetFoodItem[] = [
  {
    id: "staple_egg",
    name: "Boiled Whole Egg (1 pc)",
    category: "clean_staple",
    servingSize: "1 large egg (~50g)",
    calories: 74,
    proteinG: 6.3,
    fatG: 5.0,
    carbsG: 0.5,
    estimatedCostInr: 7,
    description: "Complete amino acid profile & choline for neuro-muscular transmission.",
  },
  {
    id: "staple_sattu",
    name: "Roasted Chana Sattu Drink",
    category: "clean_staple",
    servingSize: "50g powder in water with lemon",
    calories: 205,
    proteinG: 10.5,
    fatG: 2.5,
    carbsG: 32.0,
    estimatedCostInr: 12,
    description: "High-protein roasted gram beverage with high prebiotic fiber.",
  },
  {
    id: "staple_coffee",
    name: "Black Coffee (Unsweetened)",
    category: "clean_staple",
    servingSize: "1 cup (200ml)",
    calories: 4,
    proteinG: 0.3,
    fatG: 0.0,
    carbsG: 0.2,
    estimatedCostInr: 5,
    description: "Pure central nervous system alertness & thermogenic boost.",
  },
  {
    id: "staple_dalia",
    name: "High-Fiber Dalia Porridge",
    category: "clean_staple",
    servingSize: "1 cooked bowl (~150g)",
    calories: 150,
    proteinG: 5.5,
    fatG: 1.5,
    carbsG: 30.0,
    estimatedCostInr: 15,
    description: "Complex slow-digesting broken wheat for sustained glycogen replenishment.",
  },
  {
    id: "staple_sprouts",
    name: "Sprouted Moong & Chana",
    category: "clean_staple",
    servingSize: "1 small bowl (~100g)",
    calories: 120,
    proteinG: 8.0,
    fatG: 0.5,
    carbsG: 20.0,
    estimatedCostInr: 15,
    description: "Bio-active sprouted legumes rich in enzymes and plant protein.",
  },
  {
    id: "staple_curd",
    name: "Fresh Plain Curd / Tok Doi",
    category: "clean_staple",
    servingSize: "1 cup (~100g unsweetened)",
    calories: 60,
    proteinG: 3.5,
    fatG: 3.0,
    carbsG: 4.5,
    estimatedCostInr: 10,
    description: "Probiotic gut microbiome optimizer and gentle calcium source.",
  },
];

/**
 * Section 2: Traditional Daily Household Meals (Exact items from food.txt)
 * Real daily staples with authentic macronutrient profiles
 */
export const TRADITIONAL_MEAL_FOODS: PresetFoodItem[] = [
  {
    id: "trad_rice",
    name: "Plain Rice (Bhaat)",
    category: "traditional_meal",
    servingSize: "1 medium bowl (~200g)",
    calories: 175,
    proteinG: 4.0,
    fatG: 0.2,
    carbsG: 39.2,
    estimatedCostInr: 10,
    description: "Steamed grain staple; high glycemic index carbohydrate base.",
  },
  {
    id: "trad_ghee",
    name: "Pure Ghee (Clarified Butter)",
    category: "traditional_meal",
    servingSize: "1 tablespoon (~15g)",
    calories: 120,
    proteinG: 0.0,
    fatG: 14.0,
    carbsG: 0.0,
    estimatedCostInr: 15,
    description: "Concentrated saturated lipid matrix with butyric acid; 0% protein.",
  },
  {
    id: "trad_khichuri",
    name: "Traditional Khichuri",
    category: "traditional_meal",
    servingSize: "1 bowl (~250g)",
    calories: 320,
    proteinG: 8.5,
    fatG: 6.0,
    carbsG: 55.0,
    estimatedCostInr: 25,
    description: "Comfort slow-cooked rice and lentil porridge with balanced amino profile.",
  },
  {
    id: "trad_saag",
    name: "Saag / Shak (Leafy Greens Curry)",
    category: "traditional_meal",
    servingSize: "1 bowl (~150g, Palong/Lal Shak)",
    calories: 90,
    proteinG: 2.5,
    fatG: 5.0,
    carbsG: 8.0,
    estimatedCostInr: 15,
    description: "Micronutrient-dense greens prepared with mustard oil tempering.",
  },
  {
    id: "trad_mutton_kosha",
    name: "Mutton Kosha (Kosha Mangsho)",
    category: "traditional_meal",
    servingSize: "1 serving (~150g)",
    calories: 380,
    proteinG: 26.0,
    fatG: 22.0,
    carbsG: 10.0,
    estimatedCostInr: 95,
    description: "Slow-caramelized rich red meat curry; high protein and dense lipid load.",
  },
  {
    id: "trad_macher_jhol",
    name: "Macher Jhol (Fresh Fish Curry)",
    category: "traditional_meal",
    servingSize: "1 bowl with fish (~200g)",
    calories: 220,
    proteinG: 18.0,
    fatG: 10.0,
    carbsG: 8.0,
    estimatedCostInr: 45,
    description: "Light cumin and ginger fish stew; lean bio-available protein source.",
  },
  {
    id: "trad_shorshe_ilish",
    name: "Shorshe Ilish (Hilsa in Mustard Gravy)",
    category: "traditional_meal",
    servingSize: "1 piece with gravy (~150g)",
    calories: 310,
    proteinG: 22.0,
    fatG: 20.0,
    carbsG: 4.0,
    estimatedCostInr: 85,
    description: "High Omega-3 fatty fish cooked in pungent mustard seed paste.",
  },
  {
    id: "trad_cholar_dal",
    name: "Cholar Dal (Split Bengal Gram)",
    category: "traditional_meal",
    servingSize: "1 bowl (~150g)",
    calories: 210,
    proteinG: 7.0,
    fatG: 8.0,
    carbsG: 28.0,
    estimatedCostInr: 20,
    description: "Spiced chana dal with coconut slivers; moderate protein and complex carbs.",
  },
  {
    id: "trad_luchi",
    name: "Luchi (Deep-Fried Flatbread)",
    category: "traditional_meal",
    servingSize: "2 pieces (~50g)",
    calories: 180,
    proteinG: 3.0,
    fatG: 9.0,
    carbsG: 22.0,
    estimatedCostInr: 12,
    description: "Refined wheat flour deep-fried in oil; high lipid and low satiety index.",
  },
  {
    id: "trad_alur_dom",
    name: "Alur Dom (Spiced Potato Curry)",
    category: "traditional_meal",
    servingSize: "1 bowl (~150g)",
    calories: 170,
    proteinG: 3.0,
    fatG: 6.0,
    carbsG: 23.0,
    estimatedCostInr: 15,
    description: "Tender spiced potato cubes; starch-heavy with mild fat seasoning.",
  },
  {
    id: "trad_mishti_doi",
    name: "Mishti Doi (Sweet Cultured Curd)",
    category: "traditional_meal",
    servingSize: "1 earthen cup (~100g)",
    calories: 165,
    proteinG: 4.0,
    fatG: 5.0,
    carbsG: 25.0,
    estimatedCostInr: 25,
    description: "Fermented milk sweet with caramelized cane sugar; dense carbohydrate treat.",
  },
  {
    id: "trad_rosogolla",
    name: "Rosogolla (Syrup Cottage Cheese Ball)",
    category: "traditional_meal",
    servingSize: "1 piece (~50g)",
    calories: 140,
    proteinG: 4.0,
    fatG: 3.0,
    carbsG: 24.0,
    estimatedCostInr: 15,
    description: "Spongy chhena ball soaked in sucrose syrup; rapid glycemic spike.",
  },
];

/**
 * Section 3: Liquor & Famous Cold Drinks
 * Toxins, Empty Calories, and Visceral Fat Surges
 */
export const BEVERAGE_TOXIN_FOODS: PresetFoodItem[] = [
  {
    id: "toxin_liquor",
    name: "Liquor / Spirits (60ml Peg)",
    category: "beverage_toxin",
    servingSize: "60ml (Whiskey / Rum / Vodka)",
    calories: 150,
    proteinG: 0.0,
    fatG: 0.0,
    carbsG: 1.5,
    estimatedCostInr: 120,
    isPoisonous: true,
    description: "Hepatic toxin. Triggers [POISON DEBUFF] (-35% XP Reducer). Clearance window scales with level.",
  },
  {
    id: "bev_cold_drink",
    name: "Famous Cold Drink (300ml Can)",
    category: "beverage_toxin",
    servingSize: "300ml Can (Thums Up / Coke / Sprite)",
    calories: 145,
    proteinG: 0.0,
    fatG: 0.0,
    carbsG: 38.0,
    estimatedCostInr: 40,
    isHighSugarSurplus: true,
    description: "High-fructose corn syrup / sugar bomb. Rapid insulin surge and visceral fat accumulation; 0% protein.",
  },
  {
    id: "bev_energy_drink",
    name: "Caffeinated Energy Soda (250ml)",
    category: "beverage_toxin",
    servingSize: "250ml Can (Red Bull / Monster)",
    calories: 115,
    proteinG: 0.0,
    fatG: 0.0,
    carbsG: 27.0,
    estimatedCostInr: 125,
    isHighSugarSurplus: true,
    description: "Synthetic taurine, caffeine and sucrose. Temporary heart-rate spike with metabolic sugar surplus.",
  },
];

/**
 * Calculates the exact duration (in hours) of the Poison Debuff based on player level.
 * Level 1 Recruit = 24.0 hours baseline.
 * Level 50+ Spartan = 5.0 hours minimum.
 * Formula: Duration = max(5, 24 - (L - 1) * (19 / 49))
 */
export function calculatePoisonDurationHours(playerLevel: number): number {
  const lvl = Math.max(1, playerLevel);
  const hours = 24.0 - (lvl - 1) * (19.0 / 49.0);
  return Number(Math.max(5.0, hours).toFixed(1));
}

/**
 * Checks whether the player is currently under the Poison Debuff.
 */
export function isPoisonActive(poisonExpiresAt: string | null | undefined): boolean {
  if (!poisonExpiresAt) return false;
  return new Date(poisonExpiresAt).getTime() > Date.now();
}

/**
 * Calculates remaining hours and minutes for an active Poison Debuff.
 */
export function getRemainingPoisonTime(poisonExpiresAt: string | null | undefined): {
  isPoisoned: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  formattedString: string;
} {
  if (!poisonExpiresAt) {
    return { isPoisoned: false, hoursRemaining: 0, minutesRemaining: 0, formattedString: "" };
  }

  const diffMs = new Date(poisonExpiresAt).getTime() - Date.now();
  if (diffMs <= 0) {
    return { isPoisoned: false, hoursRemaining: 0, minutesRemaining: 0, formattedString: "" };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hoursRemaining = Math.floor(totalMinutes / 60);
  const minutesRemaining = totalMinutes % 60;

  return {
    isPoisoned: true,
    hoursRemaining,
    minutesRemaining,
    formattedString: `${hoursRemaining}h ${minutesRemaining}m`,
  };
}

/**
 * Calculates daily Net Caloric Balance comparing total consumed nutrition vs physical expenditure.
 */
export function calculateDailyEnergyBalance(params: {
  consumedCalories: number;
  workoutCalories: number;
  walkingCalories: number;
  weightKg: number;
  heightCm: number;
  age: number;
  sex?: string;
}): {
  bmrCalories: number;
  totalExpendedCalories: number;
  netCaloricBalance: number;
  status: "deficit" | "surplus" | "equilibrium";
  visceralFatRisk: boolean;
} {
  const {
    consumedCalories,
    workoutCalories,
    walkingCalories,
    weightKg = 70,
    heightCm = 175,
    age = 25,
    sex = "male",
  } = params;

  // Mifflin-St Jeor BMR Equation
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const bmrBase =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex.toLowerCase() === "female" ? -161 : 5);
  const bmrCalories = Math.round(bmrBase);

  // Active expenditure = Workout burn + Steps walking burn
  const totalExpendedCalories = Math.round(bmrCalories + workoutCalories + walkingCalories);
  const netCaloricBalance = consumedCalories - totalExpendedCalories;

  let status: "deficit" | "surplus" | "equilibrium" = "equilibrium";
  if (netCaloricBalance > 150) status = "surplus";
  else if (netCaloricBalance < -150) status = "deficit";

  // Visceral fat risk flagged if caloric surplus exceeds 350 kcal
  const visceralFatRisk = netCaloricBalance > 350;

  return {
    bmrCalories,
    totalExpendedCalories,
    netCaloricBalance,
    status,
    visceralFatRisk,
  };
}
