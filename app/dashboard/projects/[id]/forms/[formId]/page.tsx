"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { useProjectDetailsQuery } from "@/features/projects/hooks/useProjects";
import FormBuilder from "@/features/forms/components/FormBuilder";

export default function FormBuilderPage() {
  const { id, formId } = useParams() as { id: string; formId: string };
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Query project details for breadcrumbs & name reference
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjectDetailsQuery(id);

  const isEditMode = formId !== "new";

  // Check auth
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

  // Guard redirect handled on client if session is empty
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
              <a
                href={`/dashboard/projects/${id}`}
                className="px-3 py-1.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary transition-colors"
              >
                {project.name}
              </a>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-full">
                {isEditMode ? "Edit Form" : "New Form"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-10">
        {/* Back Link */}
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          className="group flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-brand-primary mb-6 transition-colors cursor-pointer"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Project
        </button>

        <div className="border-b border-zinc-200/65 dark:border-zinc-800/80 pb-8 mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark leading-tight">
            {isEditMode ? "Edit Form Template" : "Build Dynamic Form"}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-base mt-2 max-w-3xl leading-relaxed">
            {isEditMode
              ? "Modify your dynamic form schema, reorder questions, or configure visibility constraints."
              : "Design custom schemas to collect information, textual descriptions, and images from your community."}
          </p>
        </div>

        {/* Interactive canvas component */}
        <div className="mt-8">
          <FormBuilder projectId={id} formId={formId} />
        </div>
      </main>
    </div>
  );
}
