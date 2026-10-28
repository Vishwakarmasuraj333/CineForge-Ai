"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  FolderKanban,
  Video,
  Coins,
  History,
  ArrowRight,
  Plus,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function StudioDashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.projects.list(0, 5),
      api.generations.list(),
      api.usage.getSummary().catch(() => null),
    ]).then(([projRes, genRes, usageRes]) => {
      setProjects(projRes.items);
      setGenerations(genRes.items);
      setUsageSummary(usageRes);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cine-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Creative Studio Dashboard</h1>
          <p className="text-xs text-cine-400 mt-1">Overview of recent video generations, projects, and pipeline activity</p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-cine-950 font-bold text-xs tracking-wide rounded-md shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Video Generation
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-gold-400" /> Active Projects
          </span>
          <p className="text-2xl font-bold text-white font-mono">{projects.length}</p>
        </div>

        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-teal-400" /> Total Generations
          </span>
          <p className="text-2xl font-bold text-white font-mono">{generations.length}</p>
        </div>

        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cine-300" /> Video Rendered
          </span>
          <p className="text-2xl font-bold text-white font-mono">
            {usageSummary ? `${usageSummary.total_video_seconds.toFixed(0)}s` : "0s"}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-gold-400" /> Total Usage Cost
          </span>
          <p className="text-2xl font-bold text-gold-400 font-mono">
            ${usageSummary ? usageSummary.total_actual_cost.toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* Recent Generations & Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Generations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cine-300 font-mono">
              Recent Video Synthesis
            </h2>
            <Link href="/generations" className="text-xs text-gold-400 hover:underline flex items-center gap-1 font-mono">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-cine-800 bg-cine-900/60 divide-y divide-cine-800/80">
            {generations.length === 0 ? (
              <div className="p-8 text-center text-cine-500 text-xs">
                No generations yet. Launch the studio to render your first scene!
              </div>
            ) : (
              generations.slice(0, 5).map((gen) => (
                <div key={gen.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 truncate">
                    <p className="text-xs font-medium text-cine-100 truncate">{gen.prompt}</p>
                    <div className="flex items-center gap-3 text-[10px] text-cine-400 font-mono">
                      <span>{gen.provider_model_id}</span>
                      <span>•</span>
                      <span>{gen.parameters_json?.aspect_ratio || "16:9"}</span>
                      <span>•</span>
                      <span>${gen.estimated_cost?.toFixed(2)}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase shrink-0 ${
                      gen.status === "SUCCEEDED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : gen.status === "FAILED"
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-cine-800 text-gold-400 border border-cine-700 animate-pulse"
                    }`}
                  >
                    {gen.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Projects (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cine-300 font-mono">
              Active Projects
            </h2>
            <Link href="/projects" className="text-xs text-gold-400 hover:underline flex items-center gap-1 font-mono">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-cine-800 bg-cine-900/60 divide-y divide-cine-800/80">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-cine-500 text-xs">
                No active projects found.
              </div>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{proj.title}</p>
                    <p className="text-[10px] text-cine-400 line-clamp-1">{proj.description || "No description provided."}</p>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-cine-950 px-2 py-0.5 rounded border border-cine-800">
                    {proj.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

