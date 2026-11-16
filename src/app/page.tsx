import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { QuestRepository } from "@/server/repositories/quest.repository";
import { HydrationRepository } from "@/server/repositories/hydration.repository";
import { ActivityRepository } from "@/server/repositories/activity.repository";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { TodayDashboardView } from "@/components/dashboard/TodayDashboardView";
import { DayOfWeek } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Profile
  const profile = await PlayerRepository.getProfile(user.id);
  if (!profile) {
    redirect("/character-creation");
  }

  // 2. Fetch Attributes
  let attributes = await PlayerRepository.getAttributes(user.id);
  if (!attributes) {
    attributes = {
      id: "fallback",
      user_id: user.id,
      strength: 10,
      endurance: 10,
      intelligence: 10,
      discipline: 10,
      mentality: 10,
      agility: 10,
      vitality: 10,
      highest_strength: 10,
      highest_endurance: 10,
      highest_intelligence: 10,
      highest_discipline: 10,
      highest_mentality: 10,
      highest_agility: 10,
      highest_vitality: 10,
      updated_at: new Date().toISOString(),
    };
  }

  // 3. Compute current local date and day (preserves user timezone across midnight)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  const todayDateStr = `${year}-${month}-${date}`;

  const daysMap: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName: DayOfWeek = daysMap[today.getDay()];

  // 4. Fetch User Data in parallel
  const [
    equipment,
    exerciseCatalog,
    quests,
    hydrationLogs,
    activity,
    nutritionLogs,
    nutritionTargets,
    completedWorkouts,
  ] = await Promise.all([
    WorkoutRepository.getEquipment(user.id),
    WorkoutRepository.getExerciseCatalog(),
    QuestRepository.getQuests(user.id),
    HydrationRepository.getLogsForDate(user.id, todayDateStr),
    ActivityRepository.getActivityForDate(user.id, todayDateStr),
    NutritionRepository.getLogsForDate(user.id, todayDateStr),
    NutritionRepository.getTargets(user.id),
    WorkoutRepository.getTodaysCompletedWorkouts(user.id),
  ]);

  return (
    <TodayDashboardView
      profile={profile}
      attributes={attributes}
      equipment={equipment}
      exerciseCatalog={exerciseCatalog}
      quests={quests}
      hydrationLogs={hydrationLogs}
      activity={activity}
      nutritionLogs={nutritionLogs}
      nutritionTargets={nutritionTargets}
      todayDateStr={todayDateStr}
      dayName={dayName}
      completedWorkouts={completedWorkouts}
    />
  );
}
