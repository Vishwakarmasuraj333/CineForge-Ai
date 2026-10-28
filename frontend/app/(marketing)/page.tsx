"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import {
  Film,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Play,
  Clock,
  Coins,
  CheckCircle2,
  HelpCircle,
  Video,
  Image as ImageIcon
} from "lucide-react";

export default function MarketingLandingPage() {
  const [activeTab, setActiveTab] = useState<"t2v" | "i2v">("t2v");

  return (
    <div className="min-h-screen bg-cine-950 text-cine-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-cine-950/80 border-b border-cine-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandMark size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-cine-400">
            <a href="#features" className="hover:text-cine-100 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-cine-100 transition-colors">Workflow</a>
            <a href="#models" className="hover:text-cine-100 transition-colors">Models</a>
            <a href="#pricing" className="hover:text-cine-100 transition-colors">Transparent Pricing</a>
            <a href="#faq" className="hover:text-cine-100 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-cine-200 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gold-500 hover:bg-gold-400 text-cine-950 px-4 py-2 rounded-md shadow-md transition-all flex items-center gap-1.5"
            >
              Start Creating <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Subtle cinematic radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-gold-500/10 via-teal-500/5 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cine-700 bg-cine-900/60 text-xs font-mono text-gold-400">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Production-Grade Generative Video Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            From imagination to motion. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-cine-100 to-teal-400">
              Cinema-Grade AI Synthesis.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-cine-400 leading-relaxed">
            CineForge AI couples state-of-the-art text-to-video & image-to-video diffusion models with prompt decomposition, scene continuity planning, and transparent per-second cost tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-gold-500 hover:bg-gold-400 text-cine-950 font-bold text-sm tracking-wide shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
            >
              Launch Studio Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-md border border-cine-700 bg-cine-900/80 hover:bg-cine-850 text-cine-200 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              Sign In to Your Projects
            </Link>
          </div>
        </div>

        {/* Product Studio Mockup Preview */}
        <div className="max-w-5xl mx-auto mt-16 rounded-xl border border-cine-700/80 bg-cine-900/90 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-cine-850/80 border-b border-cine-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-cine-400">CineForge Studio Workspace — Scene Synthesis</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Provider Adapter: Connected
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Controls Preview */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex gap-2 p-1 bg-cine-950 rounded-md border border-cine-800">
                <button
                  onClick={() => setActiveTab("t2v")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-all ${activeTab === "t2v" ? "bg-cine-800 text-gold-400 shadow" : "text-cine-400 hover:text-cine-200"}`}
                >
                  <Video className="w-3.5 h-3.5" /> Text to Video
                </button>
                <button
                  onClick={() => setActiveTab("i2v")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-all ${activeTab === "i2v" ? "bg-cine-800 text-teal-400 shadow" : "text-cine-400 hover:text-cine-200"}`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Image to Video
                </button>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-mono text-cine-400 uppercase">Input Prompt</label>
                <div className="p-3 bg-cine-950 rounded-md border border-cine-800 text-xs text-cine-200 leading-relaxed font-sans">
                  "Wide cinematic tracking shot of an astronaut traversing obsidian dunes on Titan at twilight, golden rim lighting, 35mm lens, photorealistic 8k."
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono">
                <div className="p-2 bg-cine-950 rounded border border-cine-800">
                  <span className="text-cine-400 block text-[10px]">ASPECT RATIO</span>
                  <span className="text-cine-100 font-semibold">16:9 Widescreen</span>
                </div>
                <div className="p-2 bg-cine-950 rounded border border-cine-800">
                  <span className="text-cine-400 block text-[10px]">DURATION</span>
                  <span className="text-cine-100 font-semibold">5 Seconds @ 24fps</span>
                </div>
              </div>

              <div className="p-3 rounded bg-cine-950/80 border border-cine-800 flex items-center justify-between text-xs">
                <span className="text-cine-400 font-mono">Estimated Cost:</span>
                <span className="text-gold-400 font-bold font-mono">$0.05 USD</span>
              </div>
            </div>

            {/* Right Video Render Canvas */}
            <div className="md:col-span-7 flex flex-col items-center justify-center min-h-[260px] bg-cine-950 rounded-lg border border-cine-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-cine-900/60 to-cine-950/90 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 mb-3 shadow-lg group-hover:scale-105 transition-transform">
                  <Play className="w-7 h-7 ml-1" />
                </div>
                <p className="text-sm font-semibold text-cine-100">CineForge Interactive Preview Player</p>
                <p className="text-xs text-cine-400 mt-1 max-w-sm">
                  Generated video sequences are stored securely with verified SHA-256 integrity and authorized private streaming.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-cine-800/60 bg-cine-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono uppercase text-teal-400 tracking-widest">Engineered for Filmmakers & Creators</h2>
            <p className="text-3xl font-bold text-white">Full-Stack Architecture Without Compromise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-cine-800 bg-cine-900/60 space-y-3">
              <div className="w-10 h-10 rounded-md bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multi-Model Provider Adapters</h3>
              <p className="text-sm text-cine-400 leading-relaxed">
                Clean adapter abstraction decoupling vendor proprietary APIs. Seamlessly switch between Replicate, Fal.ai, and offline deterministic mock providers.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-cine-800 bg-cine-900/60 space-y-3">
              <div className="w-10 h-10 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Bilingual Prompt Intelligence</h3>
              <p className="text-sm text-cine-400 leading-relaxed">
                Enrich Hindi and English ideas into structured cinematic directors notes—including camera movement, atmospheric lighting, and lens focal length.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-cine-800 bg-cine-900/60 space-y-3">
              <div className="w-10 h-10 rounded-md bg-cine-700/30 border border-cine-600/40 text-cine-200 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Asynchronous Task Queue</h3>
              <p className="text-sm text-cine-400 leading-relaxed">
                Video synthesis runs non-blocking in background workers with resilient status polling, exponential backoff, and idempotency protection against duplicate billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Model Capabilities & Cost Matrix */}
      <section id="models" className="py-20 px-6 border-t border-cine-800/60">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono uppercase text-gold-400 tracking-widest">Supported Video Models</h2>
            <p className="text-3xl font-bold text-white">Verified Capabilities & Real Catalog Pricing</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-cine-800 bg-cine-900/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-cine-850 text-xs font-mono text-cine-400 uppercase border-b border-cine-800">
                <tr>
                  <th className="px-6 py-4">Model Identifier</th>
                  <th className="px-6 py-4">Supported Modes</th>
                  <th className="px-6 py-4">Max Resolution</th>
                  <th className="px-6 py-4">Aspect Ratios</th>
                  <th className="px-6 py-4">Catalog Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cine-800/80 font-sans text-cine-200">
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Minimax Video-01</td>
                  <td className="px-6 py-4 text-xs font-mono text-teal-400">Text-to-Video, Image-to-Video</td>
                  <td className="px-6 py-4">1080p</td>
                  <td className="px-6 py-4 font-mono text-xs">16:9, 9:16, 1:1</td>
                  <td className="px-6 py-4 font-mono text-gold-400 font-bold">$0.08 / sec</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Kling v1 Standard</td>
                  <td className="px-6 py-4 text-xs font-mono text-teal-400">Text-to-Video, Image-to-Video</td>
                  <td className="px-6 py-4">1080p</td>
                  <td className="px-6 py-4 font-mono text-xs">16:9, 9:16, 1:1</td>
                  <td className="px-6 py-4 font-mono text-gold-400 font-bold">$0.07 / sec</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">CogVideoX 5B</td>
                  <td className="px-6 py-4 text-xs font-mono text-teal-400">Text-to-Video</td>
                  <td className="px-6 py-4">720p</td>
                  <td className="px-6 py-4 font-mono text-xs">16:9, 9:16</td>
                  <td className="px-6 py-4 font-mono text-gold-400 font-bold">$0.03 / sec</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">CineForge Mock Fast (Dev/CI)</td>
                  <td className="px-6 py-4 text-xs font-mono text-cine-400">Deterministic Offline Simulation</td>
                  <td className="px-6 py-4">720p</td>
                  <td className="px-6 py-4 font-mono text-xs">All Ratios</td>
                  <td className="px-6 py-4 font-mono text-teal-400 font-bold">$0.01 (Mock)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-cine-800/60 bg-cine-900/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-mono uppercase text-teal-400 tracking-widest">Frequently Asked Questions</h2>
            <p className="text-3xl font-bold text-white">Technical & Academic Clarity</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-lg border border-cine-800 bg-cine-900/50">
              <h4 className="font-semibold text-white text-base">Does CineForge AI train models from scratch?</h4>
              <p className="text-sm text-cine-400 mt-2 leading-relaxed">
                No. CineForge AI is a production pipeline and research evaluation platform that interfaces with verified external generative diffusion APIs (such as Minimax, Kling, and CogVideoX) via standardized adapters.
              </p>
            </div>
            <div className="p-5 rounded-lg border border-cine-800 bg-cine-900/50">
              <h4 className="font-semibold text-white text-base">How does CineForge handle provider outages or timeouts?</h4>
              <p className="text-sm text-cine-400 mt-2 leading-relaxed">
                All long-running video generations are enqueued to background workers. The system tracks state transitions through QUEUED, SUBMITTED, PROCESSING, and DOWNLOADING, gracefully handling provider rate limits and exposing sanitized diagnostic errors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-cine-800 py-10 px-6 bg-cine-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandMark size="sm" />
          <p className="text-xs text-cine-400">
            © 2026 CineForge AI. Academic M.Sc. IT Major Project & Generative Video Studio.
          </p>
          <div className="flex gap-6 text-xs text-cine-400">
            <a href="#features" className="hover:text-cine-100">Documentation</a>
            <a href="#pricing" className="hover:text-cine-100">Cost Model</a>
            <Link href="/login" className="hover:text-cine-100">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

