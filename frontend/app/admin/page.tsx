"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Users, Film, DollarSign, Activity } from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    total_users: 1,
    total_generations: 3,
    total_billed_usd: 0.15,
    system_status: "HEALTHY",
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-cine-800 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-teal-400" /> Platform Infrastructure & Provider Health
        </h1>
        <p className="text-xs text-cine-400 mt-1">
          Real-time metrics, provider quotas, and compliance audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cine-300" /> Total Users
          </span>
          <p className="text-2xl font-bold text-white font-mono">{stats.total_users}</p>
        </div>
        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-gold-400" /> Total Renderings
          </span>
          <p className="text-2xl font-bold text-white font-mono">{stats.total_generations}</p>
        </div>
        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Platform Billed
          </span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">${stats.total_billed_usd.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 space-y-1">
          <span className="text-xs font-mono text-cine-400 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" /> Engine Health
          </span>
          <p className="text-2xl font-bold text-teal-400 font-mono">{stats.system_status}</p>
        </div>
      </div>
    </div>
  );
}

