"use client";

import { useState } from "react";
import Link from "next/link";
import { Profile, PlayerAttributes, AttributeType } from "@/types";
import { calculateAge, triggerHaptic } from "@/lib/utils";
import { getRemainingPoisonTime } from "@/lib/calculations/nutrition";
import { StatAllocationModal } from "./StatAllocationModal";
import {
  Flame,
  Wind,
  Brain,
  Shield,
  Heart,
  Zap,
  Sparkles,
  AlertTriangle,
  HeartPulse,
  Skull,
} from "lucide-react";

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
  profile: Profile;
  attributes: PlayerAttributes;
  onOpenSanctuaryModal?: () => void;
}

export function CharacterHUD({
  profile,
  attributes,
  onOpenSanctuaryModal,
}: CharacterHUDProps) {
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const age = calculateAge(profile.dob);
  const unallocatedPoints = profile.unallocated_stat_points || 0;
  const poisonInfo = getRemainingPoisonTime(profile.poison_expires_at);

  const xpPercentage = Math.min(
    100,
    Math.round((profile.current_xp / (profile.xp_to_next_level || 500)) * 100)
  );

  const attributeKeys: AttributeType[] = [
    "strength",
    "endurance",
    "intelligence",
    "discipline",
    "mentality",
    "agility",
    "vitality",
  ];

  return (
    <div className="hunter-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden border border-slate-800 space-y-4">
      {/* Background Mana Aura Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Profile Plate */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          {/* Avatar frame with toxic glow if poisoned */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 p-1 flex items-center justify-center shadow-lg transition-all ${
              poisonInfo.isPoisoned
                ? "border-2 border-purple-500 shadow-purple-950/70 ring-2 ring-purple-500/50 animate-pulse"
                : "border-2 border-cyan-500/40 shadow-cyan-950/50"
            }`}
          >
            <div
              className={`w-full h-full rounded-xl flex items-center justify-center font-black text-2xl ${
                poisonInfo.isPoisoned ? "bg-purple-950/50 text-purple-300" : "bg-slate-900 text-cyan-400"
              }`}
            >
              {(profile.name || "H").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Poison Skull Badge */}
          {poisonInfo.isPoisoned && (
            <div
              className="absolute -top-1.5 -right-1.5 bg-purple-950 text-purple-300 p-1 rounded-full border border-purple-400 shadow-md animate-bounce"
              title="Poison in system active"
            >
              <Skull className="w-3.5 h-3.5 text-purple-400" />
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow border border-cyan-400/50 uppercase">
            {profile.rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
              {profile.name}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                LVL {profile.current_level}
              </span>
              {unallocatedPoints > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("heavy");
                    setIsStatModalOpen(true);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50 text-[11px] font-mono font-bold uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm"
                  title="Unallocated Stat Points Available!"
                >
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>+{unallocatedPoints} PTS</span>
                </button>
              )}
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

          {/* User Age and Title Tag */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              AGE: {age}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate">
              {profile.title}
            </span>
          </div>

          {/* Condition status banners */}
          {poisonInfo.isPoisoned && (
            <Link
              href="/diet"
              className="mt-2 flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/50 px-2.5 py-1 rounded-xl shadow-sm transition"
            >
              <Skull className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>POISON IN SYSTEM ({poisonInfo.formattedString} left • -35% XP Reducer)</span>
            </Link>
          )}

          {profile.condition === "chicken" && (
            <button
              onClick={onOpenSanctuaryModal}
              className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-xl hover:bg-amber-900/40 transition text-left"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>CHICKEN STATUS (Debuff Active)</span>
            </button>
          )}

          {profile.condition === "medical_sanctuary" && (
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
            {profile.current_xp} / {profile.xp_to_next_level} XP ({xpPercentage}%)
          </span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out shadow-sm shadow-cyan-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* The 7 Core RPG Attributes Grid */}
      <div className="mt-5 relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            THE 7 RPG ATTRIBUTES
          </span>
          <span className="text-[10px] text-slate-500 font-mono">PEAK LIFETIME TRACKED</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {attributeKeys.map((attrKey) => {
            const score = Number(attributes[attrKey]) || 10.0;
            const highestKey = `highest_${attrKey}` as keyof PlayerAttributes;
            const peak = Number(attributes[highestKey]) || score;
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
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Peak: {peak.toFixed(1)}</span>
                  <span>{config.desc.split(" ")[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Solo Leveling Hunter Stat Point Allocation Modal */}
      <StatAllocationModal
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        profile={profile}
        attributes={attributes}
      />
    </div>
  );
}

