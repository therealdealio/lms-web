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

  const colors: Record<number, { border: string; badge: string; button: string }> = {
    1: {
      border: "border-brand-200 hover:border-brand-400",
      badge: "bg-brand-50 text-brand-700 border-brand-200",
      button: "from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600",
    },
    2: {
      border: "border-amber-200 hover:border-amber-400",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      button: "from-amber-500 to-accent-600 hover:from-amber-400 hover:to-accent-500",
    },
    3: {
      border: "border-teal-200 hover:border-teal-400",
      badge: "bg-teal-50 text-teal-700 border-teal-200",
      button: "from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500",
    },
    4: {
      border: "border-blue-200 hover:border-blue-400",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      button: "from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500",
    },
    5: {
      border: "border-rose-200 hover:border-rose-400",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      button: "from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500",
    },
  };

  const colorSet = colors[domain.id] || colors[1];

  return (
    <div
      className={`relative p-6 rounded-2xl bg-white border ${colorSet.border} transition-all duration-200 card-glow shadow-sm space-y-5`}
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
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{domain.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs border ${colorSet.badge}`}>
                Domain {domain.id} · {domain.weight}%
              </span>
            </div>
            <h3 className="font-bold text-dark-50 text-lg leading-tight">{domain.title}</h3>
          </div>
        </div>

        <p className="text-dark-400 text-sm leading-relaxed line-clamp-2">
          {domain.description}
        </p>
      </div>

      {/* Concepts list */}
      <div className="space-y-1">
        <p className="text-xs text-dark-500 uppercase tracking-wider font-medium">Topics</p>
        <div className="space-y-1">
          {domain.concepts.slice(0, 3).map((concept) => (
            <div key={concept.title} className="flex items-center gap-2 text-xs text-dark-400">
              <div className="w-1.5 h-1.5 rounded-full bg-dark-600 flex-shrink-0" />
              {concept.title}
            </div>
          ))}
          {domain.concepts.length > 3 && (
            <div className="text-xs text-dark-500">
              +{domain.concepts.length - 3} more topics
            </div>
          )}
        </div>
      </div>

      {/* Exam score */}
      {examScore !== null && examScore !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400">Best Exam Score</span>
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
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${colorSet.button} text-white text-sm font-medium transition-all shadow-sm`}
        >
          <Play size={14} />
          {isStarted ? (isCompleted ? "Review" : "Continue") : "Start"}
        </Link>

        <Link
          href={`/domain/${domain.id}/practice`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-200 hover:text-dark-50 text-sm font-medium transition-all border border-dark-700"
        >
          {isCompleted ? <RotateCcw size={14} /> : <ArrowRight size={14} />}
          Exam
        </Link>
      </div>

      {/* Questions count */}
      <div className="text-xs text-dark-500 text-center">
        {domain.questions.length} practice questions · {domain.concepts.length} concepts
      </div>
    </div>
  );
}
