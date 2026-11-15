"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/server/actions/auth.actions";
import { triggerHaptic } from "@/lib/utils";
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Dumbbell,
  Activity,
  Utensils,
  CalendarDays,
  LogOut,
  HeartPulse,
  Settings,
} from "lucide-react";

interface DesktopNavbarProps {
  onOpenSanctuary?: () => void;
}

export function DesktopNavbar({ onOpenSanctuary }: DesktopNavbarProps) {
  const pathname = usePathname();

  const NAV_LINKS = [
    { label: "Today", href: "/", icon: LayoutDashboard },
    { label: "Quests", href: "/quests", icon: CheckSquare },
    { label: "Gym Trainer", href: "/gym", icon: Dumbbell },
    { label: "Body Progression", href: "/body", icon: Activity },
    { label: "Nutrition & Fuel", href: "/diet", icon: Utensils },
    { label: "Calendar", href: "/calendar", icon: CalendarDays },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-[#07080b]/90 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition shadow-sm shadow-cyan-950">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-black tracking-tight text-white font-mono text-sm block mana-text-glow">
              SD-QUEST
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest block -mt-1 uppercase">
              REAL-LIFE RPG SYSTEM
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => triggerHaptic("light")}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Medical Sanctuary & Logout */}
        <div className="flex items-center gap-2">
          {onOpenSanctuary && (
            <button
              onClick={() => {
                triggerHaptic("medium");
                onOpenSanctuary();
              }}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-400 transition"
              title="Medical Sanctuary & Condition"
            >
              <HeartPulse className="w-4 h-4" />
            </button>
          )}

          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-red-500/50 hover:text-red-400 text-slate-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

