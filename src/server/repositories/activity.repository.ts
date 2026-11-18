import { createClient } from "@/lib/supabase/server";
import { ActivityLog } from "@/types";

export class ActivityRepository {
  static async getActivityForDate(userId: string, date: string): Promise<ActivityLog | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", date)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch daily activity log: ${error.message}`);
    }

    return data as ActivityLog;
  }

  static async upsertActivity(userId: string, activity: {
    log_date: string;
    steps: number;
    walking_duration_minutes?: number;
    distance_km?: number;
    estimated_calories_burned?: number;
    source?: "manual" | "device_synced";
    notes?: string;
  }): Promise<ActivityLog> {
    const supabase = await createClient();

    // Biomechanical & Compendium MET calculations if not explicitly provided
    let duration = activity.walking_duration_minutes;
    let distance = activity.distance_km;
    let calories = activity.estimated_calories_burned;

    if (duration === undefined || distance === undefined || calories === undefined) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("weight_kg, height_cm")
        .eq("id", userId)
        .single();

      const weight = profile?.weight_kg || 70;
      const height = profile?.height_cm || 175;
      const strideM = (height * 0.414) / 100;

      if (duration === undefined) {
        duration = Math.round(activity.steps / 100); // ~100 steps/min cadence
      }
      if (distance === undefined) {
        distance = Number(((activity.steps * strideM) / 1000).toFixed(2));
      }
      if (calories === undefined) {
        // 2024 Compendium of Physical Activities: Walking ~4 km/h on firm surface (MET 3.5)
        // kcal = MET * weight_kg * (duration_min / 60)
        calories = Math.round(3.5 * weight * (duration / 60));
      }
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .upsert({
        user_id: userId,
        log_date: activity.log_date,
        steps: activity.steps,
        walking_duration_minutes: duration,
        distance_km: distance,
        estimated_calories_burned: calories,
        source: activity.source || "manual",
        notes: activity.notes || null,
      }, { onConflict: "user_id,log_date" })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save activity log: ${error.message}`);
    }

    return data as ActivityLog;
  }

  static async getRecentActivities(userId: string, limit = 30): Promise<ActivityLog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent activities: ${error.message}`);
    }

    return (data || []) as ActivityLog[];
  }
}

