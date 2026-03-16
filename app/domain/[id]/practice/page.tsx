"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { getDomain, PASSING_SCORE } from "@/lib/curriculum";
import { loadProgress, saveDomainExamScore } from "@/lib/progress";
import { Domain } from "@/lib/types";
import QuestionCard from "@/components/QuestionCard";
import AiChat from "@/components/AiChat";
import ProgressBar from "@/components/ProgressBar";

interface Answer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const domainId = parseInt(params.id as string);

  const [domain, setDomain] = useState<Domain | null>(null);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

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

    // Scroll to top
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
      `I answered "${selectedOption}" to this question: "${question}". Can you explain why this might be wrong and what the correct concept is?`
    );
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!domain) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  const totalQuestions = domain.questions.length;
  const answeredCount = answers.size;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const hasPassed = score !== null && score >= PASSING_SCORE;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/20 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/domain/${domain.id}`}
            className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Domain {domain.id}
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-dark-400">
              {answeredCount}/{totalQuestions} answered
            </span>
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <CheckCircle size={14} />
                Submit ({answeredCount}/{totalQuestions})
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{domain.icon}</span>
            <div>
              <div className="text-sm text-dark-400 font-medium">Practice Exam</div>
              <h1 className="text-2xl font-bold text-dark-50">{domain.title}</h1>
            </div>
          </div>

          {/* Progress */}
          {!submitted && (
            <div className="space-y-2">
              <ProgressBar value={progressPercent} color="brand" size="md" showLabel />
              <p className="text-dark-500 text-xs">
                Answer all {totalQuestions} questions, then click Submit
              </p>
            </div>
          )}
        </div>

        {/* Score result */}
        {submitted && score !== null && (
          <div
            className={`p-8 rounded-2xl border shadow-sm space-y-6 ${
              hasPassed
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {hasPassed ? (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                    <Trophy size={32} className="text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center">
                    <AlertTriangle size={32} className="text-red-500" />
                  </div>
                )}
                <div>
                  <h2 className={`text-3xl font-bold ${hasPassed ? "text-emerald-800" : "text-red-800"}`}>{score}%</h2>
                  <p className={`font-medium ${hasPassed ? "text-emerald-600" : "text-red-600"}`}>
                    {hasPassed ? "Passed!" : `Failed — Need ${PASSING_SCORE}%`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${hasPassed ? "text-emerald-800" : "text-red-800"}`}>
                  {Array.from(answers.values()).filter((a) => a.isCorrect).length}/
                  {totalQuestions}
                </div>
                <div className="text-dark-400 text-sm">Correct</div>
              </div>
            </div>

            <ProgressBar
              value={score}
              color={hasPassed ? "green" : "red"}
              size="lg"
              animated
            />

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dark-700 hover:bg-dark-950 text-dark-300 hover:text-dark-100 text-sm font-medium transition-colors shadow-sm"
              >
                <RotateCcw size={14} />
                Retake Exam
              </button>

              {hasPassed && domain.id < 5 && (
                <Link
                  href={`/domain/${domain.id + 1}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-medium transition-all shadow-sm"
                >
                  Next Domain
                  <ArrowRight size={14} />
                </Link>
              )}

              {hasPassed && domain.id === 5 && (
                <Link
                  href="/certificate"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-medium transition-all shadow-sm"
                >
                  <Trophy size={14} />
                  View Certificate
                </Link>
              )}

              <Link
                href={`/domain/${domain.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dark-700 hover:bg-dark-950 text-dark-300 hover:text-dark-100 text-sm transition-colors shadow-sm"
              >
                <BookOpen size={14} />
                Review Content
              </Link>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {!submitted && (
            <h2 className="text-lg font-bold text-dark-50">
              Questions — Domain {domain.id}: {domain.title}
            </h2>
          )}
          {submitted && (
            <h2 className="text-lg font-bold text-dark-50">Review All Questions</h2>
          )}

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

        {/* Submit button (bottom) */}
        {!submitted && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckCircle size={20} />
              Submit Exam ({answeredCount}/{totalQuestions} answered)
            </button>
          </div>
        )}

        {/* AI Chat */}
        <div ref={chatRef}>
          <AiChat
            domainName={domain.title}
            domainId={domain.id}
            context={`Practice exam for Domain ${domain.id}: ${domain.title}. Topics: ${domain.questions.map((q) => q.topic).join(", ")}.`}
            initialPrompt={aiQuestion}
          />
        </div>
      </div>
    </div>
  );
}
