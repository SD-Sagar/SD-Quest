"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { triggerHaptic, calculateAge } from "@/lib/utils";
import { calculateStepsCalories } from "@/lib/calculations/gym";
import { CharacterHUD } from "@/components/character/CharacterHUD";
import { WaterMeter } from "@/components/hydration/WaterMeter";
import { WalkingMeter } from "@/components/activity/WalkingMeter";
import { QuestList } from "@/components/quests/QuestList";
import { SmartQuestModal } from "@/components/quests/SmartQuestModal";
import { ManualQuestModal } from "@/components/quests/ManualQuestModal";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BrandLogo } from "@/components/ui/BrandLogo";
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
  AttributeType,
} from "@/types";
import { DailySystemQuestCard } from "@/components/dashboard/DailySystemQuestCard";
import { getEffectiveStreakInfo } from "@/lib/calculations/streak";
import {
  Droplets,
  Footprints,
  Zap,
  ChevronDown,
  ChevronUp,
  Settings,
  Activity,
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
  const [showDetailedTelemetry, setShowDetailedTelemetry] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTodaysWorkouts(completedWorkouts || []);
  }, [completedWorkouts]);

  // Determine today's workout split
  const isGymEnabled = profile.enable_gym !== undefined ? profile.enable_gym : (profile.active_main_quest === "fitness");
  const isSunday = dayName === "Sunday";
  const todaySplitInfo = SPLIT_INFO[dayName] || SPLIT_INFO.Monday;

  // Reactive states for zero-refresh dynamic telemetry updates
  const [liveWorkouts, setLiveWorkouts] = useState(todaysWorkouts);
  const [liveHydrationTotal, setLiveHydrationTotal] = useState(
    hydrationLogs.reduce((acc, l) => acc + l.amount_ml, 0)
  );

  useEffect(() => {
    setLiveWorkouts(todaysWorkouts);
  }, [todaysWorkouts]);

  useEffect(() => {
    setLiveHydrationTotal(hydrationLogs.reduce((acc, l) => acc + l.amount_ml, 0));
  }, [hydrationLogs]);

  useEffect(() => {
    const handleWorkoutCompleted = (e: any) => {
      const session = e.detail?.session || e.detail;
      if (session) {
        setLiveWorkouts((prev) => [session, ...prev]);
      }
    };

    const handleHydrationUpdated = (e: any) => {
      if (typeof e.detail?.newTotal === "number") {
        setLiveHydrationTotal(e.detail.newTotal);
      }
    };

    const handleDayRollover = () => {
      setLiveHydrationTotal(0);
      setLiveWorkouts([]);
      router.refresh();
    };

    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("hydrationUpdated", handleHydrationUpdated);
    window.addEventListener("dayRollover", handleDayRollover);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("hydrationUpdated", handleHydrationUpdated);
      window.removeEventListener("dayRollover", handleDayRollover);
    };
  }, [router]);

  // A full split is completed only by a full training session, NOT a single exercise solo trial
  const isFullSplitSession = (s: any) =>
    !s.title?.toLowerCase().startsWith("solo trial") &&
    !s.notes?.includes("[SOLO_TRIAL]") &&
    !s.notes?.includes("[SINGLE_EXERCISE]");

  const isTodayWorkoutCompleted =
    liveWorkouts.length > 0 &&
    liveWorkouts.some((w) => w.split_day === dayName && isFullSplitSession(w));
  const todaySession = liveWorkouts.find(
    (w) => w.split_day === dayName && isFullSplitSession(w)
  );

  // Physiological Calorie Telemetry (TDEE = BMR + Active Workout + Steps)
  const age = calculateAge(profile.dob);
  const bmrBase =
    10 * (profile.weight_kg || 70) +
    6.25 * (profile.height_cm || 175) -
    5 * age +
    (profile.sex?.toLowerCase() === "female" ? -161 : 5);
  const bmrCalories = Math.round(bmrBase);

  const workoutCalories = liveWorkouts.reduce((acc, w) => acc + (w.calories_burned || 0), 0);
  const stepsTelemetry = calculateStepsCalories(
    activity?.steps || 0,
    profile.weight_kg || 70.0,
    profile.height_cm || 175.0
  );
  const stepsCalories = stepsTelemetry.caloriesBurned;
  const activeCalories = workoutCalories + stepsCalories;
  const totalBurnedCalories = bmrCalories + activeCalories;
  const consumedCalories = nutritionLogs.reduce((acc, l) => acc + (l.calories || 0), 0);
  const targetCalories = nutritionTargets?.target_calories || 2200;

  const handleNavigateToGym = () => {
    triggerHaptic("heavy");
    router.push(`/gym?split=${dayName}`);
  };

  const hydrationTarget = 3000;
  const stepsTarget = 6000;
  const streakInfo = getEffectiveStreakInfo(profile, todayDateStr);

  const userMainDomain = profile.active_main_quest || (isGymEnabled ? "fitness" : "career");

  const isQuestDoneToday = (q: Quest) => {
    if (q.status !== "completed") return false;
    const doneDate = q.last_completed_date || (q.completed_at ? q.completed_at.split("T")[0] : null);
    return doneDate === todayDateStr;
  };

  const todayCompletedQuests = useMemo(() => {
    return quests.filter(isQuestDoneToday);
  }, [quests, todayDateStr]);

  const todayScheduledQuests = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    return quests.filter((q) => {
      if (!q.recurrence || q.recurrence === "none") {
        const isDueToday = Boolean(q.deadline?.startsWith(todayDateStr));
        const isStartToday = q.start_date === todayDateStr;
        const isCurrentCampaign = Boolean(q.start_date && q.start_date <= todayDateStr && (!q.deadline || q.deadline >= todayDateStr));
        const isUndated = !q.deadline && !q.start_date;
        return isDueToday || isStartToday || isCurrentCampaign || isUndated;
      }
      if (q.recurrence === "daily") return true;
      if (q.recurrence === "weekdays") return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (q.recurrence === "weekly") {
        if (Array.isArray(q.recurrence_days) && q.recurrence_days.length > 0) {
          return q.recurrence_days.includes(dayOfWeek);
        }
        if (q.start_date) {
          return new Date(q.start_date + "T00:00:00").getDay() === dayOfWeek;
        }
        return false;
      }
      return true;
    });
  }, [quests, todayDateStr]);

  const isMainGoalCompleted = useMemo(() => {
    if (userMainDomain === "career") {
      return quests.some((q) => q.category === "career" && isQuestDoneToday(q));
    }
    if (userMainDomain === "education") {
      return quests.some((q) => q.category === "education" && isQuestDoneToday(q));
    }
    if (userMainDomain === "finance") {
      return quests.some((q) => q.category === "finance" && isQuestDoneToday(q));
    }
    return isTodayWorkoutCompleted || isSunday;
  }, [userMainDomain, quests, isTodayWorkoutCompleted, isSunday, todayDateStr]);

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Ambient Mana Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Desktop Navigation */}
      <DesktopNavbar enableGym={isGymEnabled} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 relative z-10 pb-28 md:pb-12">
        {/* Mobile Header Banner */}
        <div className="md:hidden flex items-center justify-between pb-3 border-b border-cyan-950/40 mb-3">
          <BrandLogo variant="horizontal" size="sm" />
          <div className="flex items-center gap-1.5">
            {streakInfo.effectiveStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 font-bold font-hud">
                <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                <span>{streakInfo.effectiveStreak}D</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase font-hud">
                {profile.rank} ◆ LVL {profile.current_level}
              </span>
            </div>
            <Link
              href="/settings"
              onClick={() => triggerHaptic("light")}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition flex items-center justify-center shadow-sm"
              title="Hunter System Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Col 1 to 5): Hunter Status HUD & Biometric Telemetry */}
          <div className="lg:col-span-5 space-y-4">
            {/* Authentic Solo Leveling Personal Status */}
            <CharacterHUD
              profile={profile}
              attributes={attributes}
              onOpenSanctuaryModal={() => {
                triggerHaptic("light");
                router.push("/settings");
              }}
            />

            {/* COMPACT BIOMETRIC TELEMETRY DOCK (Anti-Scroll Mobile First) */}
            <div className="solo-frame rounded-2xl p-3 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-solo font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  BIOMETRIC TELEMETRY DOCK
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetailedTelemetry(!showDetailedTelemetry)}
                  className="text-[10px] font-hud font-bold text-cyan-400 hover:text-white transition flex items-center gap-1 uppercase"
                >
                  <span>{showDetailedTelemetry ? "Hide Details" : "Telemetry Matrix"}</span>
                  {showDetailedTelemetry ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* 3-Pill Horizontal Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2 font-hud">
                {/* 1. Hydration Pill */}
                <div
                  onClick={() => setShowDetailedTelemetry(true)}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#070b14]/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold">
                      {Math.round((liveHydrationTotal / hydrationTarget) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-white font-mono font-bold text-xs block leading-tight">
                      {liveHydrationTotal} <span className="text-[9px] text-slate-400 font-normal">ml</span>
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">WATER</span>
                  </div>
                </div>

                {/* 2. Steps Kinetic Pill */}
                <div
                  onClick={() => setShowDetailedTelemetry(true)}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#070b14]/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
                    <Footprints className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold">
                      {Math.round(((activity?.steps || 0) / stepsTarget) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-white font-mono font-bold text-xs block leading-tight">
                      {(activity?.steps || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">STEPS</span>
                  </div>
                </div>

                {/* 3. TDEE Expenditure Pill */}
                <div
                  onClick={() => setShowDetailedTelemetry(true)}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#070b14]/90 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold">TDEE</span>
                  </div>
                  <div>
                    <span className="text-white font-mono font-bold text-xs block leading-tight">
                      {totalBurnedCalories} <span className="text-[9px] text-slate-400 font-normal">kcal</span>
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">
                      IN: {consumedCalories}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Granular Meters (Opens on Demand, Zero Mobile Bloat) */}
              {showDetailedTelemetry && (
                <div className="space-y-4 pt-3 border-t border-cyan-500/20 animate-in fade-in duration-200">
                  <WaterMeter logs={hydrationLogs} targetMl={hydrationTarget} dateStr={todayDateStr} />
                  <WalkingMeter
                    activity={activity}
                    dateStr={todayDateStr}
                    userWeightKg={profile.weight_kg}
                    userHeightCm={profile.height_cm}
                  />

                  {/* Energy Telemetry Detailed Ledger (2024 Adult Compendium Standard) */}
                  <div className="p-3.5 rounded-xl bg-[#070b14] border border-cyan-500/30 space-y-2 font-hud">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase">Daily Calorie Expenditure</span>
                      <span className="text-cyan-400 font-mono font-bold">{activeCalories} active • {totalBurnedCalories} TDEE</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center">
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">BMR (REST)</span>
                        <span className="text-white font-bold">{bmrCalories} kcal</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">GYM (ACTIVE)</span>
                        <span className="text-cyan-400 font-bold">{workoutCalories} kcal</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">STEPS (ACTIVE)</span>
                        <span className="text-white font-bold">{stepsCalories} kcal</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono italic text-center pt-0.5">
                      *Estimates based on 2024 Adult Compendium of Physical Activities MET classifications.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Col 6 to 12): Main Quest Dungeon Gate & Side Quests */}
          <div className="lg:col-span-7 space-y-4">
            {/* Solo Leveling Mandatory Daily System Directive */}
            <DailySystemQuestCard
              workoutCompleted={isTodayWorkoutCompleted}
              isRestDay={isSunday}
              currentHydrationMl={liveHydrationTotal}
              targetHydrationMl={hydrationTarget}
              currentSteps={activity?.steps || 0}
              targetSteps={stepsTarget}
              completedQuestsCount={todayCompletedQuests.length}
              totalQuestsCount={todayScheduledQuests.length}
              streakDays={streakInfo.effectiveStreak}
              streakStatus={streakInfo.status}
              streakMultiplier={streakInfo.multiplierLabel}
              streakTier={streakInfo.tier}
              streakMessage={streakInfo.statusMessage}
              initialCrateClaimed={profile.last_mystery_box_claimed_date === todayDateStr}
              enableGym={isGymEnabled}
              activeMainQuest={userMainDomain}
              isMainGoalCompleted={isMainGoalCompleted}
            />

            {/* Quests Engine */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-solo flex items-center gap-1.5">
                  <span className="text-cyan-400">◆</span> ACTIVE DIRECTIVES &amp; COMMITMENTS
                </h2>
                <span className="text-[10px] font-mono font-bold text-cyan-400 font-hud">
                  {todayCompletedQuests.length + (isGymEnabled && isTodayWorkoutCompleted ? 1 : 0)} / {todayScheduledQuests.length + (isGymEnabled ? 1 : 0)} COMPLETED
                </span>
              </div>

              <QuestList
                quests={quests}
                profile={profile}
                hideCreationButtons={true}
                compactView={true}
                mainQuestSplit={
                  isGymEnabled
                    ? {
                        dayName,
                        title: todaySplitInfo.title,
                        subtitle: todaySplitInfo.subtitle,
                        isRest: isSunday,
                        isCompleted: isTodayWorkoutCompleted,
                        sessionData: todaySession,
                        onEnterGym: handleNavigateToGym,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SmartQuestModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
      />
      <ManualQuestModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav enableGym={isGymEnabled} onStartWorkout={handleNavigateToGym} />
      </div>
    </div>
  );
}
