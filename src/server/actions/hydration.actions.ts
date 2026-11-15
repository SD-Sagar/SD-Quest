"use server";

import { createClient } from "@/lib/supabase/server";
import { HydrationRepository } from "@/server/repositories/hydration.repository";
import { revalidatePath } from "next/cache";

export async function tapWaterAction(date: string, amountMl = 300) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const log = await HydrationRepository.addLog(user.id, date, amountMl);
  revalidatePath("/");
  return log;
}

export async function undoWaterAction(date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const success = await HydrationRepository.undoLastLog(user.id, date);
  revalidatePath("/");
  return success;
}

