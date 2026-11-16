"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ClientTimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`;

      const cookies = document.cookie.split("; ").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.split("=");
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});

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

      // Midnight Rollover Watcher (checks every 10 seconds)
      let lastDate = localDate;
      const interval = setInterval(() => {
        const d = new Date();
        const currentDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

        if (currentDay !== lastDate) {
          lastDate = currentDay;
          document.cookie = `user_date=${encodeURIComponent(currentDay)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(
            new CustomEvent("dayRollover", { detail: { newDate: currentDay } })
          );
          router.refresh();
        }
      }, 10000);

      return () => clearInterval(interval);
    } catch (err) {
      console.warn("Client timezone sync error:", err);
    }
  }, [router]);

  return null;
}
