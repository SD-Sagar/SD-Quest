"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { FitnessExperience } from "@/types";

export interface AuthActionResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const supabase = await createClient();
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If email not confirmed, auto-confirm using admin client and retry
  if (error && error.message.toLowerCase().includes("email not confirmed")) {
    try {
      const adminClient = createAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const existing = usersData.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        await adminClient.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
        });
        const retry = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = retry.error;
        data = retry.data;
      }
    } catch {
      // Fall through to error reporting below
    }
  }

  if (error) {
    return { error: error.message };
  }

  if (data?.user) {
    const profile = await PlayerRepository.getProfile(data.user.id);
    if (!profile) {
      redirect("/character-creation");
    }
  }

  redirect("/");
}

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Create confirmed user directly via Admin API — completely bypasses Supabase SMTP email limits
  const { data: adminData, error: adminErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (adminErr) {
    if (adminErr.message.toLowerCase().includes("already") || adminErr.message.toLowerCase().includes("exists")) {
      return {
        error: "An awakened hunter with this email already exists. Please log in with your credentials.",
      };
    }

    return { error: adminErr.message };
  }

  // User successfully created and pre-confirmed; establish browser session cookies
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr) {
    return { error: `Account created, but sign-in failed: ${signInErr.message}` };
  }

  redirect("/character-creation");
}

export async function logoutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      const active = await PlayerRepository.getActiveSession(user.id);
      if (active && (active.category === "sleep" || active.type === "sleep")) {
        const startedAt = active.started_at ? new Date(active.started_at).getTime() : 0;
        const elapsedSecs = startedAt > 0 ? (Date.now() - startedAt) / 1000 : 0;
        if (elapsedSecs < 60) {
          // Mistake start (< 1 minute): cleanly clear session without penalty
          await PlayerRepository.clearActiveSession(user.id);
        } else if (elapsedSecs < 4 * 60 * 60) {
          // Logged out before 4 hours: apply penalty and lock main sleep for 12 hours
          await PlayerRepository.applySleepDeprivationPenalty(user.id, Math.floor(elapsedSecs / 60));
          await PlayerRepository.clearActiveSession(user.id);
        } else {
          // Logged out after >= 4 hours (e.g. 8h or 9h): complete sleep session and lock main sleep for 12 hours
          await PlayerRepository.completeSleepSession(user.id, Math.floor(elapsedSecs / 60));
          await PlayerRepository.clearActiveSession(user.id);
        }
      }
    } catch (err) {
      console.error("Error handling active sleep session during logout:", err);
    }
  }

  await supabase.auth.signOut();
  redirect("/login");
}

export async function initializeCharacterAction(params: {
  name: string;
  dob: string;
  heightCm: number;
  weightKg: number;
  sex?: "male" | "female" | "other";
  fitnessExperience: FitnessExperience;
  fitnessObjective: string;
  activeMainQuest?: string;
  enableGym?: boolean;
  // Circadian Sleep Calibration
  initialSleepHours?: number;
  initialWakeUpTime?: string;
  // Home Gym Arsenal
  hasBench: boolean;
  dumbbellHandleWeightKg: number;
  hasBarbell?: boolean;
  barbellWeightKg?: number;
  hasEzBar?: boolean;
  ezBarWeightKg?: number;
  hasCablePulley?: boolean;
  hasLegDeveloper?: boolean;
  plate10kgCount?: number;
  plate5kgCount: number;
  plate25kgCount: number;
  plate2kgCount?: number;
  plate125kgCount: number;
  plate1kgCount?: number;
  // Daily Fuel & Budget
  sattuDailyGrams?: number;
  boiledEggsWeeklyDays?: number;
  monthlyBudgetInr: number;
}): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No active authenticated session found. Please sign in." };
  }

  try {
    // 1. Create Hunter Profile & Baseline Attributes
    await PlayerRepository.createProfile({
      id: user.id,
      name: params.name,
      dob: params.dob,
      height_cm: params.heightCm,
      weight_kg: params.weightKg,
      sex: params.sex || "male",
      fitness_experience: params.fitnessExperience,
      fitness_objective: params.fitnessObjective,
      active_main_quest: params.activeMainQuest || "fitness",
      enable_gym: params.enableGym !== undefined ? params.enableGym : true,
      initialSleepHours: params.initialSleepHours,
      initialWakeUpTime: params.initialWakeUpTime,
    });

    // 2. Initialize Equipment Inventory
    await WorkoutRepository.upsertEquipment(user.id, {
      has_bench: params.hasBench,
      dumbbell_handle_weight_kg: params.dumbbellHandleWeightKg,
      has_barbell: params.hasBarbell ?? false,
      barbell_weight_kg: params.barbellWeightKg ?? 7.0,
      has_ez_bar: params.hasEzBar ?? false,
      ez_bar_weight_kg: params.ezBarWeightKg ?? 5.0,
      has_cable_pulley: params.hasCablePulley ?? false,
      has_leg_developer: params.hasLegDeveloper ?? false,
      plate_10kg_count: params.plate10kgCount ?? 0,
      plate_5kg_count: params.plate5kgCount,
      plate_2_5kg_count: params.plate25kgCount,
      plate_2kg_count: params.plate2kgCount ?? 4,
      plate_1_25kg_count: params.plate125kgCount,
      plate_1kg_count: params.plate1kgCount ?? 4,
      custom_plates: [],
    });

    // 3. Initialize Nutrition Targets (daily staples & budget)
    await NutritionRepository.upsertTargets(user.id, {
      target_calories: 2200,
      target_protein_g: Math.round(params.weightKg * 1.6), // ~1.6g/kg
      target_carbs_g: 250,
      target_fat_g: 60,
      monthly_budget_inr: params.monthlyBudgetInr,
      sattu_daily_grams: params.sattuDailyGrams ?? 0,
      boiled_eggs_weekly_days: params.boiledEggsWeeklyDays ?? 4,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Awakening ceremony initialization failed:", err);
    return { error: err.message || "Failed to initialize hunter profile." };
  }
}

export async function updateHunterSettingsAction(params: {
  activeMainQuest?: string;
  enableGym?: boolean;
  name?: string;
  fitnessObjective?: string;
  monthlyBudgetInr?: number;
  hasBench?: boolean;
  dumbbellHandleWeightKg?: number;
  hasBarbell?: boolean;
  barbellWeightKg?: number;
  hasEzBar?: boolean;
  ezBarWeightKg?: number;
  hasCablePulley?: boolean;
  hasLegDeveloper?: boolean;
  plate10kgCount?: number;
  plate5kgCount?: number;
  plate25kgCount?: number;
  plate2kgCount?: number;
  plate125kgCount?: number;
  plate1kgCount?: number;
}): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    if (params.activeMainQuest || params.name || params.fitnessObjective || params.enableGym !== undefined) {
      await PlayerRepository.updateProfile(user.id, {
        ...(params.activeMainQuest ? { active_main_quest: params.activeMainQuest } : {}),
        ...(params.enableGym !== undefined ? { enable_gym: params.enableGym } : {}),
        ...(params.name ? { name: params.name } : {}),
        ...(params.fitnessObjective ? { fitness_objective: params.fitnessObjective } : {}),
      });
    }

    if (
      params.hasBench !== undefined ||
      params.hasBarbell !== undefined ||
      params.hasEzBar !== undefined ||
      params.hasCablePulley !== undefined ||
      params.hasLegDeveloper !== undefined ||
      params.plate10kgCount !== undefined ||
      params.plate5kgCount !== undefined
    ) {
      await WorkoutRepository.upsertEquipment(user.id, {
        has_bench: params.hasBench ?? true,
        dumbbell_handle_weight_kg: params.dumbbellHandleWeightKg ?? 2.0,
        has_barbell: params.hasBarbell ?? false,
        barbell_weight_kg: params.barbellWeightKg ?? 7.0,
        has_ez_bar: params.hasEzBar ?? false,
        ez_bar_weight_kg: params.ezBarWeightKg ?? 5.0,
        has_cable_pulley: params.hasCablePulley ?? false,
        has_leg_developer: params.hasLegDeveloper ?? false,
        plate_10kg_count: params.plate10kgCount ?? 0,
        plate_5kg_count: params.plate5kgCount ?? 8,
        plate_2_5kg_count: params.plate25kgCount ?? 4,
        plate_2kg_count: params.plate2kgCount ?? 4,
        plate_1_25kg_count: params.plate125kgCount ?? 8,
        plate_1kg_count: params.plate1kgCount ?? 4,
      });
    }

    if (params.monthlyBudgetInr !== undefined) {
      await NutritionRepository.upsertTargets(user.id, {
        monthly_budget_inr: params.monthlyBudgetInr,
      });
    }

    revalidatePath("/settings");
    revalidatePath("/gym");
    revalidatePath("/quests");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update settings" };
  }
}

