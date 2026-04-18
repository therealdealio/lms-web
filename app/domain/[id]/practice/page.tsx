"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { getDomain, getCourseForDomain, getDomainNumber, PASSING_SCORE } from "@/lib/curriculum";
import { loadProgress, saveDomainExamScore } from "@/lib/progress";
import { Domain } from "@/lib/types";
import QuestionCard from "@/components/QuestionCard";
import AiChat from "@/components/AiChat";

interface Answer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

const ROMANS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"];

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const [domain, setDomain] = useState<Domain | null>(null);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = loadProgress();
    if (!progress.user) { router.push("/"); return; }
    const d = getDomain(domainId);
    if (!d) { router.push("/dashboard"); return; }
    setDomain(d);
  }, [domainId, router]);

  const handleAnswer = (questionId: string, selectedIndex: number, isCorrect: boolean) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, { questionId, selectedIndex, isCorrect });
      return next;
    });
  };

  const handleSubmit = () => {
    if (!domain) return;
    const totalQuestions = domain.questions.length;
    const correctAnswers = Array.from(answers.values()).filter((a) => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(percentage);
    setSubmitted(true);
    saveDomainExamScore(domainId, percentage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetake = () => {
    setAnswers(new Map());
    setSubmitted(false);
    setScore(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskAI = (question: string, selectedOption: string) => {
    setAiQuestion(
      `I answered "${selectedOption}" to this question: "${question}". Explain why this may be wrong and state the correct ruling.`
    );
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!domain) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="font-label text-[11px] uppercase tracking-[0.2em] text-ink flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 bg-oxide animate-pulse" />
          Retrieving Exam…
        </div>
      </div>
    );
  }

  const course = getCourseForDomain(domain.id);
  const domainNum = getDomainNumber(domain.id);
  const roman = ROMANS[domainNum - 1] || String(domainNum);
  const domainsInCourse = course?.domains ?? [];
  const domainIndex = domainsInCourse.findIndex((d) => d.id === domain.id);
  const nextDomain = domainIndex < domainsInCourse.length - 1 ? domainsInCourse[domainIndex + 1] : null;
  const isLastDomain = domainIndex === domainsInCourse.length - 1;

  const totalQuestions = domain.questions.length;
  const answeredCount = answers.size;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const hasPassed = score !== null && score >= PASSING_SCORE;
  const correctCount = Array.from(answers.values()).filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-paper text-ink paper-fiber">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-paper/92 backdrop-blur-sm border-b border-ink">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-8 py-3">
          <Link
            href={`/domain/${domain.id}`}
            className="flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep"
          >
            <ArrowLeft size={13} />
            Domain {roman}
          </Link>

          <div className="flex items-center gap-4">
            <span className="dossier-meta tabular">
              {answeredCount} / {totalQuestions} answered
            </span>
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="btn-ink disabled:opacity-40 disabled:pointer-events-none"
              >
                Submit Exam <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Dossier strip */}
      <div className="border-b border-ink">
        <div className="max-w-4xl mx-auto px-8 py-3 flex flex-wrap items-center justify-between gap-3 dossier-meta">
          <span className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-oxide rounded-full animate-pulse" />
            Examination · {domain.id.toUpperCase()}
          </span>
          <span className="hidden md:block">Form {domainNum}-E · {domain.title}</span>
          <span className="tabular">{totalQuestions} items · pass mark {PASSING_SCORE}%</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">

        {/* Header */}
        <header className="space-y-5">
          <div className="flex items-baseline gap-6">
            <span className="font-display italic text-oxide text-7xl lg:text-8xl leading-none tabular flex-shrink-0">
              {roman}
            </span>
            <div className="flex-1 pt-2">
              <div className="dossier-meta mb-2">Examination · Form {domainNum}-E</div>
              <h1 className="font-display font-bold text-ink text-4xl lg:text-5xl leading-[0.95] tracking-[-0.03em]">
                {domain.title}
              </h1>
            </div>
            <span className="text-5xl leading-none flex-shrink-0 hidden sm:block">{domain.icon}</span>
          </div>

          {!submitted && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="dossier-meta">Progress</span>
                <span className="font-display font-bold text-ink tabular text-lg">
                  {progressPercent}<span className="text-oxide">%</span>
                </span>
              </div>
              <div className="h-1.5 bg-ink/10 border border-ink/20">
                <div className="h-full bg-ink transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="dossier-meta">
                Answer all {totalQuestions} items, then file your submission.
              </p>
            </div>
          )}
        </header>

        {/* Score result */}
        {submitted && score !== null && (
          <div
            className={`border-2 bg-paper-fade p-8 space-y-6 ${
              hasPassed ? "border-emerald-700" : "border-oxide"
            }`}
          >
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-start gap-5">
                <span className={`font-display italic text-7xl leading-none tabular ${hasPassed ? "text-emerald-700" : "text-oxide"}`}>
                  {score}<span className="text-3xl">%</span>
                </span>
                <div>
                  <div className={`stamp ${hasPassed ? "text-emerald-700 border-emerald-700" : "text-oxide border-oxide"}`}>
                    {hasPassed ? "✓ Affirmed — Passed" : "✕ Overruled — Failed"}
                  </div>
                  <p className="font-body text-[15px] text-ink-soft mt-3 max-w-sm italic">
                    {hasPassed
                      ? `Pass mark cleared by ${score - PASSING_SCORE} points. Candidate may proceed.`
                      : `Below pass mark by ${PASSING_SCORE - score} points. Retake when prepared.`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="dossier-meta mb-1">Tally</div>
                <div className={`font-display font-bold text-4xl leading-none tabular ${hasPassed ? "text-emerald-700" : "text-oxide"}`}>
                  {correctCount} / {totalQuestions}
                </div>
                <div className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade mt-1">correct</div>
              </div>
            </div>

            <div className="h-2 bg-ink/10 border border-ink/20">
              <div
                className={`h-full transition-all duration-700 ${hasPassed ? "bg-emerald-700" : "bg-oxide"}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2.5 border border-ink text-ink hover:bg-ink hover:text-paper font-label text-[11px] uppercase tracking-[0.18em] transition-colors"
              >
                <RotateCcw size={13} />
                Retake
              </button>

              {hasPassed && nextDomain && (
                <Link
                  href={`/domain/${nextDomain.id}`}
                  className="btn-ink"
                >
                  Next Domain · {ROMANS[getDomainNumber(nextDomain.id) - 1] || getDomainNumber(nextDomain.id)}
                  <ArrowUpRight size={13} />
                </Link>
              )}

              {hasPassed && isLastDomain && (
                <Link
                  href={`/certificate?course=${domain.courseId}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-foil text-ink hover:bg-ink hover:text-foil font-label text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
                >
                  Retrieve Certificate <ArrowUpRight size={13} />
                </Link>
              )}

              <Link
                href={`/domain/${domain.id}`}
                className="flex items-center gap-2 px-4 py-2.5 border border-ink text-ink hover:bg-ink hover:text-paper font-label text-[11px] uppercase tracking-[0.18em] transition-colors"
              >
                Review Content
              </Link>
            </div>
          </div>
        )}

        {/* Questions */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
            <div>
              <div className="dossier-meta">
                {submitted ? "Review · All Items" : `Items · Domain ${roman}`}
              </div>
              <h2 className="font-display font-bold text-ink text-2xl tracking-[-0.02em] mt-0.5">
                {submitted ? "Graded Responses" : `${totalQuestions} Questions.`}
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {domain.questions.map((question, index) => {
              const answer = answers.get(question.id);
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  onAnswer={handleAnswer}
                  showResult={submitted}
                  selectedIndex={answer?.selectedIndex ?? null}
                  onAskAI={handleAskAI}
                />
              );
            })}
          </div>
        </section>

        {/* Submit button (bottom) */}
        {!submitted && (
          <div className="flex justify-center pt-4 border-t-2 border-ink">
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="btn-ink text-base disabled:opacity-40 disabled:pointer-events-none !py-5 !px-10"
            >
              File Submission ({answeredCount} / {totalQuestions}) <ArrowUpRight size={16} />
            </button>
          </div>
        )}

        {/* AI Chat */}
        <section className="space-y-3" ref={chatRef}>
          <div className="flex items-end gap-4 border-b-2 border-ink pb-2">
            <div className="section-no !text-3xl">§</div>
            <div className="flex-1">
              <div className="dossier-meta">Consulting Desk</div>
              <h2 className="font-display font-bold text-ink text-2xl tracking-[-0.02em]">
                Ask Claude about any item.
              </h2>
            </div>
          </div>
          <AiChat
            domainName={domain.title}
            domainId={domain.id}
            context={`Practice exam for Domain ${domainNum}: ${domain.title}. Topics: ${domain.questions.map((q) => q.topic).join(", ")}.`}
            initialPrompt={aiQuestion}
          />
        </section>
      </div>
    </div>
  );
}
