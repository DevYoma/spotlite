"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormsQuery } from "@/features/forms/hooks/useForms";
import { useSubmissionsQuery, useDeleteSubmissionMutation } from "@/features/submissions/hooks/useSubmissions";
import { useGeneratedImagesQuery } from "@/features/image-generation/hooks/useImageGeneration";
import { toast } from "sonner";
import { SubmissionResponse } from "@/lib/api/modules/submissions/types";

// Helper to extract a display name for the submission
function getSubmissionName(sub: SubmissionResponse, fields: any[]) {
  const nameField = fields.find(
    (f) => f.type === "text" && f.label.toLowerCase().includes("name")
  );
  if (nameField && sub.dataJson[nameField.id]) {
    return String(sub.dataJson[nameField.id]);
  }

  const firstTextField = fields.find((f) => f.type === "text");
  if (firstTextField && sub.dataJson[firstTextField.id]) {
    return String(sub.dataJson[firstTextField.id]);
  }

  for (const field of fields) {
    const val = sub.dataJson[field.id];
    if (val && typeof val === "string" && field.type !== "image") {
      return val;
    }
  }

  return "Submission";
}

// Light badge showing the status of the graphics generation
function GraphicsStatusBadge({ projectId, submissionId }: { projectId: string; submissionId: string }) {
  const { data: generatedImages = [], isLoading } = useGeneratedImagesQuery(projectId, submissionId);

  if (isLoading) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400 animate-pulse">
        Checking...
      </span>
    );
  }

  if (generatedImages.length > 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary">
        🎨 Branded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-text-secondary-light dark:bg-zinc-800 dark:text-text-secondary-dark">
      Not Generated
    </span>
  );
}

export default function SubmissionsPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: forms, isLoading: isFormsLoading } = useFormsQuery(projectId);

  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  const { data: submissions, isLoading: isSubmissionsLoading } = useSubmissionsQuery(projectId, selectedFormId);
  const deleteMutation = useDeleteSubmissionMutation();

  useEffect(() => {
    if (forms && forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id);
    }
  }, [forms, selectedFormId]);

  if (isFormsLoading) {
    return (
      <div className="space-y-4 py-8 text-left">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
      </div>
    );
  }

  const activeForm = forms?.find((f) => f.id === selectedFormId);
  const activeFields = activeForm?.schemaJson?.fields || [];

  const filteredSubmissions = (submissions || []).filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(sub.dataJson || {}).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete || !selectedFormId) return;
    try {
      await deleteMutation.mutateAsync({
        projectId,
        formId: selectedFormId,
        submissionId: submissionToDelete,
      });
      toast.success("Submission deleted successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete submission";
      toast.error(msg);
    } finally {
      setSubmissionToDelete(null);
    }
  };

  const handleCopyLink = (formId: string) => {
    const publicUrl = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public form link copied to clipboard!");
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-150 dark:border-zinc-800/80 pb-6 gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Form Submissions
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">
            View replies and generate branded graphics for each response.
          </p>
        </div>

        {forms && forms.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="form-select" className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              Form:
            </label>
            <select
              id="form-select"
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="px-4 py-2 text-sm rounded-button border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium min-w-[200px]"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!forms || forms.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-card bg-white dark:bg-surface-dark space-y-4">
          <span className="text-4xl">📋</span>
          <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
            No Forms Built Yet
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mx-auto leading-relaxed">
            Create a custom form in your project dashboard before you can start collecting and viewing responses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search submission responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              <span className="absolute right-3.5 top-3 text-zinc-400 text-sm">🔍</span>
            </div>

            {activeForm && (
              <button
                onClick={() => handleCopyLink(activeForm.id)}
                className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900 rounded-button text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔗</span> Copy Public Form Link
              </button>
            )}
          </div>

          {isSubmissionsLoading ? (
            <div className="space-y-3 py-6">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
              <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-card bg-white dark:bg-surface-dark space-y-4">
              <span className="text-4xl">📥</span>
              <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                No Submissions Received
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-xs mx-auto leading-relaxed">
                Share the public link with your community to gather data!
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-surface-dark rounded-card text-text-secondary-light dark:text-text-secondary-dark">
              No submissions match your search query.
            </div>
          ) : (
            <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/60 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      <th className="px-6 py-4">Submitted At</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Graphics</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-sm text-text-primary-light dark:text-text-primary-dark">
                    {filteredSubmissions.map((sub) => {
                      const dateFormatted = new Date(sub.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const submissionName = getSubmissionName(sub, activeFields);

                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-zinc-50/55 dark:hover:bg-zinc-900/35 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-text-muted-light">
                            {dateFormatted}
                          </td>
                          <td className="px-6 py-4 font-semibold whitespace-nowrap text-text-primary-light dark:text-text-primary-dark">
                            {submissionName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <GraphicsStatusBadge
                              projectId={projectId}
                              submissionId={sub.id}
                            />
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/dashboard/projects/${projectId}/forms/${selectedFormId}/submissions/${sub.id}`
                                  )
                                }
                                title="View Details & Generate"
                                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-button text-xs font-semibold transition-all cursor-pointer hover:border-brand-primary hover:text-brand-primary"
                              >
                                Inspect
                              </button>
                              <button
                                onClick={() => setSubmissionToDelete(sub.id)}
                                title="Delete response"
                                className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-button text-xs font-semibold transition-all cursor-pointer text-zinc-400"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-lg p-6 max-w-sm w-full mx-4 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-2 text-left">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Delete Submission
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                This will permanently delete this response and any graphics generated from it.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmissionToDelete(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmission}
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
