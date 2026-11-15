"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { startWorkoutForDay } from "@/store/slices/workoutSlice";
import { CharacterHUD } from "@/components/character/CharacterHUD";
import { ActiveWorkoutModal } from "@/components/gym/ActiveWorkoutModal";
import { GymTrainerHub } from "@/components/gym/GymTrainerHub";
import { ManualQuestModal } from "@/components/quests/ManualQuestModal";
import { SmartQuestModal } from "@/components/quests/SmartQuestModal";
import { MedicalSanctuaryModal } from "@/components/character/MedicalSanctuaryModal";
import { MonthlyReportModal } from "@/components/reports/MonthlyReportModal";
import { QuestList } from "@/components/quests/QuestList";
import { WaterMeter } from "@/components/hydration/WaterMeter";
import { BodyHeatmap } from "@/components/body/BodyHeatmap";
import { MeasurementTracker } from "@/components/body/MeasurementTracker";
import { BengaliNutritionCard } from "@/components/nutrition/BengaliNutritionCard";
import { MonthlyTileCalendar } from "@/components/calendar/MonthlyTileCalendar";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { triggerHaptic } from "@/lib/utils";
import {
  Dumbbell,
  Play,
  Sparkles,
  Award,
  ArrowRight,
  Shield,
  Utensils,
  UserPlus,
} from "lucide-react";

export default function Home() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const [activeTab, setActiveTab] = useState("today");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isSanctuaryModalOpen, setIsSanctuaryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleLaunchGym = () => {
    triggerHaptic("heavy");
    dispatch(startWorkoutForDay("Tuesday"));
  };

  // IF CHARACTER NOT YET AWAKENED / CREATED -> SHOW SOLO LEVELING GATEWAY!
  if (!player.isInitialized) {
    return (
      <div className="min-h-screen bg-[#07080b] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black relative">
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-cyan-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl hunter-panel rounded-3xl border border-cyan-500/40 p-8 sm:p-10 shadow-2xl text-center space-y-6 relative z-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/60">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              THE SYSTEM IS DORMANT
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mana-text-glow">
              SD-QUEST
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              YOUR LIFE. YOUR QUEST. YOUR RULES.
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            You have not yet undergone the Awakening Ceremony. To begin your journey, configure
            your real-life baseline: your name, birthdate, 20-in-1 bench setup, 60kg dumbbell plates,
            and Bengali nutrition parameters.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/character-creation"
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-950 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              INITIALIZE AWAKENING (CHARACTER CREATION)
            </Link>

            <Link
              href="/login"
              className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AWAKENED HUNTER DASHBOARD (RESPONSIVE DESKTOP + MOBILE)
  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-cyan-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Desktop Top Navigation Bar (Hidden on Mobile) */}
      <DesktopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSanctuary={() => setIsSanctuaryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 pb-28 md:pb-12">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="font-mono font-black text-xs tracking-widest text-cyan-400 uppercase">
              SD-QUEST // SYSTEM ACTIVE
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {player.rank} • LVL {player.currentLevel}
          </span>
        </div>

        {/* RESPONSIVE DESKTOP GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR (Col 1 to 4 on Desktop): Character Status & Quick Water */}
          <div className="lg:col-span-4 space-y-4">
            <CharacterHUD onOpenSanctuaryModal={() => setIsSanctuaryModalOpen(true)} />
            <WaterMeter />
          </div>

          {/* MAIN CONTENT (Col 5 to 12 on Desktop): Active Tab View */}
          <div className="lg:col-span-8 space-y-6">
            {/* TAB: TODAY (Command Center) */}
            {activeTab === "today" && (
              <div className="space-y-6">
                {/* Main Quest: Fitness Trainer Launch Card */}
                <div className="hunter-panel rounded-3xl p-5 sm:p-6 border border-cyan-500/40 relative overflow-hidden shadow-xl shadow-cyan-950/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                        MAIN QUEST // ACTIVE DUNGEON
                      </span>
                      <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                        Tuesday: Chest & Upper Body Hypertrophy
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        20-in-1 Bench (Incline 30°) • 60kg DB Plates • 100 Skips Objective
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0 self-start sm:self-auto">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono pt-3 border-t border-slate-800">
                    <span>Volume: 3 Exercises • 9 Sets • 90s Auto Rest Timer</span>
                    <span className="text-cyan-400 font-bold">+250 XP • +0.40 STR</span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleLaunchGym}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      ENTER GATE // START LIVE WORKOUT
                    </button>
                    <button
                      onClick={() => setActiveTab("gym")}
                      className="py-4 px-5 rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 font-mono transition"
                    >
                      SPLIT DETAILS
                    </button>
                  </div>
                </div>

                {/* Quests Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      TODAY&apos;S ACTIVE QUEST ENGINE
                    </h2>
                  </div>
                  <QuestList
                    onOpenManualModal={() => setIsManualModalOpen(true)}
                    onOpenSmartModal={() => setIsSmartModalOpen(true)}
                  />
                </div>
              </div>
            )}

            {/* TAB: GYM TRAINER (Dedicated Section 7 Master Companion) */}
            {activeTab === "gym" && <GymTrainerHub />}

            {/* TAB: QUESTS (Full Dedicated Quest Forge & List) */}
            {activeTab === "quests" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    ALL QUESTS & ACTIVE COMMITMENTS
                  </h2>
                </div>
                <QuestList
                  onOpenManualModal={() => setIsManualModalOpen(true)}
                  onOpenSmartModal={() => setIsSmartModalOpen(true)}
                />
              </div>
            )}

            {/* TAB: BODY (Anatomy Heatmap & Dimensions) */}
            {activeTab === "body" && (
              <div className="space-y-6">
                <BodyHeatmap />
                <MeasurementTracker />
              </div>
            )}

            {/* TAB: DIET (Bengali Nutrition Engine) */}
            {activeTab === "diet" && <BengaliNutritionCard />}

            {/* TAB: CALENDAR (Full-Cell Monthly Tile Grid) */}
            {activeTab === "calendar" && (
              <MonthlyTileCalendar onOpenReportModal={() => setIsReportModalOpen(true)} />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ActiveWorkoutModal />
      <ManualQuestModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
      <SmartQuestModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
      />
      <MedicalSanctuaryModal
        isOpen={isSanctuaryModalOpen}
        onClose={() => setIsSanctuaryModalOpen(false)}
      />
      <MonthlyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Android Mobile Bottom Navigation (Hidden on Desktop) */}
      <div className="md:hidden">
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onStartWorkout={handleLaunchGym}
        />
      </div>
    </div>
  );
}
