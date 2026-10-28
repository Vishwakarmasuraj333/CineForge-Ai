"use client";

import React from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cine-950 text-cine-100 flex flex-col">
      <header className="border-b border-cine-800 bg-cine-900/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" />
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800 uppercase font-bold">
            Administrative Control Plane
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-mono text-cine-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Studio
        </Link>
      </header>
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}

