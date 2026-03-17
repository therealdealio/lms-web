"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Brain,
  Award,
  BookOpen,
  BarChart3,
  LogOut,
  CheckCircle,
  ArrowRight,
  Heart,
  Zap,
  Shield,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { loadProgress, clearProgress, getOverallProgress } from "@/lib/progress";
import { saveMembership } from "@/lib/membership";
import { loadMembership, getLimit } from "@/lib/membership";
import { domains } from "@/lib/curriculum";
import { AppProgress, Membership } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";
import DomainCard from "@/components/DomainCard";

const ADMIN_EMAIL = "rrthai88@gmail.com";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [progress, setProgress] = useState<AppProgress | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) {
      router.push("/");
      return;
    }

    // DB is source of truth; fall back to localStorage only if no DB record
    const localMembership = loadMembership(p.user!.email);
    fetch("/api/membership")
      .then((r) => r.ok ? r.json() : null)
      .then((dbMembership) => {
        if (dbMembership?.tier !== undefined) {
          const m = { tier: dbMembership.tier, promptsUsed: dbMembership.promptsUsed, promptLimit: dbMembership.promptLimit };
          setMembership(m);
          // Sync localStorage so AiChat reads the correct count too
          saveMembership(p.user!.email, m);
        } else {
          setMembership(localMembership);
        }
      })
      .catch(() => setMembership(localMembership));

    // Load admin-set domain progress from DB and merge with localStorage
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
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const overallProgress = getOverallProgress(progress);
  const completedDomains = progress.domains.filter((d) => d.completed).length;
  const startedDomains = progress.domains.filter((d) => d.started).length;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-9 h-9 rounded-xl shadow-sm" />
            <div className="hidden sm:block">
              <div className="font-bold text-dark-50 leading-tight text-sm">Anthropic Architecture Certification</div>
              <div className="text-xs text-brand-600 font-medium">Preparing you for the official exam</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-colors text-sm font-medium"
            >
              <Heart size={14} />
              About
            </Link>
            {session?.user?.email === ADMIN_EMAIL && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Shield size={14} />
                Admin
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2 text-sm text-dark-400">
              <span>Welcome,</span>
              <span className="text-dark-100 font-medium">{progress.user.name}</span>
            </div>

            {progress.certificateEarned && (
              <Link
                href="/certificate"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm hover:bg-amber-100 transition-colors"
              >
                <Award size={16} />
                View Certificate
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-dark-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: BarChart3,
              label: "Overall Progress",
              value: `${overallProgress}%`,
              color: "text-brand-600",
              bg: "bg-brand-50",
            },
            {
              icon: BookOpen,
              label: "Sections Started",
              value: `${startedDomains}/8`,
              color: "text-accent-600",
              bg: "bg-accent-50",
            },
            {
              icon: CheckCircle,
              label: "Sections Passed",
              value: `${completedDomains}/8`,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              icon: Award,
              label: "Certificate",
              value: progress.certificateEarned ? "Earned!" : "In Progress",
              color: progress.certificateEarned ? "text-amber-600" : "text-dark-400",
              bg: progress.certificateEarned ? "bg-amber-50" : "bg-dark-800",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="p-5 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-3"
            >
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-dark-400 text-xs mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Membership card */}
        {membership && (
          <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between gap-4 ${
            membership.tier === "pro"
              ? "bg-gradient-to-r from-brand-50 to-orange-50 border-brand-300"
              : "bg-white border-dark-700"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                membership.tier === "pro" ? "bg-brand-100" : "bg-dark-800"
              }`}>
                <Zap size={20} className={membership.tier === "pro" ? "text-brand-600" : "text-dark-400"} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-dark-50 text-sm">
                    {membership.tier === "pro" ? "Pro Plan" : "Free Plan"}
                  </span>
                  {membership.tier === "pro" && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-xs font-semibold">PRO</span>
                  )}
                </div>
                <div className="text-dark-400 text-xs mt-0.5">
                  {Math.max(0, getLimit(membership.tier, membership.promptLimit) - membership.promptsUsed)} AI prompts remaining
                </div>
              </div>
            </div>
            <Link
              href="/upgrade"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors whitespace-nowrap shadow-sm"
            >
              <Zap size={14} />
              +500 Prompts — $5
            </Link>
          </div>
        )}

        {/* Overall progress bar */}
        <div className="p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-50">Overall Certification Progress</h2>
            <span className="text-brand-600 font-bold">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} color="brand" size="lg" animated />
          <p className="text-dark-400 text-sm">
            Pass all 8 section exams with ≥70% to earn your certificate
          </p>
        </div>

        {/* Certificate banner */}
        {progress.certificateEarned && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎓</div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Certification Complete!</h3>
                <p className="text-amber-600 text-sm">
                  Congratulations, {progress.user.name}! You have passed all 8 sections.
                </p>
              </div>
            </div>
            <Link
              href="/certificate"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors shadow-sm"
            >
              View Certificate
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Section cards + Forum tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-dark-700 pb-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-600 -mb-px transition-colors"
            >
              <BookOpen size={15} />
              Course Sections
            </Link>
            <Link
              href="/forum"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-dark-400 hover:text-dark-100 border-b-2 border-transparent hover:border-dark-500 -mb-px transition-colors"
            >
              <MessageSquare size={15} />
              Community Forum
            </Link>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
            {domains.map((domain, index) => {
              const domainProgress = progress.domains.find(
                (d) => d.domainId === domain.id
              );
              return (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  domainProgress={domainProgress || null}
                  index={index}
                />
              );
            })}
          </div>
        </div>

        {/* Exam traps reminder */}
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-bold text-red-800">Common Exam Traps — Remember These!</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
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
                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                <span className="text-red-700">{trap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
