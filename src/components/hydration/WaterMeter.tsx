"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tapWaterAction, undoWaterAction } from "@/server/actions/hydration.actions";
import { triggerHaptic } from "@/lib/utils";
import { Droplets, Plus, RotateCcw } from "lucide-react";
import { HydrationLog } from "@/types";

interface WaterMeterProps {
  logs: HydrationLog[];
  targetMl?: number;
  dateStr: string;
}

export function WaterMeter({ logs, targetMl = 3000, dateStr }: WaterMeterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Client-side local date detection to properly handle midnight transitions in user timezone
  const getClientLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const clientToday = getClientLocalDate();
  // If the server provided a UTC date that is yesterday relative to client local time, client date takes priority
  const effectiveDateStr = dateStr === clientToday ? dateStr : clientToday;

  const serverTotalMl = logs.reduce((sum, log) => sum + log.amount_ml, 0);
  // Optimistic local state: updates instantly on tap with zero wait or manual refresh needed
  const [optimisticMl, setOptimisticMl] = useState<number>(serverTotalMl);

  useEffect(() => {
    setOptimisticMl(serverTotalMl);
  }, [serverTotalMl]);

  // Midnight day-reset watcher: auto-resets water to 0ml when clock crosses 12:00 AM
  useEffect(() => {
    const handleDayRollover = () => {
      setOptimisticMl(0);
      router.refresh();
    };

    window.addEventListener("dayRollover", handleDayRollover);

    const checkDayTransition = () => {
      const currentLocalDay = getClientLocalDate();
      if (dateStr !== currentLocalDay) {
        setOptimisticMl(0);
        router.refresh();
      }
    };
    const timer = setInterval(checkDayTransition, 10000);

    return () => {
      window.removeEventListener("dayRollover", handleDayRollover);
      clearInterval(timer);
    };
  }, [dateStr, router]);

  const currentMl = optimisticMl;
  const percentage = Math.min(100, Math.round((currentMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - currentMl);

  const handleAddWater = () => {
    triggerHaptic("medium");
    const nextTotal = currentMl + 300;
    setOptimisticMl(nextTotal); // Instant UI feedback!

    // 5-Minute Cellular Hydration Surge Logic:
    // 1 tap of water increases physical recovery rate by +0.10%/min and mental by +0.05%/min for 5 minutes.
    // During those 5 minutes, additional sips do not stack or affect fatigue.
    if (typeof window !== "undefined") {
      const storedLastSurge = localStorage.getItem("sd_last_hydration_surge_at");
      const lastSurgeTime = storedLastSurge ? new Date(storedLastSurge).getTime() : 0;
      const now = Date.now();

      if (now - lastSurgeTime >= 5 * 60 * 1000) {
        const surgeIso = new Date(now).toISOString();
        localStorage.setItem("sd_last_hydration_surge_at", surgeIso);
        window.dispatchEvent(
          new CustomEvent("hydrationSurgeTriggered", {
            detail: { timestamp: surgeIso },
          })
        );
      }
    }

    window.dispatchEvent(
      new CustomEvent("hydrationUpdated", {
        detail: { date: effectiveDateStr, amount: 300, newTotal: nextTotal },
      })
    );

    startTransition(async () => {
      await tapWaterAction(effectiveDateStr, 300);
      router.refresh();
    });
  };

  const handleUndo = () => {
    triggerHaptic("light");
    const prevTotal = Math.max(0, currentMl - 300);
    setOptimisticMl(prevTotal); // Instant UI feedback!
    window.dispatchEvent(
      new CustomEvent("hydrationUpdated", {
        detail: { date: effectiveDateStr, amount: -300, newTotal: prevTotal },
      })
    );

    startTransition(async () => {
      await undoWaterAction(effectiveDateStr);
      router.refresh();
    });
  };

  return (
    <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              HYDRATION METER
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Game Resource Indicator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={handleUndo}
              disabled={isPending}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition disabled:opacity-40"
              title="Undo Last Log"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-xs font-mono font-bold text-cyan-400">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Water Fill Progress Display */}
      <div className="flex items-center gap-4">
        {/* Animated Water Drop Resource Orb */}
        <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-cyan-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 via-cyan-500 to-blue-500 transition-all duration-500 ease-out opacity-80"
            style={{ height: `${percentage}%` }}
          />
          <Droplets className="w-6 h-6 text-white relative z-10 drop-shadow" />
        </div>

        {/* Stats Readout */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xl font-black font-mono text-white tracking-tight">
              {currentMl} <span className="text-xs text-slate-400 font-normal">ml</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {targetMl} ml Target
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            {remainingMl > 0 ? `${remainingMl} ml remaining today` : "Target achieved! Hydrated ✓"}
          </span>
        </div>
      </div>

      {/* One-Tap +300ml Button */}
      <button
        onClick={handleAddWater}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        <span>ONE-TAP +300 ML WATER</span>
      </button>
    </div>
  );
}

