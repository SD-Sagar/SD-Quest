import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NutritionRepository } from "@/server/repositories/nutrition.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BengaliNutritionCard } from "@/components/nutrition/BengaliNutritionCard";

export const dynamic = "force-dynamic";

export default async function DietPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayStr = new Date().toISOString().split("T")[0];

  const [targets, foodCatalog, logs] = await Promise.all([
    NutritionRepository.getTargets(user.id),
    NutritionRepository.getFoodCatalog(user.id),
    NutritionRepository.getLogsForDate(user.id, todayStr),
  ]);

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono">
            AFFORDABLE NUTRITION & FUEL
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 9 • Bengali Staple Planner (Sattu, Eggs, Coffee, Rice/Dal) & Macro Tracking
          </p>
        </div>

        <BengaliNutritionCard
          logs={logs}
          targets={targets}
          foodCatalog={foodCatalog}
          dateStr={todayStr}
        />
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
