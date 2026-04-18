"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswer: (questionId: string, selectedIndex: number, isCorrect: boolean) => void;
  showResult?: boolean;
  selectedIndex?: number | null;
  onAskAI?: (question: string, selectedOption: string) => void;
}

const optionLetters = ["A", "B", "C", "D"];

export default function QuestionCard({
  question,
  questionNumber,
  onAnswer,
  showResult = false,
  selectedIndex = null,
  onAskAI,
}: QuestionCardProps) {
  const [localSelected, setLocalSelected] = useState<number | null>(selectedIndex);
  const [hasAnswered, setHasAnswered] = useState(selectedIndex !== null);

  const effectiveSelected = showResult ? selectedIndex : localSelected;
  const effectiveAnswered = showResult ? selectedIndex !== null : hasAnswered;

  const handleSelect = (index: number) => {
    if (effectiveAnswered && !showResult) return;
    if (showResult) return;
    setLocalSelected(index);
    setHasAnswered(true);
    const isCorrect = index === question.correctIndex;
    onAnswer(question.id, index, isCorrect);
  };

  const isCorrect = effectiveSelected === question.correctIndex;

  const optionClass = (index: number): string => {
    const base = "w-full text-left p-4 border-2 transition-all font-body text-[15px] leading-[1.55] ";
    if (!effectiveAnswered) {
      return base + "border-ink/25 bg-paper hover:border-ink hover:bg-paper-fade cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_0_var(--ink)]";
    }
    if (index === question.correctIndex) {
      return base + "border-emerald-700 bg-emerald-700/8 text-ink cursor-default";
    }
    if (index === effectiveSelected && index !== question.correctIndex) {
      return base + "border-oxide bg-oxide/5 text-ink cursor-default";
    }
    return base + "border-ink/15 bg-paper-fade text-ink-fade cursor-default opacity-70";
  };

  const optionBadgeClass = (index: number): string => {
    const base = "flex-shrink-0 w-8 h-8 border flex items-center justify-center font-display font-bold text-sm mt-[2px] ";
    if (!effectiveAnswered) return base + "border-ink/40 bg-paper text-ink";
    if (index === question.correctIndex) return base + "border-emerald-700 bg-emerald-700 text-paper";
    if (index === effectiveSelected) return base + "border-oxide bg-oxide text-paper";
    return base + "border-ink/20 bg-paper-fade text-ink-fade";
  };

  return (
    <article className="border-2 border-ink bg-paper-fade p-6 lg:p-8 space-y-6">
      {/* Header rail */}
      <header className="flex items-start justify-between gap-4 pb-4 border-b border-ink/20">
        <div className="flex items-baseline gap-4">
          <span className="font-display italic text-oxide text-4xl leading-none tabular flex-shrink-0">
            {String(questionNumber).padStart(2, "0")}.
          </span>
          <div>
            <div className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade">
              {question.topic}
            </div>
            <p className="font-display font-semibold text-ink text-[20px] leading-[1.3] tracking-[-0.01em] mt-1.5">
              {question.question}
            </p>
          </div>
        </div>
        {effectiveAnswered && (
          <span className={`stamp flex-shrink-0 ${isCorrect ? "text-emerald-700 border-emerald-700" : "text-oxide border-oxide"}`}>
            {isCorrect ? "✓ Correct" : "✕ Incorrect"}
          </span>
        )}
      </header>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            className={optionClass(index)}
          >
            <div className="flex items-start gap-4">
              <span className={optionBadgeClass(index)}>
                {optionLetters[index]}
              </span>
              <span className="flex-1 pt-1">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Grounds (explanation) */}
      {effectiveAnswered && (
        <div className={`border-2 ${isCorrect ? "border-emerald-700 bg-emerald-700/5" : "border-oxide bg-oxide/5"} p-5 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] font-semibold">
              <span className={isCorrect ? "text-emerald-700" : "text-oxide"}>§ Ruling</span>
              <span className="text-ink/30">·</span>
              <span className="text-ink">{isCorrect ? "Affirmed" : "Overruled — see grounds"}</span>
            </div>
          </div>
          <div className="rule-hair" />
          <p className="font-body text-[15px] leading-[1.6] text-ink first-letter:font-display first-letter:font-bold first-letter:text-3xl first-letter:float-left first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1 first-letter:text-oxide">
            {question.explanation}
          </p>
          {onAskAI && (
            <button
              onClick={() => onAskAI(question.question, question.options[effectiveSelected || 0])}
              className="inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.18em] text-oxide hover:text-ink font-semibold link-sweep mt-1"
            >
              Ask the AI for a second reading
              <ArrowUpRight size={12} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}
