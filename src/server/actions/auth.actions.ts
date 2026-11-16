"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
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
    // If the user already exists in auth, update their password and pre-confirm them
    if (adminErr.message.toLowerCase().includes("already") || adminErr.message.toLowerCase().includes("exists")) {
      try {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existing = usersData.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          await adminClient.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          });
        }
      } catch (e) {
        console.error("Admin user sync error:", e);
      }

      const { error: signInErr, data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        return {
          error: "An account with this email exists. Please verify your password or use SIGN IN.",
        };
      }

      if (signInData?.user) {
        const profile = await PlayerRepository.getProfile(signInData.user.id);
        if (!profile) {
          redirect("/character-creation");
        }
      }
      redirect("/");
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
  // Home Gym Arsenal
  hasBench: boolean;
  dumbbellHandleWeightKg: number;
  plate5kgCount: number;
  plate25kgCount: number;
  plate2kgCount?: number;
  plate125kgCount: number;
  plate1kgCount?: number;
  // Daily Fuel & Budget
  sattuDailyGrams: number;
  boiledEggsWeeklyDays: number;
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
    });

    // 2. Initialize Equipment Inventory
    await WorkoutRepository.upsertEquipment(user.id, {
      has_bench: params.hasBench,
      dumbbell_handle_weight_kg: params.dumbbellHandleWeightKg,
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
      sattu_daily_grams: params.sattuDailyGrams,
      boiled_eggs_weekly_days: params.boiledEggsWeeklyDays,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Awakening ceremony initialization failed:", err);
    return { error: err.message || "Failed to initialize hunter profile." };
  }
}

export async function updateHunterSettingsAction(params: {
  activeMainQuest?: string;
  name?: string;
  fitnessObjective?: string;
  monthlyBudgetInr?: number;
  hasBench?: boolean;
  dumbbellHandleWeightKg?: number;
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
    if (params.activeMainQuest || params.name || params.fitnessObjective) {
      await PlayerRepository.updateProfile(user.id, {
        ...(params.activeMainQuest ? { active_main_quest: params.activeMainQuest } : {}),
        ...(params.name ? { name: params.name } : {}),
        ...(params.fitnessObjective ? { fitness_objective: params.fitnessObjective } : {}),
      });
    }

    if (params.hasBench !== undefined) {
      await WorkoutRepository.upsertEquipment(user.id, {
        has_bench: params.hasBench,
        dumbbell_handle_weight_kg: params.dumbbellHandleWeightKg ?? 2.0,
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

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update settings" };
  }
}

