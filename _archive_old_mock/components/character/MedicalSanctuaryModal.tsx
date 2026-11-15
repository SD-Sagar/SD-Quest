"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setConditionStatus, applyPenalty } from "@/store/slices/playerSlice";
import { triggerHaptic } from "@/lib/utils";
import { Shield, AlertTriangle, X, Check, HeartPulse, RefreshCw } from "lucide-react";

interface MedicalSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalSanctuaryModal({ isOpen, onClose }: MedicalSanctuaryModalProps) {
  const dispatch = useAppDispatch();
  const condition = useAppSelector((state) => state.player.conditionStatus);
  const chickenDays = useAppSelector((state) => state.player.chickenStatusDaysRemaining);

  const [reason, setReason] = useState("Illness / Fever");

  if (!isOpen) return null;

  const handleActivateSanctuary = () => {
    triggerHaptic("heavy");
    dispatch(setConditionStatus("medical_sanctuary"));
    onClose();
  };

  const handleDeactivateSanctuary = () => {
    triggerHaptic("light");
    dispatch(setConditionStatus("normal"));
    onClose();
  };

  const handleTriggerChickenDebuff = () => {
    triggerHaptic("warning");
    dispatch(setConditionStatus("chicken"));
    dispatch(applyPenalty({ penaltyDiscipline: 0.5, penaltyXp: 100 }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl hunter-panel border border-slate-700 p-6 shadow-2xl space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                CONDITION & SANCTUARY ENGINE
              </h2>
              <p className="text-xs text-slate-400">
                Medical exceptions & strict disciplinary rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Info */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">CURRENT STATUS:</span>
          <span
            className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
              condition === "medical_sanctuary"
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                : condition === "chicken"
                ? "bg-amber-950/60 text-amber-400 border-amber-500/40"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            {condition === "medical_sanctuary"
              ? "Honorable Sanctuary (Active)"
              : condition === "chicken"
              ? `Chicken Debuff (${chickenDays || 7} Days)`
              : "Normal Operational State"}
          </span>
        </div>

        {/* 1. Honorable Medical Sanctuary */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              HONORABLE MEDICAL SANCTUARY
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            A lifelong system never punishes a lifter for injury or illness. Activating
            sanctuary freezes all streak penalties and Chicken timers with honor.
          </p>

          {condition !== "medical_sanctuary" ? (
            <div className="pt-2 space-y-2">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              >
                <option value="Illness / Fever">Illness (Fever / Infection / Cold)</option>
                <option value="Joint / Rotator Cuff Pain">Joint / Rotator Cuff Strain</option>
                <option value="Active Deload Recovery">Systemic Fatigue / Deload Week</option>
                <option value="Personal Emergency">Family / Life Emergency</option>
              </select>

              <button
                onClick={handleActivateSanctuary}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-950"
              >
                ACTIVATE RECOVERY SANCTUARY
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeactivateSanctuary}
              className="mt-2 w-full py-2.5 rounded-xl border border-emerald-500 text-emerald-400 hover:bg-emerald-950/40 font-bold text-xs uppercase tracking-wider transition"
            >
              EXIT SANCTUARY & RESUME HUNTER DUTIES
            </button>
          )}
        </div>

        {/* 2. Disciplinary Chicken Protocol */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              THE 3-DAY CHICKEN CONDITION
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Missing 3 consecutive mandatory quests without an active medical sanctuary
            triggers Chicken status for 7 days (reduced XP multipliers and visible badge).
          </p>

          {condition !== "chicken" ? (
            <button
              onClick={handleTriggerChickenDebuff}
              className="w-full py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold transition"
            >
              SIMULATE 3 CONSECUTIVE MISSED DAYS
            </button>
          ) : (
            <button
              onClick={handleDeactivateSanctuary}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RESTORE NORMAL STATUS (ADMIN PURGE)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

