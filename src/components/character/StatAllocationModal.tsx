"use client";

import { useState } from "react";
import { Profile, PlayerAttributes } from "@/types";
import { useGraceCoinAction } from "@/server/actions/player.actions";
import { soundEffects } from "@/lib/audio/soundEffects";
import { triggerHaptic } from "@/lib/utils";
import { getRemainingPoisonTime } from "@/lib/calculations/nutrition";
import { calculateCircadianAwakeStatus, getFatigueStatus } from "@/lib/calculations/fatigue";
import {
  Coins,
  Shield,
  Sparkles,
  X,
  Skull,
  Moon,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

interface StatAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  attributes: PlayerAttributes;
}

export function StatAllocationModal({
  isOpen,
  onClose,
  profile,
  attributes,
}: StatAllocationModalProps) {
  const [coins, setCoins] = useState(profile.unallocated_stat_points || 0);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const poisonInfo = getRemainingPoisonTime(profile.poison_expires_at);
  const sessionState = ((profile.active_session_state as any) || {});
  const isCurrentlySleeping = Boolean(
    sessionState.is_sleeping ||
    sessionState.category === "sleep" ||
    sessionState.session_id === "system-compulsory-sleep-stasis" ||
    sessionState.type === "sleep"
  );
  const circadian = calculateCircadianAwakeStatus({
    lastSleepStartedAt: profile.last_sleep_started_at || sessionState.last_sleep_started_at,
    lastSleepCompletedAt: profile.last_sleep_completed_at || sessionState.last_sleep_completed_at,
    rollingSleepMinutes: profile.rolling_sleep_minutes ?? sessionState.rolling_sleep_minutes,
    isCurrentlySleeping,
    frozenAwakeHours: sessionState.frozen_awake_hours,
    createdAt: profile.created_at,
  });

  const fatigueStatus = getFatigueStatus(
    Number(profile.mental_fatigue) || 0,
    Number(profile.physical_fatigue) || 0
  );
  const isSleepDeprived = Boolean(
    profile.sleep_deprived_expires_at &&
      new Date(profile.sleep_deprived_expires_at).getTime() > Date.now()
  );

  if (!isOpen) return null;

  const handleUseCoin = async (
    type: "poison" | "circadian" | "sleep_deprivation" | "fatigue"
  ) => {
    if (coins < 1 || pendingAction) return;

    setPendingAction(type);
    triggerHaptic("heavy");
    soundEffects.purify();

    // Optimistic deduction
    setCoins((prev) => Math.max(0, prev - 1));

    try {
      const res = await useGraceCoinAction(type);
      setSuccessBanner(res.message);
      setCoins(res.remainingCoins);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      console.error("Failed to use Grace Coin:", err);
      // Revert if error
      setCoins((prev) => prev + 1);
    } finally {
      setPendingAction(null);
    }
  };

  const hasAnyDebuff =
    poisonInfo.isPoisoned ||
    circadian.isExhaustionLockout ||
    !circadian.hasAdequateSleep ||
    isSleepDeprived ||
    fatigueStatus.tier !== "optimal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg hunter-panel rounded-3xl border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,229,255,0.15)] relative space-y-4 max-h-[90vh] overflow-y-auto text-slate-200 font-hud">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white text-blue-600 border border-blue-400/60 shadow-[0_0_15px_rgba(255,255,255,0.7)]">
              <Coins className="w-5 h-5 fill-blue-600 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wider font-solo flex items-center gap-1.5">
                <span>SYSTEM SANCTUARY</span>
                <span className="text-cyan-400 font-black">// GRACE COIN PURIFICATION</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                1 Coin = 3h Strain Relief • &le;3h or &le;30% Cleansed 100%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-200 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Grace Coin Balance Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-[#070b14]/90 to-cyan-950/50 border border-blue-400/40 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold block">
              AVAILABLE SANCTUARY CURRENCY
            </span>
            <div className="text-xl sm:text-2xl font-black text-white font-solo flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)] flex items-center justify-center">
                <Coins className="w-5 h-5 fill-blue-600 text-blue-600 shrink-0" />
              </div>
              <span>{coins} GRACE COIN{coins !== 1 ? "S" : ""}</span>
            </div>
            <p className="text-[10px] text-slate-400 max-w-sm">
              Attributes in SD-Quest are earned through real sweat and discipline. Grace Coins are reserved exclusively to purify adverse debuffs and fatigue!
            </p>
          </div>

          <div className="shrink-0 p-2.5 rounded-xl bg-white/10 border border-white/30 text-white text-center font-mono shadow-[0_0_10px_rgba(255,255,255,0.15)]">
            <span className="text-[9px] uppercase block text-slate-300 font-bold">PURIFICATION</span>
            <span className="text-xs font-black text-cyan-300">-3H / -30%</span>
          </div>
        </div>

        {/* Active Debuffs & Purification Cards */}
        <div className="space-y-2.5">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            ACTIVE ADVERSE CONDITIONS &amp; STRAIN
          </span>

          {/* 1. Alcohol Poison Debuff */}
          {poisonInfo.isPoisoned && (
            <div className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/25 shadow-[0_0_16px_rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/70 text-red-400 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <Skull className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    <span className="text-red-400 font-black">POISON</span> // INTOXICATION ({poisonInfo.intoxicationTier.toUpperCase()})
                  </span>
                  <span className="text-[10px] font-mono text-slate-200 block">
                    -{poisonInfo.xpPenaltyPct}% XP • Time Remaining: {poisonInfo.formattedString}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={coins < 1 || Boolean(pendingAction)}
                onClick={() => handleUseCoin("poison")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-400/50 text-xs font-mono font-black uppercase tracking-wider transition disabled:opacity-50 shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.7)] flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>PURGE 1 COIN (-3H)</span>
              </button>
            </div>
          )}

          {/* 2. Circadian Awake Exhaustion & Lockout */}
          {(circadian.isExhaustionLockout || !circadian.hasAdequateSleep) && (
            <div className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/25 shadow-[0_0_16px_rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/70 text-red-400 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    <span className="text-red-400 font-black">
                      {circadian.isExhaustionLockout ? "CRITICAL EXHAUSTION" : "INADEQUATE REST"}
                    </span>
                    {" // 26H SLEEP DEFICIT"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-200 block">
                    Awake: {circadian.hoursAwakeLive.toFixed(1)}h/26h • Sleep credit: {(circadian.cumulativeSleepMinutes / 60).toFixed(1)}h/4.0h
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={coins < 1 || Boolean(pendingAction)}
                onClick={() => handleUseCoin("circadian")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-400/50 text-xs font-mono font-black uppercase tracking-wider transition disabled:opacity-50 shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.7)] flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>-3.0H AWAKE (+180M REST)</span>
              </button>
            </div>
          )}

          {/* 3. Sleep Deprivation Penalty Debuff */}
          {isSleepDeprived && (
            <div className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/25 shadow-[0_0_16px_rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/70 text-red-400 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    <span className="text-red-400 font-black">SLEEP DEPRIVED</span> // REST PROTOCOL DEFICIT
                  </span>
                  <span className="text-[10px] font-mono text-slate-200 block">
                    -30% XP Speed • Cognitive stamina impaired
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={coins < 1 || Boolean(pendingAction)}
                onClick={() => handleUseCoin("sleep_deprivation")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-400/50 text-xs font-mono font-black uppercase tracking-wider transition disabled:opacity-50 shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.7)] flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>PURGE 1 COIN (-3H)</span>
              </button>
            </div>
          )}

          {/* 4. Biological Fatigue Strain */}
          {fatigueStatus.tier !== "optimal" && (
            <div className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/25 shadow-[0_0_16px_rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/70 text-red-400 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    <span className="text-red-400 font-black">BIOLOGICAL STRAIN</span> // {fatigueStatus.statusLabel.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-200 block">
                    Physical: {profile.physical_fatigue}% • Mental: {profile.mental_fatigue}%
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={coins < 1 || Boolean(pendingAction)}
                onClick={() => handleUseCoin("fatigue")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-400/50 text-xs font-mono font-black uppercase tracking-wider transition disabled:opacity-50 shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.7)] flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>PURGE -30% FATIGUE</span>
              </button>
            </div>
          )}

          {/* Tranquil Optimal State if No Debuffs */}
          {!hasAnyDebuff && (
            <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_14px_rgba(0,229,255,0.25)]">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-solo">
                ALL BIOLOGICAL SYSTEMS OPTIMAL
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active poison, sleep exhaustion, or biological strain detected. Your {coins} Grace Coin{coins !== 1 ? "s are" : " is"} safely preserved in the System Sanctuary for emergency purification.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white transition"
          >
            RETURN TO SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
}
