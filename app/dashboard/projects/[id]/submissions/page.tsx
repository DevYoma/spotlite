"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { useProjectDetailsQuery } from "@/features/projects/hooks/useProjects";
import { useFormsQuery } from "@/features/forms/hooks/useForms";
import { useSubmissionsQuery, useDeleteSubmissionMutation } from "@/features/submissions/hooks/useSubmissions";
import { toast } from "sonner";
import { SubmissionResponse } from "@/lib/api/modules/submissions/types";

export default function SubmissionsDashboardPage() {
  const { id } = useParams() as { id: string };
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Queries
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjectDetailsQuery(id);
  const { data: forms, isLoading: isFormsLoading } = useFormsQuery(id);

  // Form selection and filtering
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeSubmission, setActiveSubmission] = useState<SubmissionResponse | null>(null);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  const { data: submissions, isLoading: isSubmissionsLoading } = useSubmissionsQuery(id, selectedFormId);
  const deleteMutation = useDeleteSubmissionMutation();

  // Set default form selection once forms are loaded
  useEffect(() => {
    if (forms && forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id);
    }
  }, [forms, selectedFormId]);

  // Auth & loading guards
  if (!isLoaded || isProjectLoading || isFormsLoading) {
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

  // Guard redirect if session is empty
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

  const activeForm = forms?.find((f) => f.id === selectedFormId);
  const activeFields = activeForm?.schemaJson?.fields || [];

  // Search logic: check matches on dataJson keys/values
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
        projectId: id,
        formId: selectedFormId,
        submissionId: submissionToDelete,
      });
      toast.success("Submission deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete submission");
      console.error(err);
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
                href={`/dashboard/projects/${id}`}
                className="px-3 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors"
              >
                {project.name}
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="px-3 py-1.5 text-sm font-medium text-brand-accent bg-brand-accent/10 rounded-full">
                Submissions
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
        {/* Back Link */}
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          className="group flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors cursor-pointer"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Project
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200/65 dark:border-zinc-800/80 pb-6 gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Form Submissions
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1 max-w-2xl">
              Select a form to inspect user submissions, view details, or delete responses.
            </p>
          </div>

          {/* Form Switcher Dropdown */}
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

        {/* Outer State checks */}
        {!forms || forms.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-card bg-white dark:bg-surface-dark space-y-4">
            <span className="text-4xl">📋</span>
            <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
              No Forms Built Yet
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mx-auto leading-relaxed">
              Create a custom form in your project dashboard before you can start collecting and viewing responses.
            </p>
            <button
              onClick={() => router.push(`/dashboard/projects/${id}/forms/new`)}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-sm shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Build Dynamic Form
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header controls: Search & Copy link */}
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
                  className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔗</span> Copy Public Form Link
                </button>
              )}
            </div>

            {/* Submissions Loader */}
            {isSubmissionsLoading ? (
              <div className="space-y-3 py-6">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
                <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
                <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
              </div>
            ) : !submissions || submissions.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-card bg-white dark:bg-surface-dark space-y-4">
                <span className="text-4xl">📥</span>
                <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                  No Submissions Received
                </h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-xs mx-auto leading-relaxed">
                  No responses have been submitted to this form yet. Share the public link with your community to gather data!
                </p>
                {activeForm && (
                  <button
                    onClick={() => handleCopyLink(activeForm.id)}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-sm shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    Copy Public Link
                  </button>
                )}
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
                        {activeFields.map((field) => (
                          <th key={field.id} className="px-6 py-4">
                            {field.label}
                          </th>
                        ))}
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

                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-zinc-50/55 dark:hover:bg-zinc-900/35 transition-colors group"
                          >
                            <td className="px-6 py-4.5 whitespace-nowrap font-medium text-text-muted-light">
                              {dateFormatted}
                            </td>
                            {activeFields.map((field) => {
                              const val = sub.dataJson[field.id];
                              return (
                                <td key={field.id} className="px-6 py-4.5">
                                  {field.type === "image" ? (
                                    val ? (
                                      <a
                                        href={val}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="block w-10 h-10 relative group-hover:scale-[1.03] transition-transform"
                                      >
                                        <img
                                          src={val}
                                          alt="Preview"
                                          className="w-10 h-10 object-cover rounded-lg border border-zinc-200/80 dark:border-zinc-800"
                                        />
                                      </a>
                                    ) : (
                                      <span className="text-text-muted-light text-xs italic">No image</span>
                                    )
                                  ) : (
                                    <span
                                      className="text-sm truncate max-w-[200px] block"
                                      title={String(val || "")}
                                    >
                                      {String(val !== undefined && val !== null ? val : "-")}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-6 py-4.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setActiveSubmission(sub)}
                                  title="View Details"
                                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-button text-xs font-semibold transition-all cursor-pointer"
                                >
                                  🔍 Inspect
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
      </main>

      {/* INSPECT DETAILS DIALOG */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800/85 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                  Submission Details
                </h3>
                <p className="text-xs text-text-muted-light mt-0.5">
                  Submitted at {new Date(activeSubmission.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1 text-left">
              {activeFields.map((field) => {
                const val = activeSubmission.dataJson[field.id];
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted-light block">
                      {field.label}
                    </label>

                    {field.type === "image" ? (
                      val ? (
                        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 max-h-[260px] flex items-center justify-center relative group">
                          <img
                            src={val}
                            alt={field.label}
                            className="max-h-[260px] w-full object-contain"
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
                        <span className="text-sm italic text-text-muted-light block py-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center bg-zinc-50/20 dark:bg-zinc-900/10">
                          No image uploaded
                        </span>
                      )
                    ) : field.type === "textarea" ? (
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap leading-relaxed">
                        {val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "-"}
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/85 dark:border-zinc-800/80 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
                        {val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : "-"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-zinc-150 dark:border-zinc-800/85 bg-zinc-50/50 dark:bg-zinc-900/10 flex justify-end">
              <button
                onClick={() => setActiveSubmission(null)}
                className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button text-xs transition-colors cursor-pointer shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card shadow-lg p-6 max-w-sm w-full mx-4 space-y-6">
            <div className="space-y-2 text-left">
              <h3 className="font-heading font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                Delete Submission
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Are you sure you want to delete this submission response? This action will permanently remove it from your records.
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
