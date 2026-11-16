"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { startWorkoutSession } from "@/store/slices/workoutUiSlice";
import { triggerHaptic } from "@/lib/utils";
import { calculateDumbbellPlates, calculateStepsCalories } from "@/lib/calculations/gym";
import { getTodaysWorkoutsAction } from "@/server/actions/workout.actions";
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
import {
  Dumbbell,
  Play,
  Sparkles,
  Flame,
  CheckCircle2,
  ChevronRight,
  Zap,
  Clock,
  Layers,
} from "lucide-react";

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
  completedWorkouts?: any[];
}

const SPLIT_INFO: Record<DayOfWeek, { title: string; subtitle: string; isRest: boolean }> = {
  Monday: { title: "Legs & Lower Body Foundation", subtitle: "Quads, Hamstrings, Glutes, Calves", isRest: false },
  Tuesday: { title: "Chest Hypertrophy & Pectoral Power", subtitle: "Upper Chest, Mid Chest, Front Delts, Triceps", isRest: false },
  Wednesday: { title: "Back Width & Thickness", subtitle: "Lats, Rhomboids, Trapezius, Biceps", isRest: false },
  Thursday: { title: "Shoulder Overhead Power & Width", subtitle: "Lateral Deltoids, Anterior Deltoids", isRest: false },
  Friday: { title: "Deltoid Specialization & Rear Delts", subtitle: "Rear Delts, Lateral Delts, Rotator Cuff", isRest: false },
  Saturday: { title: "Arms Mastery (Biceps & Triceps)", subtitle: "Biceps, Triceps, Brachialis, Forearms", isRest: false },
  Sunday: { title: "Honored Rest & Mobility Sanctuary", subtitle: "Zero Lifting • Parasympathetic Recovery & Vagus Reset", isRest: true },
};

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
  completedWorkouts = [],
}: TodayDashboardViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [todaysWorkouts, setTodaysWorkouts] = useState<any[]>(completedWorkouts || []);

  useEffect(() => {
    setTodaysWorkouts(completedWorkouts || []);
  }, [completedWorkouts]);

  // Determine today's workout split
  const isSunday = dayName === "Sunday";
  const todaySplitInfo = SPLIT_INFO[dayName] || SPLIT_INFO.Monday;
  
  const isFullSplitSession = (s: any) =>
    !s.title?.toLowerCase().startsWith("solo trial") &&
    !s.notes?.includes("[SOLO_TRIAL]") &&
    !s.notes?.includes("[SINGLE_EXERCISE]");

  const isTodayWorkoutCompleted =
    todaysWorkouts.length > 0 &&
    todaysWorkouts.some((w) => w.split_day === dayName && isFullSplitSession(w));
  const todaySession = todaysWorkouts.find(
    (w) => w.split_day === dayName && isFullSplitSession(w)
  );

  // Accurate Physiological Calorie Telemetry
  const workoutCalories = todaysWorkouts.reduce((acc, w) => acc + (w.calories_burned || 0), 0);
  const workoutTonnage = todaysWorkouts.reduce((acc, w) => acc + (w.total_tonnage_kg || 0), 0);
  const stepsTelemetry = calculateStepsCalories(
    activity?.steps || 0,
    profile.weight_kg || 75.0,
    profile.height_cm || 175.0
  );
  const stepsCalories = stepsTelemetry.caloriesBurned;
  const totalBurnedCalories = workoutCalories + stepsCalories;
  const consumedCalories = nutritionLogs.reduce((acc, l) => acc + (l.calories || 0), 0);
  const targetCalories = nutritionTargets?.target_calories || 2200;

  const handleNavigateToGym = () => {
    triggerHaptic("heavy");
    router.push(`/gym?split=${dayName}`);
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

            {/* Live Energy & Physiological Calorie Telemetry */}
            <div className="hunter-panel rounded-3xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      ENERGY TELEMETRY (KCAL)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Biomechanical Expenditure &amp; Intake
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-orange-400">
                  {totalBurnedCalories} kcal burned
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">EXPELLED (BURNED)</span>
                  <span className="text-sm font-black text-white">
                    {totalBurnedCalories}{" "}
                    <span className="text-xs font-normal text-slate-400">kcal</span>
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Gym: {workoutCalories} • Steps: {stepsCalories}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">CONSUMED (INTAKE)</span>
                  <span className="text-sm font-black text-white">
                    {consumedCalories}{" "}
                    <span className="text-xs font-normal text-slate-400">/ {targetCalories}</span>
                  </span>
                  <span className="text-[9px] block mt-0.5 font-bold">
                    {consumedCalories <= totalBurnedCalories ? (
                      <span className="text-cyan-400">
                        Deficit: -{totalBurnedCalories - consumedCalories} kcal
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        Surplus: +{consumedCalories - totalBurnedCalories} kcal
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Visual Balance Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Intake vs Expenditure Ratio</span>
                  <span
                    className={
                      consumedCalories <= totalBurnedCalories
                        ? "text-cyan-400 font-bold"
                        : "text-amber-400 font-bold"
                    }
                  >
                    {totalBurnedCalories > 0
                      ? Math.round((consumedCalories / totalBurnedCalories) * 100)
                      : 0}
                    % ratio
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        totalBurnedCalories > 0
                          ? (consumedCalories / totalBurnedCalories) * 100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Col 6 to 12): Main Quest Dungeon Gate & Side Quests */}
          <div className="lg:col-span-7 space-y-6">
            {/* Solo Leveling Mandatory Daily System Directive */}
            <DailySystemQuestCard
              workoutCompleted={isTodayWorkoutCompleted}
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

            {/* Quests Engine */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  ACTIVE QUESTS &amp; COMMITMENTS
                </h2>
                <span className="text-[10px] font-mono text-cyan-400">
                  {quests.filter((q) => q.status === "completed").length + (isTodayWorkoutCompleted ? 1 : 0)} / {quests.length + 1} COMPLETED
                </span>
              </div>

              <QuestList
                quests={quests}
                hideCreationButtons={true}
                mainQuestSplit={{
                  dayName,
                  title: todaySplitInfo.title,
                  subtitle: todaySplitInfo.subtitle,
                  isRest: isSunday,
                  isCompleted: isTodayWorkoutCompleted,
                  sessionData: todaySession,
                  onEnterGym: handleNavigateToGym,
                }}
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
        <BottomNav onStartWorkout={handleNavigateToGym} />
      </div>
    </div>
  );
}

