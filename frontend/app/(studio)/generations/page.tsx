"use client";

import React, { useEffect, useState } from "react";
import { api, getVideoAssetUrl } from "@/lib/api-client";
import {
  History,
  Video,
  Play,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePreview, setActivePreview] = useState<any>(null);

  const loadGenerations = () => {
    api.generations.list().then((res) => {
      setGenerations(res.items);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadGenerations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cine-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-gold-400" /> Generation Queue & History
          </h1>
          <p className="text-xs text-cine-400 mt-1">
            Complete audit trail of all synthesized video sequences and rendering jobs
          </p>
        </div>

        <button
          onClick={loadGenerations}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cine-900 border border-cine-700 hover:bg-cine-850 text-xs font-mono text-cine-200 rounded-md transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Generations Table */}
      <div className="rounded-lg border border-cine-800 bg-cine-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cine-850 text-cine-400 font-mono uppercase border-b border-cine-800">
              <tr>
                <th className="px-5 py-3.5">Prompt & Scene</th>
                <th className="px-5 py-3.5">Model & Provider</th>
                <th className="px-5 py-3.5">Parameters</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cine-800/80 font-sans text-cine-200">
              {generations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-cine-500 font-sans">
                    No generation records found. Launch the studio to synthesize your first scene!
                  </td>
                </tr>
              ) : (
                generations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-cine-850/40 transition-colors">
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-medium text-cine-100 truncate">{gen.prompt}</p>
                      <p className="text-[10px] text-cine-500 font-mono mt-0.5">
                        {new Date(gen.created_at).toLocaleString()} • ID: {gen.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px]">
                      <span className="text-white block font-semibold">{gen.provider_model_id}</span>
                      <span className="text-cine-400 uppercase text-[9px]">{gen.provider_name}</span>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-cine-300">
                      <span>{gen.parameters_json?.aspect_ratio || "16:9"}</span>
                      <span className="mx-1">•</span>
                      <span>{gen.parameters_json?.duration_seconds || 5}s</span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                          gen.status === "SUCCEEDED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : gen.status === "FAILED"
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : "bg-cine-800 text-gold-400 border border-cine-700 animate-pulse"
                        }`}
                      >
                        {gen.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-gold-400 font-semibold">
                      ${gen.actual_cost != null ? gen.actual_cost.toFixed(3) : gen.estimated_cost?.toFixed(3)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {gen.status === "SUCCEEDED" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActivePreview(gen)}
                            className="p-1.5 rounded bg-cine-800 hover:bg-gold-500 hover:text-cine-950 text-gold-400 transition-colors"
                            title="Play Preview"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <a
                            href={getVideoAssetUrl(gen.owner_id, gen.id)}
                            download={`cineforge_${gen.id.slice(0, 8)}.mp4`}
                            className="p-1.5 rounded bg-cine-800 hover:bg-teal-500 hover:text-cine-950 text-teal-400 transition-colors"
                            title="Download MP4"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-cine-900 border border-cine-700 rounded-xl overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-cine-800">
              <h3 className="text-sm font-semibold text-white truncate max-w-md">
                {activePreview.prompt}
              </h3>
              <button
                onClick={() => setActivePreview(null)}
                className="text-cine-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-cine-800">
              <video
                controls
                autoPlay
                className="w-full h-full object-cover"
                src={getVideoAssetUrl(activePreview.owner_id, activePreview.id)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-cine-400">
                Model: {activePreview.provider_model_id} • Cost: ${activePreview.actual_cost?.toFixed(3)}
              </span>
              <a
                href={getVideoAssetUrl(activePreview.owner_id, activePreview.id)}
                download={`cineforge_${activePreview.id.slice(0, 8)}.mp4`}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-cine-950 font-bold text-xs rounded-md shadow flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Output
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

