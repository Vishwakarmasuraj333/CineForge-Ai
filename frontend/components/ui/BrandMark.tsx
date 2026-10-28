import React from "react";
import Link from "next/link";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  subtitle?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  className = "",
  size = "md",
  withText = true,
  subtitle,
}) => {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 font-bold tracking-tight select-none transition-all duration-200 ${className}`}
    >
      {/* Radiant Anamorphic Film-Forge Emblem */}
      <div className={`relative ${iconDimensions[size]} rounded-xl p-0.5 bg-gradient-to-tr from-amber-500 via-gold-400 to-cyan-400 shadow-md shadow-gold-500/25 group-hover:shadow-lg group-hover:shadow-gold-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center`}>
        {/* Deep Slate Glass Container */}
        <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-cine-900 via-cine-950 to-black p-1.5 flex items-center justify-center relative overflow-hidden border border-white/10">
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute inset-0 bg-radial-gradient from-gold-500/25 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* High-Definition Cinematic Camera & Forge Flame Vector */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
          >
            <defs>
              {/* Molten Gold / Forge Gradient */}
              <linearGradient id="cf-molten-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF3B0" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Anamorphic Cyan Flare Gradient */}
              <linearGradient id="cf-anamorphic-cyan" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="cf-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Hexagonal Camera Aperture Shutter Ring */}
            <path
              d="M16 2.5L27 8.5V20.5L16 26.5L5 20.5V8.5L16 2.5Z"
              stroke="url(#cf-molten-gold)"
              strokeWidth="1.8"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Dynamic Interlocking Shutter Blades */}
            <path
              d="M16 6L23 10V18L16 22L9 18V10L16 6Z"
              fill="#0F131A"
              stroke="url(#cf-anamorphic-cyan)"
              strokeWidth="1.4"
            />

            {/* Inner Anamorphic Lens Core with Prismatic Iris */}
            <circle cx="16" cy="14" r="4.5" fill="url(#cf-molten-gold)" filter="url(#cf-glow)" />

            {/* Central Pure White Laser Flare Point */}
            <circle cx="16" cy="14" r="1.8" fill="#FFFFFF" />

            {/* Horizontal Anamorphic Blue Streak */}
            <line
              x1="6"
              y1="14"
              x2="26"
              y2="14"
              stroke="url(#cf-anamorphic-cyan)"
              strokeWidth="1"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
        </div>
      </div>

      {withText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${textSizes[size]} font-black tracking-wider font-sans text-white drop-shadow-xs`}>
              CINE<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-gold-400 to-orange-400">FORGE</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-950 to-cine-900 text-teal-300 border border-teal-500/40 shadow-xs font-bold">
              AI
            </span>
          </div>
          {subtitle && (
            <span className="text-[11px] text-cine-400 font-mono tracking-wide mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
