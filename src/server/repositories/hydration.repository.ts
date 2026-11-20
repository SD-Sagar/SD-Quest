import { createClient } from "@/lib/supabase/server";
import { HydrationLog } from "@/types";

export class HydrationRepository {
  static async getLogsForDate(userId: string, date: string): Promise<HydrationLog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hydration_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", date)
      .order("logged_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch hydration logs: ${error.message}`);
    }

    return (data || []) as HydrationLog[];
  }

  static async addLog(userId: string, date: string, amountMl = 300): Promise<HydrationLog> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hydration_logs")
      .insert({
        user_id: userId,
        log_date: date,
        amount_ml: amountMl,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log hydration: ${error.message}`);
    }

    // 5-minute cellular hydration surge: safely update profile if cooldown has elapsed
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("last_hydration_surge_at")
        .eq("id", userId)
        .maybeSingle();

      const lastSurge = prof?.last_hydration_surge_at ? new Date(prof.last_hydration_surge_at).getTime() : 0;
      const now = Date.now();
      if (now - lastSurge >= 5 * 60 * 1000) {
        await supabase
          .from("profiles")
          .update({ last_hydration_surge_at: new Date(now).toISOString() })
          .eq("id", userId);
      }
    } catch {
      // Non-fatal if column is pending migration
    }

    return data as HydrationLog;
  }

  static async undoLastLog(userId: string, date: string): Promise<boolean> {
    const supabase = await createClient();
    
    // Find the latest log for today
    const { data: latestLog, error: fetchError } = await supabase
      .from("hydration_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("log_date", date)
      .order("logged_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !latestLog) {
      return false;
    }

    const { error: deleteError } = await supabase
      .from("hydration_logs")
      .delete()
      .eq("id", latestLog.id);

    if (deleteError) {
      throw new Error(`Failed to undo hydration log: ${deleteError.message}`);
    }

    return true;
  }
}

