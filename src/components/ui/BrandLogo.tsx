"use client";

import Image from "next/image";

interface BrandLogoProps {
  variant?: "horizontal" | "emblem" | "full" | "icon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
  priority?: boolean;
}

export function BrandLogo({
  variant = "horizontal",
  size = "md",
  className = "",
  showSubtitle = true,
  priority = false,
}: BrandLogoProps) {
  // Balanced emblem dimensions and font typography scaling
  const emblemSizes = {
    xs: { dim: 32, text: "text-xs", sub: "text-[7.5px]", gap: "gap-1.5" },
    sm: { dim: 44, text: "text-sm sm:text-base", sub: "text-[8.5px]", gap: "gap-2.5" },
    md: { dim: 52, text: "text-base sm:text-lg", sub: "text-[9.5px]", gap: "gap-3" },
    lg: { dim: 82, text: "text-2xl sm:text-3xl", sub: "text-[11px]", gap: "gap-3.5" },
    xl: { dim: 110, text: "text-3xl sm:text-4xl", sub: "text-xs", gap: "gap-4" },
  };

  const currentSize = emblemSizes[size] || emblemSizes.md;

  if (variant === "emblem" || variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <Image
          src="/sd-quest-emblem.png"
          alt="SD-Quest Emblem"
          width={currentSize.dim}
          height={currentSize.dim}
          priority={priority}
          className="object-contain drop-shadow-[0_0_14px_rgba(0,229,255,0.5)] hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all duration-300"
        />
      </div>
    );
  }

  if (variant === "full") {
    const fullDim = Math.round(currentSize.dim * 1.5);

    return (
      <div className={`flex flex-col items-center text-center ${currentSize.gap} ${className}`}>
        <div className="relative group">
          <Image
            src="/sd-quest-emblem.png"
            alt="SD-Quest Emblem"
            width={fullDim}
            height={fullDim}
            priority={priority}
            className="object-contain drop-shadow-[0_0_26px_rgba(0,229,255,0.6)] group-hover:drop-shadow-[0_0_36px_rgba(192,132,252,0.85)] transition-all duration-300"
          />
        </div>
        <div className="flex flex-col items-center">
          <h1 className={`font-solo font-black tracking-wider ${currentSize.text} uppercase text-white leading-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]`}>
            <span className="text-cyan-400">SD-</span>QUEST
          </h1>
          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-3.5 h-[1px] bg-cyan-500/60" />
              <span className={`font-hud font-bold tracking-[0.25em] text-cyan-400 uppercase ${currentSize.sub}`}>
                REAL-LIFE RPG SYSTEM
              </span>
              <span className="w-3.5 h-[1px] bg-purple-500/60" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: variant === "horizontal"
  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      <div className="relative shrink-0">
        <Image
          src="/sd-quest-emblem.png"
          alt="SD-Quest Emblem"
          width={currentSize.dim}
          height={currentSize.dim}
          priority={priority}
          className="object-contain drop-shadow-[0_0_14px_rgba(0,229,255,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(192,132,252,0.7)] group-hover:scale-105 transition-all duration-300"
        />
      </div>
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center">
          <span className={`font-solo font-black tracking-wider ${currentSize.text} uppercase text-white leading-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]`}>
            <span className="text-cyan-400">SD-</span>QUEST
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-2 h-[1px] bg-cyan-500/60" />
            <span className={`font-hud font-bold tracking-[0.25em] text-cyan-400/90 uppercase ${currentSize.sub}`}>
              REAL-LIFE RPG SYSTEM
            </span>
            <span className="w-2 h-[1px] bg-purple-500/60" />
          </div>
        )}
      </div>
    </div>
  );
}
