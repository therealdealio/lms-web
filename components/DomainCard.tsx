"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Domain, DomainProgress } from "@/lib/types";
import { PASSING_SCORE, getDomainNumber } from "@/lib/curriculum";

interface DomainCardProps {
  domain: Domain;
  domainProgress: DomainProgress | null;
  index: number;
}

export default function DomainCard({ domain, domainProgress, index }: DomainCardProps) {
  const isCompleted = domainProgress?.completed || false;
  const isStarted = domainProgress?.started || false;
  const examScore = domainProgress?.examScore;
  const hasPassed = examScore !== null && examScore !== undefined && examScore >= PASSING_SCORE;
  const domainNum = getDomainNumber(domain.id);
  const roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"][domainNum - 1] || String(domainNum);

  return (
    <article
      className="group relative border-2 border-ink bg-paper-fade p-5 transition-all duration-200 hover:bg-paper hover:shadow-[4px_4px_0_0_var(--ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] flex flex-col gap-4 min-h-[280px]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top metadata rail */}
      <header className="flex items-start justify-between gap-3 pb-3 border-b border-ink/15">
        <div className="flex items-baseline gap-3">
          <span className="font-display italic text-oxide text-3xl leading-none tabular">
            {roman}
          </span>
          <div>
            <div className="font-label text-[10px] uppercase tracking-[0.16em] text-ink-fade">
              Domain · {domain.weight}%
            </div>
            <div className="font-label text-[10px] uppercase tracking-[0.16em] text-oxide mt-0.5">
              {isCompleted ? "✓ Passed" : isStarted ? "◐ In Progress" : "○ Untouched"}
            </div>
          </div>
        </div>
        <span className="text-2xl leading-none grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
          {domain.icon}
        </span>
      </header>

      {/* Title + tagline */}
      <div className="flex-1">
        <h3 className="font-display font-bold text-ink text-xl leading-tight tracking-[-0.02em] mb-2">
          {domain.title}
        </h3>
        <p className="font-body text-[14px] leading-[1.5] text-ink-soft line-clamp-3">
          {domain.tagline}
        </p>
      </div>

      {/* Exam score bar */}
      {examScore !== null && examScore !== undefined && (
        <div className="space-y-1.5 border-t border-ink/15 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-label text-[10px] uppercase tracking-[0.16em] text-ink-fade">
              Best · Exam
            </span>
            <span className={`font-display font-bold tabular text-lg leading-none ${hasPassed ? "text-emerald-700" : "text-oxide"}`}>
              {examScore}<span className="text-sm">%</span>
              {!hasPassed && (
                <span className="ml-2 font-label text-[9px] uppercase tracking-[0.14em] text-ink-fade font-normal">
                  ({PASSING_SCORE}% req.)
                </span>
              )}
            </span>
          </div>
          <div className="h-[3px] bg-ink/10 overflow-hidden">
            <div
              className={`h-full ${hasPassed ? "bg-emerald-700" : "bg-oxide"}`}
              style={{ width: `${examScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-ink/15 pt-3">
        <Link
          href={`/domain/${domain.id}`}
          className={`${isStarted ? "flex-1" : "w-full"} flex items-center justify-between gap-2 px-4 py-2.5 bg-ink text-paper hover:bg-oxide font-label text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors`}
        >
          <span>{isStarted ? (isCompleted ? "Review" : "Continue") : "Begin Study"}</span>
          <ArrowUpRight size={14} />
        </Link>
        {isStarted && (
          <Link
            href={`/domain/${domain.id}/practice`}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-ink bg-paper hover:bg-ink hover:text-paper text-ink font-label text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
          >
            {isCompleted ? "Re-Exam" : "Exam"}
          </Link>
        )}
      </div>

      {/* Footer metadata */}
      <footer className="flex items-center justify-between font-label text-[10px] uppercase tracking-[0.16em] text-ink-fade -mt-1">
        <span>{domain.questions.length} questions</span>
        <span className="text-ink/30">·</span>
        <span>{domain.concepts.length} concepts</span>
      </footer>
    </article>
  );
}
