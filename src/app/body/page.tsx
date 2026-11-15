import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BodyRepository } from "@/server/repositories/body.repository";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BodyHeatmap } from "@/components/body/BodyHeatmap";
import { MeasurementTracker } from "@/components/body/MeasurementTracker";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const measurements = await BodyRepository.getMeasurements(user.id);

  async function handleAddMeasurement(m: any) {
    "use server";
    const s = await createClient();
    const {
      data: { user: authUser },
    } = await s.auth.getUser();
    if (!authUser) throw new Error("Unauthorized");
    return await BodyRepository.addMeasurement(authUser.id, m);
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <DesktopNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mana-text-glow font-mono">
            ACCURATE BODY PROGRESSION
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 8 • Interactive 16+ Muscle Anatomy Heatmap & Anthropometric Measurements
          </p>
        </div>

        <BodyHeatmap />
        <MeasurementTracker
          measurements={measurements}
          onAddMeasurement={handleAddMeasurement}
        />
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
