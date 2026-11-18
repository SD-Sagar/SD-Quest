import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlayerRepository } from "@/server/repositories/player.repository";
import { WorkoutRepository } from "@/server/repositories/workout.repository";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SettingsClientView } from "./SettingsClientView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, equipment, nutritionTargets] = await Promise.all([
    PlayerRepository.getProfile(user.id),
    WorkoutRepository.getEquipment(user.id),
    NutritionRepository.getTargets(user.id),
  ]);

  if (!profile) redirect("/character-creation");

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        {/* Navigation Bar / Back to Dashboard */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold transition group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            SYSTEM // PREFERENCES
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            THE SYSTEM // CONFIGURATION LEDGER
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono mt-0.5">
            HUNTER PREFERENCES &amp; ARSENAL
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Re-tune your active Main Quest, 20-in-1 bench setup, 60kg plates inventory &amp; fuel budget
          </p>
        </div>

        <SettingsClientView
          profile={profile}
          equipment={equipment}
          nutritionTargets={nutritionTargets}
        />
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

