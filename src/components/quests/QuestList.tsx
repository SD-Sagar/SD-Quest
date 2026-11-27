"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  startQuestSession,
  maximizeQuestSession,
  endQuestSession,
} from "@/store/slices/questUiSlice";
import { completeQuestAction, deleteQuestAction, createQuestAction, unlockOffDayQuestAction } from "@/server/actions/quest.actions";
import { getTodaysWorkoutsAction } from "@/server/actions/workout.actions";
import { saveActiveSessionAction, clearActiveSessionAction, logManualSleepSessionAction } from "@/server/actions/player.actions";
import { calculateCircadianAwakeStatus, calculatePassiveFatigueDecay } from "@/lib/calculations/fatigue";
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
  BedDouble,
  AlertTriangle,
  X,
  Check,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  Minus,
  Lock,
} from "lucide-react";

interface QuestListProps {
  quests: Quest[];
  profile?: Profile;
  onOpenManualModal?: () => void;
  onOpenSmartModal?: () => void;
  hideCreationButtons?: boolean;
  compactView?: boolean;
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
  { value: "finance", label: "Finance" },
];

export function QuestList({
  quests,
  profile,
  onOpenManualModal,
  onOpenSmartModal,
  hideCreationButtons = false,
  compactView,
  mainQuestSplit,
}: QuestListProps) {
  const isCompact = compactView !== undefined ? compactView : hideCreationButtons;
  const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isQuestActive = useAppSelector((state) => state.questUi.isActive);
  const activeQuestInRedux = useAppSelector((state) => state.questUi.quest);
  const questStartedAt = useAppSelector((state) => state.questUi.startedAtTimestamp);
  const isWorkoutActive = useAppSelector((state) => state.workoutUi.isActive);

  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | "all">("all");
  const [isPending, startTransition] = useTransition();
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Recovery Nap & Offline Sleep Modal State
  const [isManualSleepModalOpen, setIsManualSleepModalOpen] = useState(false);
  const [manualSleepMinutes, setManualSleepMinutes] = useState<number | string>(90);
  const [manualSleepLoading, setManualSleepLoading] = useState(false);

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

  // Circadian Awake & Sleep Status Telemetry
  const sessionState = ((profile?.active_session_state as any) || {});
  const activeSleepDurationMinutes =
    isSleepActive && questStartedAt
      ? Math.max(0, (Date.now() - questStartedAt) / (1000 * 60))
      : 0;

  const isCurrentlySleeping = Boolean(
    isSleepActive ||
    sessionState.is_sleeping ||
    sessionState.category === "sleep" ||
    sessionState.session_id === "system-compulsory-sleep-stasis" ||
    sessionState.type === "sleep"
  );

  const circadian = useMemo(() => {
    return calculateCircadianAwakeStatus({
      lastSleepStartedAt: profile?.last_sleep_started_at || sessionState.last_sleep_started_at,
      lastSleepCompletedAt: profile?.last_sleep_completed_at || sessionState.last_sleep_completed_at,
      rollingSleepMinutes: profile?.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes ?? 0,
      isCurrentlySleeping,
      frozenAwakeHours: sessionState.frozen_awake_hours,
      currentSleepDurationMinutes: activeSleepDurationMinutes,
      createdAt: profile?.created_at,
    });
  }, [
    profile?.last_sleep_started_at,
    profile?.last_sleep_completed_at,
    profile?.rolling_sleep_minutes,
    sessionState.last_sleep_started_at,
    sessionState.last_sleep_completed_at,
    sessionState.rolling_sleep_minutes,
    sessionState.frozen_awake_hours,
    isCurrentlySleeping,
    activeSleepDurationMinutes,
    profile?.created_at,
  ]);

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
  const currentDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  // Unlocked state records for repeat sessions and off-day sessions
  const [unlockedRepeats, setUnlockedRepeats] = useState<Record<string, boolean>>({});
  const [unlockedOffDays, setUnlockedOffDays] = useState<Record<string, boolean>>({});
  const [unlockLoadingId, setUnlockLoadingId] = useState<string | null>(null);

  // Check if a quest was completed today
  const isQuestCompletedToday = (q: Quest) => {
    if (q.status !== "completed") return false;
    const doneDate = q.last_completed_date || (q.completed_at ? q.completed_at.split("T")[0] : null);
    return doneDate === todayStr;
  };

  // Helper to determine next scheduled day of week label for off-day badge
  const getNextScheduledDayLabel = (q: Quest) => {
    if (q.recurrence === "weekdays") return "MONDAY";
    if (q.recurrence === "weekly") {
      const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      if (Array.isArray(q.recurrence_days) && q.recurrence_days.length > 0) {
        const sorted = [...q.recurrence_days].sort((a, b) => a - b);
        const next = sorted.find((d) => d > currentDayOfWeek) ?? sorted[0];
        return DAYS[next];
      }
      if (q.start_date) {
        return DAYS[new Date(q.start_date + "T00:00:00").getDay()];
      }
    }
    return "TOMORROW";
  };

  // Check if a quest is scheduled for today across all 4 recurrence types
  const isQuestScheduledForToday = (q: Quest) => {
    // 1. One-time date quest
    if (!q.recurrence || q.recurrence === "none") {
      const isDueToday = Boolean(q.deadline?.startsWith(todayStr));
      const isStartToday = q.start_date === todayStr;
      const isCurrentCampaign = Boolean(q.start_date && q.start_date <= todayStr && (!q.deadline || q.deadline >= todayStr));
      const isUndated = !q.deadline && !q.start_date;
      return isDueToday || isStartToday || isCurrentCampaign || isUndated;
    }

    // 2. Daily habit
    if (q.recurrence === "daily") {
      return true;
    }

    // 3. Weekdays habit (Mon to Fri)
    if (q.recurrence === "weekdays") {
      return currentDayOfWeek >= 1 && currentDayOfWeek <= 5;
    }

    // 4. Weekly habit on specific days
    if (q.recurrence === "weekly") {
      if (Array.isArray(q.recurrence_days) && q.recurrence_days.length > 0) {
        return q.recurrence_days.includes(currentDayOfWeek);
      }
      if (q.start_date) {
        const startDay = new Date(q.start_date + "T00:00:00").getDay();
        return startDay === currentDayOfWeek;
      }
      return false;
    }

    return true;
  };

  // Filter based on View Mode
  const modeFiltered = quests.filter((q) => {
    if (viewMode === "completed") {
      return q.status === "completed";
    }

    if (viewMode === "today") {
      const isRecurring = Boolean(q.recurrence && q.recurrence !== "none");
      if (!isRecurring) {
        // Normal one-time quest: once completed, vanish immediately from Today into Archive!
        if (q.status === "completed") return false;
        return isQuestScheduledForToday(q);
      }
      // Recurring quests (daily, weekdays, weekly): never leave Today view!
      return true;
    }

    if (viewMode === "upcoming") {
      if (q.status === "completed") return false;
      if (!q.recurrence || q.recurrence === "none") {
        return (Boolean(q.deadline) && q.deadline! > todayStr + "T23:59:59") || (Boolean(q.start_date) && q.start_date > todayStr);
      }
      // Recurring quests upcoming if not scheduled today
      return !isQuestScheduledForToday(q);
    }

    if (viewMode === "habits") {
      return Boolean(q.recurrence && q.recurrence !== "none");
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

  const userMainDomain = profile?.active_main_quest || "fitness";
  const isFitnessMain = userMainDomain === "fitness";

  // Identify the hunter's true Main Quest when a non-fitness domain is selected
  const primaryDomainQuest = useMemo(() => {
    if (isFitnessMain) return null;
    const candidates = finalQuests.filter((q) => q.category === userMainDomain);
    const pending = candidates.find((q) => q.status !== "completed");
    return pending || candidates[0] || null;
  }, [finalQuests, userMainDomain, isFitnessMain]);

  // When viewing "all" categories, prioritize the primary domain quest at the top of the quest list
  const displayQuests = useMemo(() => {
    if (!primaryDomainQuest || categoryFilter !== "all") return finalQuests;
    return [
      primaryDomainQuest,
      ...finalQuests.filter((q) => q.id !== primaryDomainQuest.id),
    ];
  }, [finalQuests, primaryDomainQuest, categoryFilter]);

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
            title: "Morning Cold Splash & Posture Alignment",
            description: "Shock nervous system with cold water rinse and 60-second spinal alignment.",
            category: "routine",
            priority: "medium",
            estimated_duration_minutes: 5,
            xp_reward: 40,
            recurrence: "daily",
            attribute_rewards: { discipline: 0.25, vitality: 0.10 },
          }),
          createQuestAction({
            title: "Core Plank & Isometric Hold Circuit",
            description: "Build anterior abdominal stability and posture endurance through timed holds.",
            category: "fitness",
            priority: "medium",
            estimated_duration_minutes: 10,
            xp_reward: 50,
            recurrence: "daily",
            attribute_rewards: { endurance: 0.25, strength: 0.15 },
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

    // Circadian Biomechanical Lockout for Physical/Fitness Directives
    const isPhysicalQuest =
      q.category === "fitness" ||
      Boolean(
        q.attribute_rewards?.strength ||
        q.attribute_rewards?.agility ||
        q.attribute_rewards?.endurance
      );

    if (isPhysicalQuest && circadian.isPhysicalTrainingLocked) {
      alert(
        `CIRCADIAN BIOMECHANICAL LOCKOUT\n\n` +
        `Current sleep: ${(circadian.cumulativeSleepMinutes / 60).toFixed(1)}h / 4.0h required in this 26h circadian cycle (Awake: ${circadian.hoursAwakeLive.toFixed(1)}h).\n\n` +
        `Physical training and conditioning quests are locked to prevent neuromuscular exhaustion and cardiac strain.\n\n` +
        `Please initiate sleep or tap "LOG RECOVERY NAP / OFFLINE SLEEP" to reach at least 4.0 hours of cumulative sleep and lift this lockout.`
      );
      return;
    }

    // Launch fresh universal quest session with hunter's real-time decayed profile fatigue
    const startedAt = Date.now();
    const decay = calculatePassiveFatigueDecay(
      profile?.last_fatigue_update_at,
      Number(profile?.mental_fatigue) || 0,
      Number(profile?.physical_fatigue) || 0,
      undefined,
      {
        hunterLevel: profile?.current_level,
        rank: profile?.rank,
        lastHydrationSurgeAt: profile?.last_hydration_surge_at,
      }
    );
    const currentPhys = decay.newPhysicalFatigue;
    const currentMent = decay.newMentalFatigue;
    const currentLvl = profile?.current_level || 1;

    const isRepeat = Boolean(unlockedRepeats[q.id]);
    const isOffDay = Boolean(unlockedOffDays[q.id]);

    dispatch(
      startQuestSession({
        quest: q,
        startedAtTimestamp: startedAt,
        initialPhysicalFatigue: currentPhys,
        initialMentalFatigue: currentMent,
        hunterLevel: currentLvl,
        isRepeatSession: isRepeat,
        isOffDaySession: isOffDay,
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
        mental_fatigue: currentMent,
        physical_fatigue: currentPhys,
        hunter_level: currentLvl,
      });
    } catch (err) {
      console.warn("Failed to persist quest session to cloud:", err);
    }
  };

  const handleUnlockRepeat = (q: Quest) => {
    triggerHaptic("heavy");
    setUnlockedRepeats((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleUnlockOffDay = async (q: Quest) => {
    triggerHaptic("heavy");
    setUnlockLoadingId(q.id);
    try {
      const res = await unlockOffDayQuestAction(q.id);
      if (res?.success) {
        setUnlockedOffDays((prev) => ({ ...prev, [q.id]: true }));
        triggerHaptic("success");
      }
    } catch (err) {
      console.error("Failed to unlock off-day quest:", err);
    } finally {
      setUnlockLoadingId(null);
    }
  };

  const handleComplete = (quest: Quest) => {
    const isRepeat = Boolean(unlockedRepeats[quest.id]);
    const isOffDay = Boolean(unlockedOffDays[quest.id]);

    if (quest.status === "completed" && !isRepeat) return;

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
      await completeQuestAction(quest.id, undefined, {
        isRepeatSession: isRepeat,
        isOffDaySession: isOffDay,
      });
      if (isRepeat) {
        setUnlockedRepeats((prev) => ({ ...prev, [quest.id]: false }));
      }
      if (isOffDay) {
        setUnlockedOffDays((prev) => ({ ...prev, [quest.id]: false }));
      }
    });
  };

  const handleDelete = (quest: Quest) => {
    triggerHaptic("medium");
    setQuestToDelete(quest);
  };

  const executeDelete = (questId: string) => {
    triggerHaptic("heavy");
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

      {/* Sticky Primary Roadmap View Tabs & Category Filters on Mobile & PC (Transparent on Dashboard) */}
      <div
        className={`space-y-2 transition-all ${
          isCompact
            ? "bg-transparent p-0 border-0 shadow-none static"
            : "sticky top-0 md:top-16 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 bg-[#05070c]/50 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-black/30"
        }`}
      >
        {/* Primary Roadmap View Tabs */}
        <div
          className={`flex rounded-2xl p-1 border shadow-sm transition-colors ${
            isCompact
              ? "bg-[#070b14]/50 border-cyan-500/20 backdrop-blur-sm"
              : "bg-slate-950/60 backdrop-blur-md border-slate-800/80"
          }`}
        >
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
            className={`rounded-2xl border transition-all duration-200 relative overflow-hidden cursor-pointer group ${
              isCompact ? "p-3 sm:p-3.5" : "p-4 sm:p-5"
            } ${
              mainQuestSplit.isCompleted
                ? "bg-slate-950/70 border-cyan-500/40 shadow-sm shadow-cyan-950/30"
                : isFitnessMain
                ? "hunter-panel border-cyan-500/60 hover:border-cyan-400 shadow-md shadow-cyan-950/40"
                : "bg-[#070b14]/90 border-slate-800 hover:border-cyan-500/40 shadow-md"
            }`}
          >
            {/* Main Quest Priority Stripe (Pulsing glowing only when fitness is user's active main quest) */}
            <div
              className={`absolute top-0 left-0 bottom-0 ${isCompact ? "w-1" : "w-1.5"} ${
                mainQuestSplit.isCompleted
                  ? "bg-cyan-400"
                  : isFitnessMain
                  ? "bg-gradient-to-b from-cyan-400 to-blue-600 animate-pulse"
                  : "bg-slate-700"
              }`}
            />

            <div className="flex items-center justify-between gap-3 pl-2">
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[9.5px] font-mono font-black uppercase px-2 py-0.2 rounded-full border tracking-wider ${
                      isFitnessMain
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-900 text-slate-300 border-slate-700"
                    }`}
                  >
                    {isFitnessMain
                      ? `MAIN // ${mainQuestSplit.dayName.toUpperCase()}`
                      : `DUNGEON // ${mainQuestSplit.dayName.toUpperCase()}`}
                  </span>
                  <span className="text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 border border-slate-700 flex items-center gap-1">
                    <Dumbbell className="w-2.5 h-2.5 text-cyan-400" />
                    {isFitnessMain ? "FITNESS" : "PHYSICAL"}
                  </span>
                  {mainQuestSplit.isCompleted ? (
                    <span className="text-[9.5px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      CLEARED
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-mono text-cyan-300">
                      PENDING ENTRY ◆
                    </span>
                  )}
                </div>

                <h4 className={`font-black text-white truncate font-solo group-hover:text-cyan-300 transition-colors ${isCompact ? "text-sm sm:text-base" : "text-base"}`}>
                  {mainQuestSplit.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate font-hud">
                  {mainQuestSplit.subtitle}
                </p>

                {!isCompact && (
                  <>
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
                  </>
                )}
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mainQuestSplit.onEnterGym();
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md ${
                    mainQuestSplit.isCompleted
                      ? "bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{mainQuestSplit.isCompleted ? "REVIEW" : "ENTER"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPULSORY SYSTEM DIRECTIVE: REGENERATIVE STASIS // SLEEP (PINNED IN ROUTINE) */}
        {viewMode !== "completed" && (categoryFilter === "all" || categoryFilter === "routine") && (
          isCompact ? (
            <div
              className={`p-3 rounded-xl border transition-all duration-200 relative overflow-hidden hunter-panel ${
                isSleepActive
                  ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,229,255,0.25)] animate-pulse"
                  : isSleepCooldown
                  ? "border-slate-800/80 bg-slate-950/60 opacity-80"
                  : "border-cyan-500/30 hover:border-cyan-400/50"
              }`}
            >
              <div
                className={`absolute top-0 left-0 bottom-0 w-1 ${
                  isSleepActive
                    ? "bg-cyan-400 shadow-[0_0_10px_#00e5ff]"
                    : isSleepCooldown
                    ? "bg-slate-700"
                    : "bg-blue-400"
                }`}
              />
              <div className="flex items-center justify-between gap-3 pl-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9.5px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/70 border border-cyan-500/40 px-1.5 py-0.2 rounded flex items-center gap-1 font-solo">
                      <Moon className="w-2.5 h-2.5 text-cyan-400" />
                      SLEEP DIRECTIVE
                    </span>
                    {isSleepActive ? (
                      <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-900/60 border border-cyan-400 px-1.5 py-0.2 rounded animate-pulse">
                        STASIS ACTIVE
                      </span>
                    ) : isSleepCooldown ? (
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-700 px-1.5 py-0.2 rounded">
                        ❄ {cooldownHoursRemaining}h COOLDOWN
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                        ⚡ 2X EXP READY
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        circadian.hasAdequateSleep
                          ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                          : "bg-red-950/80 text-red-300 border-red-500/50"
                      }`}
                    >
                      {(circadian.cumulativeSleepMinutes / 60).toFixed(1)}h / 4.0h
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate font-solo">
                    Regenerative Circadian Stasis &amp; Neural Flush
                  </h4>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("medium");
                      setIsManualSleepModalOpen(true);
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40"
                    title="Log offline nap or recovery sleep"
                  >
                    <BedDouble className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline">NAP</span>
                  </button>

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
                      className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center gap-1 bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_#00e5ff] animate-pulse"
                    >
                      <Clock className="w-3 h-3 animate-spin text-cyan-300" />
                      <span>RESUME</span>
                    </button>
                  ) : isSleepCooldown ? (
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                    >
                      <span>LOCKED</span>
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
                      className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-black uppercase transition flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white"
                    >
                      <Moon className="w-3 h-3 fill-current" />
                      <span>SLEEP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
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
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      circadian.hasAdequateSleep
                        ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/30"
                        : "bg-red-950/80 text-red-300 border-red-500/50 animate-pulse"
                    }`}
                  >
                    {(circadian.cumulativeSleepMinutes / 60).toFixed(1)}h / 4.0h CYCLE SLEEP
                  </span>
                </div>
              </div>

              <div className="shrink-0 sm:self-center flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    setIsManualSleepModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-sm"
                  title="Log an offline sleep session or afternoon recovery nap to accumulate towards the 4.0h quota and lift physical training lockouts."
                >
                  <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LOG NAP / OFFLINE SLEEP</span>
                </button>

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
          )
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left max-w-md mx-auto text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-white font-bold block text-[11px]">100 Compulsory Skips</span>
                <span className="text-slate-400 text-[10px]">Agility +0.25 • Daily</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-400 font-bold block text-[11px]">Cold Splash &amp; Posture</span>
                <span className="text-slate-400 text-[10px]">Discipline +0.25 • Daily</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-cyan-300 font-bold block text-[11px]">Core Plank Circuit</span>
                <span className="text-slate-400 text-[10px]">Endurance +0.25 • Daily</span>
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
            isCompact ? (
              <div
                key={workout.id}
                className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white truncate font-solo text-xs">{workout.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">{workout.split_day}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                  <span>{workout.calories_burned || 0} kcal</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">+{workout.xp_earned || 250} XP</span>
                </div>
              </div>
            ) : (
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
            )
          ))}

        {/* REGULAR QUESTS LIST (Active Directives First + Collapsible Completed Directives) */}
        {(() => {
          const renderQuestCard = (quest: Quest) => {
            const isRecurring = Boolean(quest.recurrence && quest.recurrence !== "none");
            const isCompletedToday = isQuestCompletedToday(quest);
            const isScheduledToday = isQuestScheduledForToday(quest);

            const isRepeatUnlocked = Boolean(unlockedRepeats[quest.id]);
            const isOffDayUnlocked = Boolean(unlockedOffDays[quest.id]);

            // State 1: Completed today and locked (needs repeat unlock)
            const isCompletedLocked = isRecurring && isCompletedToday && !isRepeatUnlocked;

            // State 2: Scheduled for another day (off-day) and not yet off-day unlocked and not completed today
            const isOffDayLocked = isRecurring && !isScheduledToday && !isOffDayUnlocked && !isCompletedToday;

            // State 3: Normal one-time quest that is completed (viewed in Archive)
            const isNormalCompleted = !isRecurring && quest.status === "completed";

            const isCurrentQuestActive = isQuestActive && activeQuestInRedux?.id === quest.id;
            const isPrimaryDomainMainQuest = primaryDomainQuest?.id === quest.id;

            if (isCompact) {
              return (
                <div
                  key={quest.id}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                    isCompletedLocked
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : isOffDayLocked
                      ? "bg-slate-950/80 border-amber-500/30 opacity-80"
                      : isNormalCompleted
                      ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                      : isCurrentQuestActive
                      ? "hunter-panel border-cyan-400 bg-slate-900/95 shadow-[0_0_15px_rgba(0,229,255,0.22)]"
                      : isPrimaryDomainMainQuest
                      ? "hunter-panel border-cyan-400/80 bg-slate-900/95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                      : "hunter-panel border-cyan-500/30 hover:border-cyan-400/60 shadow-sm"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 bottom-0 ${isPrimaryDomainMainQuest ? "w-1.5" : "w-1"} ${
                      isCompletedLocked
                        ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                        : isOffDayLocked
                        ? "bg-amber-500"
                        : isNormalCompleted
                        ? "bg-cyan-600"
                        : isCurrentQuestActive
                        ? "bg-cyan-400 shadow-[0_0_10px_#00e5ff]"
                        : isPrimaryDomainMainQuest
                        ? "bg-gradient-to-b from-cyan-400 to-blue-600 animate-pulse shadow-[0_0_10px_#00e5ff]"
                        : quest.priority === "urgent"
                        ? "bg-cyan-400 shadow-[0_0_8px_#00e5ff]"
                        : "bg-blue-600"
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2.5 pl-2">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPrimaryDomainMainQuest && (
                          <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 text-cyan-300" />
                            MAIN
                          </span>
                        )}
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                          {quest.category}
                        </span>
                        {quest.recurrence && quest.recurrence !== "none" && (
                          <span className="text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                            {quest.recurrence === "daily" ? "DAILY" : quest.recurrence === "weekdays" ? "WEEKDAYS" : "WEEKLY"}
                          </span>
                        )}
                        {isCompletedLocked ? (
                          <span className="text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            COMPLETED TODAY ◆
                          </span>
                        ) : isOffDayLocked ? (
                          <span className="text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                            OFF-DAY (NEXT: {getNextScheduledDayLabel(quest)})
                          </span>
                        ) : isRepeatUnlocked ? (
                          <span className="text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                            LIMIT BREAK (+25% FATIGUE)
                          </span>
                        ) : isOffDayUnlocked ? (
                          <span className="text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                            OFF-DAY UNLOCKED
                          </span>
                        ) : null}
                        <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {quest.estimated_duration_minutes}m
                        </span>
                        <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-1.5 py-0.2 rounded border border-cyan-500/30">
                          +{quest.xp_reward} XP
                        </span>
                        {isCurrentQuestActive && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-400 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isNormalCompleted || isCompletedLocked ? "line-through text-slate-400" : "text-white font-solo"
                        }`}
                      >
                        {quest.title}
                      </h4>
                    </div>

                    {/* Quick Compact Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isCompletedLocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnlockRepeat(quest)}
                          className="px-2 py-1 rounded-lg font-mono text-[9px] font-bold bg-cyan-950/90 border border-cyan-400 text-cyan-300 hover:bg-cyan-900 transition flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                          title="Unlock same-day repeat session (+25% fatigue rate, boosted attribute gain)"
                        >
                          <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                          <span>REPEAT (+25%)</span>
                        </button>
                      ) : isOffDayLocked ? (
                        <button
                          type="button"
                          disabled={unlockLoadingId === quest.id}
                          onClick={() => handleUnlockOffDay(quest)}
                          className="px-2 py-1 rounded-lg font-mono text-[9px] font-bold bg-slate-900 border border-amber-500/50 text-amber-300 hover:bg-amber-950/40 transition flex items-center gap-1"
                          title="Unlock off-day early access (-10 XP fee)"
                        >
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>{unlockLoadingId === quest.id ? "..." : "UNLOCK (-10 XP)"}</span>
                        </button>
                      ) : !isNormalCompleted ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleToggleQuest(e, quest)}
                            className={`p-1.5 rounded-lg border transition ${
                              isCurrentQuestActive
                                ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.4)] animate-pulse"
                                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40"
                            }`}
                            title={isCurrentQuestActive ? "Resume active session" : "Start session"}
                          >
                            {isCurrentQuestActive ? (
                              <Clock className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleComplete(quest)}
                            className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                            title="Complete directive"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(quest)}
                        className="p-1.5 rounded-lg bg-slate-900/40 text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        title="Abandon directive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  isCompletedLocked
                    ? "bg-emerald-950/15 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : isOffDayLocked
                    ? "bg-slate-950/80 border-amber-500/30 opacity-80"
                    : isNormalCompleted
                    ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                    : isCurrentQuestActive
                    ? "hunter-panel border-cyan-400 bg-slate-900/95 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                    : isPrimaryDomainMainQuest
                    ? "hunter-panel border-cyan-400/80 bg-slate-900/95 shadow-[0_0_20px_rgba(0,229,255,0.22)]"
                    : "hunter-panel border-cyan-500/30 hover:border-cyan-400/60 shadow-md"
                }`}
              >
                {/* Priority Color Stripe */}
                <div
                  className={`absolute top-0 left-0 bottom-0 ${isPrimaryDomainMainQuest ? "w-1.5" : "w-1"} ${
                    isCompletedLocked
                      ? "bg-emerald-400 shadow-[0_0_10px_#10b981]"
                      : isOffDayLocked
                      ? "bg-amber-500"
                      : isNormalCompleted
                      ? "bg-cyan-600"
                      : isCurrentQuestActive
                      ? "bg-cyan-400 shadow-[0_0_12px_#00e5ff]"
                      : isPrimaryDomainMainQuest
                      ? "bg-gradient-to-b from-cyan-400 to-blue-600 animate-pulse shadow-[0_0_12px_#00e5ff]"
                      : quest.priority === "urgent"
                      ? "bg-cyan-400 shadow-[0_0_8px_#00e5ff]"
                      : "bg-blue-600"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {isPrimaryDomainMainQuest && (
                        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)] tracking-wider flex items-center gap-1">
                          <Crown className="w-3 h-3 text-cyan-300" />
                          MAIN QUEST // {quest.category.toUpperCase()}
                        </span>
                      )}

                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                        {quest.category}
                      </span>

                      {quest.recurrence && quest.recurrence !== "none" && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40">
                          {quest.recurrence === "daily" ? "DAILY HABIT" : quest.recurrence === "weekdays" ? "WEEKDAYS (MON-FRI)" : "WEEKLY RECURRING"}
                        </span>
                      )}

                      {isCompletedLocked && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          LOCKED // COMPLETED TODAY ◆
                        </span>
                      )}

                      {isOffDayLocked && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          LOCKED // OFF-DAY (NEXT: {getNextScheduledDayLabel(quest)})
                        </span>
                      )}

                      {isRepeatUnlocked && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.3)] animate-pulse flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                          LIMIT BREAK (+25% FATIGUE • 1.25X STATS)
                        </span>
                      )}

                      {isOffDayUnlocked && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/60 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          OFF-DAY SESSION ACTIVE
                        </span>
                      )}

                      {/* Physical Training Circadian Lockout Indicator */}
                      {(quest.category === "fitness" ||
                        Boolean(
                          quest.attribute_rewards?.strength ||
                          quest.attribute_rewards?.agility ||
                          quest.attribute_rewards?.endurance
                        )) &&
                        circadian.isPhysicalTrainingLocked && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-500/60 animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            LOCKED (SLEEP REQ)
                          </span>
                        )}

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
                        isNormalCompleted || isCompletedLocked ? "line-through text-slate-400" : "text-white"
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
                    {isCompletedLocked ? (
                      <button
                        type="button"
                        onClick={() => handleUnlockRepeat(quest)}
                        className="px-3.5 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-900 border border-cyan-400 text-cyan-300 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                        <span>⚡ UNLOCK REPEAT (+25% BOOST)</span>
                      </button>
                    ) : isOffDayLocked ? (
                      <button
                        type="button"
                        disabled={unlockLoadingId === quest.id}
                        onClick={() => handleUnlockOffDay(quest)}
                        className="px-3.5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-900 border border-amber-500/60 text-amber-300 hover:bg-amber-950/50 hover:border-amber-400 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{unlockLoadingId === quest.id ? "UNLOCKING..." : "🔓 UNLOCK OFF-DAY (-10 XP)"}</span>
                      </button>
                    ) : !isNormalCompleted ? (
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
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleDelete(quest)}
                      className="p-2 rounded-xl bg-slate-900/40 text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete Quest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          };

          if (viewMode === "today") {
            return (
              <div className="space-y-3">
                {displayQuests.map(renderQuestCard)}
              </div>
            );
          }

          return displayQuests.map(renderQuestCard);
        })()}
      </div>

      {/* MANUAL SLEEP & RECOVERY NAP MODAL */}
      {isManualSleepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#090d18] border border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,229,255,0.25)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <BedDouble className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-solo tracking-wide">
                    LOG OFFLINE SLEEP // RECOVERY NAP
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Circadian Quota Accumulator
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualSleepModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-hud">
              Log offline rest or an afternoon recovery nap. Sleep duration accumulates towards your <strong>4.0-hour circadian quota</strong>, purges biological fatigue, and lifts physical training and gym lockouts.
            </p>

            {/* Quick Duration Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Quick Recovery Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "1.5h Power Nap", minutes: 90, desc: "Quick Flush" },
                  { label: "2.0h Deep Nap", minutes: 120, desc: "REM Restoration" },
                  { label: "3.0h Core Rest", minutes: 180, desc: "Deep Repair" },
                  { label: "4.0h Safe Floor", minutes: 240, desc: "Clears Lockout" },
                  { label: "6.0h Moderate", minutes: 360, desc: "Solid Rest" },
                  { label: "8.0h Full Sleep", minutes: 480, desc: "Complete Cycle" },
                ].map((preset) => (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setManualSleepMinutes(preset.minutes);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      manualSleepMinutes === preset.minutes
                        ? "bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)] text-cyan-300"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{preset.label}</span>
                    <span className="text-[9.5px] text-slate-500 mt-0.5">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Minutes Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">
                Custom Duration (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center flex-1 bg-slate-950 border border-slate-800 rounded-xl p-0.5 focus-within:border-cyan-400">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setManualSleepMinutes((prev) => Math.max(15, (Number(prev) || 90) - 15));
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={15}
                    max={720}
                    step={15}
                    value={manualSleepMinutes}
                    onChange={(e) => setManualSleepMinutes(e.target.value)}
                    onBlur={() => {
                      const val = Math.min(720, Math.max(15, Number(manualSleepMinutes) || 90));
                      setManualSleepMinutes(val);
                    }}
                    className="w-full text-center bg-transparent py-1.5 text-sm font-mono text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setManualSleepMinutes((prev) => Math.min(720, (Number(prev) || 90) + 15));
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-mono text-cyan-400 shrink-0 font-bold">
                  = {((Number(manualSleepMinutes) || 0) / 60).toFixed(1)} Hours
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsManualSleepModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={manualSleepLoading || (Number(manualSleepMinutes) || 0) <= 0}
                onClick={async () => {
                  const mins = Number(manualSleepMinutes) || 0;
                  if (mins <= 0) return;
                  setManualSleepLoading(true);
                  try {
                    await logManualSleepSessionAction(mins);
                    triggerHaptic("success");
                    confetti({ particleCount: 70, spread: 70 });
                    setIsManualSleepModalOpen(false);
                    router.refresh();
                  } catch (err: any) {
                    alert(err?.message || "Failed to log sleep session");
                  } finally {
                    setManualSleepLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-mono text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-cyan-950 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{manualSleepLoading ? "LOGGING REST..." : `CONFIRM ${((Number(manualSleepMinutes) || 0) / 60).toFixed(1)}H SLEEP`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* SOLO LEVELING SYSTEM ABANDONMENT CONFIRMATION MODAL */}
      {questToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#05070c]/95 border border-red-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.25)] space-y-4">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-solo tracking-widest uppercase">
                    SYSTEM DIRECTIVE // ABANDONMENT
                  </h3>
                  <span className="text-[10px] font-mono text-red-400">
                    Mandatory Confirmation Required
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuestToDelete(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-hud leading-relaxed">
                Hunter, are you sure you want to abandon and purge this directive from your system ledger?
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                  Target Directive:
                </span>
                <span className="text-sm font-bold text-white font-solo block">
                  {questToDelete.title}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1">
                  <span>Category: {questToDelete.category}</span>
                  <span>•</span>
                  <span>Reward: +{questToDelete.xp_reward} XP</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-red-400/80">
                ⚠ WARNING: Abandoned directives forfeit all pending XP, streak preservation, and attribute gains.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setQuestToDelete(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold transition"
              >
                DISMISS
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = questToDelete.id;
                  setQuestToDelete(null);
                  executeDelete(id);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-red-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CONFIRM ABANDON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
