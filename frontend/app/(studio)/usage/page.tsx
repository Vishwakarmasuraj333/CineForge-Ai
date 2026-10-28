"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Coins, Clock, Video, FileText, CheckCircle2 } from "lucide-react";

export default function UsagePage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.usage
      .getSummary()
      .then((res) => {
        setSummary(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-cine-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Coins className="w-6 h-6 text-gold-400" /> Usage & Cost Transparency
        </h1>
        <p className="text-xs text-cine-400 mt-1">
          Detailed ledger of model inference runtime, second-by-second charges, and billing reconciliation
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Video className="w-4 h-4 text-teal-400" /> Total Generations Rendered
          </span>
          <p className="text-3xl font-bold font-mono text-white">
            {summary?.total_generations || 0}
          </p>
        </div>

        <div className="p-5 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cine-300" /> Cumulative Video Seconds
          </span>
          <p className="text-3xl font-bold font-mono text-white">
            {summary ? `${summary.total_video_seconds.toFixed(0)}s` : "0s"}
          </p>
        </div>

        <div className="p-5 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-gold-400" /> Reconciled Cost (USD)
          </span>
          <p className="text-3xl font-bold font-mono text-gold-400">
            ${summary ? summary.total_actual_cost.toFixed(3) : "0.000"}
          </p>
        </div>
      </div>

      {/* Usage Ledger */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-cine-300 font-mono">
          Reconciled Usage Records
        </h2>

        <div className="rounded-lg border border-cine-800 bg-cine-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-cine-850 text-cine-400 font-mono uppercase border-b border-cine-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Model & Provider</th>
                  <th className="px-5 py-3.5">Metric Units</th>
                  <th className="px-5 py-3.5">Catalog Rate</th>
                  <th className="px-5 py-3.5 text-right">Actual Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cine-800/80 text-cine-200">
                {!summary || summary.recent_records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-cine-500">
                      No usage records recorded yet.
                    </td>
                  </tr>
                ) : (
                  summary.recent_records.map((rec: any) => (
                    <tr key={rec.id} className="hover:bg-cine-850/40">
                      <td className="px-5 py-4 font-mono text-cine-400">
                        {new Date(rec.recorded_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-mono">
                        <span className="text-white block font-semibold">{rec.model_id}</span>
                        <span className="text-cine-500 text-[10px] uppercase">{rec.provider_name}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-cine-300">
                        {rec.units} {rec.usage_type}
                      </td>
                      <td className="px-5 py-4 font-mono text-cine-400">
                        {rec.pricing_source}
                      </td>
                      <td className="px-5 py-4 font-mono text-gold-400 font-bold text-right">
                        ${rec.actual_amount != null ? rec.actual_amount.toFixed(3) : rec.estimated_amount.toFixed(3)} USD
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

