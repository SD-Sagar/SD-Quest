"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { completeQuest, deleteQuest, setFilter } from "@/store/slices/questSlice";
import { addXp, addAttributePoints } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import { Quest, QuestCategory } from "@/types";
import { LiveQuestStopwatch } from "./LiveQuestStopwatch";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Play,
  Wand2,
  Plus,
} from "lucide-react";

interface QuestListProps {
  onOpenManualModal: () => void;
  onOpenSmartModal: () => void;
}

const CATEGORY_TABS: { value: QuestCategory | "all"; label: string }[] = [
  { value: "all", label: "All Quests" },
  { value: "career", label: "Career" },
  { value: "fitness", label: "Fitness" },
  { value: "routine", label: "Routine" },
  { value: "education", label: "Study" },
];

export function QuestList({ onOpenManualModal, onOpenSmartModal }: QuestListProps) {
  const dispatch = useAppDispatch();
  const { quests, activeFilter } = useAppSelector((state) => state.quests);
  const [activeTimedQuest, setActiveTimedQuest] = useState<Quest | null>(null);

  const filteredQuests =
    activeFilter === "all"
      ? quests
      : quests.filter((q) => q.category === activeFilter);

  const handleComplete = (quest: Quest) => {
    if (quest.completionStatus === "completed") return;

    triggerHaptic("success");
    dispatch(completeQuest({ id: quest.id }));
    dispatch(addXp(quest.xpReward));

    if (quest.attributeRewards) {
      dispatch(addAttributePoints(quest.attributeRewards));
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Tabs & Dual Creation Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                triggerHaptic("light");
                dispatch(setFilter(tab.value));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.value
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dual Actions: Smart NLP Parse vs Manual Forge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic("light");
              onOpenSmartModal();
            }}
            className="flex-1 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-400 text-xs font-black flex items-center justify-center gap-1.5 transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            + SMART NLP PARSE
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              onOpenManualModal();
            }}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + MANUAL FORGE
          </button>
        </div>
      </div>

      {/* Quest Cards List */}
      <div className="space-y-2.5">
        {filteredQuests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl hunter-panel border border-slate-800 text-slate-500 text-xs">
            No active quests under this category. Forge or parse one above!
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const isCompleted = quest.completionStatus === "completed";

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                  isCompleted
                    ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                    : "hunter-panel border-slate-800 hover:border-slate-700 shadow-md"
                }`}
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    isCompleted
                      ? "bg-emerald-500"
                      : quest.priority === "urgent"
                      ? "bg-red-500"
                      : "bg-cyan-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                        {quest.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quest.estimatedDurationMinutes}m
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {quest.recurrence}
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
                        +{quest.xpReward} XP
                      </span>
                      {Object.entries(quest.attributeRewards).map(([attr, pts]) => (
                        <span
                          key={attr}
                          className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          +{pts} {attr.toUpperCase().slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Timer, Check, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          triggerHaptic("medium");
                          setActiveTimedQuest(quest);
                        }}
                        className="p-2 rounded-xl text-cyan-400 hover:bg-cyan-950/50 border border-cyan-500/30 transition"
                        title="Start Stopwatch"
                      >
                        <Play className="w-4 h-4 fill-cyan-400" />
                      </button>
                    )}

                    <button
                      onClick={() => handleComplete(quest)}
                      disabled={isCompleted}
                      className={`p-2 rounded-xl transition ${
                        isCompleted
                          ? "text-emerald-400 bg-emerald-950/30"
                          : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                      }`}
                      title={isCompleted ? "Completed" : "Complete Quest"}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic("light");
                        dispatch(deleteQuest(quest.id));
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Delete Quest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Stopwatch Modal */}
      {activeTimedQuest && (
        <LiveQuestStopwatch
          quest={activeTimedQuest}
          onClose={() => setActiveTimedQuest(null)}
        />
      )}
    </div>
  );
}
