"use client";

import { useState, useEffect } from "react";
import {
  getFatigueStatus,
  FatigueStatusInfo,
  HunterRecoveryStats,
  calculateDynamicFatigueRecovery,
} from "@/lib/calculations/fatigue";

interface LiveFatigueReturn {
  mentalFatigue: number;
  physicalFatigue: number;
  displayMental: string;
  displayPhysical: string;
  fatigueStatus: FatigueStatusInfo;
  isHydrationSurgeActive: boolean;
  hydrationRemainingSeconds: number;
  physicalRatePerMin: number;
  mentalRatePerMin: number;
}

/**
 * Continuous client-side reactive biological fatigue ticker.
 * Updates dynamically every 1 second based on Hunter Rank, Level, Vitality,
 * Endurance, Mentality, Discipline, and 5-minute Cellular Hydration Surges.
 */
export function useLiveFatigue(
  initialMental = 0,
  initialPhysical = 0,
  lastUpdateIso?: string | null,
  recoveryStats?: HunterRecoveryStats
): LiveFatigueReturn {
  const [mentalFatigue, setMentalFatigue] = useState(initialMental);
  const [physicalFatigue, setPhysicalFatigue] = useState(initialPhysical);
  const [activeSurgeTimestamp, setActiveSurgeTimestamp] = useState<string | null>(
    recoveryStats?.lastHydrationSurgeAt || null
  );

  // Sync if initial props change (e.g. server revalidation or action finish)
  useEffect(() => {
    setMentalFatigue(initialMental);
    setPhysicalFatigue(initialPhysical);
  }, [initialMental, initialPhysical]);

  // Read client-side hydration surge from localStorage & listen to real-time events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSurge = localStorage.getItem("sd_last_hydration_surge_at");
      if (storedSurge) {
        const diffMs = Date.now() - new Date(storedSurge).getTime();
        if (diffMs < 5 * 60 * 1000) {
          setActiveSurgeTimestamp(storedSurge);
        }
      }

      const handleHydrationSurge = (e: any) => {
        const ts = e.detail?.timestamp || new Date().toISOString();
        setActiveSurgeTimestamp(ts);
      };

      window.addEventListener("hydrationSurgeTriggered", handleHydrationSurge);
      return () => {
        window.removeEventListener("hydrationSurgeTriggered", handleHydrationSurge);
      };
    }
  }, []);

  // Live 1-second continuous biological recovery ticker
  const [ratesInfo, setRatesInfo] = useState(() =>
    calculateDynamicFatigueRecovery({
      ...recoveryStats,
      lastHydrationSurgeAt: activeSurgeTimestamp || recoveryStats?.lastHydrationSurgeAt,
    })
  );

  useEffect(() => {
    if (!lastUpdateIso) return;

    const baseMental = initialMental;
    const basePhysical = initialPhysical;
    const then = new Date(lastUpdateIso).getTime();

    const updateLiveDecay = () => {
      const now = Date.now();
      const diffMs = Math.max(0, now - then);
      const secondsElapsed = diffMs / 1000;

      const dynamicRates = calculateDynamicFatigueRecovery({
        ...recoveryStats,
        lastHydrationSurgeAt: activeSurgeTimestamp || recoveryStats?.lastHydrationSurgeAt,
      });
      setRatesInfo(dynamicRates);

      const recoveredMental = secondsElapsed * dynamicRates.mentalRatePerSec;
      const recoveredPhysical = secondsElapsed * dynamicRates.physicalRatePerSec;

      const newMental = Math.max(0, Number((baseMental - recoveredMental).toFixed(2)));
      const newPhysical = Math.max(0, Number((basePhysical - recoveredPhysical).toFixed(2)));

      setMentalFatigue(newMental);
      setPhysicalFatigue(newPhysical);
    };

    updateLiveDecay();
    const interval = setInterval(updateLiveDecay, 1000); // 1-second live resolution
    return () => clearInterval(interval);
  }, [initialMental, initialPhysical, lastUpdateIso, recoveryStats, activeSurgeTimestamp]);

  const displayMental = `${mentalFatigue.toFixed(1)}%`;
  const displayPhysical = `${physicalFatigue.toFixed(1)}%`;
  const fatigueStatus = getFatigueStatus(mentalFatigue, physicalFatigue);

  return {
    mentalFatigue,
    physicalFatigue,
    displayMental,
    displayPhysical,
    fatigueStatus,
    isHydrationSurgeActive: ratesInfo.isHydrationSurgeActive,
    hydrationRemainingSeconds: ratesInfo.hydrationSurgeRemainingSeconds,
    physicalRatePerMin: ratesInfo.physicalPerMin,
    mentalRatePerMin: ratesInfo.mentalPerMin,
  };
}
