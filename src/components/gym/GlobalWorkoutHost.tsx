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
import { calculateSessionFatigueDelta } from "@/lib/calculations/fatigue";
import { AttributeType } from "@/types";

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
  const [baseMental, setBaseMental] = useState(0);
  const [basePhysical, setBasePhysical] = useState(0);
  const [surgeRemainingSecs, setSurgeRemainingSecs] = useState(0);

  // Live cellular hydration surge listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSurge = () => {
      const stored = localStorage.getItem("sd_last_hydration_surge_at");
      if (stored) {
        const diffMs = Date.now() - new Date(stored).getTime();
        const rem = Math.max(0, Math.floor((5 * 60 * 1000 - diffMs) / 1000));
        setSurgeRemainingSecs(rem);
      } else {
        setSurgeRemainingSecs(0);
      }
    };

    checkSurge();
    const interval = setInterval(checkSurge, 1000);

    const handleSurge = () => {
      setSurgeRemainingSecs(300);
      triggerHaptic("success");
    };

    window.addEventListener("hydrationSurgeTriggered", handleSurge);
    return () => {
      clearInterval(interval);
      window.removeEventListener("hydrationSurgeTriggered", handleSurge);
    };
  }, []);

  // 1. Restore persisted sessions from Supabase on mount / refresh if Redux is empty
  useEffect(() => {
    let isMounted = true;
    async function restoreSessionFromCloud() {
      try {
        const session = await getActiveSessionAction();
        if (!isMounted || !session) return;

        if (session.mental_fatigue !== undefined) setBaseMental(Number(session.mental_fatigue) || 0);
        if (session.physical_fatigue !== undefined) setBasePhysical(Number(session.physical_fatigue) || 0);

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
  // C. QUEST PIPELINE: Universal Minimized Floating Capsule with Live Fatigue
  // ---------------------------------------------------------------------------
  if (isQuestActive && isQuestMinimized && activeQuest) {
    const elapsedMins = Math.floor(questElapsedSeconds / 60);
    const elapsedSecsRem = questElapsedSeconds % 60;
    const timeFormatted = `${String(elapsedMins).padStart(2, "0")}:${String(elapsedSecsRem).padStart(2, "0")}`;
    const targetMins = activeQuest.estimated_duration_minutes || 60;
    const isOvertime = elapsedMins > targetMins;

    const isMeditationQuest =
      activeQuest.category === "meditation" ||
      activeQuest.description?.includes("[MEDITATION_PROTOCOL]") ||
      activeQuest.title.toLowerCase().includes("meditat");

    const linkedAttrs = Object.keys(activeQuest.attribute_rewards || {});
    const funHasGrowth = linkedAttrs.some(
      (a) => a === "intelligence" || a === "strength" || a === "endurance" || a === "agility" || a === "vitality"
    );
    const isPureFunQuest = Boolean(activeQuest.is_fun && (!funHasGrowth || linkedAttrs.length === 0));

    // Pure mathematical projection: perfectly matches final log formula
    const liveFatigue = calculateSessionFatigueDelta({
      durationMinutes: questElapsedSeconds / 60,
      targetMinutes: targetMins,
      isFun: activeQuest.is_fun,
      linkedAttributes: linkedAttrs as AttributeType[],
      category: activeQuest.category,
      currentMentalFatigue: 0,
      currentPhysicalFatigue: 0,
      isMeditation: isMeditationQuest,
    });

    const overtimeSecs = Math.max(0, questElapsedSeconds - targetMins * 60);
    const liveDrainXp = Math.round(overtimeSecs * 0.50);
    const overtimeBlocks = Math.floor((elapsedMins - targetMins) / 5);
    const meditationSurgePercent = overtimeBlocks * 10;

    return (
      <div
        style={{ position: "fixed" }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[94%] sm:w-[95%] max-w-lg solo-notification-modal is-floating rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-2.5 text-white animate-in slide-in-from-bottom-3 font-hud border border-cyan-500/40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_#00e5ff] shrink-0">
            <Clock className="w-4 h-4 animate-pulse text-cyan-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-solo font-bold text-cyan-400 tracking-wider uppercase truncate max-w-[140px] sm:max-w-[200px]">
                {activeQuest.title}
              </span>
              <span
                className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                  isOvertime
                    ? "bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse"
                    : "bg-cyan-950/50 text-cyan-300 border-cyan-500/30"
                }`}
              >
                ⏱ {timeFormatted} {isOvertime ? `(+${elapsedMins - targetMins}m)` : ""}
              </span>
            </div>

            {/* Live Dual Fatigue Telemetry */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`text-[9.5px] font-mono px-1 rounded flex items-center gap-0.5 ${
                (baseMental + liveFatigue.mentalDelta) >= 85
                  ? "text-red-300 bg-red-950/80 border border-red-500 animate-pulse"
                  : liveFatigue.mentalDelta < 0
                  ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
                  : "text-cyan-300 bg-cyan-950/50 border border-cyan-500/30"
              }`}>
                MNT: {Math.max(0, Math.min(100, baseMental + liveFatigue.mentalDelta)).toFixed(1)}%
              </span>

              <span className={`text-[9.5px] font-mono px-1 rounded flex items-center gap-0.5 ${
                (basePhysical + liveFatigue.physicalDelta) >= 85
                  ? "text-red-300 bg-red-950/80 border border-red-500 animate-pulse"
                  : liveFatigue.physicalDelta > 0
                  ? "text-amber-300 bg-amber-950/60 border border-amber-500/30"
                  : "text-slate-400 bg-slate-900 border border-slate-800"
              }`}>
                PHY: {Math.max(0, Math.min(100, basePhysical + liveFatigue.physicalDelta)).toFixed(1)}%
              </span>

              {surgeRemainingSecs > 0 && (
                <span className="text-[9.5px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-400/60 px-1 rounded flex items-center gap-0.5 animate-pulse">
                  <span>💧</span>
                  <span>SURGE {Math.floor(surgeRemainingSecs / 60)}:{String(surgeRemainingSecs % 60).padStart(2, "0")}</span>
                </span>
              )}

              {/* Overtime Live XP Drain for Pure Fun */}
              {isPureFunQuest && isOvertime && liveDrainXp > 0 && (
                <span className="text-[9.5px] font-mono font-bold text-red-400 bg-red-950/80 border border-red-500/60 px-1 rounded animate-pulse">
                  ⚡ -{liveDrainXp} XP
                </span>
              )}

              {/* Overtime Live EXP Surge for Meditation */}
              {isMeditationQuest && isOvertime && overtimeBlocks > 0 && (
                <span className="text-[9.5px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-400/60 px-1 rounded animate-pulse">
                  🧘 +{meditationSurgePercent}% EXP
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleResumeQuest}
            className="solo-btn py-1.5 px-2.5 sm:px-3 text-[10px] font-solo flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">RESUME UI</span>
            <span className="sm:hidden">UI ▲</span>
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
