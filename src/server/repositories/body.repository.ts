import { createClient } from "@/lib/supabase/server";
import { BodyMeasurement, ProgressPhoto } from "@/types";

export class BodyRepository {
  static async getMeasurements(userId: string, limit = 50): Promise<BodyMeasurement[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch body measurements: ${error.message}`);
    }

    return (data || []) as BodyMeasurement[];
  }

  static async addMeasurement(userId: string, measurement: Omit<BodyMeasurement, "id" | "user_id" | "created_at">): Promise<BodyMeasurement> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("body_measurements")
      .insert({
        user_id: userId,
        date: measurement.date || new Date().toISOString().split("T")[0],
        weight_kg: measurement.weight_kg,
        chest_cm: measurement.chest_cm || null,
        waist_cm: measurement.waist_cm || null,
        hips_cm: measurement.hips_cm || null,
        neck_cm: measurement.neck_cm || null,
        arms_cm: measurement.arms_cm || null,
        forearms_cm: measurement.forearms_cm || null,
        thighs_cm: measurement.thighs_cm || null,
        calves_cm: measurement.calves_cm || null,
        notes: measurement.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save body measurement: ${error.message}`);
    }

    // Also update weight_kg in profile
    await supabase
      .from("profiles")
      .update({ weight_kg: measurement.weight_kg, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return data as BodyMeasurement;
  }

  static async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch progress photos: ${error.message}`);
    }

    return (data || []) as ProgressPhoto[];
  }

  static async addProgressPhoto(userId: string, photo: { date: string; photo_url: string; photo_type: ProgressPhoto["photo_type"]; notes?: string }): Promise<ProgressPhoto> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("progress_photos")
      .insert({
        user_id: userId,
        date: photo.date,
        photo_url: photo.photo_url,
        photo_type: photo.photo_type,
        notes: photo.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save progress photo record: ${error.message}`);
    }

    return data as ProgressPhoto;
  }
}

