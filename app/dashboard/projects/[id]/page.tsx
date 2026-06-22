"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import UserMenu from "@/components/UserMenu";
import { useProjectDetailsQuery } from "@/features/projects/hooks/useProjects";

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Query details
  const { data: project, isLoading, isError } = useProjectDetailsQuery(id);

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
          <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-xl">
                  📋
                </div>
                <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Phase 4 & 5
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                Dynamic Forms
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                Build forms to collect name, details, and pictures from your community. View, edit, or delete schemas.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-button text-sm font-semibold mt-6 cursor-not-allowed text-left flex items-center justify-between">
              <span>Form Builder</span>
              <span>🔒 Locked</span>
            </button>
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
                <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Phase 6
                </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                Form Submissions
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
                Inspect information and images submitted by users. Filter, search, and delete responses.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-button text-sm font-semibold mt-6 cursor-not-allowed text-left flex items-center justify-between">
              <span>View Responses</span>
              <span>🔒 Locked</span>
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
    </div>
  );
}
