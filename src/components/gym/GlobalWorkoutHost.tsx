"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { restoreWorkoutSession, maximizeSession } from "@/store/slices/workoutUiSlice";
import {
  restoreQuestSession,
  maximizeQuestSession,
  minimizeQuestSession,
  endQuestSession,
} from "@/store/slices/questUiSlice";
import { getActiveSessionAction, clearActiveSessionAction } from "@/server/actions/player.actions";
import { ActiveWorkoutModal } from "./ActiveWorkoutModal";
import { LiveQuestStopwatch } from "@/components/quests/LiveQuestStopwatch";
import { triggerHaptic } from "@/lib/utils";
import { Dumbbell, Clock, Maximize2, X } from "lucide-react";

export function GlobalWorkoutHost() {
  const dispatch = useAppDispatch();

  // Workout state from Redux
  const isWorkoutActive = useAppSelector((state) => state.workoutUi.isActive);

  // Quest state from Redux
  const isQuestActive = useAppSelector((state) => state.questUi.isActive);
  const isQuestMinimized = useAppSelector((state) => state.questUi.isMinimized);
  const activeQuest = useAppSelector((state) => state.questUi.quest);
  const questStartedAtTimestamp = useAppSelector((state) => state.questUi.startedAtTimestamp);

  const [questElapsedSeconds, setQuestElapsedSeconds] = useState(0);

  // 1. Restore persisted sessions from Supabase on mount / refresh if Redux is empty
  useEffect(() => {
    let isMounted = true;
    async function restoreSessionFromCloud() {
      try {
        const session = await getActiveSessionAction();
        if (!isMounted || !session) return;

        const isWorkout =
          session.type === "workout" ||
          Boolean(session.exercises) ||
          Boolean(session.dayName);

        if (isWorkout && !isWorkoutActive) {
          dispatch(restoreWorkoutSession(session));
        } else if ((session.type === "quest" || (!isWorkout && Boolean(session.session_id))) && !isQuestActive) {
          dispatch(restoreQuestSession(session));
        }
      } catch (err) {
        console.error("Failed to restore active session in GlobalHost:", err);
      }
    }

    if (!isWorkoutActive && !isQuestActive) {
      restoreSessionFromCloud();
    }

    return () => {
      isMounted = false;
    };
  }, [isWorkoutActive, isQuestActive, dispatch]);

  // 2. Live timer ticker for active quest in Redux
  useEffect(() => {
    if (!isQuestActive || !questStartedAtTimestamp) return;

    const updateTimer = () => {
      const now = Date.now();
      setQuestElapsedSeconds(Math.max(0, Math.floor((now - questStartedAtTimestamp) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isQuestActive, questStartedAtTimestamp]);

  // Handlers for Quest Minimized Capsule
  const handleResumeQuest = () => {
    triggerHaptic("heavy");
    dispatch(maximizeQuestSession());
  };

  const handleDiscardQuest = async () => {
    if (activeQuest?.category === "sleep" || activeQuest?.id === "system-compulsory-sleep-stasis") {
      // Mistake start guard (< 1 minute / < 60 seconds): safe discard without penalty or lock
      if (questElapsedSeconds < 60) {
        triggerHaptic("medium");
        await clearActiveSessionAction();
        dispatch(endQuestSession());
        return;
      }
      // If over 60 seconds, maximize UI to show the Sleep Deprivation warning modal
      triggerHaptic("heavy");
      dispatch(maximizeQuestSession());
      return;
    }

    if (!confirm("Discard this active directive? Elapsed time and potential rewards will be lost.")) return;
    triggerHaptic("medium");
    await clearActiveSessionAction();
    dispatch(endQuestSession());
  };

  // ---------------------------------------------------------------------------
  // A. WORKOUT PIPELINE: If active in Redux, render ActiveWorkoutModal
  //    (Handles full lifting screen or minimized floating capsule)
  // ---------------------------------------------------------------------------
  if (isWorkoutActive) {
    return <ActiveWorkoutModal />;
  }

  // ---------------------------------------------------------------------------
  // B. QUEST PIPELINE: Maximized modal view
  // ---------------------------------------------------------------------------
  if (isQuestActive && !isQuestMinimized && activeQuest) {
    return (
      <LiveQuestStopwatch
        quest={activeQuest}
        onClose={() => dispatch(minimizeQuestSession())}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // C. QUEST PIPELINE: Universal Minimized Floating Capsule
  // ---------------------------------------------------------------------------
  if (isQuestActive && isQuestMinimized && activeQuest) {
    const elapsedMins = Math.floor(questElapsedSeconds / 60);
    const elapsedSecsRem = questElapsedSeconds % 60;
    const timeFormatted = `${String(elapsedMins).padStart(2, "0")}:${String(elapsedSecsRem).padStart(2, "0")}`;
    const targetMins = activeQuest.estimated_duration_minutes || 60;
    const isOvertime = elapsedMins > targetMins;

    return (
      <div
        style={{ position: "fixed" }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-[95%] max-w-lg solo-notification-modal is-floating rounded-xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-2.5 text-white animate-in slide-in-from-bottom-3 font-hud"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_#00e5ff] shrink-0">
            <Clock className="w-4 h-4 animate-pulse text-cyan-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-solo font-bold text-cyan-400 tracking-wider uppercase truncate">
                DIRECTIVE ACTIVE • {activeQuest.title}
              </span>
              <span
                className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                  isOvertime
                    ? "bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse"
                    : "bg-cyan-950/50 text-cyan-300 border-cyan-500/30"
                }`}
              >
                ⏱ {timeFormatted} {isOvertime ? `(+${elapsedMins - targetMins}m)` : ""}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 truncate">
              {activeQuest.is_fun ? "🎮 Recreational Mode" : "Disciplined Directive"} • Target: {targetMins}m
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleResumeQuest}
            className="solo-btn py-1.5 px-3 text-[10px] font-solo flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>RESUME UI ▲</span>
          </button>
          <button
            type="button"
            onClick={handleDiscardQuest}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-400 transition"
            title="Discard session"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
