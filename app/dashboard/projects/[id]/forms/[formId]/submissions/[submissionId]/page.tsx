"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { useProjectDetailsQuery } from "@/features/projects/hooks/useProjects";
import { useFormDetailsQuery } from "@/features/forms/hooks/useForms";
import { useSubmissionQuery } from "@/features/submissions/hooks/useSubmissions";
import { useTemplatesQuery } from "@/features/templates/hooks/useTemplates";
import {
  useGenerateMutation,
  useGeneratedImagesQuery,
  useDeleteGeneratedImageMutation,
} from "@/features/image-generation/hooks/useImageGeneration";
import { toast } from "sonner";

export default function SubmissionDetailsPage() {
  const { id: projectId, formId, submissionId } = useParams() as {
    id: string;
    formId: string;
    submissionId: string;
  };

  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Queries
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } =
    useProjectDetailsQuery(projectId);

  const { data: form, isLoading: isFormLoading, isError: isFormError } =
    useFormDetailsQuery(projectId, formId);

  const { data: submission, isLoading: isSubmissionLoading, isError: isSubmissionError } =
    useSubmissionQuery(projectId, formId, submissionId);

  const { data: templates = [], isLoading: isTemplatesLoading } =
    useTemplatesQuery(projectId);

  const { data: generatedImages = [], isLoading: isGraphicsLoading } =
    useGeneratedImagesQuery(projectId, submissionId);

  // Mutations
  const generateMutation = useGenerateMutation(projectId);
  const deleteMutation = useDeleteGeneratedImageMutation(projectId);

  // State
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  // Pre-select linked template or first available template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      const preselected = templates.find((t) => t.id === form?.linkedTemplateId) || templates[0];
      setSelectedTemplateId(preselected.id);
    }
  }, [templates, form?.linkedTemplateId, selectedTemplateId]);

  // Auth & loading check
  if (!isLoaded || isProjectLoading || isFormLoading || isSubmissionLoading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoaded && !user) {
    router.push("/sign-in");
    return null;
  }

  if (isProjectError || isFormError || isSubmissionError || !project || !form || !submission) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="font-heading font-semibold text-2xl text-text-primary-light dark:text-text-primary-dark mb-2">
          Submission Not Found
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mb-6 leading-relaxed">
          The project, form, or submission details you are trying to view do not exist or you do not have permissions to access them.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button shadow-card transition-all cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const activeFields = form.schemaJson?.fields || [];
  const generatedGraphic = generatedImages[0]; // limit to 1 graphic for MVP

  const handleGenerate = async () => {
    if (!selectedTemplateId) return;
    try {
      await generateMutation.mutateAsync({
        submissionId: submission.id,
        templateId: selectedTemplateId,
      });
      toast.success("Graphic generated successfully!");
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    try {
      await deleteMutation.mutateAsync({ imageId: imageToDelete, submissionId: submission.id });
      toast.success("Graphic deleted");
    } catch {
      toast.error("Failed to delete graphic");
    } finally {
      setImageToDelete(null);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `graphic-${submission.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  // Find a name for breadcrumbs reference
  const nameField = activeFields.find(
    (f) => f.type === "text" && f.label.toLowerCase().includes("name")
  );
  const submissionName = nameField
    ? String(submission.dataJson[nameField.id] || "Details")
    : "Response Details";

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
              <a
                href={`/dashboard/projects/${projectId}`}
                className="px-3 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors"
              >
                {project.name}
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <a
                href={`/dashboard/projects/${projectId}?tab=submissions`}
                className="px-3 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors"
              >
                Submissions
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-full truncate max-w-[150px]">
                {submissionName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 space-y-8 text-left">
        <button
          onClick={() => router.push(`/dashboard/projects/${projectId}?tab=submissions`)}
          className="group flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors cursor-pointer"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Submissions
        </button>

        <div className="border-b border-zinc-200/65 dark:border-zinc-800/80 pb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Submission Details
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">
            Submitted at {new Date(submission.createdAt).toLocaleString()} for form:{" "}
            <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {form.name}
            </span>
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form responses card */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 md:p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg border-b border-zinc-150 dark:border-zinc-800 pb-3 text-text-primary-light dark:text-text-primary-dark">
              User Answers
            </h2>
            <div className="space-y-6">
              {activeFields.map((field) => {
                const val = submission.dataJson[field.id];
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted-light block">
                      {field.label}
                    </label>

                    {field.type === "image" ? (
                      val ? (
                        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900/50 max-h-[300px] flex items-center justify-center relative group">
                          <img
                            src={val}
                            alt={field.label}
                            className="max-h-[300px] w-full object-contain"
                          />
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-black/75 backdrop-blur-sm transition-all"
                          >
                            Open Original ↗
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm italic text-text-muted-light block py-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center bg-zinc-50/20 dark:bg-zinc-900/10">
                          No image uploaded
                        </span>
                      )
                    ) : field.type === "textarea" ? (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/85 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap leading-relaxed">
                        {val !== undefined && val !== null && String(val).trim() !== ""
                          ? String(val)
                          : "-"}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/85 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
                        {val !== undefined && val !== null && String(val).trim() !== ""
                          ? String(val)
                          : "-"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graphic Generation card */}
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 md:p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg border-b border-zinc-150 dark:border-zinc-800 pb-3 text-text-primary-light dark:text-text-primary-dark">
              Branded Graphic
            </h2>

            {isGraphicsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-text-muted-light">Loading graphic status...</span>
              </div>
            ) : generatedGraphic ? (
              <div className="space-y-6">
                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-card overflow-hidden shadow-sm group">
                  <img
                    src={generatedGraphic.imageUrl}
                    alt="Generated branded graphic"
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(generatedGraphic.imageUrl)}
                      className="px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-button text-sm font-semibold transition-all shadow-md cursor-pointer"
                    >
                      Download PNG
                    </button>
                    <button
                      onClick={() => setImageToDelete(generatedGraphic.id)}
                      className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-button text-sm font-semibold transition-all shadow-md cursor-pointer"
                    >
                      Delete Graphic
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleDownload(generatedGraphic.imageUrl)}
                    className="flex-1 px-5 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>⬇</span> Download Graphic
                  </button>
                  <button
                    onClick={() => setImageToDelete(generatedGraphic.id)}
                    className="px-5 py-3 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/20 font-semibold rounded-button text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>✕</span> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-card space-y-5 bg-zinc-50/20 dark:bg-zinc-900/10">
                <span className="text-4xl block">🎨</span>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-text-primary-light dark:text-text-primary-dark">
                    No Graphic Generated
                  </h3>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-xs mx-auto">
                    Transform this raw submission data into a beautifully structured branded graphic.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-button text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  Generate Graphic
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* GENERATE GRAPHIC MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Generate Branded Graphic
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="h-7 w-7 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              Choose a design template. Spotlite will auto-render the user responses at the predefined sizes and coords.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted-light uppercase tracking-wider">
                Select Template
              </label>
              {templates.length === 0 ? (
                <p className="text-sm text-red-500 font-medium">
                  No templates configured. Build a template first.
                </p>
              ) : (
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !selectedTemplateId || templates.length === 0}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-button text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "✨ Generate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-lg p-6 max-w-sm w-full mx-4 space-y-6 text-left animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Delete Graphic
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Are you sure you want to delete this generated graphic? This action is permanent, but you can always regenerate it.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-button text-xs font-semibold cursor-pointer disabled:opacity-50"
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
