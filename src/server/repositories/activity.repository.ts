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

    // Standard estimates if not provided
    const duration = activity.walking_duration_minutes ?? Math.round((activity.steps / 100) * 1.0); // ~100 steps/min
    const distance = activity.distance_km ?? Number(((activity.steps * 0.762) / 1000).toFixed(2)); // ~0.762m avg stride
    const calories = activity.estimated_calories_burned ?? Math.round(activity.steps * 0.04); // ~0.04 kcal/step

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

