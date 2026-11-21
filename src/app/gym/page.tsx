import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GymTrainerHub } from "@/components/gym/GymTrainerHub";

export const dynamic = "force-dynamic";

export default async function GymPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, equipment, exerciseCatalog, completedWorkouts] = await Promise.all([
    PlayerRepository.getProfile(user.id),
    WorkoutRepository.getEquipment(user.id),
    WorkoutRepository.getExerciseCatalog(),
    WorkoutRepository.getTodaysCompletedWorkouts(user.id),
  ]);

  const isGymEnabled = profile?.enable_gym !== false;

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar enableGym={isGymEnabled} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              RANK: {profile?.rank || "Recruit"} (LEVEL {profile?.current_level || 1})
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono">
            MAIN QUEST // HOME-GYM TRAINER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 7 • 20-in-1 Bench & 60KG Dumbbell Companion • Rookie-to-Spartan Progression Engine
          </p>
        </div>

        <GymTrainerHub
          equipment={equipment}
          exerciseCatalog={exerciseCatalog}
          playerLevel={profile?.current_level || 1}
          playerRank={profile?.rank || "Recruit"}
          initialCompletedSessions={completedWorkouts}
          initialActiveSession={profile?.active_session_state || null}
          profile={profile}
        />
      </main>
      <div className="md:hidden">
        <BottomNav enableGym={isGymEnabled} />
      </div>
    </div>
  );
}
