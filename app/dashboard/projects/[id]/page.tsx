"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { useProjectDetailsQuery } from "@/features/projects/hooks/useProjects";
import { useFormsQuery, useDeleteFormMutation } from "@/features/forms/hooks/useForms";
import { toast } from "sonner";

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Query details
  const { data: project, isLoading, isError } = useProjectDetailsQuery(id);

  // Forms listing and deletion
  const { data: forms, isLoading: isFormsLoading } = useFormsQuery(id);
  const deleteFormMutation = useDeleteFormMutation();

  // Custom modal delete confirmation state
  const [formToDelete, setFormToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteFormClick = (formId: string, formName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormToDelete({ id: formId, name: formName });
  };

  const handleConfirmDeleteForm = async () => {
    if (!formToDelete) return;
    try {
      await deleteFormMutation.mutateAsync({ projectId: id, formId: formToDelete.id });
      toast.success(`Form "${formToDelete.name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete form");
      console.error("Failed to delete form:", err);
    } finally {
      setFormToDelete(null);
    }
  };

  const handleCopyLinkClick = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const publicUrl = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public form link copied to clipboard!");
  };

  if (!isLoaded || isLoading) {
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
        </main>
      </div>
    );
  }

  // Guard redirect handled on client if session is empty
  if (isLoaded && !user) {
    router.push("/sign-in");
    return null;
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-brand-error/10 rounded-2xl flex items-center justify-center text-brand-error text-3xl mb-6">
          ⚠️
        </div>
        <h2 className="font-heading font-semibold text-2xl text-text-primary-light dark:text-text-primary-dark mb-2">
          Project Not Found
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mb-8 leading-relaxed">
          The project workspace you are trying to view does not exist or you do not have permission to access it.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button shadow-card hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

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
            <div className="hidden sm:flex items-center gap-3">
              <a
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors"
              >
                Dashboard
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-full">
                {project.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Body Content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-10">
        {/* Back Link & Header */}
        <button
          onClick={() => router.push("/dashboard")}
          className="group flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary mb-6 transition-colors cursor-pointer"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Dashboard
        </button>

        <div className="border-b border-zinc-200/65 dark:border-zinc-800/80 pb-8 mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark leading-tight">
            {project.name}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-base mt-2 max-w-3xl leading-relaxed">
            {project.description || "No description provided for this workspace."}
          </p>
        </div>

        {/* Feature Sections Grid (Upcoming Phases placeholders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Forms */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow min-h-[380px]">
            <div className="space-y-4 w-full flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-xl">
                    📋
                  </div>
                  <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                    Dynamic Forms
                  </h3>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/projects/${id}/forms/new`)}
                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-xs shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  + Build Form
                </button>
              </div>
              
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                Build forms to collect name, details, and pictures from your community. View, edit, or delete schemas.
              </p>

              {/* Dynamic Forms List */}
              <div className="flex-1 flex flex-col justify-center min-h-[150px]">
                {isFormsLoading ? (
                  <div className="space-y-3">
                    <div className="h-12 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded-lg" />
                    <div className="h-12 bg-zinc-150 dark:bg-zinc-800 animate-pulse rounded-lg" />
                  </div>
                ) : forms && forms.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {forms.map((form) => (
                      <div
                        key={form.id}
                        onClick={() => router.push(`/dashboard/projects/${id}/forms/${form.id}`)}
                        className="p-3 border border-zinc-200/60 dark:border-zinc-800/50 bg-zinc-55/20 dark:bg-zinc-900/30 rounded-lg hover:border-brand-primary/45 transition-colors cursor-pointer group/item flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark truncate group-hover/item:text-brand-primary transition-colors">
                            {form.name}
                          </div>
                          <div className="text-xs text-text-muted-light truncate">
                            {form.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold bg-brand-primary/10 text-brand-primary rounded-full px-2 py-0.5 whitespace-nowrap">
                            {(form.schemaJson?.fields || []).length} fields
                          </span>
                          <button
                            onClick={(e) => handleCopyLinkClick(form.id, e)}
                            title="Copy public link"
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer text-sm"
                          >
                            🔗
                          </button>
                          <button
                            onClick={(e) => handleDeleteFormClick(form.id, form.name, e)}
                            title="Delete form"
                            className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-text-muted-light text-sm flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/30 dark:bg-zinc-900/10">
                    <span>📋</span>
                    <span>No forms built yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Templates */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-brand-secondary/10 rounded-xl flex items-center justify-center text-brand-secondary text-xl">
                  🎨
                </div>
                <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Phase 7 & 8
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                Graphic Templates
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                Upload background templates and drag-and-drop placeholder layout coordinates on a visual canvas.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-button text-sm font-semibold mt-6 cursor-not-allowed text-left flex items-center justify-between">
              <span>Template Canvas</span>
              <span>🔒 Locked</span>
            </button>
          </div>

          {/* Card 3: Submissions */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent text-xl">
                  📥
                </div>
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                Form Submissions
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                Inspect information and images submitted by users. Filter, search, and delete responses.
              </p>
            </div>
            <button
              onClick={() => router.push(`/dashboard/projects/${id}/submissions`)}
              className="px-5 py-2.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent font-semibold rounded-button text-sm mt-6 transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>View Responses</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 4: Generated Graphics */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 text-xl">
                  ⚡
                </div>
                <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Phase 9 & 10
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                Generated Graphics
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                Render and download the generated images automatically using Satori/Resvg creative engine.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-button text-sm font-semibold mt-6 cursor-not-allowed text-left flex items-center justify-between">
              <span>Download Center</span>
              <span>🔒 Locked</span>
            </button>
          </div>
        </div>
      </main>

      {/* Custom Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-lg p-6 max-w-sm w-full mx-4 space-y-6">
            <div className="space-y-2 text-left">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Delete Form Template
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Are you sure you want to delete the form <strong className="text-brand-primary">"{formToDelete.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFormToDelete(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteForm}
                disabled={deleteFormMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-button text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {deleteFormMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
