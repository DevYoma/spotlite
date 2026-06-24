"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface FormField {
  id: string;
  type: "text" | "textarea" | "image" | "radio" | "select";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormDetails {
  id: string;
  name: string;
  title: string;
  schemaJson: {
    fields: FormField[];
  };
}

export default function PublicFormPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [form, setForm] = useState<FormDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Form submission state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/public/forms/${id}`);
        if (!res.ok) {
          throw new Error("Form not found");
        }
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("Failed to load form:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchForm();
    }
  }, [id]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setUploadingFields((prev) => ({ ...prev, [fieldId]: true }));
    try {
      // 1. Fetch presigned URL from backend
      const presignRes = await fetch(`/api/submissions/${id}/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate presigned upload link");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2. Upload the file body directly to R2/S3 via PUT request
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image file to storage provider");
      }

      // 3. Register the final S3/R2 public read URL in local form answers state
      handleInputChange(fieldId, publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
      console.error("Upload error:", err);
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Front-end check for required fields before hitting the API
    const fields = form.schemaJson.fields || [];
    for (const field of fields) {
      const val = formData[field.id];
      if (field.required && (val === undefined || val === null || String(val).trim() === "")) {
        toast.error(`"${field.label}" is required`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataJson: formData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit form responses");
      }

      setIsSuccess(true);
      toast.success("Form submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card p-8 shadow-card space-y-6 animate-pulse">
          <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
          <div className="space-y-4 pt-4">
            <div className="h-10 bg-zinc-150 dark:bg-zinc-800 rounded-lg" />
            <div className="h-24 bg-zinc-150 dark:bg-zinc-800 rounded-lg" />
            <div className="h-10 bg-zinc-150 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-brand-error/10 rounded-2xl flex items-center justify-center text-brand-error text-3xl mb-6">
          ⚠️
        </div>
        <h2 className="font-heading font-semibold text-2xl text-text-primary-light dark:text-text-primary-dark mb-2">
          Form Not Found
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-sm mb-8 leading-relaxed">
          The form you are trying to access does not exist or has been deactivated by its creator.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold rounded-button shadow-card transition-all cursor-pointer"
        >
          Back Home
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card p-8 shadow-card text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 text-3xl mx-auto">
            ✓
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary-light dark:text-text-primary-dark">
              Submission Received!
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-3 leading-relaxed">
              Thank you for filling out <strong className="text-brand-primary">"{form.title}"</strong>. Your response details and upload references have been logged successfully.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <p className="text-xs text-text-muted-light">
              Branded graphics generation powered by Spotlite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fields = form.schemaJson.fields || [];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300 flex flex-col items-center justify-center py-12 px-4 md:px-8">
      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
          S
        </div>
        <span className="font-heading font-bold text-xl tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Spotlite
        </span>
      </div>

      <div className="max-w-xl w-full bg-white dark:bg-surface-dark border border-zinc-200/60 dark:border-zinc-800/80 rounded-card p-6 md:p-8 shadow-card">
        {/* Form Title */}
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-5 mb-6 text-center sm:text-left">
          <h1 className="font-heading font-bold text-2xl text-text-primary-light dark:text-text-primary-dark leading-tight">
            {form.title}
          </h1>
          <p className="text-xs text-text-muted-light mt-1.5">
            Submit responses below to complete template graphics mapping.
          </p>
        </div>

        {/* Form Fields Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-brand-primary">*</span>}
              </label>

              {/* TEXT FIELD */}
              {field.type === "text" && (
                <input
                  type="text"
                  placeholder={field.placeholder || "Enter value..."}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              )}

              {/* TEXTAREA FIELD */}
              {field.type === "textarea" && (
                <textarea
                  placeholder={field.placeholder || "Type details..."}
                  rows={4}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-y"
                />
              )}

              {/* SELECT FIELD */}
              {field.type === "select" && (
                <select
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
                >
                  <option value="" className="text-text-muted-light">Select option...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* RADIO FIELD */}
              {field.type === "radio" && (
                <div className="flex flex-col gap-2 pt-1.5">
                  {(field.options || []).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 text-sm text-text-secondary-light dark:text-text-secondary-dark cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={formData[field.id] === opt}
                        onChange={() => handleInputChange(field.id, opt)}
                        className="rounded-full border-zinc-300 text-brand-primary focus:ring-brand-primary h-4 w-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* IMAGE UPLOAD FIELD */}
              {field.type === "image" && (
                <div className="space-y-3">
                  {formData[field.id] ? (
                    // Uploaded state preview
                    <div className="relative border border-zinc-250/60 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-card flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-150 dark:border-zinc-800/80">
                          <img
                            src={formData[field.id]}
                            alt="Uploaded preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium truncate">
                            Uploaded Picture
                          </div>
                          <a
                            href={formData[field.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-brand-primary hover:underline truncate block"
                          >
                            View raw file ↗
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange(field.id, "")}
                        className="px-2.5 py-1.5 border border-red-200/50 dark:border-red-950/20 text-brand-error text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    // Empty drag drop click card
                    <label className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-card hover:border-brand-primary/45 transition-colors cursor-pointer bg-zinc-55/10 dark:bg-zinc-900/20 text-center relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(field.id, file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingFields[field.id]}
                      />
                      {uploadingFields[field.id] ? (
                        <div className="space-y-2">
                          <div className="animate-spin text-2xl">⏳</div>
                          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                            Uploading directly to storage...
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-2xl">🖼️</span>
                          <div className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            Click to Upload Image
                          </div>
                          <div className="text-xs text-text-muted-light">
                            Supports PNG, JPG, or WEBP (Max 5MB)
                          </div>
                        </div>
                      )}
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Form Submit Footer button */}
          <button
            type="submit"
            disabled={isSubmitting || Object.values(uploadingFields).some(Boolean)}
            className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-55 text-white font-semibold rounded-button shadow-card hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-8"
          >
            {isSubmitting ? "Submitting Responses..." : "Submit Form Response"}
          </button>
        </form>
      </div>
    </div>
  );
}
