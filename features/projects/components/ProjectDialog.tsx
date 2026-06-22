"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@/lib/api/modules/projects/schema";
import { CreateProjectInput, ProjectResponse } from "@/lib/api/modules/projects/types";
import { useCreateProjectMutation, useUpdateProjectMutation } from "../hooks/useProjects";
import { toast } from "sonner";

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectResponse | null;
}

export default function ProjectDialog({ isOpen, onClose, projectToEdit }: ProjectDialogProps) {
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form values when dialog opens or changes mode
  useEffect(() => {
    if (isOpen) {
      reset({
        name: projectToEdit?.name || "",
        description: projectToEdit?.description || "",
      });
    }
  }, [isOpen, projectToEdit, reset]);

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      if (projectToEdit) {
        await updateMutation.mutateAsync({ id: projectToEdit.id, input: data });
        toast.success(`Project "${data.name}" updated successfully`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Project "${data.name}" created successfully`);
      }
      onClose();
      reset();
    } catch (err: any) {
      toast.error(err.message || "Failed to save project");
      console.error("Failed to save project:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg p-6 md:p-8 bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-modal shadow-modal z-10 transition-all duration-300 transform scale-100 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <h2 className="text-2xl font-heading font-bold text-text-primary-light dark:text-text-primary-dark">
            {projectToEdit ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark" htmlFor="name">
              Project Name <span className="text-brand-primary">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Class of 2026 Graphics"
              className="w-full px-4 py-3 rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-brand-error font-medium mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="e.g. Workspace for generating custom welcome banners and certificates."
              className="w-full px-4 py-3 rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-brand-error font-medium mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-button border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-text-secondary-light dark:text-text-secondary-dark text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isSubmitting}
              className="px-5 py-2.5 rounded-button bg-brand-primary text-white hover:bg-brand-primary/95 text-sm font-semibold shadow-card transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Saving..." : projectToEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
