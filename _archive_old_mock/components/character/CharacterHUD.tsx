"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import { calculateAge } from "@/lib/utils";
import { Shield, Zap, Brain, Flame, Heart, Wind, Sparkles, AlertTriangle, HeartPulse } from "lucide-react";
import { AttributeType } from "@/types";

const ATTRIBUTE_CONFIG: Record<
  AttributeType,
  { label: string; icon: any; color: string; desc: string }
> = {
  strength: {
    label: "STR",
    icon: Flame,
    color: "text-red-400 border-red-500/30 bg-red-950/20",
    desc: "Gym volume & load",
  },
  endurance: {
    label: "END",
    icon: Wind,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20",
    desc: "Stamina & cardio pacing",
  },
  intelligence: {
    label: "INT",
    icon: Brain,
    color: "text-blue-400 border-blue-500/30 bg-blue-950/20",
    desc: "Coding & problem solving",
  },
  discipline: {
    label: "DIS",
    icon: Shield,
    color: "text-amber-400 border-amber-500/30 bg-amber-950/20",
    desc: "Consistency & honoring commitments",
  },
  mentality: {
    label: "MEN",
    icon: Heart,
    color: "text-purple-400 border-purple-500/30 bg-purple-950/20",
    desc: "Stress resilience & recovery",
  },
  agility: {
    label: "AGI",
    icon: Zap,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20",
    desc: "Speed, skips & footwork",
  },
  vitality: {
    label: "VIT",
    icon: Sparkles,
    color: "text-pink-400 border-pink-500/30 bg-pink-950/20",
    desc: "Hydration, sleep & nutrition",
  },
};

interface CharacterHUDProps {
  onOpenSanctuaryModal?: () => void;
}

export function CharacterHUD({ onOpenSanctuaryModal }: CharacterHUDProps) {
  const player = useAppSelector((state) => state.player);
  const [age, setAge] = useState<number>(() => calculateAge(player.dob));

  useEffect(() => {
    setAge(calculateAge(player.dob, new Date()));
  }, [player.dob]);

  const xpPercentage = Math.min(100, Math.round((player.currentXp / player.xpToNextLevel) * 100));

  return (
    <div className="hunter-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden border border-slate-800 space-y-4">
      {/* Background Mana Aura Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Profile Plate */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          {/* Avatar frame */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-cyan-500/40 p-1 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center font-black text-2xl text-cyan-400">
              {(player.name || "H").charAt(0).toUpperCase()}
            </div>
          </div>
          {/* Rank Badge */}
          <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow border border-cyan-400/50 uppercase">
            {player.rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
              {player.name || "Hunter"}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                LVL {player.currentLevel}
              </span>
              {onOpenSanctuaryModal && (
                <button
                  onClick={onOpenSanctuaryModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-slate-700 transition"
                  title="Sanctuary / Condition Settings"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Age and Title Tag directly below avatar */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              AGE: {age}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate">
              {player.title}
            </span>
          </div>

          {/* Condition status if Chicken or Medical */}
          {player.conditionStatus === "chicken" && (
            <button
              onClick={onOpenSanctuaryModal}
              className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-xl hover:bg-amber-900/40 transition text-left"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>CHICKEN STATUS ({player.chickenStatusDaysRemaining || 7} days debuff)</span>
            </button>
          )}

          {player.conditionStatus === "medical_sanctuary" && (
            <button
              onClick={onOpenSanctuaryModal}
              className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded-xl hover:bg-emerald-900/40 transition text-left"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>HONORABLE SANCTUARY (Streaks Protected)</span>
            </button>
          )}
        </div>
      </div>

      {/* Animated XP Progress Bar */}
      <div className="mt-4 relative z-10">
        <div className="flex justify-between items-center text-xs mb-1 font-mono">
          <span className="text-slate-400 font-medium">EXPERIENCE POINTS</span>
          <span className="text-cyan-400 font-bold">
            {player.currentXp} / {player.xpToNextLevel} XP ({xpPercentage}%)
          </span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out shadow-sm shadow-cyan-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* The 7 Attributes Grid with clear spacing */}
      <div className="mt-5 relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            THE 7 RPG ATTRIBUTES
          </span>
          <span className="text-[10px] text-slate-500 font-mono">PEAK LIFETIME TRACKED</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(player.attributes) as AttributeType[]).map((attrKey) => {
            const attr = player.attributes[attrKey];
            const config = ATTRIBUTE_CONFIG[attrKey];
            const Icon = config.icon;

            return (
              <div
                key={attrKey}
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${config.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold font-mono tracking-wider">{config.label}</span>
                  </div>
                  <span className="font-mono font-black text-sm text-white pl-2">
                    {attr.score.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Peak: {attr.lifetimeHighest.toFixed(1)}</span>
                  <span>LVL {attr.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
