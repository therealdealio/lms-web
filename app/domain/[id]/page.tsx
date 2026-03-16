"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  Code,
  CheckCircle,
  Brain,
} from "lucide-react";
import { getDomain } from "@/lib/curriculum";
import { loadProgress, markDomainStarted } from "@/lib/progress";
import { Domain } from "@/lib/types";
import AiChat from "@/components/AiChat";
import ConceptQuiz from "@/components/ConceptQuiz";

export default function DomainPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = parseInt(params.id as string);

  const [domain, setDomain] = useState<Domain | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<number>>(new Set([0]));
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const progress = loadProgress();
    if (!progress.user) {
      router.push("/");
      return;
    }

    const d = getDomain(domainId);
    if (!d) {
      router.push("/dashboard");
      return;
    }

    setDomain(d);
    markDomainStarted(domainId);
    setHasStarted(true);
  }, [domainId, router]);

  const toggleConcept = (index: number) => {
    setExpandedConcepts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!domain) return;
    setExpandedConcepts(new Set(domain.concepts.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedConcepts(new Set());
  };

  if (!domain) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const domainColors = [
    { bg: "from-brand-50 to-orange-50", border: "border-brand-200", badge: "bg-brand-50 text-brand-700 border-brand-200" },
    { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    { bg: "from-teal-50 to-emerald-50", border: "border-teal-200", badge: "bg-teal-50 text-teal-700 border-teal-200" },
    { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    { bg: "from-rose-50 to-pink-50", border: "border-rose-200", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  ];
  const color = domainColors[(domain.id - 1) % domainColors.length];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/20 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-9 h-9 rounded-xl shadow-sm" />
            <span className="hidden sm:flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm">
              <ArrowLeft size={14} />
              Dashboard
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-dark-400 hidden sm:block">
              Section {domain.id} of 8
            </span>
            <Link
              href={`/domain/${domain.id}/practice`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-medium transition-all shadow-sm"
            >
              <CheckCircle size={14} />
              Take Practice Exam
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Domain header */}
        <div className={`p-8 rounded-2xl bg-gradient-to-br ${color.bg} border ${color.border} shadow-sm space-y-4`}>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{domain.icon}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs border ${color.badge}`}>
                  Domain {domain.id}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs border ${color.badge}`}>
                  {domain.weight}% of Exam
                </span>
                <span className={`px-3 py-1 rounded-full text-xs border ${color.badge}`}>
                  {domain.concepts.length} Concepts
                </span>
                <span className={`px-3 py-1 rounded-full text-xs border ${color.badge}`}>
                  {domain.questions.length} Practice Questions
                </span>
              </div>
              <h1 className="text-3xl font-bold text-dark-50">{domain.title}</h1>
              <p className="text-dark-300 mt-2 leading-relaxed">{domain.description}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={expandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white border border-dark-700 text-dark-400 hover:text-dark-100 text-xs transition-colors"
            >
              <ChevronDown size={14} />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white border border-dark-700 text-dark-400 hover:text-dark-100 text-xs transition-colors"
            >
              <ChevronUp size={14} />
              Collapse All
            </button>
          </div>
        </div>

        {/* Concepts */}
        <div className="space-y-4">
          {domain.concepts.map((concept, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white border border-dark-700 shadow-sm overflow-hidden"
            >
              {/* Concept header */}
              <button
                onClick={() => toggleConcept(index)}
                className="w-full flex items-center justify-between p-6 hover:bg-dark-950 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-50">{concept.title}</h3>
                    {!expandedConcepts.has(index) && (
                      <p className="text-dark-400 text-sm mt-0.5 line-clamp-1">
                        {concept.content.slice(0, 80)}...
                      </p>
                    )}
                  </div>
                </div>
                {expandedConcepts.has(index) ? (
                  <ChevronUp size={18} className="text-dark-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-dark-400 flex-shrink-0" />
                )}
              </button>

              {/* Concept content */}
              {expandedConcepts.has(index) && (
                <div className="px-6 pb-6 space-y-6 border-t border-dark-700">
                  {/* Main content */}
                  <div className="pt-4">
                    <p className="text-dark-300 leading-relaxed">{concept.content}</p>
                  </div>

                  {/* Key points */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-brand-600" />
                      <h4 className="font-semibold text-dark-50 text-sm">Key Points</h4>
                    </div>
                    <div className="space-y-2">
                      {concept.keyPoints.map((point, pi) => (
                        <div key={pi} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                          </div>
                          <p className="text-dark-200 text-sm leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exam trap */}
                  {concept.examTrap && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        <h4 className="font-semibold text-red-700 text-sm">Exam Trap</h4>
                      </div>
                      <p className="text-red-700 text-sm leading-relaxed">{concept.examTrap}</p>
                    </div>
                  )}

                  {/* Code example */}
                  {concept.codeExample && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Code size={16} className="text-brand-600" />
                        <h4 className="font-semibold text-dark-100 text-sm">Code Example</h4>
                      </div>
                      <pre className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-sm text-gray-100 leading-relaxed overflow-x-auto">
                        <code>{concept.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Free-text knowledge check */}
                  <ConceptQuiz
                    conceptTitle={concept.title}
                    conceptContent={concept.content}
                    keyPoints={concept.keyPoints}
                    domainName={domain.title}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Practice button */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 rounded-2xl bg-brand-50 border border-brand-200 shadow-sm">
          <div>
            <h3 className="font-bold text-dark-50">Ready to test your knowledge?</h3>
            <p className="text-dark-400 text-sm mt-1">
              Take the practice exam with {domain.questions.length} questions. Need ≥70% to pass.
            </p>
          </div>
          <Link
            href={`/domain/${domain.id}/practice`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all whitespace-nowrap shadow-sm"
          >
            Start Practice Exam
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* AI Chat */}
        <AiChat
          domainName={domain.title}
          domainId={domain.id}
          context={`Domain ${domain.id}: ${domain.title}. Key concepts: ${domain.concepts.map((c) => c.title).join(", ")}.`}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-dark-700">
          {domain.id > 1 ? (
            <Link
              href={`/domain/${domain.id - 1}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dark-700 hover:bg-dark-950 text-dark-300 hover:text-dark-100 text-sm transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              Section {domain.id - 1}
            </Link>
          ) : (
            <div />
          )}

          {domain.id < 8 ? (
            <Link
              href={`/domain/${domain.id + 1}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dark-700 hover:bg-dark-950 text-dark-300 hover:text-dark-100 text-sm transition-colors shadow-sm"
            >
              Section {domain.id + 1}
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dark-700 hover:bg-dark-950 text-dark-300 hover:text-dark-100 text-sm transition-colors shadow-sm"
            >
              Back to Dashboard
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
