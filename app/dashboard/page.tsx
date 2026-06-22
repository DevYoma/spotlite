import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";

export default async function DashboardPage() {
  const user = await currentUser();

  // Guard: if user isn't authenticated, Clerk middleware protects this,
  // but it's good practice to redirect just in case.
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-surface-dark">
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

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-10">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Welcome back, {user.firstName || "Creator"}!
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
              Manage your projects, designs, and templates.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-brand-primary/50 text-white font-medium rounded-button cursor-not-allowed text-sm">
            + New Project
          </button>
        </div>

        {/* Empty State Card */}
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
          <button className="px-6 py-3 bg-brand-primary/50 text-white font-medium rounded-button cursor-not-allowed inline-flex items-center gap-2">
            Create Project (Phase 3)
          </button>
        </div>
      </main>
    </div>
  );
}
