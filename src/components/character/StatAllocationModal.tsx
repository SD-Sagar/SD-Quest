"use client";

import { useState } from "react";
import { AttributeType, PlayerAttributes, Profile } from "@/types";
import { allocateStatPointAction } from "@/server/actions/player.actions";
import { soundEffects } from "@/lib/audio/soundEffects";
import { triggerHaptic } from "@/lib/utils";
import {
  Flame,
  Wind,
  Brain,
  Shield,
  Heart,
  Zap,
  Sparkles,
  X,
  Plus,
  CheckCircle2,
} from "lucide-react";

interface StatAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  attributes: PlayerAttributes;
}

const STAT_DETAILS: Record<
  AttributeType,
  { name: string; tag: string; icon: any; color: string; desc: string }
> = {
  strength: {
    name: "Strength",
    tag: "STR",
    icon: Flame,
    color: "text-red-400 border-red-500/40 bg-red-950/30",
    desc: "Increases physical power, dumbbell tonnage capacity & raw muscle force.",
  },
  agility: {
    name: "Agility",
    tag: "AGI",
    icon: Zap,
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/30",
    desc: "Improves skipping rhythm, speed bonus window & kinetic coordination.",
  },
  endurance: {
    name: "Endurance",
    tag: "END",
    icon: Wind,
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30",
    desc: "Reduces stamina decay in extended training and high-volume sessions.",
  },
  discipline: {
    name: "Discipline",
    tag: "DIS",
    icon: Shield,
    color: "text-amber-400 border-amber-500/40 bg-amber-950/30",
    desc: "Strengthens daily quest streak multiplier and resistance to skipping.",
  },
  mentality: {
    name: "Mentality",
    tag: "MEN",
    icon: Heart,
    color: "text-purple-400 border-purple-500/40 bg-purple-950/30",
    desc: "Mental composure under fatigue, stress resilience & deep focus.",
  },
  vitality: {
    name: "Vitality",
    tag: "VIT",
    icon: Sparkles,
    color: "text-pink-400 border-pink-500/40 bg-pink-950/30",
    desc: "Accelerates biological muscle recovery, sleep score & metabolic health.",
  },
  intelligence: {
    name: "Intelligence",
    tag: "INT",
    icon: Brain,
    color: "text-blue-400 border-blue-500/40 bg-blue-950/30",
    desc: "Enhances coding output, cognitive problem solving & learning capacity.",
  },
};

export function StatAllocationModal({
  isOpen,
  onClose,
  profile,
  attributes,
}: StatAllocationModalProps) {
  const [unallocated, setUnallocated] = useState(
    profile.unallocated_stat_points || 0
  );
  const [localAttrs, setLocalAttrs] = useState<Record<AttributeType, number>>({
    strength: Number(attributes.strength) || 10,
    agility: Number(attributes.agility) || 10,
    endurance: Number(attributes.endurance) || 10,
    discipline: Number(attributes.discipline) || 10,
    mentality: Number(attributes.mentality) || 10,
    vitality: Number(attributes.vitality) || 10,
    intelligence: Number(attributes.intelligence) || 10,
  });
  const [pendingStat, setPendingStat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAllocate = async (attr: AttributeType) => {
    if (unallocated <= 0 || pendingStat) return;
    setPendingStat(attr);
    triggerHaptic("heavy");
    soundEffects.clank();

    // Optimistic update
    setUnallocated((prev) => Math.max(0, prev - 1));
    setLocalAttrs((prev) => ({
      ...prev,
      [attr]: Number((prev[attr] + 1.0).toFixed(1)),
    }));

    try {
      await allocateStatPointAction(attr, 1);
      soundEffects.chime();
    } catch (err) {
      console.error("Failed to allocate stat point:", err);
      // Revert if error
      setUnallocated((prev) => prev + 1);
      setLocalAttrs((prev) => ({
        ...prev,
        [attr]: Number((prev[attr] - 1.0).toFixed(1)),
      }));
    } finally {
      setPendingStat(null);
    }
  };

  const statKeys: AttributeType[] = [
    "strength",
    "agility",
    "endurance",
    "discipline",
    "mentality",
    "vitality",
    "intelligence",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg hunter-panel rounded-3xl border border-amber-500/40 p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              HUNTER STAT MATRIX // ATTRIBUTE ALLOCATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Points Counter Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest block">
              SYSTEM LEVEL REWARD
            </span>
            <span className="text-xs text-slate-300">
              Unallocated Stat Points
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono text-amber-400 animate-pulse">
              {unallocated}
            </span>
            <span className="text-xs text-slate-500 font-mono uppercase">PTS</span>
          </div>
        </div>

        {/* Stats Allocation Rows */}
        <div className="space-y-2">
          {statKeys.map((attr) => {
            const config = STAT_DETAILS[attr];
            const Icon = config.icon;
            const currentVal = localAttrs[attr];
            const isAllocating = pendingStat === attr;

            return (
              <div
                key={attr}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${config.color}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                        {config.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                        {config.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                      {config.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono font-black text-base text-white">
                    {currentVal.toFixed(1)}
                  </span>
                  <button
                    type="button"
                    disabled={unallocated <= 0 || isAllocating}
                    onClick={() => handleAllocate(attr)}
                    className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-black flex items-center justify-center font-black transition shadow-md shadow-amber-950 active:scale-95"
                    title={`Allocate 1 Point to ${config.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition"
          >
            CONFIRM &amp; RETURN TO SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
}

