"use client";

import { triggerHaptic } from "@/lib/utils";
import { LayoutDashboard, Dumbbell, Sparkles, Activity, Calendar as CalendarIcon } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartWorkout: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onStartWorkout }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-2 py-2 flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic("light");
            setActiveTab("today");
          }}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold px-2 py-1 transition-all ${
            activeTab === "today" ? "text-cyan-400" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>TODAY</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic("light");
            setActiveTab("quests");
          }}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold px-2 py-1 transition-all ${
            activeTab === "quests" ? "text-cyan-400" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>QUESTS</span>
        </button>

        {/* Center Primary Action: Start Workout */}
        <button
          onClick={() => {
            triggerHaptic("medium");
            onStartWorkout();
          }}
          className="relative -top-3 w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/60 flex items-center justify-center text-white shadow-lg shadow-cyan-950 hover:scale-105 active:scale-95 transition"
          title="Enter Gate / Start Workout"
        >
          <Dumbbell className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            triggerHaptic("light");
            setActiveTab("body");
          }}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold px-2 py-1 transition-all ${
            activeTab === "body" ? "text-cyan-400" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>BODY</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic("light");
            setActiveTab("calendar");
          }}
          className={`flex flex-col items-center gap-1 text-[9px] font-bold px-2 py-1 transition-all ${
            activeTab === "calendar" ? "text-cyan-400" : "text-slate-500 hover:text-slate-400"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>CALENDAR</span>
        </button>
      </div>
    </nav>
  );
}
