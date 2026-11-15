"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { triggerHaptic } from "@/lib/utils";
import { Shield, Sparkles, Key, Mail, ArrowRight, UserPlus, Flame } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("heavy");
    setLoading(true);

    // Redirect to character creation if new hunter, or command center if existing
    setTimeout(() => {
      router.push("/character-creation");
    }, 600);
  };

  const handleQuickDemo = () => {
    triggerHaptic("medium");
    router.push("/character-creation");
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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mana-text-glow">
            SD-QUEST
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            YOUR LIFE. YOUR QUEST. YOUR RULES.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Hunter Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="hunter@sdquest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-10"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Access Secret (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-10"
              />
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition flex items-center justify-center gap-2"
          >
            <span>SIGN IN // ENTER GATE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Initialize Awakening CTA */}
        <div className="pt-2 border-t border-slate-800 space-y-3 text-center">
          <p className="text-xs text-slate-400">
            First time entering the System?
          </p>
          <Link
            href="/character-creation"
            className="w-full py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            INITIALIZE AWAKENING (CHARACTER CREATION)
          </Link>
        </div>
      </div>
    </div>
  );
}

