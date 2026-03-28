"use client";

import Link from "next/link";
import { ArrowLeft, Rocket, BookPlus, Bug, TrendingUp } from "lucide-react";
import { updates, Update } from "@/lib/updates";

const typeConfig: Record<
  Update["type"],
  { label: string; icon: typeof Rocket; bg: string; text: string; border: string }
> = {
  feature: { label: "Feature", icon: Rocket, bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  course: { label: "New Course", icon: BookPlus, bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  fix: { label: "Bug Fix", icon: Bug, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
  improvement: { label: "Improvement", icon: TrendingUp, bg: "bg-sky-500/10", text: "text-sky-600", border: "border-sky-500/20" },
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-headline font-bold text-on-surface tracking-tight hidden sm:block">
              Learn Agent Architecture
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="pt-[73px]">
        {/* Hero */}
        <div className="relative bg-surface-container-low border-b border-outline-variant/20 py-16 overflow-hidden">
          <div className="absolute inset-0 blueprint-grid pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-headline font-black tracking-tight">
              What&apos;s New
            </h1>
            <p className="text-on-surface-variant font-label text-base max-w-xl mx-auto">
              New features, courses, and fixes shipped to Learn Agent Architecture.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
          {updates.map((update) => {
            const cfg = typeConfig[update.type];
            const Icon = cfg.icon;
            return (
              <div
                key={update.id}
                className="relative pl-8 border-l-2 border-outline-variant/20 pb-2"
              >
                {/* Dot */}
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${cfg.bg} border-2 ${cfg.border}`}
                />

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label font-medium ${cfg.bg} ${cfg.text}`}
                    >
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                    <span className="text-xs text-on-surface-variant font-label">
                      {formatDate(update.date)}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface text-base">
                    {update.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant font-label leading-relaxed">
                    {update.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
