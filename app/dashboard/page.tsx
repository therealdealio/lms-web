"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LogOut,
  Shield,
  MessageSquare,
  UserCircle,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { loadProgress, clearProgress, getOverallProgress, getCourseProgress } from "@/lib/progress";
import { saveMembership } from "@/lib/membership";
import { loadMembership, getLimit } from "@/lib/membership";
import { courses, getDomainsForCourse } from "@/lib/curriculum";
import { AppProgress, Membership } from "@/lib/types";
import DomainCard from "@/components/DomainCard";

const ADMIN_EMAIL = "rrthai88@gmail.com";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [progress, setProgress] = useState<AppProgress | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("aai");
  const [clock, setClock] = useState("");

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
      .then((dbDomains: { courseId?: string; domainId: string; completed: boolean; examScore: number | null; examAttempts: number }[] | null) => {
        if (dbDomains && dbDomains.length > 0) {
          const merged = { ...p, courses: { ...p.courses } };
          for (const courseKey of Object.keys(merged.courses)) {
            merged.courses[courseKey] = { ...merged.courses[courseKey], domains: merged.courses[courseKey].domains.map((d) => {
              const db = dbDomains.find((x) => x.domainId === d.domainId);
              if (db && db.completed && !d.completed) {
                return { ...d, completed: true, examScore: db.examScore ?? 100, examAttempts: Math.max(d.examAttempts, db.examAttempts) };
              }
              return d;
            })};
            const allPassed = merged.courses[courseKey].domains.every((d) => d.completed);
            if (allPassed) merged.courses[courseKey].certificateEarned = true;
          }
          setProgress(merged);
        } else {
          setProgress(p);
        }
      })
      .catch(() => setProgress(p));
  }, [router]);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss} UTC`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    clearProgress();
    await signOut({ callbackUrl: "/" });
  };

  if (!progress || !progress.user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="font-label text-[11px] uppercase tracking-[0.2em] text-ink flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 bg-oxide animate-pulse" />
          Retrieving Dossier…
        </div>
      </div>
    );
  }

  const activeCourse = courses.find((c) => c.id === activeTab);
  const activeDomains = getDomainsForCourse(activeTab);
  const activeCourseProgress = getCourseProgress(progress, activeTab);
  const overallProgress = getOverallProgress(progress, activeTab);
  const completedDomains = activeCourseProgress?.domains.filter((d) => d.completed).length ?? 0;
  const startedDomains = activeCourseProgress?.domains.filter((d) => d.started).length ?? 0;
  const totalDomains = activeDomains.length;
  const promptsLeft = membership ? Math.max(0, getLimit(membership.tier, membership.promptLimit) - membership.promptsUsed) : null;
  const initials = (progress.user.name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-paper text-ink paper-fiber">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-paper/92 backdrop-blur-sm border-b border-ink">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display font-black text-ink text-lg leading-none tracking-tight">L·A·A</span>
            <span className="hidden sm:block h-5 w-px bg-ink/40" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-label text-[10px] uppercase tracking-[0.22em] text-ink-fade">Dossier</span>
              <span className="font-display text-[13px] font-semibold text-ink italic -mt-0.5">Learn Agent Architecture</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/updates" className="hidden md:flex items-center gap-1.5 px-3 py-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep">
              <Bell size={13} />
              Updates
            </Link>
            <Link href="/about" className="hidden md:inline-block px-3 py-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep">
              About
            </Link>
            <Link href="/profile" className="hidden md:flex items-center gap-1.5 px-3 py-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep">
              <UserCircle size={13} />
              Profile
            </Link>
            {session?.user?.email === ADMIN_EMAIL && (
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 border border-oxide text-oxide font-label text-[11px] uppercase tracking-[0.18em] hover:bg-oxide hover:text-paper transition-colors">
                <Shield size={13} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            <Link href="/profile" className="ml-2 flex items-center gap-2 px-2 py-1.5 hover:bg-paper-deep transition-colors">
              <div className="w-7 h-7 border border-ink bg-paper-fade flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarImage ? (
                  <img src={avatarImage} alt="" className="w-full h-full object-cover" />
                ) : avatarEmoji ? (
                  <span className="text-sm leading-none">{avatarEmoji}</span>
                ) : (
                  <span className="text-ink text-[10px] font-display font-bold">{initials}</span>
                )}
              </div>
              <span className="text-ink font-label text-xs uppercase tracking-[0.14em] hidden md:block">{progress.user.name}</span>
            </Link>

            <button onClick={handleLogout}
              className="ml-1 flex items-center gap-1.5 px-3 py-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors">
              <LogOut size={14} />
              <span className="hidden sm:block">Exit</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Dossier masthead strip ── */}
      <div className="border-b border-ink">
        <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-wrap items-center justify-between gap-3 dossier-meta">
          <span className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-oxide rounded-full animate-pulse" />
            Candidate File № {initials}-{progress.user.email.split("@")[0].slice(0,3).toUpperCase()}
          </span>
          <span className="hidden sm:block">Session · Authenticated</span>
          <span className="hidden md:block tabular">{clock || "—"}</span>
          <span>Dashboard</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-10 space-y-12">

        {/* ── Candidate File hero ── */}
        <section className="border-2 border-ink bg-ink text-paper relative overflow-hidden">
          <span aria-hidden className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-oxide pointer-events-none" />
          <span aria-hidden className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-oxide pointer-events-none" />
          <span aria-hidden className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-oxide pointer-events-none" />
          <span aria-hidden className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-oxide pointer-events-none" />

          <div className="grid grid-cols-12 gap-0">
            {/* Candidate identity */}
            <div className="col-span-12 lg:col-span-7 p-10 lg:p-12 relative border-b-2 lg:border-b-0 lg:border-r-2 border-paper/15">
              <div className="dossier-meta !text-paper/60 mb-3">Candidate</div>
              <h1 className="font-display font-bold text-[4.5rem] lg:text-[6rem] leading-[0.88] tracking-[-0.04em] text-paper">
                {progress.user.name}
              </h1>
              <div className="rule-hair mt-6 mb-4 opacity-30" />
              <p className="font-body text-[17px] leading-[1.5] text-paper/80 max-w-md italic">
                {completedDomains === 0
                  ? `No domains passed yet in ${activeCourse?.title ?? "this course"}. Select a tile below to commence.`
                  : completedDomains === totalDomains
                  ? `All ${totalDomains} domains of ${activeCourse?.title ?? "this course"} complete. Claim your certificate.`
                  : `${completedDomains} of ${totalDomains} domains passed in ${activeCourse?.title ?? "this course"}. Forward, candidate.`}
              </p>
              <div className="mt-8 flex items-center gap-4 font-label text-[10px] uppercase tracking-[0.18em] text-paper/50">
                <span>File opened · {new Date(progress.user.startedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span className="text-paper/20">·</span>
                <span>{progress.user.email}</span>
              </div>
            </div>

            {/* Overall progress gauge */}
            <div className="col-span-12 lg:col-span-5 p-10 lg:p-12 flex flex-col justify-between gap-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="dossier-meta !text-paper/60 mb-1">Overall</div>
                  <div className="font-display font-bold text-paper leading-none tabular text-6xl">
                    {overallProgress}<span className="text-foil text-3xl">%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="dossier-meta !text-paper/60 mb-1">Ratio</div>
                  <div className="font-display italic text-foil text-3xl tabular leading-none">
                    {completedDomains} / {totalDomains}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 bg-paper/15">
                  <div
                    className="h-full bg-foil transition-all duration-700"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="flex justify-between font-label text-[10px] uppercase tracking-[0.18em] text-paper/50">
                  <span>{completedDomains} passed</span>
                  <span>{startedDomains - completedDomains} underway</span>
                  <span>{totalDomains - startedDomains} pending</span>
                </div>
              </div>

              {activeCourseProgress?.certificateEarned && (
                <Link
                  href={`/certificate?course=${activeTab}`}
                  className="flex items-center justify-between gap-2 px-5 py-3 bg-foil text-ink hover:bg-paper font-label text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
                >
                  <span>Retrieve Certificate</span>
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Statistics rail ── */}
        <section className="border-y-2 border-ink bg-paper-deep">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x md:divide-ink/20">
            {[
              { n: "I",   label: "Passed",     value: `${completedDomains}/${totalDomains}`, accent: completedDomains > 0 ? "text-emerald-700" : "text-ink" },
              { n: "II",  label: "Started",    value: `${startedDomains}/${totalDomains}`,   accent: "text-oxide" },
              { n: "III", label: "Prompts",    value: promptsLeft !== null ? String(promptsLeft) : "—", accent: "text-ink" },
              { n: "IV",  label: "Certificate",value: activeCourseProgress?.certificateEarned ? "Earned" : "—", accent: activeCourseProgress?.certificateEarned ? "text-oxide" : "text-ink-fade" },
            ].map(({ n, label, value, accent }) => (
              <div key={n} className="p-6 lg:p-8">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-display italic text-oxide text-xl leading-none">{n}</span>
                  <span className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade">§</span>
                </div>
                <div className={`font-display font-bold leading-none tabular text-4xl lg:text-5xl ${accent}`}>
                  {value}
                </div>
                <div className="mt-3 font-label text-[10px] uppercase tracking-[0.18em] text-ink-soft">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Upgrade nudge */}
        {membership && membership.tier !== "pro" && promptsLeft !== null && promptsLeft < 5 && (
          <aside className="border-2 border-oxide bg-paper-fade p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="font-display italic text-oxide text-3xl leading-none">!</span>
              <div>
                <p className="font-display font-bold text-ink text-lg leading-tight">
                  Only <span className="italic text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>{promptsLeft} AI prompts</span> remaining.
                </p>
                <p className="font-body text-[14px] leading-snug text-ink-soft mt-1">
                  Replenish for <strong>$5</strong>. 500 additional prompts. Each ≈ $0.01 API cost; your fee routes to coverage.
                </p>
              </div>
            </div>
            <Link href="/upgrade" className="btn-ink flex-shrink-0">
              Replenish <ArrowUpRight size={14} />
            </Link>
          </aside>
        )}

        {/* ── Course tabs + forum ── */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-0">
            <div className="flex gap-0">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setActiveTab(course.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 font-label text-[11px] uppercase tracking-[0.18em] font-semibold border-b-2 -mb-[2px] transition-colors ${
                    activeTab === course.id
                      ? "text-oxide border-oxide"
                      : "text-ink-fade hover:text-ink border-transparent"
                  }`}
                >
                  <span className="font-display italic text-base normal-case tracking-normal text-ink">
                    {course.id === "aai" ? "I" : "II"}
                  </span>
                  <span>{course.title}</span>
                </button>
              ))}
            </div>
            <Link
              href="/forum"
              className="flex items-center gap-2 px-4 py-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep mb-2"
            >
              <MessageSquare size={13} />
              Forum
              <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* First-time user hint */}
          {activeCourseProgress?.domains.every((d) => !d.started) && (
            <div className="border-2 border-dashed border-ink/30 bg-paper-fade p-5 flex items-start gap-4">
              <span className="font-display italic text-oxide text-3xl leading-none flex-shrink-0">I.</span>
              <div>
                <p className="font-display font-bold text-ink text-lg leading-tight">Begin with Domain I.</p>
                <p className="font-body text-[14px] leading-snug text-ink-soft mt-1">
                  Walk the domains in order — each builds on the last. Study concepts, summon the AI tutor, then sit the domain exam when ready.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activeDomains.map((domain, index) => {
              const domainProgress = activeCourseProgress?.domains.find((d) => d.domainId === domain.id);
              return <DomainCard key={domain.id} domain={domain} domainProgress={domainProgress || null} index={index} />;
            })}
          </div>
        </section>

        {/* ── Exam Traps ── */}
        {activeCourse?.examTraps && activeCourse.examTraps.length > 0 && (
          <section className="border-2 border-ink bg-paper-fade paper-grain relative">
            <div className="border-b-2 border-ink bg-ink text-paper px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="stamp stamp-rotate-back text-oxide border-oxide !transform-none text-[10px]">⚠ Warning</span>
                <h3 className="font-display font-bold text-lg tracking-tight">Known Exam Traps</h3>
              </div>
              <span className="dossier-meta !text-paper/50 hidden sm:block">Classified · Study carefully</span>
            </div>
            <div className="p-8 grid sm:grid-cols-2 gap-x-10 gap-y-4 relative z-10">
              {activeCourse.examTraps.map((trap, i) => (
                <div key={trap} className="flex items-start gap-4">
                  <span className="font-display italic text-oxide text-xl leading-none tabular flex-shrink-0 w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-body text-[15px] leading-[1.55] text-ink">{trap}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer mark ── */}
        <footer className="pt-8 pb-4 flex items-center justify-between border-t-2 border-ink">
          <span className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade">
            © {new Date().getFullYear()} · Learn Agent Architecture
          </span>
          <span className="font-display italic text-ink">— End of File —</span>
        </footer>
      </div>
    </div>
  );
}
