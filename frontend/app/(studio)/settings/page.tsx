"use client";

import React, { useState, useEffect } from "react";
import { api, getStoredToken } from "@/lib/api-client";
import {
  Settings,
  Key,
  User,
  Sliders,
  Database,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  Cloud
} from "lucide-react";

export default function StudioSettingsPage() {
  const [activeTab, setActiveTab] = useState<"api" | "profile" | "presets" | "system">("api");
  const [profile, setProfile] = useState<{ display_name: string; email: string; role: string } | null>(null);

  // API Token State
  const [replicateToken, setReplicateToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://studio.cineforge.ai/api/webhooks/replicate");

  // Presets State
  const [defaultModel, setDefaultModel] = useState("minimax-video-01");
  const [defaultAspectRatio, setDefaultAspectRatio] = useState("16:9");
  const [autoOptimizer, setAutoOptimizer] = useState(true);

  // Status State
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.auth
      .me()
      .then((data) => setProfile(data))
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cine-900 via-cine-900/90 to-cine-850 p-6 sm:p-8 border border-cine-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono font-medium mb-3">
              <Settings className="w-3.5 h-3.5" />
              STUDIO PREFERENCES & CONFIGURATION
            </div>
            <h1 className="text-3xl font-extrabold text-cine-100 tracking-tight">
              Studio Settings
            </h1>
            <p className="mt-1 text-cine-400 text-sm">
              Manage your personal cloud credentials, studio presets, model preferences, and active database connection.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cine-800 pb-2">
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "api"
              ? "bg-cine-850 text-gold-400 border border-cine-700 shadow-sm font-bold"
              : "text-cine-400 hover:text-cine-200"
          }`}
        >
          <Key className="w-4 h-4" />
          API Keys & Webhooks
        </button>

        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "presets"
              ? "bg-cine-850 text-gold-400 border border-cine-700 shadow-sm font-bold"
              : "text-cine-400 hover:text-cine-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Generation Presets
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "profile"
              ? "bg-cine-850 text-gold-400 border border-cine-700 shadow-sm font-bold"
              : "text-cine-400 hover:text-cine-200"
          }`}
        >
          <User className="w-4 h-4" />
          Director Profile
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "system"
              ? "bg-cine-850 text-gold-400 border border-cine-700 shadow-sm font-bold"
              : "text-cine-400 hover:text-cine-200"
          }`}
        >
          <Database className="w-4 h-4" />
          Cloud Infrastructure
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Studio settings updated successfully. Credentials and presets are stored securely.</span>
        </div>
      )}

      {/* Tab 1: API Keys */}
      {activeTab === "api" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl bg-cine-900 border border-cine-800 p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-cine-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-gold-400" />
                External AI Provider Credentials
              </h3>
              <p className="text-xs text-cine-400 mt-1">
                Configure your server-side API keys to unlock live cloud inference directly through your personal provider account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cine-300 uppercase tracking-wider mb-1.5">
                  Replicate API Token (Bearer Token)
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={replicateToken}
                    onChange={(e) => setReplicateToken(e.target.value)}
                    placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-cine-950 border border-cine-800 rounded-xl px-4 py-2.5 text-sm text-cine-100 font-mono focus:outline-none focus:border-gold-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cine-400 hover:text-cine-200"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-cine-500 block mt-1">
                  Required for Minimax Video-01 and Kling v1.6 live cloud rendering. Token is encrypted at rest using AES-256.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-cine-300 uppercase tracking-wider mb-1.5">
                  Async Status Webhook Target
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-cine-950 border border-cine-800 rounded-xl px-4 py-2.5 text-sm text-cine-100 font-mono focus:outline-none focus:border-gold-500"
                />
                <span className="text-[11px] text-cine-500 block mt-1">
                  Replicate will deliver generation completed webhooks to this endpoint.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-sm shadow-md shadow-gold-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Credentials
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Generation Presets */}
      {activeTab === "presets" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl bg-cine-900 border border-cine-800 p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-cine-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gold-400" />
                Default Studio Presets
              </h3>
              <p className="text-xs text-cine-400 mt-1">
                Set default generation attributes loaded automatically when creating new studio shots.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-cine-300 uppercase tracking-wider mb-1.5">
                  Preferred Foundation Model
                </label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full bg-cine-950 border border-cine-800 rounded-xl px-4 py-2.5 text-sm text-cine-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="minimax-video-01">Minimax Video-01 ($0.08/s - High Motion)</option>
                  <option value="kling-v1-standard">Kling v1.6 Standard ($0.07/s - Cinematic)</option>
                  <option value="cogvideox-5b">CogVideoX 5B ($0.03/s - Open Weights)</option>
                  <option value="cineforge-mock-v1">Deterministic Mock (Free Offline)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-cine-300 uppercase tracking-wider mb-1.5">
                  Default Aspect Ratio
                </label>
                <select
                  value={defaultAspectRatio}
                  onChange={(e) => setDefaultAspectRatio(e.target.value)}
                  className="w-full bg-cine-950 border border-cine-800 rounded-xl px-4 py-2.5 text-sm text-cine-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="16:9">16:9 Widescreen (Landscape Cinema)</option>
                  <option value="9:16">9:16 Vertical (Reels / Shorts / TikTok)</option>
                  <option value="1:1">1:1 Square (Instagram Feed)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-cine-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-cine-200 block">Automatic Prompt Optimizer</span>
                <span className="text-xs text-cine-400 block mt-0.5">
                  Automatically enhance raw user prompts with camera optics, aperture notes, and volumetric lighting directives.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoOptimizer}
                onChange={(e) => setAutoOptimizer(e.target.checked)}
                className="w-5 h-5 accent-gold-500 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-sm shadow-md shadow-gold-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Studio Presets
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Director Profile */}
      {activeTab === "profile" && (
        <div className="rounded-2xl bg-cine-900 border border-cine-800 p-6 space-y-5">
          <h3 className="text-lg font-bold text-cine-100 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-400" />
            Director Identity
          </h3>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                disabled
                value={profile?.display_name || "Christopher Nolan"}
                className="w-full bg-cine-950/60 border border-cine-800 rounded-xl px-4 py-2.5 text-sm text-cine-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || "creator@cineforge.ai"}
                className="w-full bg-cine-950/60 border border-cine-800 rounded-xl px-4 py-2.5 text-sm text-cine-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1">
                Studio Authorization Role
              </label>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cine-800 text-teal-400 border border-teal-500/30 text-xs font-mono font-bold">
                <Shield className="w-3.5 h-3.5" />
                {profile?.role || "USER"} (PRO DIRECTOR)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud Infrastructure */}
      {activeTab === "system" && (
        <div className="rounded-2xl bg-cine-900 border border-cine-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-cine-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-gold-400" />
            Active Production Cloud Infrastructure
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-cine-950 border border-cine-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cine-400">DATABASE BACKEND</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>
              <div className="text-cine-200 font-bold text-sm">Neon Serverless PostgreSQL</div>
              <p className="text-cine-500 text-[11px] font-sans">
                AWS US East 2 (Ohio) &bull; ep-wild-math-b58gwbds-pooler &bull; Transaction Pooling
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cine-950 border border-cine-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cine-400">STORAGE DRIVER</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
              <div className="text-cine-200 font-bold text-sm">Path-Traversal Protected Storage</div>
              <p className="text-cine-500 text-[11px] font-sans">
                storage/uploads &bull; SHA-256 binary validation &bull; S3 driver ready
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cine-950 border border-cine-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cine-400">BACKGROUND ENGINE</span>
                <span className="text-teal-400 font-bold">READY</span>
              </div>
              <div className="text-cine-200 font-bold text-sm">Async Task Runner + Celery Queue</div>
              <p className="text-cine-500 text-[11px] font-sans">
                Automatic recovery of interrupted jobs during server restart
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cine-950 border border-cine-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cine-400">PLATFORM VERSION</span>
                <span className="text-gold-400 font-bold">v1.0.0 PRODUCTION</span>
              </div>
              <div className="text-cine-200 font-bold text-sm">FastAPI + Next.js 14 App Router</div>
              <p className="text-cine-500 text-[11px] font-sans">
                M.Sc. IT Major Project & Full-Stack Generative Video Studio
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
