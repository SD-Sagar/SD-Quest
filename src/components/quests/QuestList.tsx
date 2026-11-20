"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  startQuestSession,
  maximizeQuestSession,
  endQuestSession,
} from "@/store/slices/questUiSlice";
import { completeQuestAction, deleteQuestAction, createQuestAction } from "@/server/actions/quest.actions";
import { getTodaysWorkoutsAction } from "@/server/actions/workout.actions";
import { saveActiveSessionAction, clearActiveSessionAction } from "@/server/actions/player.actions";
import { triggerHaptic } from "@/lib/utils";
import { playQuestCompleteSound } from "@/lib/audio/soundEffects";
import confetti from "canvas-confetti";
import { Quest, QuestCategory, Profile } from "@/types";
import {
  CheckCircle2,
  Clock,
  Trash2,
  Play,
  Wand2,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Dumbbell,
  Target,
  RotateCcw,
  Flame,
  Award,
  Moon,
} from "lucide-react";

interface QuestListProps {
  quests: Quest[];
  profile?: Profile;
  onOpenManualModal?: () => void;
  onOpenSmartModal?: () => void;
  hideCreationButtons?: boolean;
  mainQuestSplit?: {
    dayName: string;
    title: string;
    subtitle: string;
    isRest?: boolean;
    isCompleted: boolean;
    sessionData?: any;
    onEnterGym: () => void;
  };
}

type ViewMode = "today" | "upcoming" | "habits" | "completed";

const CATEGORY_TABS: { value: QuestCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "career", label: "Career" },
  { value: "fitness", label: "Fitness" },
  { value: "routine", label: "Routine" },
  { value: "education", label: "Study" },
];

export function QuestList({
  quests,
  profile,
  onOpenManualModal,
  onOpenSmartModal,
  hideCreationButtons = false,
  mainQuestSplit,
}: QuestListProps) {
  const dispatch = useAppDispatch();
  const isQuestActive = useAppSelector((state) => state.questUi.isActive);
  const activeQuestInRedux = useAppSelector((state) => state.questUi.quest);
  const isWorkoutActive = useAppSelector((state) => state.workoutUi.isActive);

  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | "all">("all");
  const [isPending, startTransition] = useTransition();
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  // Biological Sleep Directive Cooldown & State
  const lastSleepAt = profile?.last_sleep_completed_at
    ? new Date(profile.last_sleep_completed_at).getTime()
    : 0;
  const hoursSinceLastSleep = lastSleepAt > 0 ? (Date.now() - lastSleepAt) / (1000 * 60 * 60) : 999;
  const isSleepCooldown = hoursSinceLastSleep < 12;
  const cooldownHoursRemaining = Math.max(0, Math.ceil(12 - hoursSinceLastSleep));

  const isSleepActive =
    isQuestActive &&
    (activeQuestInRedux?.category === "sleep" ||
      (activeQuestInRedux as any)?.is_sleep ||
      activeQuestInRedux?.id === "system-compulsory-sleep-stasis");

  useEffect(() => {
    getTodaysWorkoutsAction()
      .then((sessions) => {
        setCompletedWorkouts(sessions || []);
      })
      .catch(() => {});

    const handleWorkoutCompleted = (e: any) => {
      const session = e.detail?.session || e.detail;
      if (session) {
        setCompletedWorkouts((prev) => [session, ...prev]);
      }
    };

    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    return () => window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Filter based on View Mode
  const modeFiltered = quests.filter((q) => {
    if (viewMode === "completed") {
      return q.status === "completed";
    }
    if (q.status === "completed") return false;

    if (viewMode === "today") {
      // Due today, start date is today, or daily recurrence
      const isDueToday = q.deadline?.startsWith(todayStr);
      const isStartToday = q.start_date === todayStr;
      const isDailyHabit = q.recurrence === "daily" || q.recurrence === "weekdays";
      return isDueToday || isStartToday || isDailyHabit || (!q.deadline && q.recurrence === "none");
    }

    if (viewMode === "upcoming") {
      // Has a deadline or start_date after today
      return (q.deadline && q.deadline > todayStr + "T23:59:59") || (q.start_date > todayStr);
    }

    if (viewMode === "habits") {
      return q.recurrence !== "none";
    }

    return true;
  });

  // Apply Category filter (Routine includes custom Sleep quests)
  const finalQuests =
    categoryFilter === "all"
      ? modeFiltered
      : modeFiltered.filter((q) =>
          categoryFilter === "routine"
            ? q.category === "routine" || q.category === "sleep"
            : q.category === categoryFilter
        );

  const handleSeedRoadmap = () => {
    triggerHaptic("heavy");
    setIsSeeding(true);
    startTransition(async () => {
      try {
        const d1 = new Date();
        d1.setDate(d1.getDate() + 3);
        const d2 = new Date();
        d2.setDate(d2.getDate() + 7);
        const d3 = new Date();
        d3.setDate(d3.getDate() + 14);

        await Promise.all([
          createQuestAction({
            title: "Awakened Rank Milestone: Reach Level 5 & Initiate Hunter Status",
            description: "Accumulate 2,500 total XP through workouts and quests to break through Recruit rank limiters.",
            category: "career",
            priority: "high",
            estimated_duration_minutes: 60,
            xp_reward: 350,
            deadline: d1.toISOString(),
            recurrence: "none",
          }),
          createQuestAction({
            title: "30-Day Conditioning Campaign: Move 25,000kg Iron Tonnage",
            description: "Consolidate gym split volume across consecutive weeks without skipping recovery days.",
            category: "fitness",
            priority: "medium",
            estimated_duration_minutes: 45,
            xp_reward: 400,
            deadline: d2.toISOString(),
            recurrence: "none",
          }),
          createQuestAction({
            title: "Deep Focus Mastery: Complete 20-Hour Uninterrupted Study/Work Sprint",
            description: "Channel high intelligence and discipline without central nervous burnout.",
            category: "education",
            priority: "high",
            estimated_duration_minutes: 90,
            xp_reward: 350,
            deadline: d3.toISOString(),
            recurrence: "none",
          }),
        ]);
      } catch (err) {
        console.error("Failed to seed roadmap quests:", err);
      } finally {
        setIsSeeding(false);
      }
    });
  };

  const handleSeedHabits = () => {
    triggerHaptic("heavy");
    setIsSeeding(true);
    startTransition(async () => {
      try {
        await Promise.all([
          createQuestAction({
            title: "Daily 100 Compulsory Skips Protocol",
            description: "Complete 100 jump rope repetitions post-workout or during morning routine.",
            category: "fitness",
            priority: "high",
            estimated_duration_minutes: 5,
            xp_reward: 50,
            recurrence: "daily",
            attribute_rewards: { agility: 0.25 },
          }),
          createQuestAction({
            title: "Hydration Discipline: Reach 3,000ml Pure Water",
            description: "Maintain cellular hydration and kidney filtration efficiency.",
            category: "routine",
            priority: "high",
            estimated_duration_minutes: 10,
            xp_reward: 40,
            recurrence: "daily",
            attribute_rewards: { vitality: 0.25 },
          }),
          createQuestAction({
            title: "6,000 Steps Daily Territory Scouting",
            description: "Achieve baseline caloric expenditure through walking mobility.",
            category: "fitness",
            priority: "medium",
            estimated_duration_minutes: 45,
            xp_reward: 50,
            recurrence: "daily",
            attribute_rewards: { endurance: 0.25 },
          }),
          createQuestAction({
            title: "Evening Review: Plan Next Day Directives",
            description: "Review today's achievements and lock tomorrow's priority missions before resting.",
            category: "routine",
            priority: "medium",
            estimated_duration_minutes: 15,
            xp_reward: 40,
            recurrence: "daily",
            attribute_rewards: { discipline: 0.25 },
          }),
        ]);
      } catch (err) {
        console.error("Failed to seed habit quests:", err);
      } finally {
        setIsSeeding(false);
      }
    });
  };

  const handleToggleQuest = async (e: React.MouseEvent, q: Quest) => {
    e.stopPropagation();
    triggerHaptic("heavy");

    // If this exact quest is already active in Redux, maximize the stopwatch UI immediately
    if (isQuestActive && activeQuestInRedux?.id === q.id) {
      dispatch(maximizeQuestSession());
      return;
    }

    if (isWorkoutActive) {
      alert("A Gym Training protocol is currently active. Please minimize or complete your workout before launching another timed directive.");
      return;
    }

    // 12-Hour Lockout Guard for Main Sleep Directive
    if (q.id === "system-compulsory-sleep-stasis" && isSleepCooldown) {
      alert(`Main Sleep Protocol is locked for 12 hours (${cooldownHoursRemaining}h remaining). Only after 12 hours have passed can this main sleep directive be started again. You may forge a custom Sleep/Nap quest under Routine if you wish to sleep now.`);
      return;
    }

    // Launch fresh universal quest session
    const startedAt = Date.now();
    dispatch(
      startQuestSession({
        quest: q,
        startedAtTimestamp: startedAt,
      })
    );

    try {
      await saveActiveSessionAction({
        session_id: q.id,
        type: "quest",
        title: q.title,
        started_at: new Date(startedAt).toISOString(),
        target_minutes: q.estimated_duration_minutes || 60,
        is_fun: q.is_fun || false,
        linked_attributes: Object.keys(q.attribute_rewards || {}),
        category: q.category,
        quest_data: q,
      });
    } catch (err) {
      console.warn("Failed to persist quest session to cloud:", err);
    }
  };

  const handleComplete = (quest: Quest) => {
    if (quest.status === "completed") return;

    triggerHaptic("success");
    playQuestCompleteSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
    });

    startTransition(async () => {
      if (isQuestActive && activeQuestInRedux?.id === quest.id) {
        dispatch(endQuestSession());
        await clearActiveSessionAction().catch(() => {});
      }
      await completeQuestAction(quest.id);
    });
  };

  const handleDelete = (questId: string) => {
    if (!confirm("Are you sure you want to abandon and delete this quest?")) return;
    triggerHaptic("medium");

    startTransition(async () => {
      if (isQuestActive && activeQuestInRedux?.id === questId) {
        dispatch(endQuestSession());
        await clearActiveSessionAction().catch(() => {});
      }
      await deleteQuestAction(questId);
    });
  };

  return (
    <div className="space-y-4">
      {/* Dual Creation Buttons (Only in Quest Forge page; Dashboard has clean navigation) */}
      {!hideCreationButtons ? (
        <div className="flex items-center gap-2">
          {onOpenSmartModal && (
            <button
              onClick={() => {
                triggerHaptic("light");
                onOpenSmartModal();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              + SMART NLP PARSER
            </button>
          )}

          {onOpenManualModal && (
            <button
              onClick={() => {
                triggerHaptic("light");
                onOpenManualModal();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + MANUAL FORGE
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400">
            Active Directives &amp; Commitments
          </span>
          <Link
            href="/quests"
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>FORGE NEW QUESTS →</span>
          </Link>
        </div>
      )}

      {/* Sticky Primary Roadmap View Tabs & Category Filters on Mobile & PC */}
      <div className="sticky top-0 md:top-16 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 bg-[#07080b]/92 backdrop-blur-xl border-b border-cyan-950/40 shadow-xl shadow-black/40 space-y-2 transition-all">
        {/* Primary Roadmap View Tabs */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800 shadow-sm">
          <button
            onClick={() => {
              triggerHaptic("light");
              setViewMode("today");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition ${
              viewMode === "today"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => {
              triggerHaptic("light");
              setViewMode("upcoming");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition ${
              viewMode === "upcoming"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ROADMAP
          </button>
          <button
            onClick={() => {
              triggerHaptic("light");
              setViewMode("habits");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition ${
              viewMode === "habits"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            HABITS
          </button>
          <button
            onClick={() => {
              triggerHaptic("light");
              setViewMode("completed");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition ${
              viewMode === "completed"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ARCHIVE
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            let count =
              tab.value === "all"
                ? modeFiltered.length
                : tab.value === "routine"
                ? modeFiltered.filter((q) => q.category === "routine" || q.category === "sleep").length
                : modeFiltered.filter((q) => q.category === tab.value).length;

            // Compulsory Sleep Directive is pinned under Routine & All Categories (except completed archive)
            if (viewMode !== "completed" && (tab.value === "all" || tab.value === "routine")) {
              count += 1;
            }

            // Main Quest is counted under Fitness and All Categories when in Today view
            if (viewMode === "today" && mainQuestSplit) {
              if (tab.value === "all" || tab.value === "fitness") {
                count += 1;
              }
            }

            return (
              <button
                key={tab.value}
                onClick={() => {
                  triggerHaptic("light");
                  setCategoryFilter(tab.value);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  categoryFilter === tab.value
                    ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-900/40 text-slate-500 border border-slate-800/60 hover:text-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-400 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quests List Container */}
      <div className="space-y-2.5">
        {/* PINNED MAIN QUEST: TODAY'S GYM DUNGEON SPLIT */}
        {viewMode === "today" && mainQuestSplit && (categoryFilter === "all" || categoryFilter === "fitness") && (
          <div
            onClick={mainQuestSplit.onEnterGym}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden cursor-pointer group ${
              mainQuestSplit.isCompleted
                ? "bg-slate-950/70 border-cyan-500/40 shadow-sm shadow-cyan-950/30"
                : "hunter-panel border-cyan-500/60 hover:border-cyan-400 shadow-lg shadow-cyan-950/40"
            }`}
          >
            {/* Glowing Main Quest Priority Stripe */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                mainQuestSplit.isCompleted
                  ? "bg-cyan-400"
                  : "bg-gradient-to-b from-cyan-400 to-blue-600 animate-pulse"
              }`}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 tracking-wider">
                    MAIN QUEST // {mainQuestSplit.dayName.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-cyan-400" />
                    FITNESS
                  </span>
                  {mainQuestSplit.isCompleted ? (
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-cyan-950">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      COMPLETED ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-2.5 py-0.5 rounded-full">
                      PENDING ENTRY ◆
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors font-solo">
                  {mainQuestSplit.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium font-hud">
                  {mainQuestSplit.subtitle}
                </p>

                {mainQuestSplit.isCompleted && mainQuestSplit.sessionData ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1 flex-wrap">
                    <span>Conquered: {mainQuestSplit.sessionData.workout_set_logs?.length || 0} Sets</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{mainQuestSplit.sessionData.calories_burned || 0} kcal</span>
                    <span>•</span>
                    <span className="text-white font-bold">{Math.round(mainQuestSplit.sessionData.total_tonnage_kg || 0)}kg</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1 flex-wrap">
                    <span>20-in-1 Bench Flow • 60kg Plates Solver • 100+ Skips Challenge</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 pt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                    +200-350 XP
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    +0.40 STR
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    +0.30 DIS
                  </span>
                </div>
              </div>

              <div className="shrink-0 sm:self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mainQuestSplit.onEnterGym();
                  }}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md ${
                    mainQuestSplit.isCompleted
                      ? "bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{mainQuestSplit.isCompleted ? "REVIEW / GYM HUB" : "ENTER GATE"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPULSORY SYSTEM DIRECTIVE: REGENERATIVE STASIS // SLEEP (PINNED IN ROUTINE) */}
        {viewMode !== "completed" && (categoryFilter === "all" || categoryFilter === "routine") && (
          <div
            className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
              isSleepActive
                ? "hunter-panel border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(0,229,255,0.3)] animate-pulse"
                : isSleepCooldown
                ? "hunter-panel border-slate-800/80 bg-slate-950/60 opacity-80"
                : "hunter-panel border-blue-500/40 hover:border-cyan-400/60 shadow-md"
            }`}
          >
            {/* Priority Color Stripe */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1 ${
                isSleepActive
                  ? "bg-cyan-400 shadow-[0_0_12px_#00e5ff]"
                  : isSleepCooldown
                  ? "bg-slate-700"
                  : "bg-blue-400"
              }`}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-solo">
                    <Moon className="w-3 h-3 text-cyan-400" />
                    SYSTEM DIRECTIVE // MANDATORY STASIS
                  </span>

                  {isSleepActive ? (
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-900/60 border border-cyan-400 px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      CIRCADIAN STASIS ACTIVE
                    </span>
                  ) : isSleepCooldown ? (
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                      ❄ 12H COOLDOWN ({cooldownHoursRemaining}h left)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded">
                      ⚡ 2X EXP BOOSTER READY
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-slate-400">
                    Target: 8.0h – 8.5h • Safe: 4.0h+
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-solo">
                  Regenerative Circadian Stasis &amp; Neural Flush
                </h4>
                <p className="text-xs text-slate-400 font-hud line-clamp-2">
                  Mandatory biological repair protocol. Resting between 8.0h and 8.5h unlocks a <strong>⚡ 2X EXP Booster for 5 hours</strong> and purges fatigue. Stopping before 4.0h inflicts a -100 Mana penalty and a 5-hour EXP debuff.
                </p>

                <div className="flex items-center gap-2 mt-2 pt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                    +150 XP (2X Boost Active)
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    +0.75 MEN
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-cyan-300/80 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    -35% MNT • -45% PHY
                  </span>
                </div>
              </div>

              <div className="shrink-0 sm:self-center">
                {isSleepActive ? (
                  <button
                    type="button"
                    onClick={(e) =>
                      handleToggleQuest(e, {
                        id: "system-compulsory-sleep-stasis",
                        user_id: profile?.id || "",
                        title: "System Directive: Regenerative Stasis // Sleep",
                        description:
                          "Mandatory circadian cellular and neural repair protocol. Target 8h 00m – 8h 30m to unlock ⚡ 2X EXP Booster for 5 hours. Resting under 4.0h incurs a -100 Mana penalty.",
                        classification: "permanent",
                        category: "sleep",
                        start_date: todayStr,
                        recurrence: "daily",
                        recurrence_days: [],
                        estimated_duration_minutes: 480,
                        priority: "high",
                        difficulty: "Recruit",
                        attribute_rewards: { mentality: 0.75 },
                        xp_reward: 150,
                        penalty_config: { xp: 100 },
                        status: "in_progress",
                        is_manual: false,
                        is_fun: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      })
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_#00e5ff] animate-pulse"
                  >
                    <Clock className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                    <span>RESUME STASIS ▲</span>
                  </button>
                ) : isSleepCooldown ? (
                  <button
                    type="button"
                    disabled
                    title="Main Sleep Protocol requires a 12-hour biological cooldown. Only after 12 hours can this main sleep directive be started again. If you wish to take an extra nap now, forge a custom Sleep quest under Routine below."
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Moon className="w-3.5 h-3.5 opacity-50" />
                    <span>LOCKED ({cooldownHoursRemaining}H COOLDOWN)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) =>
                      handleToggleQuest(e, {
                        id: "system-compulsory-sleep-stasis",
                        user_id: profile?.id || "",
                        title: "System Directive: Regenerative Stasis // Sleep",
                        description:
                          "Mandatory circadian cellular and neural repair protocol. Target 8h 00m – 8h 30m to unlock ⚡ 2X EXP Booster for 5 hours. Resting under 4.0h incurs a -100 Mana penalty.",
                        classification: "permanent",
                        category: "sleep",
                        start_date: todayStr,
                        recurrence: "daily",
                        recurrence_days: [],
                        estimated_duration_minutes: 480,
                        priority: "high",
                        difficulty: "Recruit",
                        attribute_rewards: { mentality: 0.75 },
                        xp_reward: 150,
                        penalty_config: { xp: 100 },
                        status: "pending",
                        is_manual: false,
                        is_fun: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      })
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-950"
                  >
                    <Moon className="w-3.5 h-3.5 fill-current" />
                    <span>INITIATE SLEEP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP EMPTY STATE & VISUALIZER */}
        {viewMode === "upcoming" && finalQuests.length === 0 && (
          <div className="p-6 rounded-3xl hunter-panel border border-cyan-500/30 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                HUNTER ROADMAP // NO FUTURE CAMPAIGNS SCHEDULED
              </span>
              <h3 className="text-base font-bold text-white">Your Long-Term Progression Horizon is Open</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Roadmap tracks multi-day campaigns, milestone targets, and rank promotions scheduled beyond today.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left max-w-lg mx-auto text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-400 font-bold block text-[11px]">Rank Milestone</span>
                <span className="text-slate-400 text-[10px]">Reach Level 5 Initiate</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-white font-bold block text-[11px]">30-Day Volume</span>
                <span className="text-slate-400 text-[10px]">Move 25,000kg Iron</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-300 font-bold block text-[11px]">Deep Focus</span>
                <span className="text-slate-400 text-[10px]">20h Study Sprint</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSeeding}
              onClick={handleSeedRoadmap}
              className="solo-btn"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isSeeding ? "FORGING ROADMAP..." : "SEED INITIAL HUNTER MILESTONES"}</span>
            </button>
          </div>
        )}

        {/* HABITS EMPTY STATE & VISUALIZER */}
        {viewMode === "habits" && finalQuests.length === 0 && (
          <div className="p-6 rounded-3xl solo-frame space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block font-solo">
                DAILY HABITS PROTOCOL // ZERO ACTIVE HABITS
              </span>
              <h3 className="text-base font-bold text-white font-solo">Automate Your Daily Discipline Loop</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Habits recur daily and reset automatically each dawn to maintain streak multiplier bonuses and attribute growth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md mx-auto text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-white font-bold block text-[11px]">100 Compulsory Skips</span>
                <span className="text-slate-400 text-[10px]">Agility +0.25 • Daily</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-400 font-bold block text-[11px]">3,000ml Hydration</span>
                <span className="text-slate-400 text-[10px]">Vitality +0.25 • Daily</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-300 font-bold block text-[11px]">6,000 Steps Scouting</span>
                <span className="text-slate-400 text-[10px]">Endurance +0.25 • Daily</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-white font-bold block text-[11px]">Evening Review</span>
                <span className="text-slate-400 text-[10px]">Discipline +0.25 • Daily</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSeeding}
              onClick={handleSeedHabits}
              className="solo-btn"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isSeeding ? "ACTIVATING PROTOCOLS..." : "SEED ESSENTIAL DAILY DISCIPLINE HABITS"}</span>
            </button>
          </div>
        )}

        {/* TODAY EMPTY STATE */}
        {viewMode === "today" && finalQuests.length === 0 && (
          (mainQuestSplit && (categoryFilter === "all" || categoryFilter === "fitness")) ||
          (categoryFilter === "all" || categoryFilter === "routine") ? null : (
            <div className="p-8 text-center rounded-3xl hunter-panel border border-dashed border-slate-800 space-y-3">
              <Sparkles className="w-6 h-6 text-cyan-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-solo">
                  No Quests in {categoryFilter.toUpperCase()} Category
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {!hideCreationButtons
                    ? "Use Smart NLP Parser or Manual Forge to schedule your next objective in this category:"
                    : "Direct all focus to your Main Gym Dungeon directive above."}
                </p>
              </div>
              {!hideCreationButtons && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onOpenSmartModal}
                    className="solo-btn"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    + Smart NLP Task
                  </button>
                  <button
                    type="button"
                    onClick={onOpenManualModal}
                    className="solo-btn-secondary"
                  >
                    + Manual Forge
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* ARCHIVE EMPTY STATE */}
        {viewMode === "completed" && finalQuests.length === 0 && completedWorkouts.length === 0 && (
          <div className="p-8 text-center rounded-3xl hunter-panel border border-dashed border-slate-800 space-y-2">
            <Award className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              ARCHIVE VAULT // ZERO COMPLETED RECORDS YET
            </p>
            <p className="text-[11px] text-slate-500">
              Complete daily quests or conquer your gym split to log permanent achievements into your Hunter Archive.
            </p>
          </div>
        )}

        {/* ARCHIVE: RENDER COMPLETED GYM DUNGEON SESSIONS */}
        {viewMode === "completed" &&
          (categoryFilter === "all" || categoryFilter === "fitness") &&
          completedWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="p-4 rounded-2xl border bg-slate-950/70 border-cyan-500/30 relative overflow-hidden shadow-md"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-400" />
              <div className="flex items-start justify-between gap-3 pl-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-cyan-400" />
                      GYM DUNGEON INSTANCE
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {workout.split_day}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(workout.completed_at || workout.started_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>{workout.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                    <span>{workout.workout_set_logs?.length || 0} Sets Logged</span>
                    <span>•</span>
                    <span className="text-white font-bold">{workout.calories_burned || 0} kcal Expelled</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{Math.round(workout.total_tonnage_kg || 0)}kg Moved</span>
                    <span>•</span>
                    <span>{workout.duration_minutes} Mins</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                      +{workout.xp_earned || 250} XP AWARDED
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                      ARCHIVE VERIFIED ◆
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* REGULAR QUESTS LIST */}
        {finalQuests.map((quest) => {
            const isCompleted = quest.status === "completed";
            const isCurrentQuestActive = isQuestActive && activeQuestInRedux?.id === quest.id;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  isCompleted
                    ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                    : isCurrentQuestActive
                    ? "hunter-panel border-cyan-400 bg-slate-900/95 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                    : "hunter-panel border-cyan-500/30 hover:border-cyan-400/60 shadow-md"
                }`}
              >
                {/* Priority Color Stripe */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    isCompleted
                      ? "bg-cyan-600"
                      : isCurrentQuestActive
                      ? "bg-cyan-400 shadow-[0_0_12px_#00e5ff]"
                      : quest.priority === "urgent"
                      ? "bg-cyan-400 shadow-[0_0_8px_#00e5ff]"
                      : "bg-blue-600"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                        {quest.category}
                      </span>

                      {isCurrentQuestActive && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.3)] animate-pulse flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400 animate-spin" />
                          ACTIVE PROTOCOL
                        </span>
                      )}

                      {quest.deadline && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {quest.deadline.replace("T", " ")}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quest.estimated_duration_minutes}m
                      </span>

                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {quest.recurrence === "none" ? "one-off" : quest.recurrence}
                      </span>

                      {quest.is_fun && (
                        <span className="text-[9.5px] font-mono font-bold text-purple-300 bg-purple-950/70 border border-purple-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          🎮 FUN
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold tracking-tight ${
                        isCompleted ? "line-through text-slate-500" : "text-white"
                      }`}
                    >
                      {quest.title}
                    </h4>

                    {quest.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {quest.description}
                      </p>
                    )}

                    {/* Stat Rewards Badge Row */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                        +{quest.xp_reward} XP
                      </span>
                      {Object.entries(quest.attribute_rewards || {}).map(([attr, pts]) => (
                        <span
                          key={attr}
                          className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          +{pts} {attr.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {!isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleToggleQuest(e, quest)}
                          className={`p-2 rounded-xl border transition ${
                            isCurrentQuestActive
                              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)] animate-pulse"
                              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40"
                          }`}
                          title={isCurrentQuestActive ? "Active Directive in Progress — Click to Resume UI" : "Start Timed Session"}
                        >
                          {isCurrentQuestActive ? (
                            <Clock className="w-4 h-4 text-cyan-300 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleComplete(quest)}
                          className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                          title="Quick Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(quest.id)}
                      className="p-2 rounded-xl bg-slate-900/40 text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete Quest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
