"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import { getDomain, getCourseForDomain, getDomainNumber } from "@/lib/curriculum";
import { loadProgress, markDomainStarted } from "@/lib/progress";
import { Domain } from "@/lib/types";

const AiChat = dynamic(() => import("@/components/AiChat"), {
  loading: () => <div className="h-24 border-2 border-ink/20 bg-paper-fade animate-pulse" />,
});

const ConceptQuiz = dynamic(() => import("@/components/ConceptQuiz"), {
  loading: () => <div className="h-16 border border-ink/20 bg-paper-fade animate-pulse" />,
});

const ROMANS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"];

export default function DomainPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

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
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="font-label text-[11px] uppercase tracking-[0.2em] text-ink flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 bg-oxide animate-pulse" />
          Retrieving Domain…
        </div>
      </div>
    );
  }

  const course = getCourseForDomain(domain.id);
  const domainNum = getDomainNumber(domain.id);
  const roman = ROMANS[domainNum - 1] || String(domainNum);
  const domainsInCourse = course?.domains ?? [];
  const domainIndex = domainsInCourse.findIndex((d) => d.id === domain.id);
  const prevDomain = domainIndex > 0 ? domainsInCourse[domainIndex - 1] : null;
  const nextDomain = domainIndex < domainsInCourse.length - 1 ? domainsInCourse[domainIndex + 1] : null;

  return (
    <div className="min-h-screen bg-paper text-ink paper-fiber">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-paper/92 backdrop-blur-sm border-b border-ink">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-8 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep">
            <ArrowLeft size={13} />
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="dossier-meta hidden sm:block">
              Domain {roman} of {ROMANS[domainsInCourse.length - 1] || domainsInCourse.length}
            </span>
            <Link
              href={`/domain/${domain.id}/practice`}
              className="btn-ink"
            >
              Sit Exam <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Dossier strip */}
      <div className="border-b border-ink">
        <div className="max-w-5xl mx-auto px-8 py-3 flex flex-wrap items-center justify-between gap-3 dossier-meta">
          <span className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-oxide rounded-full animate-pulse" />
            Study Session · {domain.id.toUpperCase()}
          </span>
          <span className="hidden md:block">{course?.title ?? ""}</span>
          <span>{domain.concepts.length} concepts · {domain.questions.length} questions</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">

        {/* Domain header */}
        <header className="space-y-6">
          <div className="flex items-baseline gap-6">
            <span className="font-display italic text-oxide text-7xl lg:text-8xl leading-none tabular flex-shrink-0">
              {roman}.
            </span>
            <div className="flex-1 pt-2">
              <div className="dossier-meta mb-2">
                Domain · {domain.weight}% of Exam
              </div>
              <h1 className="font-display font-bold text-ink text-4xl lg:text-5xl leading-[0.95] tracking-[-0.03em]">
                {domain.title}
              </h1>
            </div>
            <span className="text-5xl leading-none flex-shrink-0 hidden sm:block">{domain.icon}</span>
          </div>

          <div className="rule-thick" />

          <p className="font-body text-[17px] leading-[1.6] text-ink-soft max-w-3xl">{domain.description}</p>
        </header>

        {/* Plain English */}
        <aside className="border-2 border-ink bg-paper-fade p-6 flex gap-5">
          <span className="font-display italic text-oxide text-4xl leading-none flex-shrink-0">§</span>
          <div>
            <div className="dossier-meta mb-1.5">Plain Reading</div>
            <p className="font-body text-[16px] text-ink leading-[1.55]">{domain.plainEnglish}</p>
          </div>
        </aside>

        {/* Concepts */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
            <div>
              <div className="section-no !text-3xl">№ 01</div>
              <div className="dossier-meta">The Concepts</div>
              <h2 className="font-display font-bold text-ink text-3xl tracking-[-0.02em] mt-1">
                {domain.concepts.length} Readings.
              </h2>
            </div>
            <div className="flex gap-2">
              <button onClick={expandAll}
                className="flex items-center gap-1.5 px-3 py-2 border border-ink text-ink hover:bg-ink hover:text-paper font-label text-[10px] uppercase tracking-[0.18em] transition-colors">
                <ChevronDown size={12} /> Open All
              </button>
              <button onClick={collapseAll}
                className="flex items-center gap-1.5 px-3 py-2 border border-ink text-ink hover:bg-ink hover:text-paper font-label text-[10px] uppercase tracking-[0.18em] transition-colors">
                <ChevronUp size={12} /> Close All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {domain.concepts.map((concept, index) => {
              const isOpen = expandedConcepts.has(index);
              return (
                <article key={index} className="border-2 border-ink bg-paper-fade overflow-hidden">
                  <button
                    onClick={() => toggleConcept(index)}
                    className={`w-full flex items-center justify-between p-5 transition-colors text-left ${isOpen ? "bg-ink text-paper" : "hover:bg-paper"}`}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className={`font-display italic tabular text-3xl leading-none flex-shrink-0 w-10 ${isOpen ? "text-foil" : "text-oxide"}`}>
                        {String(index + 1).padStart(2, "0")}.
                      </span>
                      <div>
                        <div className={`dossier-meta ${isOpen ? "!text-paper/60" : ""}`}>Reading {index + 1}</div>
                        <h3 className={`font-display font-bold text-lg leading-tight tracking-[-0.01em] mt-0.5 ${isOpen ? "text-paper" : "text-ink"}`}>
                          {concept.title}
                        </h3>
                        {!isOpen && (
                          <p className="font-body text-[14px] text-ink-fade mt-1 line-clamp-1 max-w-2xl">
                            {concept.content.slice(0, 120)}…
                          </p>
                        )}
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronUp size={17} className="text-paper/70 flex-shrink-0" />
                      : <ChevronDown size={17} className="text-ink-fade flex-shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="p-7 space-y-7 border-t-2 border-ink bg-paper">

                      {/* Main body */}
                      <p className="font-body text-[16px] leading-[1.65] text-ink first-letter:font-display first-letter:font-bold first-letter:text-[3rem] first-letter:float-left first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1 first-letter:text-oxide">
                        {concept.content}
                      </p>

                      {/* Key points */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 border-b border-ink/15 pb-2">
                          <span className="font-display italic text-oxide text-xl leading-none">✦</span>
                          <h4 className="font-label text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">Key Points</h4>
                        </div>
                        <ol className="space-y-2.5">
                          {concept.keyPoints.map((point, pi) => (
                            <li key={pi} className="grid grid-cols-[2rem_1fr] gap-3 items-baseline">
                              <span className="font-display italic text-oxide tabular">
                                {String.fromCharCode(97 + pi)}.
                              </span>
                              <span className="font-body text-[15px] leading-[1.55] text-ink">{point}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Exam trap */}
                      {concept.examTrap && (
                        <div className="border-2 border-oxide bg-oxide/5 p-5 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="stamp text-oxide border-oxide">⚠ Trap</span>
                            <h4 className="font-display font-bold text-ink text-base">Exam Trap</h4>
                          </div>
                          <div className="rule-hair" />
                          <p className="font-body text-[15px] leading-[1.55] text-ink">{concept.examTrap}</p>
                        </div>
                      )}

                      {/* Code example */}
                      {concept.codeExample && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 border-b border-ink/15 pb-2">
                            <span className="dossier-meta">Code Specimen</span>
                          </div>
                          <pre className="text-[0.82rem]"><code>{concept.codeExample}</code></pre>
                        </div>
                      )}

                      {/* Concept quiz */}
                      <ConceptQuiz
                        conceptTitle={concept.title}
                        conceptContent={concept.content}
                        keyPoints={concept.keyPoints}
                        domainName={domain.title}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Practice exam CTA */}
        <aside className="border-2 border-ink bg-ink text-paper p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between relative overflow-hidden">
          <span aria-hidden className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-foil pointer-events-none" />
          <span aria-hidden className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-foil pointer-events-none" />
          <div>
            <div className="dossier-meta !text-paper/60 mb-2">Examination</div>
            <h3 className="font-display font-bold text-3xl tracking-[-0.02em] leading-tight">
              Ready to be <span className="italic font-light text-foil" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>tested</span>, candidate?
            </h3>
            <p className="font-body text-[15px] leading-snug text-paper/70 mt-2">
              {domain.questions.length} exam-style questions · pass mark {">= 70%"}
            </p>
          </div>
          <Link
            href={`/domain/${domain.id}/practice`}
            className="flex-shrink-0 flex items-center gap-2 bg-foil text-ink hover:bg-paper px-6 py-3 font-label text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
          >
            Sit Exam <ArrowUpRight size={14} />
          </Link>
        </aside>

        {/* AI Chat */}
        <section className="space-y-3">
          <div className="flex items-end gap-4 border-b-2 border-ink pb-2">
            <div className="section-no !text-3xl">№ 02</div>
            <div className="flex-1">
              <div className="dossier-meta">The Tutor</div>
              <h2 className="font-display font-bold text-ink text-2xl tracking-[-0.02em]">
                Consult Claude on this Domain.
              </h2>
            </div>
          </div>
          <AiChat
            domainName={domain.title}
            domainId={domain.id}
            context={`Domain ${domainNum}: ${domain.title}. Key concepts: ${domain.concepts.map((c) => c.title).join(", ")}.`}
          />
        </section>

        {/* Prev / Next */}
        <nav className="flex justify-between items-center pt-6 border-t-2 border-ink gap-4">
          {prevDomain ? (
            <Link href={`/domain/${prevDomain.id}`}
              className="flex items-center gap-2 px-4 py-2.5 border border-ink text-ink hover:bg-ink hover:text-paper font-label text-[11px] uppercase tracking-[0.18em] transition-colors">
              <ArrowLeft size={13} />
              <span>Previous · {ROMANS[getDomainNumber(prevDomain.id) - 1] || getDomainNumber(prevDomain.id)}</span>
            </Link>
          ) : <div />}

          {nextDomain ? (
            <Link href={`/domain/${nextDomain.id}`}
              className="flex items-center gap-2 px-4 py-2.5 border border-ink text-ink hover:bg-ink hover:text-paper font-label text-[11px] uppercase tracking-[0.18em] transition-colors">
              <span>Next · {ROMANS[getDomainNumber(nextDomain.id) - 1] || getDomainNumber(nextDomain.id)}</span>
              <ArrowUpRight size={13} />
            </Link>
          ) : (
            <Link href="/dashboard" className="btn-ink">
              Return to Dashboard <ArrowUpRight size={14} />
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
