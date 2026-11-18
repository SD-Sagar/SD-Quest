import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
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
      strength: 1,
      endurance: 1,
      intelligence: 1,
      discipline: 1,
      mentality: 1,
      agility: 1,
      vitality: 1,
      highest_strength: 1,
      highest_endurance: 1,
      highest_intelligence: 1,
      highest_discipline: 1,
      highest_mentality: 1,
      highest_agility: 1,
      highest_vitality: 1,
      updated_at: new Date().toISOString(),
    };
  }

  // 3. Compute current local date and day (respects user timezone & midnight rollover via cookie)
  const cookieStore = await cookies();
  const userDateCookie = cookieStore.get("user_date")?.value;
  const userTzCookie = cookieStore.get("user_tz")?.value;

  const daysMap: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let todayDateStr: string;
  let dayName: DayOfWeek;

  if (userDateCookie && /^\d{4}-\d{2}-\d{2}$/.test(userDateCookie)) {
    todayDateStr = userDateCookie;
    const [y, m, d] = userDateCookie.split("-").map(Number);
    const localDate = new Date(y, m - 1, d);
    dayName = daysMap[localDate.getDay()];
  } else if (userTzCookie) {
    try {
      const now = new Date();
      todayDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: userTzCookie }).format(now);
      const dayStr = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: userTzCookie }).format(now);
      dayName = dayStr as DayOfWeek;
    } catch {
      const today = new Date();
      todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      dayName = daysMap[today.getDay()];
    }
  } else {
    const today = new Date();
    todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    dayName = daysMap[today.getDay()];
  }

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
