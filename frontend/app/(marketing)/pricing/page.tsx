"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  HelpCircle,
  Calculator,
  ArrowRight,
  Flame,
  Film
} from "lucide-react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [videoSeconds, setVideoSeconds] = useState(300);

  const tiers = [
    {
      name: "Starter",
      badge: "Free Exploration",
      price: annual ? "$0" : "$0",
      period: "forever",
      description: "Ideal for testing cinematic AI prompts and learning video generation fundamentals.",
      credits: "50 Credits / mo (~50s video)",
      features: [
        "720p Resolution outputs",
        "Deterministic Mock & CogVideoX preview",
        "Community Showcase access",
        "Standard execution queue",
        "Single-shot generation",
        "Community support",
      ],
      ctaText: "Get Started Free",
      ctaHref: "/register",
      popular: false,
    },
    {
      name: "Creator Pro",
      badge: "Most Popular for Directors",
      price: annual ? "$24" : "$29",
      period: "per month",
      description: "For digital filmmakers, motion designers, and creative advertising agencies.",
      credits: "500 Credits / mo (~500s video)",
      features: [
        "Full 1080p High-Motion HD renders",
        "Minimax Video-01 & Kling v1.6 access",
        "Image-to-Video multi-modal synthesis",
        "Priority GPU cloud scheduling",
        "Custom seeds & negative prompt controls",
        "Watermark-free commercial license",
        "Direct MP4 master asset downloads",
      ],
      ctaText: "Start Creator Pro",
      ctaHref: "/register?plan=creator",
      popular: true,
    },
    {
      name: "Studio Director",
      badge: "High-Volume Production",
      price: annual ? "$65" : "$79",
      period: "per month",
      description: "Full production suite with multi-scene storyboarding and prompt intelligence.",
      credits: "1,800 Credits / mo (~1,800s video)",
      features: [
        "Everything in Creator Pro",
        "Multi-Scene Script Storyboard Studio",
        "Bilingual Hindi/English Prompt Intelligence",
        "Parallel concurrent job rendering (5 slots)",
        "Dedicated cloud storage (100 GB)",
        "API access with custom webhooks",
        "Priority 24/7 technical assistance",
      ],
      ctaText: "Elevate to Studio Director",
      ctaHref: "/register?plan=director",
      popular: false,
    },
    {
      name: "Enterprise",
      badge: "Custom Infrastructure",
      price: annual ? "$210" : "$249",
      period: "per month",
      description: "Dedicated GPU clusters, SLA guarantees, and tailored LoRA fine-tuning.",
      credits: "6,000+ Credits / mo",
      features: [
        "Unlimited parallel generation slots",
        "Private dedicated inference endpoints",
        "Character LoRA keyframe consistency training",
        "Custom Sentry monitoring & audit logging",
        "Custom contract & invoice billing",
        "Dedicated Solutions Architect",
      ],
      ctaText: "Contact Enterprise Sales",
      ctaHref: "mailto:enterprise@cineforge.ai",
      popular: false,
    },
  ];

  // Interactive calculation
  const minimaxCost = (videoSeconds * 0.08).toFixed(2);
  const klingCost = (videoSeconds * 0.07).toFixed(2);
  const cogVideoCost = (videoSeconds * 0.03).toFixed(2);

  return (
    <div className="min-h-screen bg-cine-950 text-cine-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-cine-800">
          <BrandMark size="md" />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-cine-300 hover:text-cine-100 transition-colors">
              Home
            </Link>
            <Link href="/login" className="text-sm font-medium text-cine-300 hover:text-cine-100 transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-ember-500 text-cine-950 font-bold text-sm shadow-md shadow-gold-500/20 hover:from-gold-400 hover:to-ember-400 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            TRANSPARENT, SECOND-BY-SECOND PRICING
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-cine-100">
            Unleash Hollywood-Grade AI Video Without Hidden Fees
          </h1>
          <p className="text-cine-400 text-base sm:text-lg">
            Choose the studio tier that matches your creative ambition. Every plan includes second-by-second usage reconciliation and zero unexpected overage charges.
          </p>

          {/* Billing Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-gold-400 font-bold" : "text-cine-400"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-14 h-7 rounded-full bg-cine-800 p-1 flex items-center transition-colors border border-cine-700"
            >
              <div
                className={`w-5 h-5 rounded-full bg-gold-400 shadow-md transform transition-transform ${
                  annual ? "translate-x-7 bg-emerald-400" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-1.5 ${annual ? "text-emerald-400 font-bold" : "text-cine-400"}`}>
              Annual Billing
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl flex flex-col justify-between p-6 sm:p-7 relative transition-all duration-300 border ${
                tier.popular
                  ? "bg-gradient-to-b from-cine-900 to-cine-950 border-gold-400 shadow-2xl shadow-gold-500/15 scale-105 z-10"
                  : "bg-cine-900/80 border-cine-800 hover:border-cine-700"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-gold-500 to-ember-500 text-cine-950 font-bold text-xs tracking-wider uppercase font-mono shadow-md">
                  RECOMMENDED
                </div>
              )}

              <div>
                <span className="text-xs font-mono font-medium text-gold-400 uppercase tracking-widest">
                  {tier.badge}
                </span>
                <h3 className="text-2xl font-bold text-cine-100 mt-1">{tier.name}</h3>
                <p className="text-xs text-cine-400 mt-2 min-h-[36px]">{tier.description}</p>

                <div className="mt-5 pb-5 border-b border-cine-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-cine-100">{tier.price}</span>
                    <span className="text-xs text-cine-400 font-mono">/{tier.period}</span>
                  </div>
                  <div className="mt-2 text-xs font-mono font-medium text-teal-400 bg-teal-950/40 border border-teal-500/30 px-2 py-1 rounded-md inline-block">
                    {tier.credits}
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-5 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-cine-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={tier.ctaHref}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-gold-500 to-ember-500 text-cine-950 hover:from-gold-400 hover:to-ember-400 shadow-lg shadow-gold-500/20"
                      : "bg-cine-800 hover:bg-cine-700 text-cine-100 border border-cine-700"
                  }`}
                >
                  {tier.ctaText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Estimator Slider */}
        <div className="rounded-2xl bg-cine-900 border border-cine-800 p-6 sm:p-8 max-w-4xl mx-auto shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-gold-400" />
            <h2 className="text-xl font-bold text-cine-100">Live Video Runtime Cost Estimator</h2>
          </div>
          <p className="text-sm text-cine-400 mb-6">
            Drag the slider to calculate the exact estimated cost for your monthly video generation volume across our primary foundation models.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-cine-300">Target Monthly Render Volume:</span>
              <span className="text-lg font-bold text-gold-400">{videoSeconds} Seconds (~{Math.round(videoSeconds / 60)} Minutes)</span>
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={videoSeconds}
              onChange={(e) => setVideoSeconds(Number(e.target.value))}
              className="w-full h-2 bg-cine-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
            />
            <div className="flex justify-between text-xs font-mono text-cine-500">
              <span>10s (Minimal)</span>
              <span>500s (Indie Film)</span>
              <span>1000s (Short Series)</span>
              <span>2000s (Full Feature)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-cine-800">
            <div className="bg-cine-950 p-4 rounded-xl border border-cine-800/80">
              <span className="text-xs font-mono text-cine-400 block">MINIMAX VIDEO-01</span>
              <span className="text-2xl font-bold text-gold-400">${minimaxCost}</span>
              <span className="text-[11px] text-cine-500 block mt-1">At $0.08 / second</span>
            </div>
            <div className="bg-cine-950 p-4 rounded-xl border border-cine-800/80">
              <span className="text-xs font-mono text-cine-400 block">KLING v1.6 STANDARD</span>
              <span className="text-2xl font-bold text-teal-400">${klingCost}</span>
              <span className="text-[11px] text-cine-500 block mt-1">At $0.07 / second</span>
            </div>
            <div className="bg-cine-950 p-4 rounded-xl border border-cine-800/80">
              <span className="text-xs font-mono text-cine-400 block">COGVIDEOX 5B</span>
              <span className="text-2xl font-bold text-emerald-400">${cogVideoCost}</span>
              <span className="text-[11px] text-cine-500 block mt-1">At $0.03 / second</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-cine-100">Frequently Asked Questions</h2>
            <p className="text-sm text-cine-400 mt-1">Everything you need to know about billing, models, and quotas.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-cine-900 border border-cine-800">
              <h4 className="font-bold text-cine-200 text-sm">How does second-by-second reconciliation work?</h4>
              <p className="mt-2 text-xs text-cine-400 leading-relaxed">
                When you submit a generation job, an upfront credit hold is estimated based on duration. Once the external model finishes rendering and returns the final asset, your ledger is reconciled to the exact millisecond duration, refunding any unused fraction.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-cine-900 border border-cine-800">
              <h4 className="font-bold text-cine-200 text-sm">What happens if a video generation fails?</h4>
              <p className="mt-2 text-xs text-cine-400 leading-relaxed">
                If an inference request times out, fails provider validation, or is cancelled by you before rendering begins, 100% of your estimated credits are automatically restored to your account balance with zero penalty.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-cine-900 border border-cine-800">
              <h4 className="font-bold text-cine-200 text-sm">Can I bring my own Replicate or Fal.ai API token?</h4>
              <p className="mt-2 text-xs text-cine-400 leading-relaxed">
                Yes! Under Studio Settings, you can configure your own personal API tokens. When configured, generations bypass platform credit deductions and bill directly to your personal provider account at raw wholesale cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
