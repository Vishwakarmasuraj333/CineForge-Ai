import React from "react";
import Link from "next/link";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  className = "",
  size = "md",
  withText = true,
}) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-cine-100 ${className}`}>
      {/* Film-Frame Minimal Geometric Brand Mark */}
      <div className={`relative ${iconSizes[size]} rounded-md border border-cine-700 bg-cine-900 p-1 flex items-center justify-center overflow-hidden shadow-inner`}>
        {/* Film sprocket holes on top and bottom */}
        <div className="absolute top-0.5 left-1 w-1 h-0.5 rounded-xs bg-cine-700" />
        <div className="absolute top-0.5 right-1 w-1 h-0.5 rounded-xs bg-cine-700" />
        <div className="absolute bottom-0.5 left-1 w-1 h-0.5 rounded-xs bg-cine-700" />
        <div className="absolute bottom-0.5 right-1 w-1 h-0.5 rounded-xs bg-cine-700" />

        {/* Center motion aperture / anvil mark with warm amber-gold accent */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-gold-400 transform -rotate-12"
        >
          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.2" />
          <line x1="19" y1="5" x2="19" y2="19" stroke="#14B8A6" strokeWidth="2.5" />
        </svg>
      </div>

      {withText && (
        <span className={`${textSizes[size]} font-semibold tracking-wider font-sans`}>
          CINE<span className="text-gold-400 font-extrabold">FORGE</span>
          <span className="text-xs px-1.5 py-0.5 ml-1.5 rounded-xs font-mono font-medium tracking-normal bg-cine-800 text-teal-400 border border-cine-700">
            AI
          </span>
        </span>
      )}
    </Link>
  );
};

