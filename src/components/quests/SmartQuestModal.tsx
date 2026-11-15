"use client";

import { useState } from "react";
import { parseQuestFromNaturalLanguage, ParsedQuestResult } from "@/lib/calculations/nlp";
import { createQuestAction } from "@/server/actions/quest.actions";
import { triggerHaptic } from "@/lib/utils";
import { Wand2, X, Sparkles, Check, ArrowRight, Calendar, Clock } from "lucide-react";

interface SmartQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartQuestModal({ isOpen, onClose }: SmartQuestModalProps) {
  const [naturalInput, setNaturalInput] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedQuestResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInterpret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    triggerHaptic("medium");
    const parsed = parseQuestFromNaturalLanguage(naturalInput);
    setParsedPreview(parsed);
  };

  const handleConfirmAndSave = async () => {
    if (!parsedPreview) return;

    triggerHaptic("heavy");
    setLoading(true);

    try {
      await createQuestAction({
        title: parsedPreview.title,
        description: parsedPreview.description,
        category: parsedPreview.category,
        classification: parsedPreview.classification,
        start_date: parsedPreview.startDate,
        deadline: parsedPreview.deadline || null,
        estimated_duration_minutes: parsedPreview.durationMinutes,
        recurrence: parsedPreview.recurrence,
        recurrence_days: parsedPreview.recurrence_days,
        priority: parsedPreview.priority,
        difficulty: parsedPreview.difficulty,
        attribute_rewards: parsedPreview.attributeRewards,
        xp_reward: parsedPreview.xpReward,
        is_manual: false,
      });

      onClose();
      setNaturalInput("");
      setParsedPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl hunter-panel border border-cyan-500/40 p-5 sm:p-6 shadow-2xl space-y-4 relative text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                SMART QUEST PARSER (NLP)
              </h2>
              <p className="text-xs text-slate-400">
                Natural English input • Interprets dates, deadlines &amp; attributes
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

        {/* Input Textarea */}
        <form onSubmit={handleInterpret} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g. Pay broadband bill tomorrow at 5pm, or Walk dog every Sunday morning for 30 minutes, or Study Next.js on Friday for 2 hours"
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-medium leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>INTERPRET OBJECTIVE &amp; SCHEDULE</span>
          </button>
        </form>

        {/* Parsed Preview Card */}
        {parsedPreview && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
              <span className="font-bold uppercase tracking-wider">
                [SYSTEM INTEL // PARSED BLUEPRINT]
              </span>
              <span className="capitalize">{parsedPreview.category}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{parsedPreview.title}</h3>
              <p className="text-[11px] text-slate-400">{parsedPreview.description}</p>
            </div>

            {/* Extracted Date & Timing */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Start: {parsedPreview.startDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {parsedPreview.deadline
                    ? `Due: ${parsedPreview.deadline.replace("T", " ")}`
                    : `Recur: ${parsedPreview.recurrence}`}
                </span>
              </div>
            </div>

            {/* Attributes & XP Forecast */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 font-mono">
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(parsedPreview.attributeRewards).map(([attr, val]) => (
                  <span
                    key={attr}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px]"
                  >
                    +{val} {attr.slice(0, 3)}
                  </span>
                ))}
              </div>
              <span className="font-bold text-cyan-400">+{parsedPreview.xpReward} XP</span>
            </div>

            <button
              onClick={handleConfirmAndSave}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "COMMITTING..." : "CONFIRM & ENCRYPT ONTO SYSTEM"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
