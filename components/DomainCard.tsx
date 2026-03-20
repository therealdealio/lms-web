"use client";

import Link from "next/link";
import { CheckCircle, Play, RotateCcw, ArrowRight, Trophy } from "lucide-react";
import { Domain, DomainProgress } from "@/lib/types";
import { PASSING_SCORE } from "@/lib/curriculum";
import ProgressBar from "./ProgressBar";

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

  return (
    <div
      className="relative p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 transition-all duration-200 card-glow shadow-sm space-y-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Status badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <CheckCircle size={12} />
          Passed
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{domain.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/8 text-primary border border-primary/15 font-label font-bold">
              Domain {domain.id} · {domain.weight}% of exam
            </span>
            <h3 className="font-headline font-bold text-on-surface text-base leading-snug mt-1">{domain.title}</h3>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          {domain.tagline}
        </p>
      </div>

      {/* Exam score */}
      {examScore !== null && examScore !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Best Exam Score</span>
            <span className={`font-bold ${hasPassed ? "text-emerald-600" : "text-red-500"}`}>
              {examScore}%
              {hasPassed ? (
                <Trophy size={14} className="inline ml-1" />
              ) : (
                <span className="ml-1 text-xs">({PASSING_SCORE}% needed)</span>
              )}
            </span>
          </div>
          <ProgressBar
            value={examScore}
            color={hasPassed ? "green" : "red"}
            size="sm"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Link
          href={`/domain/${domain.id}`}
          className={`${isStarted ? "flex-1" : "w-full"} flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-headline font-bold transition-all hover:opacity-90 shadow-sm`}
        >
          <Play size={14} />
          {isStarted ? (isCompleted ? "Review" : "Continue") : "Start Learning"}
        </Link>

        {isStarted && (
          <Link
            href={`/domain/${domain.id}/practice`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-sm font-label font-medium transition-all border border-outline-variant/30"
          >
            {isCompleted ? <RotateCcw size={14} /> : <ArrowRight size={14} />}
            Exam
          </Link>
        )}
      </div>

      {/* Questions count */}
      <div className="text-xs text-on-surface-variant/60 text-center font-label">
        {domain.questions.length} practice questions · {domain.concepts.length} concepts
      </div>
    </div>
  );
}