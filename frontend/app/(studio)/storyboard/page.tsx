"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Clapperboard,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  SunMedium,
  Clock,
  Play,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface SceneCard {
  id: number;
  sceneNumber: number;
  title: string;
  shotType: string;
  cameraMovement: string;
  lighting: string;
  prompt: string;
  durationSeconds: number;
}

export default function StoryboardStudioPage() {
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("Chronicles of New Dawn");
  const [scenes, setScenes] = useState<SceneCard[]>([
    {
      id: 1,
      sceneNumber: 1,
      title: "Establishing the Citadel",
      shotType: "Extreme Wide Shot",
      cameraMovement: "Slow Crane Down",
      lighting: "Golden Hour Sunrise",
      prompt: "Majestic obsidian tower rising above morning mountain mists, crystalline solar collectors catching golden dawn rays, cinematic depth of field, 8k",
      durationSeconds: 5,
    },
    {
      id: 2,
      sceneNumber: 2,
      title: "The Pilot Approaches",
      shotType: "Medium Tracking Shot",
      cameraMovement: "Handheld Low Angle",
      lighting: "Diffused Rim Lighting",
      prompt: "Astronaut in weathered carbon-fiber flight suit walking along the damp landing strip towards an idling hyper-drive shuttle, exhaust heat distortion",
      durationSeconds: 5,
    },
    {
      id: 3,
      sceneNumber: 3,
      title: "Orbital Ignition & Departure",
      shotType: "Dynamic Follow Shot",
      cameraMovement: "FPV Accelerating Dolly",
      lighting: "Cyan Plasma Glow",
      prompt: "Thrusters burst into electric blue plasma, shuttle catapults vertically through thunderous storm clouds into starry space, intense motion blur",
      durationSeconds: 5,
    },
  ]);

  const [isBatchRendering, setIsBatchRendering] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  const addScene = () => {
    const nextNum = scenes.length + 1;
    setScenes([
      ...scenes,
      {
        id: Date.now(),
        sceneNumber: nextNum,
        title: `Scene ${nextNum}: New Beat`,
        shotType: "Wide Shot",
        cameraMovement: "Smooth Pan Right",
        lighting: "Cinematic Natural",
        prompt: "Describe visual choreography, character actions, and environmental details...",
        durationSeconds: 5,
      },
    ]);
  };

  const removeScene = (id: number) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter((s) => s.id !== id).map((s, idx) => ({ ...s, sceneNumber: idx + 1 })));
  };

  const updateScene = (id: number, key: keyof SceneCard, value: any) => {
    setScenes(scenes.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalEstimatedCost = (totalDuration * 0.08).toFixed(2);

  const handleBatchRender = () => {
    setIsBatchRendering(true);
    setTimeout(() => {
      setIsBatchRendering(false);
      setBatchSuccessMessage(
        `Successfully enqueued ${scenes.length} sequence scenes (${totalDuration}s total) to the Studio Queue.`
      );
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cine-900 via-cine-900/90 to-cine-850 p-6 sm:p-8 border border-cine-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-medium mb-3">
              <Clapperboard className="w-3.5 h-3.5" />
              DIRECTOR MODE v2.0
            </div>
            <h1 className="text-3xl font-extrabold text-cine-100 tracking-tight">
              Multi-Scene Script Storyboard
            </h1>
            <p className="mt-1 text-cine-400 text-sm max-w-2xl">
              Choreograph multi-shot cinematic films. Maintain visual coherence, shot progression, and camera movements across an entire story sequence.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-cine-950/80 border border-cine-800 p-3.5 rounded-xl self-start md:self-auto font-mono text-xs">
            <div>
              <span className="text-cine-400 block">SCENES</span>
              <span className="text-lg font-bold text-cine-100">{scenes.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-cine-800" />
            <div>
              <span className="text-cine-400 block">TOTAL RUNTIME</span>
              <span className="text-lg font-bold text-gold-400">{totalDuration}s</span>
            </div>
            <div className="w-[1px] h-8 bg-cine-800" />
            <div>
              <span className="text-cine-400 block">EST. COST</span>
              <span className="text-lg font-bold text-emerald-400">${totalEstimatedCost}</span>
            </div>
          </div>
        </div>
      </div>

      {batchSuccessMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{batchSuccessMessage}</span>
          <button
            onClick={() => router.push("/generations")}
            className="ml-auto underline font-bold hover:text-emerald-300"
          >
            View in Generations Queue &rarr;
          </button>
        </div>
      )}

      {/* Sequence Timeline Header & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-gold-400" />
          <h2 className="text-xl font-bold text-cine-100">Shot Sequence Timeline</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={addScene}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cine-900 hover:bg-cine-800 text-cine-200 border border-cine-700 font-medium text-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            Add Scene Shot
          </button>

          <button
            onClick={handleBatchRender}
            disabled={isBatchRendering}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-xs shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50"
          >
            {isBatchRendering ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cine-950 border-t-transparent rounded-full animate-spin" />
                Dispatching Jobs...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Render Entire Storyboard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scene Cards Stack */}
      <div className="space-y-5">
        {scenes.map((scene, idx) => (
          <div
            key={scene.id}
            className="rounded-2xl bg-cine-900/90 border border-cine-800/80 p-5 sm:p-6 hover:border-gold-500/40 transition-all shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cine-800/60">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/30 flex items-center justify-center font-mono font-bold text-sm">
                  #{scene.sceneNumber}
                </span>
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) => updateScene(scene.id, "title", e.target.value)}
                  className="bg-transparent border-none text-lg font-bold text-cine-100 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded px-1.5 py-0.5"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-mono text-cine-400 bg-cine-950 px-2.5 py-1 rounded-md border border-cine-800">
                  {scene.durationSeconds}s / ${(scene.durationSeconds * 0.08).toFixed(2)}
                </span>
                {scenes.length > 1 && (
                  <button
                    onClick={() => removeScene(scene.id)}
                    className="p-1.5 rounded-lg text-cine-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Scene"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Directive Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div>
                <label className="block text-[11px] font-mono text-cine-400 uppercase tracking-wider mb-1">
                  Shot Framing
                </label>
                <select
                  value={scene.shotType}
                  onChange={(e) => updateScene(scene.id, "shotType", e.target.value)}
                  className="w-full bg-cine-950 border border-cine-800 rounded-lg px-3 py-1.5 text-xs text-cine-200 focus:outline-none focus:border-gold-500"
                >
                  <option>Extreme Wide Shot</option>
                  <option>Wide Establishing Shot</option>
                  <option>Medium Tracking Shot</option>
                  <option>Close-Up Portrait</option>
                  <option>Macro Detail Shot</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cine-400 uppercase tracking-wider mb-1">
                  Camera Choreography
                </label>
                <select
                  value={scene.cameraMovement}
                  onChange={(e) => updateScene(scene.id, "cameraMovement", e.target.value)}
                  className="w-full bg-cine-950 border border-cine-800 rounded-lg px-3 py-1.5 text-xs text-cine-200 focus:outline-none focus:border-gold-500"
                >
                  <option>Slow Crane Down</option>
                  <option>Handheld Low Angle</option>
                  <option>FPV Accelerating Dolly</option>
                  <option>Smooth Pan 180°</option>
                  <option>Orbit 360° Counter-Clockwise</option>
                  <option>Static Anamorphic Focus</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cine-400 uppercase tracking-wider mb-1">
                  Lighting & Mood
                </label>
                <select
                  value={scene.lighting}
                  onChange={(e) => updateScene(scene.id, "lighting", e.target.value)}
                  className="w-full bg-cine-950 border border-cine-800 rounded-lg px-3 py-1.5 text-xs text-cine-200 focus:outline-none focus:border-gold-500"
                >
                  <option>Golden Hour Sunrise</option>
                  <option>Diffused Rim Lighting</option>
                  <option>Cyan Plasma Glow</option>
                  <option>Moody Neon Chiaroscuro</option>
                  <option>High-Key Cinematic Daylight</option>
                </select>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="block text-[11px] font-mono text-cine-400 uppercase tracking-wider mb-1">
                Visual Scene Prompt
              </label>
              <textarea
                value={scene.prompt}
                onChange={(e) => updateScene(scene.id, "prompt", e.target.value)}
                rows={2}
                className="w-full bg-cine-950 border border-cine-800 rounded-xl p-3 text-sm text-cine-100 focus:outline-none focus:border-gold-500 transition-colors resize-none font-sans"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
