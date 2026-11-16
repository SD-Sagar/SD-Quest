"use client";

import { useAppSelector } from "@/store";
import { ActiveWorkoutModal } from "./ActiveWorkoutModal";

export function GlobalWorkoutHost() {
  const isActive = useAppSelector((state) => state.workoutUi.isActive);

  // If no workout session is currently ongoing, zero DOM overhead
  if (!isActive) return null;

  return <ActiveWorkoutModal />;
}
