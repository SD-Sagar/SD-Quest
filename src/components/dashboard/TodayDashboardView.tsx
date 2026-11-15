"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store";
import { startWorkoutSession } from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import { calculateDumbbellPlates } from "@/lib/calculations/gym";
import { CharacterHUD } from "@/components/character/CharacterHUD";
import { WaterMeter } from "@/components/hydration/WaterMeter";
import { WalkingMeter } from "@/components/activity/WalkingMeter";
import { QuestList } from "@/components/quests/QuestList";
import { ActiveWorkoutModal } from "@/components/gym/ActiveWorkoutModal";
import { SmartQuestModal } from "@/components/quests/SmartQuestModal";
import { ManualQuestModal } from "@/components/quests/ManualQuestModal";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  Profile,
  PlayerAttributes,
  EquipmentInventory,
  ExerciseDefinition,
  Quest,
  HydrationLog,
  ActivityLog,
  NutritionLog,
  DailyNutritionTargets,
  DayOfWeek,
} from "@/types";
import { DailySystemQuestCard } from "@/components/dashboard/DailySystemQuestCard";
import { Dumbbell, Play, Sparkles } from "lucide-react";

interface TodayDashboardViewProps {
  profile: Profile;
  attributes: PlayerAttributes;
  equipment: EquipmentInventory | null;
  exerciseCatalog: ExerciseDefinition[];
  quests: Quest[];
  hydrationLogs: HydrationLog[];
  activity: ActivityLog | null;
  nutritionLogs: NutritionLog[];
  nutritionTargets: DailyNutritionTargets | null;
  todayDateStr: string;
  dayName: DayOfWeek;
}

export function TodayDashboardView({
  profile,
  attributes,
  equipment,
  exerciseCatalog,
  quests,
  hydrationLogs,
  activity,
  nutritionLogs,
  nutritionTargets,
  todayDateStr,
  dayName,
}: TodayDashboardViewProps) {
  const dispatch = useAppDispatch();
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Determine today's workout plan
  const isSunday = dayName === "Sunday";

  const handleLaunchWorkout = () => {
    triggerHaptic("heavy");

    const defaultInv = equipment || {
      id: "default",
      user_id: profile.id,
      has_bench: true,
      bench_positions: [],
      dumbbell_handle_weight_kg: 2.0,
      plate_5kg_count: 8,
      plate_2_5kg_count: 4,
      plate_1_25kg_count: 8,
      custom_plates: [],
      updated_at: new Date().toISOString(),
    };

    // Filter exercises matching today's split
    const relevantExercises = exerciseCatalog.slice(0, 3);
    const exercisesForSession = relevantExercises.map((ex) => {
      const plateResult = calculateDumbbellPlates(15.0, defaultInv, true);
      return {
        definition: ex,
        defaultWeightKg: plateResult.achievableWeightKg,
        plateBreakdown: plateResult.summaryString,
      };
    });

    dispatch(
      startWorkoutSession({
        dayName,
        title: `${dayName}: Physical Conditioning & Hypertrophy`,
        targetMuscles: "Chest, Shoulders & Upper Body",
        skippingTarget: 100,
        exercises: exercisesForSession,
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Ambient Mana Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-cyan-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Desktop Navigation */}
      <DesktopNavbar />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 pb-28 md:pb-12">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="font-mono font-black text-xs tracking-widest text-cyan-400 uppercase">
              SD-QUEST // SYSTEM ACTIVE
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {profile.rank} • LVL {profile.current_level}
          </span>
        </div>

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Col 1 to 5): Character Status & Health Telemetry */}
          <div className="lg:col-span-5 space-y-5">
            <CharacterHUD profile={profile} attributes={attributes} />
            <WaterMeter logs={hydrationLogs} targetMl={3000} dateStr={todayDateStr} />
            <WalkingMeter activity={activity} dateStr={todayDateStr} />
          </div>

          {/* Right Column (Col 6 to 12): Main Quest Dungeon Gate & Side Quests */}
          <div className="lg:col-span-7 space-y-6">
            {/* Solo Leveling Mandatory Daily System Directive */}
            <DailySystemQuestCard
              workoutCompleted={false}
              isRestDay={isSunday}
              currentHydrationMl={hydrationLogs.reduce((acc, l) => acc + l.amount_ml, 0)}
              targetHydrationMl={2400}
              currentSteps={activity?.steps || 0}
              targetSteps={6000}
              completedQuestsCount={quests.filter((q) => q.status === "completed").length}
              totalQuestsCount={quests.length}
              streakDays={3}
              initialCrateClaimed={profile.last_mystery_box_claimed_date === todayDateStr}
            />

            {/* Main Quest: Home-Gym Workout Launch Card */}
            <div className="hunter-panel rounded-3xl p-5 sm:p-6 border border-cyan-500/40 relative overflow-hidden shadow-xl shadow-cyan-950/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    MAIN QUEST // {dayName.toUpperCase()} DUNGEON INSTANCE
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                    {isSunday ? "Sunday: Honored Recovery Protocol" : `${dayName}: Dumbbell Hypertrophy & Volume`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    20-in-1 Bench • 60kg Plates Solver • 100 Skips Objective
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0 self-start sm:self-auto">
                  <Dumbbell className="w-6 h-6" />
                </div>
              </div>

              {!isSunday ? (
                <>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono pt-3 border-t border-slate-800">
                    <span>Structured Exercises • Rest Countdown Timers</span>
                    <span className="text-cyan-400 font-bold">+200-350 XP • STR & DIS</span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleLaunchWorkout}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      ENTER GATE // START LIVE WORKOUT
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
                  Honored recovery day. Active stretching, hydration, and central nervous system replenishment.
                </div>
              )}
            </div>

            {/* Quests Engine */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  ACTIVE QUESTS & COMMITMENTS
                </h2>
                <span className="text-[10px] font-mono text-cyan-400">
                  {quests.filter((q) => q.status === "completed").length} / {quests.length} COMPLETED
                </span>
              </div>

              <QuestList
                quests={quests}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                onOpenSmartModal={() => setIsSmartModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ActiveWorkoutModal />
      <SmartQuestModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
      />
      <ManualQuestModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Android Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav onStartWorkout={handleLaunchWorkout} />
      </div>
    </div>
  );
}

