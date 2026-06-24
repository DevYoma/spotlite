"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import ProjectDialog from "@/features/projects/components/ProjectDialog";
import { useProjectsQuery, useDeleteProjectMutation } from "@/features/projects/hooks/useProjects";
import { ProjectResponse } from "@/lib/api/modules/projects/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectResponse | null>(null);

  // Queries & Mutations
  const { data: projects, isLoading, isError } = useProjectsQuery();
  const deleteMutation = useDeleteProjectMutation();

  // Custom modal delete confirmation state
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300 flex flex-col">
        {/* Skeleton Nav */}
        <nav className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-surface-dark">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
              <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            </div>
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full" />
          </div>
        </nav>

        {/* Skeleton Body */}
        <main className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-10 flex-1 flex flex-col gap-8">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-card" />
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-card" />
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-card" />
          </div>
        </main>
      </div>
    );
  }

  // Guard redirect handled on client if session is empty
  if (isLoaded && !user) {
    router.push("/sign-in");
    return null;
  }

  const handleCreateClick = () => {
    setProjectToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (project: ProjectResponse, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    setProjectToEdit(project);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    setDeleteConfirmName("");
    setProjectToDelete({ id, name });
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteMutation.mutateAsync(projectToDelete.id);
      toast.success(`Project "${projectToDelete.name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
      console.error("Failed to delete project:", err);
    } finally {
      setProjectToDelete(null);
      setDeleteConfirmName("");
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-surface-dark shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
                S
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-text-primary-light dark:text-text-primary-dark">
                Spotlite
              </span>
            </a>
            <div className="hidden sm:flex items-center gap-1">
              <a
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-full"
              >
                Dashboard
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted-light hidden sm:inline">
              Signed in as <strong className="text-text-primary-light dark:text-text-primary-dark">{user.emailAddresses[0]?.emailAddress}</strong>
            </span>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Welcome back, {user.firstName || "Creator"}!
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
              Manage your projects, designs, and templates.
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button shadow-card hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer"
          >
            + New Project
          </button>
        </div>

        {isError && (
          <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error rounded-xl text-sm mb-6">
            Failed to load projects. Please try refreshing.
          </div>
        )}

        {/* Projects Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-card" />
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-card" />
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-card" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark group-hover:text-brand-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClick(project, e)}
                        title="Edit project"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(project.id, project.name, e)}
                        title="Delete project"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm line-clamp-3 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-6 flex items-center justify-between text-xs text-text-muted-light">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-brand-primary group-hover:underline">Open Workspace →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card py-20 px-6 text-center max-w-2xl mx-auto">
            <div className="h-16 w-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary text-3xl mx-auto mb-6">
              📂
            </div>
            <h2 className="font-heading font-semibold text-2xl text-text-primary-light dark:text-text-primary-dark mb-2">
              No Projects Yet
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Create your first project workspace to start building custom forms and generating automated social graphics.
            </p>
            <button
              onClick={handleCreateClick}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button shadow-card hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              Create Project
            </button>
          </div>
        )}
      </main>

      {/* Project Create/Edit Modal */}
      <ProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        projectToEdit={projectToEdit}
      />

      {/* Custom Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-lg p-6 max-w-sm w-full mx-4 space-y-6">
            <div className="space-y-3 text-left">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Delete Project
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                This will permanently delete all forms, templates, and submissions in <strong className="text-brand-primary font-semibold">"{projectToDelete.name}"</strong>. This action cannot be undone.
              </p>
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted-light block">
                  Type the project name to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={projectToDelete.name}
                  className="w-full px-3 py-2 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-55/20 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setProjectToDelete(null);
                  setDeleteConfirmName("");
                }}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteProject}
                disabled={deleteMutation.isPending || deleteConfirmName !== projectToDelete.name}
                className="px-4 py-2 bg-red-500 hover:bg-red-650 hover:bg-red-600 active:scale-98 text-white rounded-button text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
