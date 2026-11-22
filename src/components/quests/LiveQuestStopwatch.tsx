"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeQuestAction } from "@/server/actions/quest.actions";
import {
  saveActiveSessionAction,
  clearActiveSessionAction,
  getActiveSessionAction,
  completeSleepSessionAction,
  applySleepDeprivationAction,
  spendGraceCoinAction,
} from "@/server/actions/player.actions";
import { useAppDispatch, useAppSelector } from "@/store";
import { endQuestSession, minimizeQuestSession } from "@/store/slices/questUiSlice";
import { triggerHaptic } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Play, Pause, X, CheckCircle2, Zap, Flame, Shield, Minimize2, AlertTriangle, Moon } from "lucide-react";
import { Quest } from "@/types";
import { ActiveFatigueDock } from "@/components/character/ActiveFatigueDock";

interface LiveQuestStopwatchProps {
  quest: Quest;
  onClose: () => void;
}

export function LiveQuestStopwatch({ quest, onClose }: LiveQuestStopwatchProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const reduxStartedAt = useAppSelector((state) => state.questUi.startedAtTimestamp);

  const [seconds, setSeconds] = useState(() => {
    if (reduxStartedAt) {
      return Math.max(0, Math.floor((Date.now() - reduxStartedAt) / 1000));
    }
    return 0;
  });
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSleepDeprivedModal, setShowSleepDeprivedModal] = useState(false);
  const [graceCoinShield, setGraceCoinShield] = useState(false);
  const [graceCoinsAvailable, setGraceCoinsAvailable] = useState(0);
  const [startTimeIso, setStartTimeIso] = useState<string | null>(() => {
    if (reduxStartedAt) {
      return new Date(reduxStartedAt).toISOString();
    }
    return null;
  });

  const isSleepQuest = quest.category === "sleep" || (quest as any).is_sleep;
  const isMeditationQuest =
    quest.category === "meditation" ||
    quest.description?.includes("[MEDITATION_PROTOCOL]") ||
    quest.title.toLowerCase().includes("meditat");

  const linkedAttrs = Object.keys(quest.attribute_rewards || {});
  const funHasIntelligenceOrPhysical = linkedAttrs.some(
    (a) =>
      a === "intelligence" ||
      a === "strength" ||
      a === "endurance" ||
      a === "agility" ||
      a === "vitality"
  );
  const isPureFunQuest = Boolean(
    quest.is_fun && (!funHasIntelligenceOrPhysical || linkedAttrs.length === 0)
  );

  const estimatedMinutes = isSleepQuest ? 480 : quest.estimated_duration_minutes || 30;

  // 1. Initialize or resume universal timestamp session from Supabase
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const active = await getActiveSessionAction();
        let sessionStart = startTimeIso || (quest.started_at ? quest.started_at : new Date().toISOString());

        if (active) {
          if (active.grace_coin_consumed || active.grace_coin_consumed_for_session === quest.id) {
            setGraceCoinShield(true);
          }
          if (active.grace_coins !== undefined) {
            setGraceCoinsAvailable(active.grace_coins);
          }
          if (active.session_id === quest.id && active.started_at) {
            sessionStart = active.started_at;
          }
        } else if (!startTimeIso && !quest.started_at) {
          // Register fresh session in Supabase for cross-device & offline tracking
          await saveActiveSessionAction({
            session_id: quest.id,
            type: "quest",
            title: quest.title,
            started_at: sessionStart,
            target_minutes: estimatedMinutes,
            is_fun: quest.is_fun || false,
            linked_attributes: Object.keys(quest.attribute_rewards || {}),
            category: quest.category,
            quest_data: quest,
          });
        }

        if (isMounted) {
          setStartTimeIso(sessionStart);
          const elapsed = Math.max(
            0,
            Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000)
          );
          setSeconds(elapsed);
        }
      } catch (e) {
        console.error("Failed to init universal session timestamp:", e);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [quest.id, quest.title, quest.started_at, quest.is_fun, quest.attribute_rewards, quest.category, estimatedMinutes, quest, startTimeIso]);

  // 2. Real-time tick anchored to timestamp (never drifts or halts if tab sleeps)
  useEffect(() => {
    if (!isRunning || !startTimeIso) return;

    const interval = setInterval(() => {
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - new Date(startTimeIso).getTime()) / 1000)
      );
      setSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTimeIso]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(
    displaySeconds
  ).padStart(2, "0")}`;

  const diffMinutes = minutes - estimatedMinutes;
  const isOvertime = diffMinutes > 0;
  const hoursSlept = Number((minutes / 60).toFixed(2));

  // Live EXP Drain calculation for unshielded pure fun (-0.50 XP/sec)
  const overtimeSeconds = Math.max(0, seconds - estimatedMinutes * 60);
  const liveDrainedXp = Number((overtimeSeconds * 0.5).toFixed(1));

  const handleSpendGraceCoin = async () => {
    triggerHaptic("heavy");
    try {
      const res = await spendGraceCoinAction();
      if (res.success) {
        setGraceCoinShield(true);
        setGraceCoinsAvailable(res.remainingCoins);
        const active = await getActiveSessionAction();
        await saveActiveSessionAction({
          ...active,
          grace_coin_consumed: true,
          grace_coin_consumed_for_session: quest.id,
        });
      }
    } catch (e) {
      console.error("Failed to spend Grace Coin:", e);
    }
  };

  const handleFinish = async () => {
    triggerHaptic("heavy");

    // Sleep Protocol Handling
    if (isSleepQuest) {
      // Mistake start guard (< 1 minute / < 60 seconds): safe cancel, zero penalty, zero lockout
      if (seconds < 60) {
        triggerHaptic("light");
        setLoading(true);
        try {
          await clearActiveSessionAction();
          dispatch(endQuestSession());
          onClose();
          router.refresh();
        } catch (err: any) {
          console.error(err);
        } finally {
          setLoading(false);
        }
        return;
      }

      // If active for >= 60 seconds and under 4.0 hours, trigger sleep deprivation penalty warning
      if (hoursSlept < 4.0) {
        setShowSleepDeprivedModal(true);
        return;
      }

      setLoading(true);
      try {
        const sleepRes = await completeSleepSessionAction(minutes);
        if (sleepRes.isOptimal) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
          });
        }
        dispatch(endQuestSession());
        onClose();
        router.refresh();
      } catch (err: any) {
        console.error(err);
        setLoading(false);
      }
      return;
    }

    // Standard Quest Handling
    setLoading(true);
    try {
      await clearActiveSessionAction();
      await completeQuestAction(quest.id, Math.max(1, minutes));
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
      });
      dispatch(endQuestSession());
      onClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleMinimize = () => {
    triggerHaptic("medium");
    dispatch(minimizeQuestSession());
    onClose();
  };

  const handleDiscard = async () => {
    if (isSleepQuest) {
      // Mistake start guard (< 1 minute / < 60 seconds): safe cancel, zero penalty, zero lockout
      if (seconds < 60) {
        triggerHaptic("light");
        setLoading(true);
        try {
          await clearActiveSessionAction();
          dispatch(endQuestSession());
          onClose();
          router.refresh();
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
        return;
      }

      // If active for >= 60 seconds and under 4 hours, abandoning triggers sleep deprivation penalty warning
      if (hoursSlept < 4.0) {
        setShowSleepDeprivedModal(true);
        return;
      }

      // If >= 4 hours (e.g. 9 hours), ending the session completes sleep and initiates the 12-hour lockout
      triggerHaptic("medium");
      setLoading(true);
      try {
        await completeSleepSessionAction(minutes);
        dispatch(endQuestSession());
        onClose();
        router.refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!confirm("Abandon this active directive? Elapsed time will be discarded.")) return;
    triggerHaptic("medium");
    setLoading(true);
    try {
      await clearActiveSessionAction();
      dispatch(endQuestSession());
      onClose();
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleMinimize();
        }
      }}
    >
      <div className="w-full max-w-sm max-h-[94vh] overflow-y-auto rounded-3xl hunter-panel border border-cyan-500/40 p-4 sm:p-6 text-center shadow-2xl relative space-y-3.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-150 scrollbar-none">
        {/* Top Header with Live Fatigue Dock, Explicit MINIMIZE Button & Close */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {isSleepQuest ? "STASIS" : "TELEMETRY"}
            </span>
            <ActiveFatigueDock />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleMinimize}
              className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-[10px] font-mono font-bold flex items-center gap-1 transition shadow-[0_0_8px_rgba(0,229,255,0.2)]"
              title="Minimize to floating capsule"
            >
              <Minimize2 className="w-3 h-3" />
              <span>MINIMIZE ▼</span>
            </button>
            <button
              type="button"
              onClick={handleMinimize}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Close / Minimize Session"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-white tracking-tight line-clamp-1 font-solo">
            {quest.title}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {isSleepQuest
              ? "Circadian Target: 8h 00m – 8h 30m (2X EXP Window) • Minimum Safe: 4h 00m"
              : isMeditationQuest
              ? `🧘 Mindfulness Target: ${estimatedMinutes} Min • Mental Purge Protocol`
              : isPureFunQuest
              ? `🎮 Pure Fun (No Stats): ${estimatedMinutes} Min • Overtime Strict Drain`
              : `Target Duration: ${estimatedMinutes} Min • ${quest.is_fun ? "Growth Fun Mode" : "Disciplined Objective"}`}
          </p>
        </div>

        {/* Timer Circle */}
        <div
          className={`w-40 h-40 mx-auto rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-all ${
            isSleepQuest
              ? hoursSlept >= 8.0 && hoursSlept <= 8.5
                ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_#00e5ff]"
                : hoursSlept < 4.0
                ? "border-amber-500/60 bg-amber-950/20 shadow-amber-950/60"
                : "border-blue-500/50 bg-blue-950/20"
              : isMeditationQuest
              ? isOvertime
                ? "border-cyan-300 bg-cyan-950/30 shadow-[0_0_18px_#00e5ff]"
                : "border-cyan-500/40 bg-cyan-950/20 shadow-cyan-950"
              : isOvertime && isPureFunQuest && !graceCoinShield
              ? "border-red-500/80 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
              : isOvertime
              ? "border-amber-500/60 bg-amber-950/20 shadow-amber-950/60"
              : "border-cyan-500/40 bg-cyan-950/20 shadow-cyan-950"
          }`}
        >
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mana-text-glow">
            {timeFormatted}
          </span>
          <span
            className={`text-[9.5px] font-bold font-mono uppercase tracking-widest mt-1 ${
              isSleepQuest
                ? hoursSlept >= 8.0 && hoursSlept <= 8.5
                  ? "text-cyan-300 animate-pulse"
                  : hoursSlept < 4.0
                  ? "text-amber-400 animate-pulse"
                  : "text-blue-300"
                : isMeditationQuest && isOvertime
                ? "text-cyan-300 animate-pulse"
                : isOvertime && isPureFunQuest && !graceCoinShield
                ? "text-red-400 animate-pulse"
                : isOvertime
                ? "text-amber-400 animate-pulse"
                : "text-cyan-400"
            }`}
          >
            {isSleepQuest
              ? hoursSlept >= 8.0 && hoursSlept <= 8.5
                ? "⚡ 2X EXP OPTIMAL"
                : hoursSlept < 4.0
                ? `DEPRIVATION ZONE (${hoursSlept}h)`
                : `STASIS ACTIVE (${hoursSlept}h)`
              : isMeditationQuest && isOvertime
              ? `DEEP ZEN (+${diffMinutes}m)`
              : isOvertime && isPureFunQuest && !graceCoinShield
              ? `DRAIN ACTIVE (-${liveDrainedXp} XP)`
              : isOvertime
              ? `OVERTIME (+${diffMinutes}m)`
              : isRunning
              ? "SERVER TIMED"
              : "PAUSED"}
          </span>
        </div>

        {/* Estimation & Overtime Kinetics */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5">
          {isSleepQuest ? (
            <div className="space-y-1 text-left">
              {hoursSlept >= 8.0 && hoursSlept <= 8.5 ? (
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-400" />
                  <span>OPTIMAL SYNC REACHED (2X EXP BOOSTER READY)</span>
                </div>
              ) : hoursSlept < 4.0 ? (
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>INSUFFICIENT REST: &lt; 4h sleep penalty active.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-cyan-300 font-bold">CIRCADIAN REPAIR SAFE ({(8.0 - hoursSlept).toFixed(1)}h to 2X EXP)</span>
                </div>
              )}
            </div>
          ) : isMeditationQuest ? (
            <div className="space-y-1 text-left">
              {isOvertime ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-cyan-300 font-bold">
                    <span>🧘</span>
                    <span>DEEP ZEN OVERTIME (+10% EXP &amp; Yields per 5m)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Overtime is a virtue in meditation. Posture stillness accelerates willpower and biological clarity.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-cyan-300 font-bold">MINDFUL STASIS ({estimatedMinutes - minutes}m left)</span>
                </div>
              )}
            </div>
          ) : isOvertime && isPureFunQuest ? (
            <div className="space-y-2 text-left">
              {graceCoinShield ? (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <span>🪙</span>
                      <span>GRACE COIN SHIELD ACTIVE</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">0 DRAIN</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">
                    +60-minute clean buffer unlocked. Leisure running without penalties.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 space-y-1.5 animate-pulse">
                  <div className="flex items-center justify-between font-bold text-red-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>DOPAMINE RUNAWAY ACTIVE</span>
                    </span>
                    <span className="text-white font-mono font-black">-{liveDrainedXp} XP</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-tight">
                    Pure fun exceeded scheduled duration without growth stats. Live XP drain active (-0.50 XP/s).
                  </p>
                  {graceCoinsAvailable > 0 && (
                    <button
                      type="button"
                      onClick={handleSpendGraceCoin}
                      className="w-full mt-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10.5px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 shadow-md shadow-amber-950"
                    >
                      <span>🪙</span>
                      <span>USE GRACE COIN (+60m Shield • {graceCoinsAvailable} Left)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : isOvertime ? (
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>OVERTIME SURGE ACTIVE (+0.75x Stat Yield)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pushing beyond target limits rewards accelerated attribute growth.
                {quest.is_fun
                  ? " (Growth fun: fatigue growth dampened by ~70%)."
                  : " (Fatigue builds at +2% per 5 min during overtime)."}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-cyan-300 font-bold">ON TARGET ({estimatedMinutes - minutes}m left)</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1 font-hud">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>RESUME</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleFinish}
            className={`flex-2 py-2.5 px-4 rounded-xl text-xs font-black font-solo transition flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              isSleepQuest && hoursSlept >= 8.0 && hoursSlept <= 8.5
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_15px_#00e5ff] animate-pulse"
                : isSleepQuest && hoursSlept < 4.0
                ? "bg-amber-600 hover:bg-amber-500 text-black"
                : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_#00e5ff]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 fill-black text-cyan-400" />
            <span>{loading ? "SAVING..." : isSleepQuest ? "WAKE UP & LOG" : "LOG COMPLETE"}</span>
          </button>
        </div>

        {/* Discard Option */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={loading}
            className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition"
          >
            Abandon Directive (Discard)
          </button>
        </div>
      </div>

      {/* Sleep Deprivation Warning Modal (< 4 Hours) */}
      {showSleepDeprivedModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-2xl hunter-panel border border-red-500/70 p-4 sm:p-5 text-center shadow-2xl space-y-3.5 sm:space-y-4 scrollbar-none">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold font-solo text-red-400 uppercase tracking-wider">
                SLEEP DEPRIVATION WARNING
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                You have only rested for {hoursSlept} hours. Stopping sleep before 4.0 hours causes biological breakdown!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-[11px] font-mono text-red-300 text-left space-y-1">
              <div className="font-bold text-red-400 uppercase">PENALTY CONSEQUENCES:</div>
              <div>• -100 Mana / XP deducted immediately</div>
              <div>• Circadian Debuff: 5 hours of 0.7x EXP gain speed</div>
              <div>• 12-Hour Protocol Lockout: Main sleep directive locked for 12 hours</div>
            </div>

            <div className="space-y-2 pt-1 font-hud">
              <button
                type="button"
                onClick={() => setShowSleepDeprivedModal(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black font-solo transition shadow-[0_0_12px_#00e5ff]"
              >
                RESUME SLEEP PROTOCOL ▲
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await applySleepDeprivationAction(minutes);
                    dispatch(endQuestSession());
                    setShowSleepDeprivedModal(false);
                    onClose();
                    router.refresh();
                  } catch (e) {
                    console.error(e);
                    setLoading(false);
                  }
                }}
                className="w-full py-2 rounded-xl bg-slate-900 border border-red-500/50 text-red-400 hover:bg-red-950/60 text-xs font-mono font-bold transition"
              >
                {loading ? "APPLYING..." : "FORCE WAKE UP (ACCEPT PENALTY & 12H LOCK)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
