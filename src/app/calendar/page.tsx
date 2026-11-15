import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { QuestRepository } from "@/server/repositories/quest.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MonthlyTileCalendar } from "@/components/calendar/MonthlyTileCalendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [sessions, quests] = await Promise.all([
    WorkoutRepository.getWorkoutSessions(user.id, 100),
    QuestRepository.getQuests(user.id),
  ]);

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono">
            DAILY CALENDAR &amp; WORKOUT LEDGER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 12 • Full-Cell Monthly Tile Ledger • Synchronized Workouts &amp; Date Quests
          </p>
        </div>

        <MonthlyTileCalendar sessions={sessions} quests={quests} />
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
