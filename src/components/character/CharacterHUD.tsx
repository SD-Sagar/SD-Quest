"use client";

import { useState } from "react";
import Link from "next/link";
import { Profile, PlayerAttributes, AttributeType } from "@/types";
import { calculateAge, triggerHaptic } from "@/lib/utils";
import { getRemainingPoisonTime } from "@/lib/calculations/nutrition";
import { StatAllocationModal } from "./StatAllocationModal";
import {
  Zap,
  Shield,
  HeartPulse,
  Skull,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CharacterHUDProps {
  profile: Profile;
  attributes: PlayerAttributes;
  onOpenSanctuaryModal?: () => void;
}

const ATTRIBUTE_LABELS: Record<AttributeType, { name: string; full: string }> = {
  strength: { name: "Strength", full: "STR" },
  agility: { name: "Agility", full: "AGI" },
  intelligence: { name: "Intelligent", full: "INT" },
  mentality: { name: "Mentality", full: "MEN" },
  vitality: { name: "Vitality", full: "VIT" },
  endurance: { name: "Endurance", full: "END" },
  discipline: { name: "Discipline", full: "DIS" },
};

export function CharacterHUD({
  profile,
  attributes,
  onOpenSanctuaryModal,
}: CharacterHUDProps) {
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
  const age = calculateAge(profile.dob);
  const unallocatedPoints = profile.unallocated_stat_points || 0;
  const poisonInfo = getRemainingPoisonTime(profile.poison_expires_at);

  const xpPercentage = Math.min(
    100,
    Math.round((profile.current_xp / (profile.xp_to_next_level || 500)) * 100)
  );

  const attributeKeys: AttributeType[] = [
    "strength",
    "agility",
    "intelligence",
    "mentality",
    "vitality",
    "endurance",
    "discipline",
  ];

  return (
    <div className="solo-frame rounded-2xl p-4 sm:p-5 relative overflow-hidden space-y-4">
      {/* Top Ambient Mana Aura */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HUNTER HEADER & SILHOUETTE AVATAR */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative shrink-0">
          {/* Authentic Solo Leveling Avatar Frame with Cyan Contour Glow */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-b from-[#0b1220] to-[#05070d] p-1 flex items-center justify-center border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] ${
              poisonInfo.isPoisoned ? "border-cyan-300 ring-2 ring-cyan-500/50" : ""
            }`}
          >
            <div className="w-full h-full rounded-lg bg-[#070b14] flex items-center justify-center font-black text-2xl font-solo text-cyan-400 mana-text-glow">
              {(profile.name || "H").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Poison Alert Icon */}
          {poisonInfo.isPoisoned && (
            <div
              className="absolute -top-1.5 -right-1.5 bg-[#090d18] text-cyan-300 p-1 rounded-full border border-cyan-400 shadow-[0_0_10px_#00e5ff] animate-pulse"
              title="Poison in system active"
            >
              <Skull className="w-3.5 h-3.5 text-cyan-300" />
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute -bottom-2 -right-1 bg-cyan-950 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-400 shadow font-solo uppercase">
            {profile.rank}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white truncate font-solo white-text-glow">
              {profile.name}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                LVL {profile.current_level}
              </span>
              {unallocatedPoints > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("heavy");
                    setIsStatModalOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[11px] font-mono font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-[0_0_12px_#00e5ff]"
                  title="Unallocated Stat Points Available!"
                >
                  <Zap className="w-3 h-3 fill-black" />
                  <span>+{unallocatedPoints} PTS</span>
                </button>
              )}
              {onOpenSanctuaryModal && (
                <button
                  onClick={onOpenSanctuaryModal}
                  className="p-1 rounded bg-slate-900/80 text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition"
                  title="Sanctuary / Condition Settings"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Age and Title Tag */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap font-hud">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
              AGE: {age}
            </span>
            <span className="text-xs text-slate-300 font-medium truncate">
              {profile.title}
            </span>
          </div>

          {/* Poison debuff banner */}
          {poisonInfo.isPoisoned && (
            <Link
              href="/diet"
              className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-400/60 px-2.5 py-1 rounded shadow transition font-hud"
            >
              <Skull className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>STATUS DEBUFF // POISON ({poisonInfo.formattedString} left • -35% XP)</span>
            </Link>
          )}

          {profile.condition === "chicken" && (
            <button
              onClick={onOpenSanctuaryModal}
              className="mt-2 flex items-center gap-1.5 text-xs text-slate-200 bg-cyan-950/50 border border-cyan-500/40 px-2.5 py-1 rounded hover:bg-cyan-900/50 transition text-left font-hud"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
              <span>CHICKEN STATUS (Debuff Active)</span>
            </button>
          )}

          {profile.condition === "medical_sanctuary" && (
            <button
              onClick={onOpenSanctuaryModal}
              className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 px-2.5 py-1 rounded hover:bg-cyan-900/60 transition text-left font-hud"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>HONORABLE SANCTUARY (Streaks Protected)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MANA / EXPERIENCE ENERGY GAUGE */}
      <div className="relative z-10 space-y-1">
        <div className="flex justify-between items-center text-xs font-hud">
          <span className="text-slate-400 font-bold tracking-wider">MANA / XP PROGRESSION</span>
          <span className="text-cyan-400 font-bold font-mono mana-text-glow">
            {profile.current_xp} / {profile.xp_to_next_level} XP ({xpPercentage}%)
          </span>
        </div>
        <div className="h-2 w-full bg-[#05070e] rounded-full overflow-hidden border border-cyan-500/40 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white transition-all duration-500 ease-out shadow-[0_0_10px_#00e5ff]"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. AUTHENTIC [ PERSONAL STATUS ] STATS SCREEN (Expandable / Collapsible) */}
      <div className="relative z-10 pt-1 space-y-2.5 font-hud">
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            setIsAttributesExpanded(!isAttributesExpanded);
          }}
          className="w-full p-2 rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 text-center relative overflow-hidden flex items-center justify-between px-3 transition group"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 text-xs">◆</span>
            <span className="text-[11px] font-solo font-bold text-cyan-300 uppercase tracking-widest mana-text-glow">
              PERSONAL STATUS ATTRIBUTES
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 group-hover:text-white transition">
            <span>{isAttributesExpanded ? "COLLAPSE ▲" : "EXPAND STATS ▼"}</span>
            {isAttributesExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {/* 2-Column Bracketed Stats matching Reference 2: [Strength Lv. X] [Agility Lv. Y] */}
        {isAttributesExpanded && (
          <div className="grid grid-cols-2 gap-2 font-hud animate-in fade-in slide-in-from-top-1 duration-150">
            {attributeKeys.map((attrKey) => {
              const score = Number(attributes[attrKey]) || 10.0;
              const meta = ATTRIBUTE_LABELS[attrKey];

              return (
                <div
                  key={attrKey}
                  className="solo-bracket flex items-center justify-between hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,229,255,0.25)] transition duration-150"
                >
                  <div className="min-w-0 flex items-center gap-1.5 truncate">
                    <span className="text-cyan-400 text-xs font-mono">◆</span>
                    <span className="text-slate-300 text-xs font-bold truncate">
                      [{meta.name} Lv. {Math.floor(score)}]
                    </span>
                  </div>
                  <span className="text-white font-mono font-black text-xs shrink-0 pl-1">
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stat Allocation Modal */}
      {isStatModalOpen && (
        <StatAllocationModal
          isOpen={isStatModalOpen}
          profile={profile}
          attributes={attributes}
          onClose={() => setIsStatModalOpen(false)}
        />
      )}
    </div>
  );
}
