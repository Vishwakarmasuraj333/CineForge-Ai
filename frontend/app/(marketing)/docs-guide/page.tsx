"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import {
  Code2,
  Terminal,
  FileCode,
  Layers,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Zap,
  BookOpen
} from "lucide-react";

export default function DocsGuidePage() {
  const [selectedLang, setSelectedLang] = useState<"curl" | "python" | "typescript">("python");
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const snippets = {
    curl: `curl -X POST "http://localhost:8000/api/v1/generations" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "00000000-0000-0000-0000-000000000000",
    "prompt": "Cinematic 8k shot of a futuristic orbital solar station, anamorphic lens flare",
    "generation_type": "text_to_video",
    "provider_name": "replicate",
    "provider_model_id": "minimax-video-01",
    "idempotency_key": "gen_unique_idempotency_uuid_001",
    "parameters": {
      "aspect_ratio": "16:9",
      "duration_seconds": 5,
      "resolution": "720p"
    }
  }'`,
    python: `import httpx

API_BASE = "http://localhost:8000/api/v1"
TOKEN = "YOUR_ACCESS_TOKEN"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

payload = {
    "project_id": "YOUR_PROJECT_ID",
    "prompt": "Cinematic 8k shot of a futuristic orbital solar station, anamorphic lens flare",
    "generation_type": "text_to_video",
    "provider_name": "replicate",
    "provider_model_id": "minimax-video-01",
    "idempotency_key": "gen_unique_idempotency_uuid_001",
    "parameters": {
        "aspect_ratio": "16:9",
        "duration_seconds": 5,
        "resolution": "720p"
    }
}

response = httpx.post(f"{API_BASE}/generations", headers=headers, json=payload)
data = response.json()
print("Generation Created:", data["id"], "Status:", data["status"])`,
    typescript: `const API_BASE = "http://localhost:8000/api/v1";
const TOKEN = "YOUR_ACCESS_TOKEN";

const response = await fetch(\`\${API_BASE}/generations\`, {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${TOKEN}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    project_id: "YOUR_PROJECT_ID",
    prompt: "Cinematic 8k shot of a futuristic orbital solar station, anamorphic lens flare",
    generation_type: "text_to_video",
    provider_name: "replicate",
    provider_model_id: "minimax-video-01",
    idempotency_key: "gen_unique_idempotency_uuid_001",
    parameters: {
      aspect_ratio: "16:9",
      duration_seconds: 5,
      resolution: "720p"
    }
  })
});

const data = await response.json();
console.log("Generation Enqueued:", data.id, "Status:", data.status);`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[selectedLang]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cine-950 text-cine-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-cine-800">
          <BrandMark size="md" />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-cine-300 hover:text-cine-100 transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-cine-300 hover:text-cine-100 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-cine-300 hover:text-cine-100 transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            DEVELOPER PLATFORM & REST API
          </div>
          <h1 className="text-4xl font-extrabold text-cine-100 tracking-tight">
            CineForge AI Developer Documentation
          </h1>
          <p className="text-cine-400 text-base leading-relaxed">
            Integrate high-motion video generation into your web, mobile, or enterprise workflows. Our REST API exposes unified asynchronous endpoints across Minimax, Kling, and CogVideoX models.
          </p>
        </div>

        {/* Code Snippet Box */}
        <div className="rounded-2xl bg-cine-900 border border-cine-800 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3.5 bg-cine-950 border-b border-cine-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
                Create Generation Request
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cine-800 text-cine-300">
                POST /api/v1/generations
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-cine-900 rounded-lg p-0.5 border border-cine-800 text-xs font-mono">
                <button
                  onClick={() => setSelectedLang("python")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedLang === "python" ? "bg-cine-800 text-gold-400 font-bold" : "text-cine-400"
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setSelectedLang("typescript")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedLang === "typescript" ? "bg-cine-800 text-gold-400 font-bold" : "text-cine-400"
                  }`}
                >
                  TypeScript
                </button>
                <button
                  onClick={() => setSelectedLang("curl")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedLang === "curl" ? "bg-cine-800 text-gold-400 font-bold" : "text-cine-400"
                  }`}
                >
                  cURL
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-cine-800 hover:bg-cine-700 text-cine-300 hover:text-cine-100 transition-colors"
                title="Copy Code"
              >
                {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-5 bg-cine-950/80 font-mono text-xs text-cine-200 overflow-x-auto">
            <pre>
              <code>{snippets[selectedLang]}</code>
            </pre>
          </div>
        </div>

        {/* API Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-cine-900 border border-cine-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-cine-100">Asynchronous Polling</h3>
            <p className="text-xs text-cine-400 leading-relaxed">
              Video rendering takes 30-180 seconds. The API returns an instant <code className="text-gold-400 font-mono">201 Created</code> with status <code className="text-cine-300 font-mono">QUEUED</code>, avoiding HTTP connection drops.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cine-900 border border-cine-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-cine-100">Guaranteed Idempotency</h3>
            <p className="text-xs text-cine-400 leading-relaxed">
              Pass a unique <code className="text-teal-400 font-mono">idempotency_key</code> with each submission. Retrying with identical parameters returns the existing job and prevents accidental double charges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cine-900 border border-cine-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-cine-100">Unified Schema Registry</h3>
            <p className="text-xs text-cine-400 leading-relaxed">
              Whether rendering through Minimax, Kling, or CogVideoX, our adapter standardizes request parameters, progress normalization, and MP4 downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
