"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { useProjectDetailsQuery } from "@/features/projects/hooks/useProjects";
import { useFormsQuery, useDeleteFormMutation } from "@/features/forms/hooks/useForms";
import { useTemplatesQuery, useCreateTemplateMutation, useDeleteTemplateMutation } from "@/features/templates/hooks/useTemplates";
import SubmissionsPanel from "@/features/submissions/components/SubmissionsPanel";
import { toast } from "sonner";

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Active Tab state — reads initial value from ?tab= query param
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "forms" | "templates" | "submissions") ?? "forms";
  const [activeTab, setActiveTab] = useState<"forms" | "templates" | "submissions">(initialTab);

  // Project Details
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjectDetailsQuery(id);

  // Forms listing and deletion
  const { data: forms, isLoading: isFormsLoading } = useFormsQuery(id);
  const deleteFormMutation = useDeleteFormMutation();
  const [formToDelete, setFormToDelete] = useState<{ id: string; name: string } | null>(null);

  // Templates listing, creation, and deletion
  const { data: templates, isLoading: isTemplatesLoading } = useTemplatesQuery(id);
  const createTemplateMutation = useCreateTemplateMutation();
  const deleteTemplateMutation = useDeleteTemplateMutation();
  
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);

  // Copy Link helpers
  const handleCopyLinkClick = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const publicUrl = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public form link copied to clipboard!");
  };

  // Form deletion triggers
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

  // Template deletion triggers
  const handleDeleteTemplateClick = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToDelete({ id: templateId, name: templateName });
  };

  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplateMutation.mutateAsync({ projectId: id, templateId: templateToDelete.id });
      toast.success(`Template "${templateToDelete.name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template");
      console.error("Failed to delete template:", err);
    } finally {
      setTemplateToDelete(null);
    }
  };

  // Template background R2 uploading and database registration
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTemplateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (!newTemplateFile) {
      toast.error("Background image file is required");
      return;
    }

    // Size limit: 5MB
    if (newTemplateFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setIsUploadingBackground(true);
    try {
      // 1. Request presigned URL from templates API
      const presignRes = await fetch(`/api/projects/${id}/templates/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: newTemplateFile.name,
          contentType: newTemplateFile.type,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate presigned upload link");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2. Direct PUT binary payload to S3/R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": newTemplateFile.type,
        },
        body: newTemplateFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload background image to storage");
      }

      // 3. Save template record in PostgreSQL
      await createTemplateMutation.mutateAsync({
        projectId: id,
        input: {
          name: newTemplateName.trim(),
          backgroundImageUrl: publicUrl,
        },
      });

      toast.success("Graphic template created successfully!");
      setIsCreateTemplateOpen(false);
      setNewTemplateName("");
      setNewTemplateFile(null);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.error("Create template error:", err);
    } finally {
      setIsUploadingBackground(false);
    }
  };

  // Loading skeleton layout
  if (!isLoaded || isProjectLoading) {
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

  // Auth Guard
  if (isLoaded && !user) {
    router.push("/sign-in");
    return null;
  }

  if (isProjectError || !project) {
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

      {/* Main Body */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Header Back & Info */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="group flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors cursor-pointer"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Dashboard
          </button>

          <div className="border-b border-zinc-200/65 dark:border-zinc-800/80 pb-6">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark leading-tight">
              {project.name}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base mt-2 max-w-3xl leading-relaxed">
              {project.description || "No description provided for this workspace."}
            </p>
          </div>
        </div>

        {/* Tab Headers Navigation */}
        <div className="border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-6">
          <button
            onClick={() => setActiveTab("forms")}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "forms"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            }`}
          >
            <span>📋</span> Forms
            {forms && (
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold text-text-secondary-light">
                {forms.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "templates"
                ? "border-brand-secondary text-brand-secondary"
                : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            }`}
          >
            <span>🎨</span> Graphic Templates
            {templates && (
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold text-text-secondary-light">
                {templates.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "submissions"
                ? "border-brand-accent text-brand-accent"
                : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            }`}
          >
            <span>📥</span> Submissions
          </button>
        </div>

        {/* Tab Workspace Panels */}
        <div className="py-2">
          
          {/* FORMS TAB */}
          {activeTab === "forms" && (
            <div className="space-y-6">
              {isFormsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="h-44 bg-zinc-150 dark:bg-zinc-800/60 rounded-card animate-pulse" />
                  <div className="h-44 bg-zinc-150 dark:bg-zinc-800/60 rounded-card animate-pulse" />
                </div>
              ) : forms && forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => (
                    <div
                      key={form.id}
                      onClick={() => router.push(`/dashboard/projects/${id}/forms/${form.id}`)}
                      className="group border border-zinc-200/60 dark:border-zinc-800/50 bg-white dark:bg-surface-dark rounded-card p-6 flex flex-col justify-between hover:border-brand-primary/45 hover:shadow-md transition-all cursor-pointer min-h-[180px] shadow-sm relative overflow-hidden"
                    >
                      {/* Gradient Hover Edge indicator */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">📋</span>
                          <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary rounded-full px-2.5 py-0.5 whitespace-nowrap">
                            {(form.schemaJson?.fields || []).length} fields
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark group-hover:text-brand-primary transition-colors truncate">
                          {form.name}
                        </h3>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs truncate">
                          {form.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-6">
                        <span className="text-[10px] text-text-muted-light">
                          Created {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopyLinkClick(form.id, e)}
                            title="Copy public link"
                            className="p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer text-sm"
                          >
                            🔗
                          </button>
                          <button
                            onClick={(e) => handleDeleteFormClick(form.id, form.name, e)}
                            title="Delete form"
                            className="p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer text-sm text-zinc-400"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Build Form trigger card */}
                  <div
                    onClick={() => router.push(`/dashboard/projects/${id}/forms/new`)}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 hover:border-brand-primary/60 rounded-card flex flex-col items-center justify-center p-8 transition-colors cursor-pointer text-center min-h-[180px] bg-zinc-50/20 dark:bg-zinc-900/10 group"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                    <h3 className="font-heading font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">
                      Build Dynamic Form
                    </h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1 max-w-[200px]">
                      Collect details and photos from your community.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-card bg-white dark:bg-surface-dark space-y-4">
                  <span className="text-4xl">📋</span>
                  <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                    No Forms Built Yet
                  </h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mx-auto leading-relaxed">
                    Create dynamic custom forms to collect information from external users.
                  </p>
                  <button
                    onClick={() => router.push(`/dashboard/projects/${id}/forms/new`)}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-sm shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    Build Dynamic Form
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              {isTemplatesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="h-48 bg-zinc-150 dark:bg-zinc-800/60 rounded-card animate-pulse" />
                  <div className="h-48 bg-zinc-150 dark:bg-zinc-800/60 rounded-card animate-pulse" />
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="group border border-zinc-200/60 dark:border-zinc-800/50 bg-white dark:bg-surface-dark rounded-card overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      {/* Image Preview */}
                      <div className="aspect-[4/3] w-full relative bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-850 overflow-hidden">
                        <img
                          src={template.backgroundImageUrl}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>

                      {/* Info & Footer */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-heading font-bold text-base text-text-primary-light dark:text-text-primary-dark truncate" title={template.name}>
                            {template.name}
                          </h3>
                          <button
                            onClick={(e) => handleDeleteTemplateClick(template.id, template.name, e)}
                            title="Delete template"
                            className="p-1.5 rounded hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 border border-transparent transition-all cursor-pointer text-sm"
                          >
                            🗑️
                          </button>
                        </div>

                        <button
                          onClick={() => router.push(`/dashboard/projects/${id}/templates/${template.id}`)}
                          className="w-full py-2 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30 rounded-button text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>🎨 Edit Canvas</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Create Template Trigger Card */}
                  <div
                    onClick={() => setIsCreateTemplateOpen(true)}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 hover:border-brand-secondary/60 rounded-card flex flex-col items-center justify-center p-8 transition-colors cursor-pointer text-center min-h-[220px] bg-zinc-50/20 dark:bg-zinc-900/10 group"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                    <h3 className="font-heading font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">
                      Create Graphic Template
                    </h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1 max-w-[200px]">
                      Upload background graphics and position field overlays.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-card bg-white dark:bg-surface-dark space-y-4">
                  <span className="text-4xl">🎨</span>
                  <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                    No Templates Configured
                  </h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mx-auto leading-relaxed">
                    Create reusable design templates by uploading custom morning sunrise backdrops.
                  </p>
                  <button
                    onClick={() => setIsCreateTemplateOpen(true)}
                    className="px-5 py-2.5 bg-brand-secondary hover:bg-brand-secondary/95 text-white font-semibold rounded-button text-sm shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    + Create Template
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === "submissions" && (
            <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 md:p-8">
              <SubmissionsPanel projectId={id} />
            </div>
          )}
        </div>
      </main>

      {/* FORM DELETE CONFIRMATION DIALOG */}
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

      {/* TEMPLATE DELETE CONFIRMATION DIALOG */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-lg p-6 max-w-sm w-full mx-4 space-y-6">
            <div className="space-y-2 text-left">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Delete Graphic Template
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Are you sure you want to delete the template <strong className="text-brand-secondary">"{templateToDelete.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTemplate}
                disabled={deleteTemplateMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-button text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {deleteTemplateMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {isCreateTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/85 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Create New Template
              </h3>
              <button
                onClick={() => {
                  setIsCreateTemplateOpen(false);
                  setNewTemplateName("");
                  setNewTemplateFile(null);
                }}
                className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate}>
              <div className="p-6 space-y-6">
                {/* Template Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark" htmlFor="template-name">
                    Template Name
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    required
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g. Rise and Shine Backdrop"
                    className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
                  />
                </div>

                {/* Drag-and-drop Image Upload Zone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Background Graphic Image
                  </label>
                  
                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-zinc-50/30 dark:bg-zinc-900/10 hover:border-brand-secondary/40 transition-colors text-center relative group">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setNewTemplateFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {newTemplateFile ? (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-emerald-500 flex items-center justify-center gap-1.5">
                          ✓ Ready to Upload
                        </div>
                        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium truncate max-w-[280px] mx-auto">
                          {newTemplateFile.name} ({(newTemplateFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                        <div className="text-[10px] text-text-muted-light">
                          Click or drag to change file
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-3xl block group-hover:scale-108 transition-transform">🖼️</span>
                        <div className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                          Upload Background Image
                        </div>
                        <div className="text-xs text-text-muted-light">
                          Drag & drop or browse (max 5MB, PNG/JPEG)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4.5 border-t border-zinc-150 dark:border-zinc-800/85 bg-zinc-50/50 dark:bg-zinc-900/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateTemplateOpen(false);
                    setNewTemplateName("");
                    setNewTemplateFile(null);
                  }}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBackground}
                  className="px-5 py-2 bg-brand-secondary hover:bg-brand-secondary/95 text-white font-semibold rounded-button text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUploadingBackground ? "Uploading Background..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
