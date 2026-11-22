"use client";

import { useState, useEffect } from "react";
import { Brain, Flame } from "lucide-react";
import { useLiveFatigue } from "@/lib/hooks/useLiveFatigue";
import { getFatigueStatus } from "@/lib/calculations/fatigue";
import { getActiveSessionAction } from "@/server/actions/player.actions";

interface ActiveFatigueDockProps {
  initialMental?: number;
  initialPhysical?: number;
  lastUpdateIso?: string | null;
}

/**
 * Compact, icon-only mobile-responsive live biological fatigue telemetry dock.
 * Built specifically for active Gym workout headers, Solo trials, and Quest countdown modals.
 * When explicit session values are passed, directly renders real-time session numbers with zero lag.
 */
export function ActiveFatigueDock({
  initialMental,
  initialPhysical,
  lastUpdateIso,
}: ActiveFatigueDockProps) {
  const hasExplicitValues = initialMental !== undefined && initialPhysical !== undefined;

  const [baseMental, setBaseMental] = useState(initialMental ?? 0);
  const [basePhysical, setBasePhysical] = useState(initialPhysical ?? 0);
  const [baseLastUpdate, setBaseLastUpdate] = useState(lastUpdateIso || null);

  useEffect(() => {
    if (hasExplicitValues) return;

    let isMounted = true;
    async function syncFatigue() {
      try {
        const session = await getActiveSessionAction();
        if (isMounted && session) {
          if (session.mental_fatigue !== undefined) setBaseMental(Number(session.mental_fatigue) || 0);
          if (session.physical_fatigue !== undefined) setBasePhysical(Number(session.physical_fatigue) || 0);
          if (session.last_fatigue_update_at) setBaseLastUpdate(session.last_fatigue_update_at);
        }
      } catch {}
    }
    syncFatigue();
    return () => {
      isMounted = false;
    };
  }, [hasExplicitValues]);

  const live = useLiveFatigue(
    hasExplicitValues ? initialMental : baseMental,
    hasExplicitValues ? initialPhysical : basePhysical,
    hasExplicitValues ? null : baseLastUpdate
  );

  const finalMental = hasExplicitValues ? initialMental : live.mentalFatigue;
  const finalPhysical = hasExplicitValues ? initialPhysical : live.physicalFatigue;
  const displayMental = `${Number(finalMental).toFixed(1)}%`;
  const displayPhysical = `${Number(finalPhysical).toFixed(1)}%`;
  const fatigueStatus = getFatigueStatus(finalMental, finalPhysical);

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border transition-all duration-300 shrink-0 font-hud text-[10px] sm:text-xs shadow-sm ${
        fatigueStatus.isNeuralLockout
          ? "bg-red-950/80 border-red-500/70 text-red-300 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]"
          : fatigueStatus.isOverload
          ? "bg-amber-950/80 border-amber-500/70 text-amber-300 animate-pulse"
          : "bg-slate-950/85 border-slate-800 text-slate-200"
      }`}
      title={`Biological Fatigue: Mental ${displayMental} • Physical ${displayPhysical} (${fatigueStatus.statusLabel})`}
    >
      {/* Mental Exhaustion (Brain Icon Only) */}
      <div className="flex items-center gap-1">
        <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
        <span className="font-mono font-bold text-cyan-300">{displayMental}</span>
      </div>

      <span className="text-slate-700 select-none">|</span>

      {/* Physical Exhaustion (Flame Icon Only) */}
      <div className="flex items-center gap-1">
        <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
        <span className="font-mono font-bold text-amber-300">{displayPhysical}</span>
      </div>
    </div>
  );
}
