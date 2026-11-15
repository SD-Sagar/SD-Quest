import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates accurate chronological age from Date of Birth.
 * Automatically ages the player over the years.
 */
export function calculateAge(dob: string, referenceDate?: Date): number {
  if (!dob) return 25;
  const ref = referenceDate || (typeof window !== "undefined" ? new Date() : new Date("2026-01-01"));
  const birthDate = new Date(dob);
  let age = ref.getFullYear() - birthDate.getFullYear();
  const monthDiff = ref.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(1, age);
}

/**
 * Android touch haptic feedback trigger
 */
export function triggerHaptic(style: "light" | "medium" | "heavy" | "success" | "warning" = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  switch (style) {
    case "light":
      navigator.vibrate(10);
      break;
    case "medium":
      navigator.vibrate(25);
      break;
    case "heavy":
      navigator.vibrate([40, 20, 40]);
      break;
    case "success":
      navigator.vibrate([15, 30, 20]);
      break;
    case "warning":
      navigator.vibrate([30, 50, 60]);
      break;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
