"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      {/* Header */}
      <header className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            S
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Spotlite
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-brand-primary cursor-pointer hover:underline">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-5 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-button shadow-card hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <a
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-button shadow-card hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all cursor-pointer"
            >
              Dashboard
            </a>
            <div className="ml-2 flex items-center">
              <UserButton />
            </div>
          </Show>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-semibold uppercase tracking-wider">
            ✨ Creative Automation for Teams
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark leading-[1.1]">
            Collect responses. <br className="hidden sm:inline" />
            Generate <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">branded graphics</span> in seconds.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
            Spotlite helps community leaders, class representatives, and designers build dynamic forms, collect member details, and auto-generate beautifully branded layouts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-medium rounded-button shadow-card hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer text-lg">
                  Get Started for Free
                </button>
              </SignUpButton>
              <a
                href="/demo"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-surface-dark border border-zinc-200 dark:border-zinc-800 text-text-primary-light dark:text-text-primary-dark font-medium rounded-button hover:-translate-y-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-lg"
              >
                Try the Demo
              </a>
            </Show>
            <Show when="signed-in">
              <a
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-medium rounded-button shadow-card hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer text-lg"
              >
                Go to Dashboard
              </a>
            </Show>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white dark:bg-surface-dark p-8 rounded-card shadow-card text-left border border-zinc-100/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-all">
            <div className="h-12 w-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary text-2xl mb-6">
              📋
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2 text-text-primary-light dark:text-text-primary-dark">
              1. Dynamic Form Builder
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
              Create customized forms with text fields, dropdowns, and file uploads. Share the link with your community.
            </p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-8 rounded-card shadow-card text-left border border-zinc-100/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-all">
            <div className="h-12 w-12 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary text-2xl mb-6">
              🎨
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2 text-text-primary-light dark:text-text-primary-dark">
              2. Visual Canvas Editor
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
              Upload custom backgrounds and visually drag placeholder boxes. Define exactly where user details and pictures go.
            </p>
          </div>

          <div className="bg-white dark:bg-surface-dark p-8 rounded-card shadow-card text-left border border-zinc-100/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-all">
            <div className="h-12 w-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent text-2xl mb-6">
              ⚡
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2 text-text-primary-light dark:text-text-primary-dark">
              3. Automatic Generation
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
              As soon as a form is submitted, Spotlite renders the customized graphic ready for instant high-quality download.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-[1280px] mx-auto px-4 md:px-8 border-t border-zinc-200/40 dark:border-zinc-805/45 py-8 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark mt-12">
        <p>
          Built by{" "}
          <a
            href="https://me-teal-xi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Ogheneyoma
          </a>
        </p>
      </footer>
    </div>
  );
}
