"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  FolderKanban,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Film
} from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Project State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit Project State
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Delete Project Modal State
  const [deletingProject, setDeletingProject] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProjects = () => {
    api.projects
      .list()
      .then((res) => {
        setProjects(res.items);
        setLoading(false);
      })
      .catch(() => {
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
      await api.projects.create({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setNewTitle("");
      setNewDesc("");
      setIsCreating(false);
      showToast("Project created successfully!");
      loadProjects();
    } catch (err: any) {
      showToast(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editTitle.trim()) return;
    setSubmitting(true);
    try {
      await api.projects.update(editingProject.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
      });
      setEditingProject(null);
      showToast("Project updated successfully!");
      loadProjects();
    } catch (err: any) {
      showToast(err.message || "Failed to update project");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await api.projects.delete(deletingProject.id);
      setDeletingProject(null);
      showToast(`Deleted "${deletingProject.title}" successfully.`);
      loadProjects();
    } catch (err: any) {
      showToast(err.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cine-900 via-cine-900/95 to-cine-850 p-6 sm:p-8 border border-cine-800 shadow-xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono font-medium mb-3">
            <FolderKanban className="w-3.5 h-3.5" />
            TIMELINE & WORKSPACE DIRECTORY
          </div>
          <h1 className="text-3xl font-extrabold text-cine-100 tracking-tight">
            Video Projects
          </h1>
          <p className="mt-1 text-cine-400 text-sm max-w-xl">
            Organize your film productions, manage multi-scene assets, and launch camera shot rendering.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-xs rounded-xl shadow-lg shadow-gold-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-cine-900/90 border border-gold-500/40 text-gold-300 text-sm shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg p-6 rounded-2xl border border-cine-700 bg-cine-900 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-cine-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold-400" /> Create New Video Project
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-cine-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Neo-Tokyo Cyberpunk Chronicles"
                  className="w-full p-3 bg-cine-950 border border-cine-800 rounded-xl text-sm text-cine-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1.5">
                  Description / Synopsis (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Notes on visual theme, character continuity, or camera directions..."
                  className="w-full p-3 bg-cine-950 border border-cine-800 rounded-xl text-sm text-cine-100 focus:outline-none focus:border-gold-500 resize-none font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-medium text-cine-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-lg p-6 rounded-2xl border border-cine-700 bg-cine-900 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-cine-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-gold-400" /> Edit Project Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="text-cine-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 bg-cine-950 border border-cine-800 rounded-xl text-sm text-cine-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cine-400 uppercase tracking-wider mb-1.5">
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-3 bg-cine-950 border border-cine-800 rounded-xl text-sm text-cine-100 focus:outline-none focus:border-gold-500 resize-none font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-xs font-medium text-cine-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-gold-500 to-ember-500 hover:from-gold-400 hover:to-ember-400 text-cine-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal (Real in-app modal, replaces window.confirm) */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-rose-500/40 bg-cine-900 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Project</h3>
                <p className="text-xs text-cine-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-cine-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deletingProject.title}"</strong>? The project record will be removed from your active studio workspace.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 text-xs font-medium text-cine-300 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-cine-400 text-sm font-mono flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
          Loading productions...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cine-800 bg-cine-900/40 p-12 text-center space-y-4">
          <FolderKanban className="w-12 h-12 text-cine-700 mx-auto" />
          <h3 className="text-lg font-bold text-cine-200">No Projects Found</h3>
          <p className="text-xs text-cine-400 max-w-sm mx-auto">
            You don't have any active projects yet. Create a project to organize your video generation prompts and timelines.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-ember-500 text-cine-950 font-bold text-xs rounded-xl shadow-md"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl border border-cine-800 bg-cine-900/80 hover:border-gold-500/40 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {proj.status}
                  </span>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(proj);
                        setEditTitle(proj.title);
                        setEditDesc(proj.description || "");
                      }}
                      className="p-1.5 rounded-lg text-cine-400 hover:text-white hover:bg-cine-800 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProject(proj)}
                      className="p-1.5 rounded-lg text-cine-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-cine-400 line-clamp-3 leading-relaxed">
                  {proj.description || "No project description provided."}
                </p>
              </div>

              <div className="pt-4 border-t border-cine-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-cine-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cine-500" />
                    {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                  <span>ID: {proj.id.slice(0, 8)}</span>
                </div>

                {/* Open in Studio CTA */}
                <Link
                  href={`/create?projectId=${proj.id}`}
                  className="w-full py-2 rounded-xl bg-cine-800 hover:bg-cine-750 text-cine-200 hover:text-white text-xs font-bold border border-cine-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5 text-gold-400" />
                  Open in Studio
                  <ArrowRight className="w-3 h-3 text-cine-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
