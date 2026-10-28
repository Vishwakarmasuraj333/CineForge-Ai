"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { FolderKanban, Plus, Trash2, Calendar, FileText, Check, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = () => {
    api.projects.list().then((res) => {
      setProjects(res.items);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await api.projects.create({ title: newTitle.trim(), description: newDesc.trim() || undefined });
      setNewTitle("");
      setNewDesc("");
      setIsCreating(false);
      loadProjects();
    } catch (err) {
      // Error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.projects.delete(id);
      loadProjects();
    } catch (err) {
      // Error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cine-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-gold-400" /> Video Projects
          </h1>
          <p className="text-xs text-cine-400 mt-1">Organize your creative productions and asset timelines</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-cine-950 font-bold text-xs tracking-wide rounded-md shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Creation Modal / Card */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 rounded-lg border border-gold-500/40 bg-cine-900 space-y-4 shadow-xl">
          <h3 className="text-sm font-semibold text-white">Create New Video Project</h3>
          <div className="space-y-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Project Title (e.g. Blade Runner Reimagined)"
              className="w-full p-2.5 bg-cine-950 border border-cine-700 rounded-md text-xs text-cine-100 focus:outline-none focus:border-gold-400"
            />
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Project synopsis or creative notes..."
              className="w-full p-2.5 bg-cine-950 border border-cine-700 rounded-md text-xs text-cine-100 focus:outline-none focus:border-gold-400"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-cine-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-cine-950 font-bold text-xs rounded-md shadow"
            >
              {submitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-lg border border-cine-800 bg-cine-900/60 flex flex-col justify-between space-y-4 hover:border-cine-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cine-950 text-teal-400 border border-cine-800">
                  {proj.status}
                </span>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="text-cine-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-white">{proj.title}</h3>
              <p className="text-xs text-cine-400 line-clamp-2">
                {proj.description || "No project description."}
              </p>
            </div>

            <div className="pt-3 border-t border-cine-800/80 flex items-center justify-between text-[10px] font-mono text-cine-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(proj.created_at).toLocaleDateString()}
              </span>
              <span>ID: {proj.id.slice(0, 8)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

