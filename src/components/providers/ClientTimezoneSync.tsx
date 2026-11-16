"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ClientTimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const getLocalDateStr = (d = new Date()) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

      const localDate = getLocalDateStr();

      const getCookies = () =>
        document.cookie.split("; ").reduce((acc: Record<string, string>, c) => {
          const [k, v] = c.split("=");
          if (k && v) acc[k] = decodeURIComponent(v);
          return acc;
        }, {});

      const cookies = getCookies();
      let needsRefresh = false;

      if (cookies["user_tz"] !== tz) {
        document.cookie = `user_tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; SameSite=Lax`;
        needsRefresh = true;
      }

      if (cookies["user_date"] !== localDate) {
        document.cookie = `user_date=${encodeURIComponent(localDate)}; path=/; max-age=86400; SameSite=Lax`;
        needsRefresh = true;
      }

      if (needsRefresh) {
        router.refresh();
      }

      // 1. Cross-Tab Synchronizer via BroadcastChannel
      let channel: BroadcastChannel | null = null;
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("sd_quest_telemetry");

        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (!type) return;

          // Dispatch locally so existing window event listeners in UI react instantly
          window.dispatchEvent(new CustomEvent(type, { detail: payload }));

          if (type === "dayRollover") {
            const newDate = payload?.newDate || getLocalDateStr();
            document.cookie = `user_date=${encodeURIComponent(newDate)}; path=/; max-age=86400; SameSite=Lax`;
            router.refresh();
          } else if (type === "workoutCompleted" || type === "hydrationUpdated" || type === "mealLogged") {
            router.refresh();
          }
        };
      }

      // Forward local events to BroadcastChannel for other open tabs
      const forwardToChannel = (type: string, detail: any) => {
        try {
          channel?.postMessage({ type, payload: detail });
        } catch {
          // ignore postMessage errors
        }
      };

      const onLocalHydration = (e: any) => forwardToChannel("hydrationUpdated", e.detail);
      const onLocalWorkout = (e: any) => forwardToChannel("workoutCompleted", e.detail);
      const onLocalMeal = (e: any) => forwardToChannel("mealLogged", e.detail);

      window.addEventListener("hydrationUpdated", onLocalHydration);
      window.addEventListener("workoutCompleted", onLocalWorkout);
      window.addEventListener("mealLogged", onLocalMeal);

      // 2. High-Precision Midnight Rollover (12:00:00.000 AM Target)
      let midnightTimer: NodeJS.Timeout | null = null;

      const scheduleMidnightRoll = () => {
        const now = new Date();
        const nextMidnight = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0,
          0,
          1,
          0 // 1 second past midnight to guarantee calendar turn
        );
        const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

        midnightTimer = setTimeout(() => {
          const currentDay = getLocalDateStr();
          document.cookie = `user_date=${encodeURIComponent(currentDay)}; path=/; max-age=86400; SameSite=Lax`;
          
          const eventDetail = { newDate: currentDay };
          window.dispatchEvent(new CustomEvent("dayRollover", { detail: eventDetail }));
          forwardToChannel("dayRollover", eventDetail);
          router.refresh();

          // Reschedule for next midnight
          scheduleMidnightRoll();
        }, msUntilMidnight);
      };

      scheduleMidnightRoll();

      // 3. Heartbeat Watcher (checks every 10s for device sleep/wake recovery)
      let lastCheckedDate = localDate;
      const heartbeatInterval = setInterval(() => {
        const currentDay = getLocalDateStr();
        if (currentDay !== lastCheckedDate) {
          lastCheckedDate = currentDay;
          document.cookie = `user_date=${encodeURIComponent(currentDay)}; path=/; max-age=86400; SameSite=Lax`;

          const eventDetail = { newDate: currentDay };
          window.dispatchEvent(new CustomEvent("dayRollover", { detail: eventDetail }));
          forwardToChannel("dayRollover", eventDetail);
          router.refresh();
        }
      }, 10000);

      return () => {
        if (channel) channel.close();
        if (midnightTimer) clearTimeout(midnightTimer);
        clearInterval(heartbeatInterval);
        window.removeEventListener("hydrationUpdated", onLocalHydration);
        window.removeEventListener("workoutCompleted", onLocalWorkout);
        window.removeEventListener("mealLogged", onLocalMeal);
      };
    } catch (err) {
      console.warn("Client timezone sync error:", err);
    }
  }, [router]);

  return null;
}
