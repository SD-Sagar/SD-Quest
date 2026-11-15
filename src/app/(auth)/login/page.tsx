"use client";

import { useState } from "react";
import { loginAction, signupAction } from "@/server/actions/auth.actions";
import { triggerHaptic } from "@/lib/utils";
import { Mail, Key, ArrowRight, Sparkles, UserPlus, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerHaptic("heavy");
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const action = mode === "login" ? loginAction : signupAction;

    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        triggerHaptic("warning");
      }
    } catch (err: any) {
      // In Next.js redirect throws a special NEXT_REDIRECT error which is caught as expected
      if (err?.message?.includes("NEXT_REDIRECT")) return;
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black relative">
      {/* Background Mana Aura Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-b from-cyan-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md hunter-panel rounded-3xl border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Title Plate */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            HUNTER AUTHENTICATION GATE
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mana-text-glow">
            SD-QUEST
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            YOUR LIFE. YOUR QUEST. YOUR RULES.
          </p>
        </div>

        {/* Mode Toggle (Sign In vs Sign Up) */}
        <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              mode === "login"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              mode === "signup"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Hunter Email Address
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="hunter@sdquest.com"
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-10"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Secret Password
            </label>
            <div className="relative">
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-10"
              />
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "COMMUNICATING WITH SYSTEM..." : mode === "login" ? "ENTER SYSTEM GATE" : "INITIATE AWAKENING"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center font-mono">
          Decades-long encrypted personal ledger. Strictly user-isolated via Supabase RLS.
        </p>
      </div>
    </div>
  );
}

