"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Brain,
  Award,
  BookOpen,
  LogOut,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { loadProgress, clearProgress, getOverallProgress } from "@/lib/progress";
import { saveMembership } from "@/lib/membership";
import { loadMembership, getLimit } from "@/lib/membership";
import { domains } from "@/lib/curriculum";
import { AppProgress, Membership } from "@/lib/types";
import DomainCard from "@/components/DomainCard";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [progress, setProgress] = useState<AppProgress | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) { router.push("/"); return; }

    const localMembership = loadMembership(p.user!.email);
    fetch("/api/membership")
      .then((r) => r.ok ? r.json() : null)
      .then((dbMembership) => {
        if (dbMembership?.tier !== undefined) {
          const m = { tier: dbMembership.tier, promptsUsed: dbMembership.promptsUsed, promptLimit: dbMembership.promptLimit };
          setMembership(m);
          saveMembership(p.user!.email, m);
        } else {
          setMembership(localMembership);
        }
      })
      .catch(() => setMembership(localMembership));

    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) { setAvatarEmoji(data.avatarEmoji || null); setAvatarImage(data.avatarImage || null); }
      })
      .catch(() => {});

    fetch("/api/progress")
      .then((r) => r.ok ? r.json() : null)
      .then((dbDomains: { domainId: number; completed: boolean; examScore: number | null; examAttempts: number }[] | null) => {
        if (dbDomains && dbDomains.length > 0) {
          const merged = { ...p };
          merged.domains = p.domains.map((d) => {
            const db = dbDomains.find((x) => x.domainId === d.domainId);
            if (db && db.completed && !d.completed) {
              return { ...d, completed: true, examScore: db.examScore ?? 100, examAttempts: Math.max(d.examAttempts, db.examAttempts) };
            }
            return d;
          });
          const allPassed = merged.domains.every((d) => d.completed);
          if (allPassed) merged.certificateEarned = true;
          setProgress(merged);
        } else {
          setProgress(p);
        }
      })
      .catch(() => setProgress(p));
  }, [router]);

  const handleLogout = async () => {
    clearProgress();
    await signOut({ callbackUrl: "/" });
  };

  if (!progress || !progress.user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const overallProgress = getOverallProgress(progress);
  const completedDomains = progress.domains.filter((d) => d.completed).length;
  const promptsLeft = membership ? Math.max(0, getLimit(membership.tier, membership.promptLimit) - membership.promptsUsed) : null;

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-outline-variant/20 glass px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-headline font-bold text-on-surface text-sm hidden sm:block">Learn Agent Architecture</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/about" className="hidden md:block px-3 py-2 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors text-sm font-label font-medium">
              About
            </Link>
            <Link href="/profile" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors text-sm font-label font-medium">
              <UserCircle size={14} />
              Profile
            </Link>
            {session?.user?.email === ADMIN_EMAIL && (
              <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md bg-error-container/30 text-on-error-container text-sm font-label font-medium">
                <Shield size={14} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Avatar */}
            <Link href="/profile" className="ml-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-container transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarImage ? (
                  <img src={avatarImage} alt="" className="w-full h-full object-cover" />
                ) : avatarEmoji ? (
                  <span className="text-sm leading-none">{avatarEmoji}</span>
                ) : (
                  <span className="text-on-primary text-xs font-headline font-bold">
                    {(progress.user.name || "?").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-on-surface font-label font-medium text-sm hidden md:block">{progress.user.name}</span>
            </Link>

            <button onClick={handleLogout}
              className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/15 transition-colors text-sm font-label">
              <LogOut size={15} />
              <span className="hidden sm:block">Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Welcome hero strip ── */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-primary-container p-8 text-on-primary">
          <div className="absolute inset-0 blueprint-grid opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-on-primary/70 text-sm font-label mb-1">Welcome back</p>
              <h1 className="text-3xl font-headline font-black tracking-tight">{progress.user.name}</h1>
              <p className="text-on-primary/80 text-sm font-label mt-1">
                {completedDomains === 0
                  ? "You haven't started any domains yet. Pick one below to begin."
                  : completedDomains === 8
                  ? "You've completed all 8 domains! Claim your certificate."
                  : `${completedDomains} of 8 domains passed · Keep going!`}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex justify-between text-sm">
                <span className="text-on-primary/70 font-label">Overall Progress</span>
                <span className="font-headline font-bold">{overallProgress}%</span>
              </div>
              <div className="h-2 bg-on-primary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-on-primary rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-on-primary/60 font-label">
                <span>{completedDomains} passed</span>
                <span>8 total</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats + Membership row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-headline font-bold text-emerald-600">{completedDomains}/8</div>
            <div className="text-on-surface-variant text-xs font-label">Domains Passed</div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div className="text-2xl font-headline font-bold text-primary">
              {progress.domains.filter((d) => d.started).length}/8
            </div>
            <div className="text-on-surface-variant text-xs font-label">Domains Started</div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
              <Zap size={18} className={membership?.tier === "pro" ? "text-primary" : "text-on-surface-variant"} />
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">
              {promptsLeft !== null ? promptsLeft : <span className="text-base text-on-surface-variant">Loading…</span>}
            </div>
            <div className="text-on-surface-variant text-xs font-label">AI Prompts Left</div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${progress.certificateEarned ? "bg-amber-50" : "bg-surface-container"}`}>
              <Award size={18} className={progress.certificateEarned ? "text-amber-600" : "text-on-surface-variant"} />
            </div>
            <div className={`text-2xl font-headline font-bold ${progress.certificateEarned ? "text-amber-600" : "text-on-surface-variant"}`}>
              {progress.certificateEarned ? "Earned!" : "—"}
            </div>
            <div className="text-on-surface-variant text-xs font-label">Certificate</div>
          </div>
        </div>

        {/* Upgrade nudge (only for free plan with low prompts) */}
        {membership && membership.tier !== "pro" && promptsLeft !== null && promptsLeft < 5 && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-primary flex-shrink-0" />
              <p className="text-sm font-label text-on-surface">
                Only <span className="font-bold text-primary">{promptsLeft} AI prompts</span> left — unlock 500 more for $5.
              </p>
            </div>
            <Link href="/upgrade"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-xs hover:opacity-90 whitespace-nowrap shadow-sm">
              Upgrade <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Certificate banner */}
        {progress.certificateEarned && (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Award size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-amber-800">Certification Complete!</h3>
                <p className="text-amber-600 text-sm font-label">Congratulations, {progress.user.name}! All 8 sections passed.</p>
              </div>
            </div>
            <Link href="/certificate"
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-white font-headline font-bold text-sm whitespace-nowrap shadow-sm">
              View Certificate <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ── Domain cards + Forum tabs ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-1 border-b border-outline-variant/25">
            <Link href="/dashboard"
              className="flex items-center gap-2 px-4 py-3 text-sm font-headline font-bold text-primary border-b-2 border-primary -mb-px">
              <BookOpen size={14} />
              Study Domains
            </Link>
            <Link href="/forum"
              className="flex items-center gap-2 px-4 py-3 text-sm font-label font-medium text-on-surface-variant hover:text-on-surface border-b-2 border-transparent hover:border-outline-variant -mb-px transition-colors">
              <MessageSquare size={14} />
              Community Forum
            </Link>
          </div>

          {/* First-time user hint */}
          {progress.domains.every((d) => !d.started) && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/15">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-on-primary text-xs font-headline font-black">1</span>
              </div>
              <div>
                <p className="text-sm font-headline font-bold text-on-surface">Start with Domain 1</p>
                <p className="text-xs text-on-surface-variant font-label mt-0.5">
                  Work through the domains in order — each one builds on the last. Read the concepts first, then take the practice exam to pass.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {domains.map((domain, index) => {
              const domainProgress = progress.domains.find((d) => d.domainId === domain.id);
              return <DomainCard key={domain.id} domain={domain} domainProgress={domainProgress || null} index={index} />;
            })}
          </div>
        </div>

        {/* ── Exam Traps ── */}
        <div className="p-6 rounded-xl bg-error-container/15 border border-error/15 space-y-4">
          <div className="flex items-center gap-2">
            <Brain size={17} className="text-error" />
            <h3 className="font-headline font-bold text-on-surface">Common Exam Traps</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {[
              "Subagents share memory with coordinators → WRONG",
              "Loop termination by model text → WRONG",
              "High-stakes with prompt only → WRONG",
              "Ambiguous tools: first fix is a classifier → WRONG",
              "~/.claude/CLAUDE.md for team rules → WRONG",
              "Batch API for pre-merge block checks → WRONG",
              "Self-review same session is sufficient → WRONG",
            ].map((trap) => (
              <div key={trap} className="flex items-start gap-2 text-sm">
                <span className="text-error mt-0.5 flex-shrink-0 font-headline font-bold">✗</span>
                <span className="text-on-surface-variant font-label">{trap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
