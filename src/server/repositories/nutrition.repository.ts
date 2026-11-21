import { createClient } from "@/lib/supabase/server";
import { DailyNutritionTargets, FoodItem, NutritionLog, MealType } from "@/types";

export class NutritionRepository {
  static async getTargets(userId: string): Promise<DailyNutritionTargets | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("daily_nutrition_targets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch nutrition targets: ${error.message}`);
    }

    return data as DailyNutritionTargets;
  }

  static async upsertTargets(userId: string, targets: Partial<DailyNutritionTargets>): Promise<DailyNutritionTargets> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("daily_nutrition_targets")
      .upsert({
        user_id: userId,
        target_calories: targets.target_calories ?? 2200,
        target_protein_g: targets.target_protein_g ?? 120,
        target_carbs_g: targets.target_carbs_g ?? 250,
        target_fat_g: targets.target_fat_g ?? 60,
        monthly_budget_inr: targets.monthly_budget_inr ?? 4500,
        sattu_daily_grams: targets.sattu_daily_grams ?? 50,
        boiled_eggs_weekly_days: targets.boiled_eggs_weekly_days ?? 4,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update nutrition targets: ${error.message}`);
    }

    return data as DailyNutritionTargets;
  }

  static async getFoodCatalog(userId: string): Promise<FoodItem[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("food_catalog")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .neq("category", "__hidden_preset__")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch food catalog: ${error.message}`);
    }

    return (data || []) as FoodItem[];
  }

  static async getHiddenPresetFoodIds(userId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("food_catalog")
      .select("name")
      .eq("user_id", userId)
      .eq("category", "__hidden_preset__");

    if (error) {
      console.error("Failed to fetch hidden presets:", error);
      return [];
    }

    return (data || []).map((row) => row.name);
  }

  static async addCustomFood(
    userId: string,
    item: {
      name: string;
      default_serving: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      approx_cost_inr?: number;
      category: string;
      description?: string;
      is_poisonous?: boolean;
    }
  ): Promise<FoodItem> {
    const supabase = await createClient();
    const cat = item.is_poisonous ? "beverage_poison" : item.category;

    const basePayload: any = {
      user_id: userId,
      name: item.name.trim(),
      default_serving: item.default_serving.trim(),
      calories: Math.round(Number(item.calories) || 0),
      protein_g: Number(Number(item.protein_g || 0).toFixed(1)),
      carbs_g: Number(Number(item.carbs_g || 0).toFixed(1)),
      fat_g: Number(Number(item.fat_g || 0).toFixed(1)),
      approx_cost_inr: Math.round(Number(item.approx_cost_inr) || 0),
      category: cat,
      is_verified: false,
    };

    let result = await supabase
      .from("food_catalog")
      .insert({
        ...basePayload,
        description: item.description?.trim() || null,
        is_poisonous: item.is_poisonous ?? false,
      })
      .select()
      .single();

    if (result.error && result.error.message.includes("column")) {
      result = await supabase.from("food_catalog").insert(basePayload).select().single();
    }

    if (result.error) {
      throw new Error(`Failed to add custom food: ${result.error.message}`);
    }

    return result.data as FoodItem;
  }

  static async deleteCustomFood(userId: string, foodId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("food_catalog")
      .delete()
      .eq("id", foodId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete custom food: ${error.message}`);
    }

    return true;
  }

  static async hidePresetFood(userId: string, presetId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("food_catalog")
      .select("id")
      .eq("user_id", userId)
      .eq("category", "__hidden_preset__")
      .eq("name", presetId)
      .maybeSingle();

    if (existing) return true;

    const { error } = await supabase.from("food_catalog").insert({
      user_id: userId,
      name: presetId,
      category: "__hidden_preset__",
      default_serving: "hidden",
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      approx_cost_inr: 0,
      is_verified: false,
    });

    if (error) {
      throw new Error(`Failed to hide preset food: ${error.message}`);
    }
    return true;
  }

  static async unhidePresetFood(userId: string, presetId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("food_catalog")
      .delete()
      .eq("user_id", userId)
      .eq("category", "__hidden_preset__")
      .eq("name", presetId);

    if (error) {
      throw new Error(`Failed to restore food: ${error.message}`);
    }
    return true;
  }

  static async getLogsForDate(userId: string, date: string): Promise<NutritionLog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", date)
      .order("logged_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch daily nutrition logs: ${error.message}`);
    }

    return (data || []) as NutritionLog[];
  }

  static async addLog(userId: string, item: {
    log_date: string;
    meal_type: MealType;
    food_name: string;
    serving_size: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    cost_inr?: number;
    is_verified?: boolean;
  }): Promise<NutritionLog> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("nutrition_logs")
      .insert({
        user_id: userId,
        log_date: item.log_date,
        meal_type: item.meal_type,
        food_name: item.food_name,
        serving_size: item.serving_size,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        cost_inr: item.cost_inr ?? 0,
        is_verified: item.is_verified ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log nutrition item: ${error.message}`);
    }

    return data as NutritionLog;
  }

  static async deleteLog(userId: string, logId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("nutrition_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete nutrition log: ${error.message}`);
    }

    return true;
  }
}

