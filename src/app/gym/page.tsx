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
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-28 md:pb-12 space-y-3.5 sm:space-y-6">
        {/* Sleek Mobile Header vs Detailed Desktop Header */}
        <div className="flex items-center justify-between gap-2 border-b border-cyan-950/40 pb-2.5 sm:border-0 sm:pb-0">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9.5px] sm:text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase font-hud">
                RANK: {profile?.rank || "Recruit"} (LVL {profile?.current_level || 1})
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mana-text-glow font-solo">
              HOME-GYM TRAINER
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono hidden sm:block mt-1">
              Section 7 • 20-in-1 Bench &amp; 60KG Dumbbell Companion • Rookie-to-Spartan Progression Engine
            </p>
          </div>
          <div className="sm:hidden flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold uppercase shadow-sm">
              SOLO LEVELING HUD
            </span>
          </div>
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
