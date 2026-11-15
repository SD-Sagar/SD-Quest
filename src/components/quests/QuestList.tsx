"use client";

import { useState, useTransition } from "react";
import { completeQuestAction, deleteQuestAction } from "@/server/actions/quest.actions";
import { triggerHaptic } from "@/lib/utils";
import { playQuestCompleteSound } from "@/lib/audio/soundEffects";
import confetti from "canvas-confetti";
import { Quest, QuestCategory } from "@/types";
import { LiveQuestStopwatch } from "./LiveQuestStopwatch";
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
} from "lucide-react";

interface QuestListProps {
  quests: Quest[];
  onOpenManualModal: () => void;
  onOpenSmartModal: () => void;
}

type ViewMode = "today" | "upcoming" | "habits" | "completed";

const CATEGORY_TABS: { value: QuestCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "career", label: "Career" },
  { value: "fitness", label: "Fitness" },
  { value: "routine", label: "Routine" },
  { value: "education", label: "Study" },
];

export function QuestList({ quests, onOpenManualModal, onOpenSmartModal }: QuestListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | "all">("all");
  const [activeTimedQuest, setActiveTimedQuest] = useState<Quest | null>(null);
  const [isPending, startTransition] = useTransition();

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

  // Apply Category filter
  const finalQuests =
    categoryFilter === "all"
      ? modeFiltered
      : modeFiltered.filter((q) => q.category === categoryFilter);

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
      await completeQuestAction(quest.id);
    });
  };

  const handleDelete = (questId: string) => {
    triggerHaptic("light");
    startTransition(async () => {
      await deleteQuestAction(questId);
    });
  };

  return (
    <div className="space-y-4">
      {/* Primary Roadmap View Tabs */}
      <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
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

      {/* Dual Creation Buttons */}
      <div className="flex items-center gap-2">
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
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              triggerHaptic("light");
              setCategoryFilter(tab.value);
            }}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
              categoryFilter === tab.value
                ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-900/40 text-slate-500 border border-slate-800/60 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quests List */}
      <div className="space-y-2.5">
        {finalQuests.length === 0 ? (
          <div className="p-8 text-center rounded-3xl hunter-panel border border-dashed border-slate-800 space-y-2">
            <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              No quests found in this view.
            </p>
            <p className="text-[11px] text-slate-500">
              Use Smart NLP or Manual Forge to schedule your next objective.
            </p>
          </div>
        ) : (
          finalQuests.map((quest) => {
            const isCompleted = quest.status === "completed";

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  isCompleted
                    ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                    : "hunter-panel border-slate-800 hover:border-slate-700 shadow-md"
                }`}
              >
                {/* Priority Color Stripe */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    isCompleted
                      ? "bg-emerald-500"
                      : quest.priority === "urgent"
                      ? "bg-rose-500"
                      : quest.priority === "high"
                      ? "bg-amber-500"
                      : "bg-cyan-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                        {quest.category}
                      </span>

                      {quest.deadline && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1">
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
                          onClick={() => {
                            triggerHaptic("medium");
                            setActiveTimedQuest(quest);
                          }}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition"
                          title="Start Timed Session"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          onClick={() => handleComplete(quest)}
                          className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                          title="Quick Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
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
          })
        )}
      </div>

      {/* Live Stopwatch Modal for Timed Quests */}
      {activeTimedQuest && (
        <LiveQuestStopwatch
          quest={activeTimedQuest}
          onClose={() => setActiveTimedQuest(null)}
        />
      )}
    </div>
  );
}
