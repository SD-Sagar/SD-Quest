import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Triggers native haptic feedback on supported mobile devices
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" | "warning" = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    switch (type) {
      case "light":
        navigator.vibrate(15);
        break;
      case "medium":
        navigator.vibrate(35);
        break;
      case "heavy":
        navigator.vibrate(75);
        break;
      case "success":
        navigator.vibrate([25, 40, 45]);
        break;
      case "warning":
        navigator.vibrate([60, 50, 60]);
        break;
    }
  } catch {
    // Vibration ignored if blocked by permissions
  }
}

/**
 * Calculates current age dynamically from Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string, referenceDate?: Date): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = referenceDate || new Date("2026-01-01");
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}
