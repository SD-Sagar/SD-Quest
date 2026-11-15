"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { triggerHaptic } from "@/lib/utils";
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
}

export function BottomNav({ onStartWorkout }: BottomNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Today", href: "/", icon: LayoutDashboard },
    { label: "Quests", href: "/quests", icon: CheckSquare },
    { label: "Gym", href: "/gym", icon: Dumbbell, isCenter: true },
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
                onClick={() => triggerHaptic("medium")}
                className="relative -top-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/80 border border-cyan-400/50 flex flex-col items-center transition active:scale-95"
              >
                <Icon className="w-5 h-5 fill-white" />
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

