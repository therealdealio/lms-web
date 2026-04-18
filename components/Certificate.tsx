"use client";

import { AppProgress, CourseProgress, Course } from "@/lib/types";

interface CertificateProps {
  progress: AppProgress;
  courseProgress: CourseProgress;
  course: Course;
}

const ROMANS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"];

export default function Certificate({ progress, courseProgress, course }: CertificateProps) {
  if (!progress.user) return null;

  const completionDate = courseProgress.certificateEarnedAt
    ? new Date(courseProgress.certificateEarnedAt)
    : new Date();
  const dateString = completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const serial = `№ ${course.id.toUpperCase()}-${String(completionDate.getTime()).slice(-6)}`;

  const passedDomains = courseProgress.domains.filter((d) => d.completed);
  const avgScore =
    passedDomains.length > 0
      ? Math.round(passedDomains.reduce((sum, d) => sum + (d.examScore || 0), 0) / passedDomains.length)
      : 0;

  return (
    <article className="certificate-print relative w-full max-w-4xl mx-auto bg-paper border-2 border-ink shadow-[8px_8px_0_0_var(--ink)] print:shadow-none paper-grain">
      {/* Engraved rule frame */}
      <div className="absolute inset-4 border border-ink/30 pointer-events-none" />
      <div className="absolute inset-6 border border-ink/15 pointer-events-none" />

      {/* Corner ticks */}
      <span aria-hidden className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-oxide pointer-events-none" />
      <span aria-hidden className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-oxide pointer-events-none" />
      <span aria-hidden className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-oxide pointer-events-none" />
      <span aria-hidden className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-oxide pointer-events-none" />

      {/* Masthead */}
      <header className="relative border-b border-ink px-14 py-5 flex items-center justify-between">
        <div className="dossier-meta">{serial}</div>
        <div className="dossier-meta text-oxide">Certificate of Completion</div>
        <div className="dossier-meta tabular">{completionDate.getFullYear()}</div>
      </header>

      <div className="relative z-10 px-14 py-12 space-y-10">

        {/* Recipient */}
        <div className="text-center space-y-3">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-ink-fade">Hereby affirms</p>
          <h1 className="font-display font-bold text-ink text-[5rem] lg:text-[6rem] leading-[0.88] tracking-[-0.04em]">
            {progress.user.name}
          </h1>
          <p className="font-body text-sm text-ink-fade italic">{progress.user.email}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-ink/40" />
          <span className="font-display italic text-oxide text-xl">§</span>
          <div className="flex-1 h-px bg-ink/40" />
        </div>

        {/* Achievement */}
        <div className="text-center space-y-4">
          <p className="font-body italic text-ink-soft text-lg">has satisfied all requirements of the</p>
          <h2 className="font-display font-bold text-ink text-3xl lg:text-4xl leading-tight tracking-[-0.02em] max-w-2xl mx-auto">
            {course.title}
            {course.subtitle && (
              <>
                <br />
                <span className="italic font-light text-oxide text-2xl lg:text-3xl" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                  — {course.subtitle} —
                </span>
              </>
            )}
          </h2>
          <p className="font-body text-[15px] leading-[1.55] text-ink-soft max-w-xl mx-auto">
            {course.description}
          </p>
        </div>

        {/* Stats ledger */}
        <div className="border-2 border-ink bg-paper-fade">
          <div className="grid grid-cols-3 divide-x-2 divide-ink">
            <div className="p-6 text-center">
              <div className="dossier-meta mb-2">§ Avg Score</div>
              <div className="font-display font-bold text-ink text-5xl leading-none tabular">
                {avgScore}<span className="text-oxide text-3xl">%</span>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="dossier-meta mb-2">§ Domains</div>
              <div className="font-display font-bold text-ink text-5xl leading-none tabular">
                {passedDomains.length}<span className="text-ink-fade text-2xl">/{course.domains.length}</span>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="dossier-meta mb-2">§ Completed</div>
              <div className="font-display font-bold text-ink text-2xl leading-tight tabular">
                {dateString}
              </div>
            </div>
          </div>
        </div>

        {/* Domain ledger */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-ink/40" />
            <span className="dossier-meta">Domain Ledger</span>
            <div className="flex-1 h-px bg-ink/40" />
          </div>
          <ol className="space-y-1.5">
            {course.domains.map((domain, idx) => {
              const dp = courseProgress.domains.find((d) => d.domainId === domain.id);
              const score = dp?.examScore ?? 0;
              const roman = ROMANS[idx] || String(idx + 1);
              return (
                <li key={domain.id} className="grid grid-cols-[3rem_1fr_auto] gap-4 items-baseline py-1.5 border-b border-dotted border-ink/20">
                  <span className="font-display italic text-oxide tabular text-lg">
                    {roman}.
                  </span>
                  <span className="font-body text-[15px] text-ink truncate">{domain.title}</span>
                  <span className="font-display font-bold text-emerald-700 tabular text-lg">{score}%</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-10 pt-8 border-t border-ink/30">
          <div className="text-center">
            <div className="font-accent italic text-ink-soft text-2xl mb-1">Community</div>
            <div className="border-b border-ink/70 pb-1 mb-2" />
            <p className="dossier-meta">Awarding Body</p>
          </div>
          <div className="text-center">
            <div className="font-accent italic text-oxide text-2xl mb-1">Tutor · Claude</div>
            <div className="border-b border-ink/70 pb-1 mb-2" />
            <p className="dossier-meta">AI Examiner</p>
          </div>
        </div>

        <p className="font-body italic text-ink-fade text-xs text-center leading-snug max-w-lg mx-auto">
          This is an informal community recognition. Independent resource. Not affiliated with or endorsed by Anthropic PBC.
        </p>
      </div>

      {/* Foot rule */}
      <footer className="relative border-t border-ink px-14 py-4 flex items-center justify-between">
        <span className="dossier-meta">learnagentarchitecture.com</span>
        <span className="font-display italic text-ink">— Seal —</span>
        <span className="dossier-meta tabular">{completionDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
      </footer>
    </article>
  );
}
