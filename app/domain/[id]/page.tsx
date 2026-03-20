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

  useEffect(() => {
    const progress = loadProgress();
    if (!progress.user) { router.push("/"); return; }
    const d = getDomain(domainId);
    if (!d) { router.push("/dashboard"); return; }
    setDomain(d);
    markDomainStarted(domainId);
  }, [domainId, router]);

  const toggleConcept = (index: number) => {
    setExpandedConcepts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); } else { next.add(index); }
      return next;
    });
  };

  const expandAll = () => { if (domain) setExpandedConcepts(new Set(domain.concepts.map((_, i) => i))); };
  const collapseAll = () => setExpandedConcepts(new Set());

  if (!domain) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-outline-variant/20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium">
            <ArrowLeft size={15} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant font-label hidden sm:block">
              Domain {domain.id} of 8
            </span>
            <Link
              href={`/domain/${domain.id}/practice`}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-headline font-bold hover:opacity-90 transition-all shadow-sm"
            >
              <CheckCircle size={14} />
              Practice Exam
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Plain English intro */}
        <div className="flex gap-4 p-5 rounded-xl bg-primary/5 border border-primary/15">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-headline font-bold text-primary uppercase tracking-wider mb-1">In Plain English</p>
            <p className="text-on-surface text-sm leading-relaxed">{domain.plainEnglish}</p>
          </div>
        </div>

        {/* Domain header */}
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-headline font-bold bg-primary/8 text-primary">
              Domain {domain.id}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-label bg-surface-container text-on-surface-variant">
              {domain.weight}% of Exam
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-label bg-surface-container text-on-surface-variant">
              {domain.concepts.length} Concepts
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-label bg-surface-container text-on-surface-variant">
              {domain.questions.length} Practice Questions
            </span>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-5xl flex-shrink-0">{domain.icon}</span>
            <div>
              <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">{domain.title}</h1>
              <p className="text-on-surface-variant mt-2 leading-relaxed">{domain.description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={expandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-label transition-colors">
              <ChevronDown size={13} /> Expand All
            </button>
            <button onClick={collapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-label transition-colors">
              <ChevronUp size={13} /> Collapse All
            </button>
          </div>
        </div>

        {/* Concepts */}
        <div className="space-y-3">
          {domain.concepts.map((concept, index) => (
            <div key={index} className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 overflow-hidden shadow-sm">

              {/* Concept header */}
              <button
                onClick={() => toggleConcept(index)}
                className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-headline font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">{concept.title}</h3>
                    {!expandedConcepts.has(index) && (
                      <p className="text-on-surface-variant text-sm mt-0.5 line-clamp-1">
                        {concept.content.slice(0, 90)}...
                      </p>
                    )}
                  </div>
                </div>
                {expandedConcepts.has(index)
                  ? <ChevronUp size={17} className="text-on-surface-variant flex-shrink-0" />
                  : <ChevronDown size={17} className="text-on-surface-variant flex-shrink-0" />}
              </button>

              {/* Concept content */}
              {expandedConcepts.has(index) && (
                <div className="px-5 pb-6 space-y-6 border-t border-outline-variant/15">

                  {/* Main content */}
                  <p className="pt-5 text-on-surface-variant leading-relaxed">{concept.content}</p>

                  {/* Key points */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} className="text-primary" />
                      <h4 className="font-headline font-bold text-on-surface text-sm">Key Points</h4>
                    </div>
                    <div className="space-y-2 pl-1">
                      {concept.keyPoints.map((point, pi) => (
                        <div key={pi} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <p className="text-on-surface text-sm leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exam trap */}
                  {concept.examTrap && (
                    <div className="p-4 rounded-lg bg-error-container/20 border border-error/20 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-error" />
                        <h4 className="font-headline font-bold text-on-surface text-sm">Exam Trap</h4>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed">{concept.examTrap}</p>
                    </div>
                  )}

                  {/* Code example */}
                  {concept.codeExample && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Code size={15} className="text-primary" />
                        <h4 className="font-headline font-bold text-on-surface text-sm">Code Example</h4>
                      </div>
                      <pre className="p-4 rounded-lg bg-inverse-surface text-inverse-on-surface text-xs leading-relaxed overflow-x-auto">
                        <code>{concept.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* AI Quiz */}
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

        {/* Practice Exam CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 rounded-xl bg-primary/5 border border-primary/15">
          <div>
            <h3 className="font-headline font-bold text-on-surface">Ready to test your knowledge?</h3>
            <p className="text-on-surface-variant text-sm mt-1 font-label">
              {domain.questions.length} practice questions · Need ≥70% to pass
            </p>
          </div>
          <Link
            href={`/domain/${domain.id}/practice`}
            className="flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-sm hover:opacity-90 transition-all whitespace-nowrap shadow-sm"
          >
            Start Practice Exam
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* AI Chat */}
        <AiChat
          domainName={domain.title}
          domainId={domain.id}
          context={`Domain ${domain.id}: ${domain.title}. Key concepts: ${domain.concepts.map((c) => c.title).join(", ")}.`}
        />

        {/* Prev / Next navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          {domain.id > 1 ? (
            <Link href={`/domain/${domain.id - 1}`}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 text-on-surface-variant hover:text-primary text-sm font-label transition-colors shadow-sm">
              <ArrowLeft size={15} />
              Domain {domain.id - 1}
            </Link>
          ) : <div />}

          {domain.id < 8 ? (
            <Link href={`/domain/${domain.id + 1}`}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 text-on-surface-variant hover:text-primary text-sm font-label transition-colors shadow-sm">
              Domain {domain.id + 1}
              <ArrowRight size={15} />
            </Link>
          ) : (
            <Link href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-headline font-bold hover:opacity-90 transition-all shadow-sm">
              Back to Dashboard
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
