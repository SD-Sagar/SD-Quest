import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuestRepository } from "@/server/repositories/quest.repository";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { QuestsPageClient } from "./QuestsPageClient";
import { DayOfWeek } from "@/types";

export const dynamic = "force-dynamic";

const SPLIT_INFO: Record<DayOfWeek, { title: string; subtitle: string; isRest: boolean }> = {
  Monday: { title: "Legs & Lower Body Foundation", subtitle: "Quads, Hamstrings, Glutes, Calves", isRest: false },
  Tuesday: { title: "Chest Hypertrophy & Pectoral Power", subtitle: "Upper Chest, Mid Chest, Front Delts, Triceps", isRest: false },
  Wednesday: { title: "Back Width & Thickness", subtitle: "Lats, Rhomboids, Trapezius, Biceps", isRest: false },
  Thursday: { title: "Shoulder Overhead Power & Width", subtitle: "Lateral Deltoids, Anterior Deltoids", isRest: false },
  Friday: { title: "Deltoid Specialization & Rear Delts", subtitle: "Rear Delts, Lateral Delts, Rotator Cuff", isRest: false },
  Saturday: { title: "Arms Mastery (Biceps & Triceps)", subtitle: "Biceps, Triceps, Brachialis, Forearms", isRest: false },
  Sunday: { title: "Honored Rest & Mobility Sanctuary", subtitle: "Zero Lifting • Parasympathetic Recovery & Vagus Reset", isRest: true },
};

export default async function QuestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date();
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
  const todaySplitInfo = SPLIT_INFO[dayName] || SPLIT_INFO.Monday;

  const [quests, todaysWorkouts] = await Promise.all([
    QuestRepository.getQuests(user.id),
    WorkoutRepository.getTodaysCompletedWorkouts(user.id),
  ]);

  const isFullSplitSession = (s: any) =>
    !s.title?.toLowerCase().startsWith("solo trial") &&
    !s.notes?.includes("[SOLO_TRIAL]") &&
    !s.notes?.includes("[SINGLE_EXERCISE]");

  const isTodayWorkoutCompleted =
    todaysWorkouts.length > 0 &&
    todaysWorkouts.some((w) => w.split_day === dayName && isFullSplitSession(w));
  const todaySession = todaysWorkouts.find(
    (w) => w.split_day === dayName && isFullSplitSession(w)
  );

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono">
            QUEST FORGE &amp; COMMITMENTS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 5 &amp; 6 • Permanent, Scheduled, and Temporary Real-Life RPG Objectives
          </p>
        </div>

        <QuestsPageClient
          initialQuests={quests}
          mainQuestSplit={{
            dayName,
            title: todaySplitInfo.title,
            subtitle: todaySplitInfo.subtitle,
            isRest: todaySplitInfo.isRest,
            isCompleted: isTodayWorkoutCompleted,
            sessionData: todaySession,
          }}
        />
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
