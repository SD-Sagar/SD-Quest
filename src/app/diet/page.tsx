import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { ActivityRepository } from "@/server/repositories/activity.repository";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { DailyFuelCard } from "@/components/nutrition/DailyFuelCard";

export const dynamic = "force-dynamic";

export default async function DietPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [profile, targets, foodCatalog, logs, activity, completedWorkouts, hiddenPresetIds] = await Promise.all([
    PlayerRepository.getProfile(user.id),
    NutritionRepository.getTargets(user.id),
    NutritionRepository.getFoodCatalog(user.id),
    NutritionRepository.getLogsForDate(user.id, todayStr),
    ActivityRepository.getActivityForDate(user.id, todayStr),
    WorkoutRepository.getTodaysCompletedWorkouts(user.id),
    NutritionRepository.getHiddenPresetFoodIds(user.id),
  ]);

  const isGymEnabled = profile?.enable_gym !== false;

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar enableGym={isGymEnabled} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono">
            DAILY NUTRITION &amp; FUEL SANCTUARY
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 9 • Macro Balance, Real Daily Life Meals, and System Toxin Clearance
          </p>
        </div>

        <DailyFuelCard
          logs={logs}
          targets={targets}
          foodCatalog={foodCatalog}
          hiddenPresetIds={hiddenPresetIds}
          profile={profile}
          activity={activity}
          completedWorkouts={completedWorkouts}
          dateStr={todayStr}
        />
      </main>
      <div className="md:hidden">
        <BottomNav enableGym={isGymEnabled} />
      </div>
    </div>
  );
}
