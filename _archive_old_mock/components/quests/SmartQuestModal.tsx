"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store";
import { addManualQuest } from "@/store/slices/questSlice";
import { parseQuestFromNaturalLanguage, ParsedQuestResult } from "@/lib/calculations/nlp";
import { triggerHaptic } from "@/lib/utils";
import { X, Sparkles, Check, Wand2, ArrowRight, ShieldCheck, Clock } from "lucide-react";

interface SmartQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLES = [
  "Walk my dog every Sunday morning for 30 minutes",
  "Study Next.js architecture for 60 mins every weekday",
  "Jog in park for 25 minutes every morning",
  "Clean apartment and wash dishes for 30 minutes",
];

export function SmartQuestModal({ isOpen, onClose }: SmartQuestModalProps) {
  const dispatch = useAppDispatch();
  const [inputText, setInputText] = useState("Walk my dog every Sunday morning for 30 minutes");
  const [parsed, setParsed] = useState<ParsedQuestResult>(() =>
    parseQuestFromNaturalLanguage("Walk my dog every Sunday morning for 30 minutes")
  );

  if (!isOpen) return null;

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (text.trim().length > 3) {
      setParsed(parseQuestFromNaturalLanguage(text));
    }
  };

  const handleSelectExample = (eg: string) => {
    triggerHaptic("light");
    setInputText(eg);
    setParsed(parseQuestFromNaturalLanguage(eg));
  };

  const handleCommit = () => {
    triggerHaptic("success");
    dispatch(
      addManualQuest({
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        classification: parsed.classification,
        durationMinutes: parsed.durationMinutes,
        recurrence: parsed.recurrence,
        priority: parsed.priority,
        difficulty: parsed.difficulty,
        selectedAttributes: parsed.relevantAttributes,
        customRewards: parsed.attributeRewards,
        customXp: parsed.xpReward,
      })
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl hunter-panel border border-cyan-500/40 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                SMART QUEST PARSER
              </h2>
              <p className="text-xs text-slate-400">
                Describe activity in plain English — System extracts rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input prompt */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Natural Language Description
          </label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g. Walk my dog every Sunday for 30 minutes..."
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Example Quick Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">
            TAP TO TRY EXAMPLES
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((eg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectExample(eg)}
                className="text-[10px] text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-cyan-950/40 px-2.5 py-1 rounded-xl border border-slate-800 transition text-left"
              >
                &ldquo;{eg}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Live Interpretation HUD Preview */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              SYSTEM INTERPRETATION PREVIEW
            </span>
            <span className="text-slate-500 text-[10px]">VERIFY BEFORE COMMIT</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Extracted Title
              </span>
              <span className="text-sm font-bold text-white block">
                {parsed.title}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 font-bold uppercase">
                {parsed.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {parsed.durationMinutes} mins
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 uppercase">
                {parsed.recurrence}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                +{parsed.xpReward} XP
              </span>
            </div>

            {/* Fair Attribute Breakdown */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Allocated Attributes (Anti-Cheat Context Rules)
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {Object.entries(parsed.attributeRewards).map(([stat, pts]) => (
                  <span
                    key={stat}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-bold"
                  >
                    +{pts} {stat.toUpperCase().slice(0, 3)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition"
          >
            <Check className="w-4 h-4" />
            COMMIT QUEST
          </button>
        </div>
      </div>
    </div>
  );
}

