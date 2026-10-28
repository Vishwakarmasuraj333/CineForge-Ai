"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  Play,
  Copy,
  Check,
  Video,
  Eye,
  Heart,
  SlidersHorizontal,
  Flame,
  Camera,
  Layers
} from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  prompt: string;
  cameraMovement: string;
  category: "scifi" | "cyberpunk" | "cinematic" | "nature" | "anime";
  model: string;
  duration: string;
  aspectRatio: string;
  likes: number;
  views: number;
  videoPlaceholderUrl?: string;
  thumbnailGradient: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "sc-1",
    title: "Orbital Relay over Titan's Methane Seas",
    prompt: "Cinematic wide shot of an orbital scientific station rotating above the dense amber atmosphere of Titan, methane sea glinting under distant sunlight, anamorphic lens flare, 8k, photorealistic",
    cameraMovement: "Slow Orbit 360",
    category: "scifi",
    model: "Minimax Video-01",
    duration: "10s",
    aspectRatio: "16:9",
    likes: 342,
    views: 1820,
    thumbnailGradient: "from-amber-900/40 via-cine-900 to-cine-950",
  },
  {
    id: "sc-2",
    title: "Neo-Tokyo Rainstorm Alley Pursuit",
    prompt: "Cyberpunk alley in heavy neon rain, holographic advertisements reflecting on wet asphalt, hooded runner dashing past steam vents, dynamic handheld tracking shot, volumetric lighting",
    cameraMovement: "Dynamic Tracking",
    category: "cyberpunk",
    model: "Kling v1.6 Standard",
    duration: "5s",
    aspectRatio: "16:9",
    likes: 518,
    views: 2940,
    thumbnailGradient: "from-blue-900/40 via-purple-900/30 to-cine-950",
  },
  {
    id: "sc-3",
    title: "The Old Clockmaker of Prague",
    prompt: "Intimate macro shot of an elderly artisan with magnifying loupe adjusting brass escapement gears in a candlelit workshop, dust motes dancing in warm light, 35mm film grain",
    cameraMovement: "Rack Focus Macro",
    category: "cinematic",
    model: "Minimax Video-01",
    duration: "5s",
    aspectRatio: "1:1",
    likes: 275,
    views: 1410,
    thumbnailGradient: "from-yellow-900/30 via-stone-900 to-cine-950",
  },
  {
    id: "sc-4",
    title: "Volcanic Aurora over Icelandic Black Sands",
    prompt: "Breathtaking FPV drone sweep descending over steaming basalt lava flows meeting the frozen Atlantic ocean, vibrant emerald aurora borealis rippling across the dark sky",
    cameraMovement: "FPV Drone Dive",
    category: "nature",
    model: "CogVideoX-5B",
    duration: "5s",
    aspectRatio: "16:9",
    likes: 620,
    views: 3880,
    thumbnailGradient: "from-emerald-950/40 via-teal-900/30 to-cine-950",
  },
  {
    id: "sc-5",
    title: "Solar Sailer navigating Asteroid Belt",
    prompt: "Gilded solar sails billowing in stellar winds, reflecting polychromatic sunlight as it maneuvers through a dense crystalline asteroid field, hyper-detailed hard sci-fi aesthetic",
    cameraMovement: "Dolly Zoom Pull",
    category: "scifi",
    model: "Minimax Video-01",
    duration: "10s",
    aspectRatio: "16:9",
    likes: 412,
    views: 2150,
    thumbnailGradient: "from-amber-950/40 via-orange-950/20 to-cine-950",
  },
  {
    id: "sc-6",
    title: "Cybernetic Samurai Katana Stance",
    prompt: "Anime aesthetic 3D render of a cybernetic warrior unsheathing a glowing plasma blade on a rainy rooftop, cherry blossom petals drifting past neon skyscrapers, slow motion",
    cameraMovement: "Low Angle Tilt",
    category: "anime",
    model: "Kling v1.6 Standard",
    duration: "5s",
    aspectRatio: "9:16",
    likes: 740,
    views: 4500,
    thumbnailGradient: "from-rose-950/40 via-indigo-950/30 to-cine-950",
  },
];

export default function ExploreShowcasePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Masterpieces" },
    { id: "scifi", label: "Sci-Fi & Cosmos" },
    { id: "cyberpunk", label: "Cyberpunk & Neon" },
    { id: "cinematic", label: "Cinematic Drama" },
    { id: "nature", label: "Nature & FPV" },
    { id: "anime", label: "Anime & Stylized" },
  ];

  const filteredItems = selectedCategory === "all"
    ? SHOWCASE_ITEMS
    : SHOWCASE_ITEMS.filter((item) => item.category === selectedCategory);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRemix = (promptText: string) => {
    router.push(`/create?prompt=${encodeURIComponent(promptText)}`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cine-900 via-cine-900/90 to-cine-850 p-6 sm:p-8 border border-cine-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono font-medium mb-3">
            <Flame className="w-3.5 h-3.5 text-ember-400 animate-pulse" />
            CURATED CREATIVE GALLERY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-cine-100 tracking-tight">
            Cinematic Community Showcase
          </h1>
          <p className="mt-2 text-cine-400 text-base leading-relaxed">
            Discover breathtaking AI-generated shots rendered by CineForge creators. Explore director prompts, camera choreography directives, and remix any scene directly into your Studio timeline.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
              selectedCategory === cat.id
                ? "bg-gradient-to-r from-gold-500 to-ember-500 text-cine-950 font-bold border-gold-400 shadow-lg shadow-gold-500/20"
                : "bg-cine-900/70 text-cine-300 hover:text-cine-100 hover:bg-cine-850 border-cine-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-cine-900 border border-cine-800/80 overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/10 flex flex-col"
          >
            {/* Media Aspect Ratio Container */}
            <div className={`relative w-full aspect-video bg-gradient-to-br ${item.thumbnailGradient} flex items-center justify-center p-6 border-b border-cine-800/50 overflow-hidden`}>
              {/* Background Glow */}
              <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Shutter Watermark Icon */}
              <Camera className="w-16 h-16 text-cine-700/40 group-hover:scale-110 group-hover:text-gold-400/30 transition-all duration-500" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gold-500/90 text-cine-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Top Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-cine-950/80 backdrop-blur-md text-xs font-mono font-medium text-teal-300 border border-teal-500/30">
                  {item.model}
                </span>
                <span className="px-2 py-1 rounded-md bg-cine-950/80 backdrop-blur-md text-xs font-mono text-cine-300 border border-cine-700">
                  {item.duration}
                </span>
              </div>

              {/* Camera Movement Pill */}
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cine-950/90 backdrop-blur-md text-xs font-medium text-amber-300 border border-amber-500/30">
                  <Camera className="w-3 h-3 text-gold-400" />
                  {item.cameraMovement}
                </span>
              </div>

              <div className="absolute bottom-3 right-3 text-xs font-mono text-cine-400 bg-cine-950/80 px-2 py-0.5 rounded">
                {item.aspectRatio}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-cine-100 group-hover:text-gold-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-cine-400 line-clamp-3 leading-relaxed font-sans">
                  "{item.prompt}"
                </p>
              </div>

              {/* Action Buttons & Metrics */}
              <div className="pt-3 border-t border-cine-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-cine-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> {item.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {item.views}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(item.id, item.prompt)}
                    title="Copy Prompt"
                    className="p-2 rounded-lg bg-cine-800/80 hover:bg-cine-700 text-cine-300 hover:text-cine-100 border border-cine-700 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRemix(item.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-xs shadow-md shadow-gold-500/10 hover:shadow-gold-500/25 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Remix
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
