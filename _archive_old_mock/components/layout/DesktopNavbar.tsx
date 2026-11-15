"use client";

import Link from "next/link";
import { useAppSelector } from "@/store";
import { calculateAge, triggerHaptic } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  Sparkles,
  Activity,
  Utensils,
  Calendar,
  HeartPulse,
  Award,
} from "lucide-react";

interface DesktopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSanctuary: () => void;
}

export function DesktopNavbar({ activeTab, setActiveTab, onOpenSanctuary }: DesktopNavbarProps) {
  const player = useAppSelector((state) => state.player);
  const age = calculateAge(player.dob);
  const xpPct = Math.min(100, Math.round((player.currentXp / player.xpToNextLevel) * 100));

  const navItems = [
    { id: "today", label: "TODAY HUD", icon: LayoutDashboard },
    { id: "gym", label: "GYM TRAINER", icon: Dumbbell },
    { id: "quests", label: "QUESTS & FORGE", icon: Sparkles },
    { id: "body", label: "ANATOMY MAP", icon: Activity },
    { id: "diet", label: "BENGALI DIET", icon: Utensils },
    { id: "calendar", label: "CALENDAR", icon: Calendar },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand & Hunter ID */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="font-mono font-black text-sm tracking-widest text-cyan-400 uppercase">
              SD-QUEST
            </span>
          </div>

          {/* Quick Player Chip */}
          <div className="flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
            <span className="font-bold text-white">{player.name || "Hunter"}</span>
            <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              AGE: {age}
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono">
              {player.rank} • LVL {player.currentLevel}
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic("light");
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Mini XP & Sanctuary Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-28 text-right font-mono text-[10px]">
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>XP</span>
              <span className="text-cyan-300 font-bold">{xpPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic("light");
              onOpenSanctuary();
            }}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 transition"
            title="Sanctuary / Medical Status"
          >
            <HeartPulse className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

