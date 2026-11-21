"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { triggerHaptic } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store";
import { maximizeSession } from "@/store/slices/workoutUiSlice";
import {
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Activity,
  Utensils,
  CalendarDays,
  PlusCircle,
} from "lucide-react";

interface BottomNavProps {
  onStartWorkout?: () => void;
  enableGym?: boolean;
}

export function BottomNav({ onStartWorkout, enableGym = true }: BottomNavProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isWorkoutMinimized = useAppSelector(
    (state) => state.workoutUi.isActive && state.workoutUi.isMinimized
  );

  const NAV_ITEMS = [
    { label: "Today", href: "/", icon: LayoutDashboard },
    { label: "Quests", href: "/quests", icon: CheckSquare },
    ...(enableGym ? [{ label: "Gym", href: "/gym", icon: Dumbbell, isCenter: true }] : []),
    { label: "Body", href: "/body", icon: Activity },
    { label: "Diet", href: "/diet", icon: Utensils },
    { label: "Calendar", href: "/calendar", icon: CalendarDays },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080b]/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  triggerHaptic("medium");
                  if (isWorkoutMinimized) {
                    dispatch(maximizeSession());
                  }
                }}
                className={`flex-1 py-1.5 flex flex-col items-center gap-1 text-[10px] font-mono font-bold transition group relative ${
                  isActive
                    ? "text-cyan-300"
                    : "text-cyan-400 hover:text-white"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-all relative ${
                    isActive
                      ? "bg-cyan-500/25 border border-cyan-300 shadow-[0_0_14px_#00e5ff]"
                      : "bg-cyan-950/70 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,229,255,0.3)] group-hover:border-cyan-300"
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-300" />
                  {isWorkoutMinimized && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300" />
                    </span>
                  )}
                </div>
                <span className="font-solo tracking-wider">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerHaptic("light")}
              className={`flex-1 py-1.5 flex flex-col items-center gap-1 text-[10px] font-mono font-medium transition ${
                isActive
                  ? "text-cyan-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

