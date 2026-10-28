"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { api, getVideoAssetUrl } from "@/lib/api-client";
import {
  Video,
  Image as ImageIcon,
  Sparkles,
  Play,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  XCircle,
  UploadCloud,
  CheckCircle2,
  Layers,
  Clock,
  Film
} from "lucide-react";

function CreateStudioContent() {
  const searchParams = useSearchParams();

  // Projects
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Mode & Prompt
  const [mode, setMode] = useState<"text_to_video" | "image_to_video">("text_to_video");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const qPrompt = searchParams.get("prompt");
    if (qPrompt) {
      setPrompt(qPrompt);
    }
  }, [searchParams]);
  const [negativePrompt, setNegativePrompt] = useState("");

  // Image Upload for Image-to-Video
  const [uploadedAsset, setUploadedAsset] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Providers & Models
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("mock");
  const [selectedModel, setSelectedModel] = useState("cineforge-mock-v1");

  // Settings
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState("720p");

  // Live Cost Estimate
  const [estimatedCost, setEstimatedCost] = useState<number>(0.05);

  // Prompt Intelligence & Storyboard
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<any>(null);
  const [storyboardResult, setStoryboardResult] = useState<any>(null);
  const [generatingStoryboard, setGeneratingStoryboard] = useState(false);

  // Active Generation Execution & Polling
  const [activeGeneration, setActiveGeneration] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Initial Data: Projects & Providers
  useEffect(() => {
    // Fetch Projects
    api.projects.list().then((res) => {
      setProjects(res.items);
      if (res.items.length > 0) {
        setSelectedProjectId(res.items[0].id);
      } else {
        // Create a default project if user has none
        api.projects.create({ title: "My First Cinematic Project" }).then((newProj) => {
          setProjects([newProj]);
          setSelectedProjectId(newProj.id);
        });
      }
    });

    // Fetch Providers & Models
    api.providers.list().then((res) => {
      setProviders(res.providers);
      if (res.providers.length > 0) {
        const prov = res.providers[0];
        setSelectedProvider(prov.provider_name);
        if (prov.models && prov.models.length > 0) {
          setSelectedModel(prov.models[0].model_id);
        }
      }
    });
  }, []);

  // Update Cost Estimate when model or duration changes
  useEffect(() => {
    if (selectedProvider && selectedModel) {
      api.usage
        .getEstimate(selectedProvider, selectedModel, duration, resolution)
        .then((res) => setEstimatedCost(res.estimated_cost))
        .catch(() => {});
    }
  }, [selectedProvider, selectedModel, duration, resolution]);

  // Polling loop for active generation
  useEffect(() => {
    if (!activeGeneration) return;
    if (["SUCCEEDED", "FAILED", "CANCELLED"].includes(activeGeneration.status)) return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.generations.get(activeGeneration.id);
        setActiveGeneration(updated);
      } catch (err) {
        // Polling retry
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeGeneration]);

  // Handle Image Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const asset = await api.assets.upload(file, selectedProjectId);
      setUploadedAsset(asset);
    } catch (err: any) {
      setError(err.message || "Failed to upload input image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Enhance Prompt Action
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    setError(null);
    try {
      const res = await api.prompt.enhance(prompt);
      setEnhancedResult(res);
      setPrompt(res.enhanced_prompt);
    } catch (err: any) {
      setError("Prompt enhancement failed. Using standard prompt.");
    } finally {
      setEnhancing(false);
    }
  };

  // Storyboard Generation Action
  const handleGenerateStoryboard = async () => {
    if (!prompt.trim()) return;
    setGeneratingStoryboard(true);
    setError(null);
    try {
      const res = await api.prompt.storyboard(prompt, 3);
      setStoryboardResult(res);
    } catch (err: any) {
      setError("Storyboard synthesis failed.");
    } finally {
      setGeneratingStoryboard(false);
    }
  };

  // Submit Video Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a video prompt description.");
      return;
    }
    if (mode === "image_to_video" && !uploadedAsset) {
      setError("Please upload an input frame image for Image-to-Video mode.");
      return;
    }
    if (!selectedProjectId) {
      setError("Please select or create a project first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const idempotencyKey = `cine_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const res = await api.generations.create({
        project_id: selectedProjectId,
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || undefined,
        generation_type: mode,
        provider_name: selectedProvider,
        provider_model_id: selectedModel,
        input_asset_id: uploadedAsset ? uploadedAsset.id : undefined,
        idempotency_key: idempotencyKey,
        parameters: {
          aspect_ratio: aspectRatio,
          duration_seconds: duration,
          resolution: resolution,
          fps: 24,
        },
      });
      setActiveGeneration(res);
    } catch (err: any) {
      setError(err.message || "Failed to submit generation task.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Generation
  const handleCancel = async () => {
    if (!activeGeneration) return;
    try {
      const res = await api.generations.cancel(activeGeneration.id);
      setActiveGeneration(res);
    } catch (err: any) {
      setError(err.message || "Failed to cancel generation.");
    }
  };

  // Find selected model spec
  const currentProviderObj = providers.find((p) => p.provider_name === selectedProvider);
  const currentModelSpec = currentProviderObj?.models?.find((m: any) => m.model_id === selectedModel);

  return (
    <div className="space-y-6">
      {/* Cinematic Studio Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cine-900 via-cine-900/95 to-cine-850 p-6 border border-cine-800 shadow-xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cine-800/80 border border-cine-700 text-gold-400 font-mono text-[10px] font-semibold">
              4K Neural Motion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Film className="w-6 h-6 text-gold-400" /> Cinema Generation Studio
          </h1>
          <p className="text-xs text-cine-400 mt-1 max-w-xl">
            Transform text prompts and conditioning frames into coherent, high-definition motion video with director-level camera controls.
          </p>
        </div>

        {/* Project Selector */}
        <div className="relative z-10 flex items-center gap-2 bg-cine-950/80 border border-cine-800 px-3.5 py-2 rounded-xl text-xs font-mono">
          <span className="text-cine-400">ACTIVE PROJECT:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent border-none text-gold-400 font-bold focus:outline-none font-sans text-xs cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-cine-900 text-cine-100">
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating Modern Alert Toast */}
      {error && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-cine-900 to-cine-950 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Controls & Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Switcher */}
          <div className="flex gap-2 p-1.5 bg-cine-900/90 rounded-xl border border-cine-800 shadow-md">
            <button
              onClick={() => setMode("text_to_video")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === "text_to_video"
                  ? "bg-gradient-to-r from-gold-500 to-amber-500 text-cine-950 shadow-md shadow-gold-500/20"
                  : "text-cine-400 hover:text-cine-100"
              }`}
            >
              <Video className="w-4 h-4" /> Text to Video
            </button>
            <button
              onClick={() => setMode("image_to_video")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                mode === "image_to_video"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-cine-950 shadow-md shadow-teal-500/20"
                  : "text-cine-400 hover:text-cine-100"
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Image to Video
            </button>
          </div>

          {/* Image Upload Area for Image-to-Video */}
          {mode === "image_to_video" && (
            <div className="p-4 rounded-lg border border-dashed border-cine-700 bg-cine-900/40 text-center space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              {uploadedAsset ? (
                <div className="flex items-center justify-between p-3 bg-cine-900 rounded-md border border-cine-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedAsset.download_url}
                      alt="Uploaded frame"
                      className="w-12 h-12 object-cover rounded border border-cine-700"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-cine-100">{uploadedAsset.original_filename}</p>
                      <p className="text-[10px] text-cine-400 font-mono">
                        {uploadedAsset.width}x{uploadedAsset.height} px • {(uploadedAsset.file_size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gold-400 hover:underline font-mono"
                  >
                    Replace Image
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer py-6 flex flex-col items-center justify-center text-cine-400 hover:text-cine-200 transition-colors"
                >
                  <UploadCloud className="w-8 h-8 mb-2 text-teal-400" />
                  <p className="text-xs font-semibold">Click to upload conditioning start frame</p>
                  <p className="text-[10px] text-cine-500 mt-1 font-mono">PNG, JPG, or WEBP (Max 50MB)</p>
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-gold-400 mt-2" />}
                </div>
              )}
            </div>
          )}

          {/* Prompt Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-cine-400">Cinematic Prompt</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateStoryboard}
                  disabled={generatingStoryboard || !prompt.trim()}
                  className="text-xs text-cine-400 hover:text-white flex items-center gap-1 font-mono transition-colors disabled:opacity-40"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-400" /> Storyboard
                </button>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={enhancing || !prompt.trim()}
                  className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-mono font-semibold transition-colors disabled:opacity-40"
                >
                  {enhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Enhance
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene: e.g. An ancient brass observatory clockwork ticking under aurora borealis, anamorphic lens, 35mm grain, volumetric light..."
              className="w-full p-3 bg-cine-900 border border-cine-700 rounded-md text-sm text-cine-100 placeholder:text-cine-600 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 leading-relaxed font-sans"
            />

            {/* Quick Inspiration Prompts */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-cine-500 uppercase tracking-wider mr-1">Inspirations:</span>
              <button
                type="button"
                onClick={() => setPrompt("Cyberpunk alley in heavy neon rain, holographic advertisements reflecting on wet asphalt, hooded runner dashing past steam vents, 35mm anamorphic lens flare, 8k")}
                className="px-2.5 py-1 rounded-md bg-cine-900 hover:bg-cine-800 text-cine-300 hover:text-gold-300 border border-cine-800 text-[11px] font-medium transition-colors"
              >
                🌧️ Neo-Tokyo Rain
              </button>
              <button
                type="button"
                onClick={() => setPrompt("Cinematic wide shot of an orbital scientific station rotating above the dense amber atmosphere of Titan, methane sea glinting under distant sunlight, 8k photorealistic")}
                className="px-2.5 py-1 rounded-md bg-cine-900 hover:bg-cine-800 text-cine-300 hover:text-gold-300 border border-cine-800 text-[11px] font-medium transition-colors"
              >
                🚀 Orbital Relay
              </button>
              <button
                type="button"
                onClick={() => setPrompt("Intimate macro shot of an elderly artisan with magnifying loupe adjusting brass escapement gears in candlelit workshop, dust motes dancing in warm light, 35mm film grain")}
                className="px-2.5 py-1 rounded-md bg-cine-900 hover:bg-cine-800 text-cine-300 hover:text-gold-300 border border-cine-800 text-[11px] font-medium transition-colors"
              >
                🕰️ Clockmaker Macro
              </button>
              <button
                type="button"
                onClick={() => setPrompt("Breathtaking FPV drone sweep descending over steaming basalt lava flows meeting the frozen Atlantic ocean, vibrant emerald aurora borealis overhead, 8k")}
                className="px-2.5 py-1 rounded-md bg-cine-900 hover:bg-cine-800 text-cine-300 hover:text-gold-300 border border-cine-800 text-[11px] font-medium transition-colors"
              >
                🌋 Icelandic Volcano
              </button>
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-cine-400">Negative Prompt (Optional)</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g. Blurry, distorted hands, morphing artifacts, low quality, oversaturated"
              className="w-full px-3 py-2 bg-cine-900 border border-cine-700 rounded-md text-xs text-cine-200 placeholder:text-cine-600 focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Model & Provider Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-cine-400">AI Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  const prov = providers.find((p) => p.provider_name === e.target.value);
                  if (prov?.models?.length > 0) {
                    setSelectedModel(prov.models[0].model_id);
                  }
                }}
                className="w-full bg-cine-900 border border-cine-700 rounded-md p-2 text-xs text-cine-200 focus:outline-none focus:border-gold-400"
              >
                {providers.map((p) => (
                  <option key={p.provider_name} value={p.provider_name}>
                    {p.provider_name.toUpperCase()} {p.is_configured ? "• Active" : "(Demo/Mock)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-cine-400">Model Architecture</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-cine-900 border border-cine-700 rounded-md p-2 text-xs text-cine-200 focus:outline-none focus:border-gold-400"
              >
                {currentProviderObj?.models?.map((m: any) => (
                  <option key={m.model_id} value={m.model_id}>
                    {m.display_name} (${m.cost_per_second_usd}/s)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aspect Ratio, Duration & Resolution Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-cine-400">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-cine-900 border border-cine-700 rounded-md p-2 text-xs text-cine-200 focus:outline-none focus:border-gold-400"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Vertical</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-cine-400">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-cine-900 border border-cine-700 rounded-md p-2 text-xs text-cine-200 focus:outline-none focus:border-gold-400"
              >
                <option value={5}>5 Seconds</option>
                <option value={10}>10 Seconds</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-cine-400">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-cine-900 border border-cine-700 rounded-md p-2 text-xs text-cine-200 focus:outline-none focus:border-gold-400"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p FHD</option>
              </select>
            </div>
          </div>

          {/* Cost Estimate & Generate Button */}
          <div className="p-4 rounded-lg bg-cine-900 border border-cine-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cine-400 uppercase block">Estimated Cost:</span>
              <span className="text-lg font-bold font-mono text-gold-400">${estimatedCost.toFixed(3)} USD</span>
              <span className="text-[10px] text-cine-500 block font-mono">Transparent catalog calculation</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={submitting || (activeGeneration && !["SUCCEEDED", "FAILED", "CANCELLED"].includes(activeGeneration.status))}
              className="w-full sm:w-auto px-8 py-3 rounded-md bg-gold-500 hover:bg-gold-400 text-cine-950 font-bold text-sm tracking-wide shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enqueueing Job...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Generate Video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Stage & Real-time Progress (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-cine-800 bg-cine-900/90 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-cine-850 border-b border-cine-800 flex items-center justify-between">
              <span className="text-xs font-mono text-cine-300 font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-teal-400" /> Output Monitor
              </span>
              {activeGeneration && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    activeGeneration.status === "SUCCEEDED"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : activeGeneration.status === "FAILED"
                      ? "bg-red-950 text-red-400 border border-red-800"
                      : "bg-cine-800 text-gold-400 border border-cine-700 animate-pulse"
                  }`}
                >
                  {activeGeneration.status}
                </span>
              )}
            </div>

            <div className="p-6 flex flex-col items-center justify-center min-h-[340px] text-center">
              {activeGeneration ? (
                <div className="w-full space-y-4">
                  {/* Progress Bar if processing */}
                  {!["SUCCEEDED", "FAILED", "CANCELLED"].includes(activeGeneration.status) && (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400 animate-spin">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-cine-100">Synthesizing Video...</p>
                      <p className="text-xs text-cine-400 font-mono">
                        Job: {activeGeneration.provider_job_id || activeGeneration.id.slice(0, 8)}
                      </p>

                      <div className="w-full bg-cine-950 rounded-full h-2 border border-cine-800 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-gold-500 to-teal-400 h-full transition-all duration-500"
                          style={{ width: `${activeGeneration.progress_percent || 25}%` }}
                        />
                      </div>

                      <button
                        onClick={handleCancel}
                        className="text-xs text-red-400 hover:text-red-300 font-mono underline pt-2"
                      >
                        Cancel Task
                      </button>
                    </div>
                  )}

                  {/* Succeeded Video Player */}
                  {activeGeneration.status === "SUCCEEDED" && (
                    <div className="space-y-4">
                      <div className="rounded-lg overflow-hidden border border-cine-700 bg-black aspect-video relative">
                        <video
                          controls
                          autoPlay
                          loop
                          className="w-full h-full object-cover"
                          src={getVideoAssetUrl(activeGeneration.owner_id, activeGeneration.id)}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono p-2 bg-cine-950 rounded border border-cine-800">
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Generation Complete
                        </span>
                        <a
                          href={getVideoAssetUrl(activeGeneration.owner_id, activeGeneration.id)}
                          download={`cineforge_${activeGeneration.id.slice(0, 8)}.mp4`}
                          className="px-3 py-1 bg-gold-500 hover:bg-gold-400 text-cine-950 rounded font-bold flex items-center gap-1 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Download MP4
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Failed State */}
                  {activeGeneration.status === "FAILED" && (
                    <div className="space-y-2 text-red-400">
                      <AlertCircle className="w-10 h-10 mx-auto" />
                      <p className="text-sm font-semibold">Generation Failed</p>
                      <p className="text-xs text-cine-400 max-w-xs mx-auto">
                        {activeGeneration.safe_error_message || "External provider encountered an error."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-cine-500">
                  <Play className="w-12 h-12 mx-auto stroke-1 text-cine-600" />
                  <p className="text-sm font-medium text-cine-400">Ready for Synthesis</p>
                  <p className="text-xs max-w-xs">
                    Configure your scene prompt and click Generate Video to launch the rendering queue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Storyboard Card if generated */}
          {storyboardResult && (
            <div className="p-4 rounded-lg border border-cine-800 bg-cine-900/60 space-y-3">
              <h4 className="text-xs font-mono uppercase text-teal-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Synthesized 3-Scene Storyboard
              </h4>
              <div className="space-y-2 text-xs">
                {storyboardResult.scenes.map((sc: any) => (
                  <div key={sc.scene_number} className="p-2.5 rounded bg-cine-950 border border-cine-800 text-left">
                    <span className="text-gold-400 font-semibold block">{sc.title}</span>
                    <p className="text-cine-300 mt-1">{sc.visual_prompt}</p>
                    <div className="flex gap-3 text-[10px] text-cine-500 mt-1 font-mono">
                      <span>Camera: {sc.camera_direction}</span>
                      <span>Lighting: {sc.lighting}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateStudioPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-cine-400 font-mono text-sm">Loading Studio Workspace...</div>}>
      <CreateStudioContent />
    </React.Suspense>
  );
}

