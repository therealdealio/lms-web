"use client";

import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle, MessageSquare } from "lucide-react";
import { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswer: (questionId: string, selectedIndex: number, isCorrect: boolean) => void;
  showResult?: boolean;
  selectedIndex?: number | null;
  onAskAI?: (question: string, selectedOption: string) => void;
}

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

  const getOptionStyle = (index: number): string => {
    const base =
      "w-full text-left p-4 rounded-xl border transition-all text-sm leading-relaxed ";

    if (!effectiveAnswered) {
      return (
        base +
        "border-dark-700 bg-white text-dark-200 hover:border-brand-400 hover:bg-brand-50 cursor-pointer"
      );
    }

    if (index === question.correctIndex) {
      return (
        base +
        "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-default"
      );
    }

    if (index === effectiveSelected && index !== question.correctIndex) {
      return (
        base +
        "border-red-300 bg-red-50 text-red-800 cursor-default"
      );
    }

    return base + "border-dark-700 bg-dark-800 text-dark-500 cursor-default";
  };

  const getOptionIcon = (index: number) => {
    if (!effectiveAnswered) return null;

    if (index === question.correctIndex) {
      return <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />;
    }
    if (index === effectiveSelected && index !== question.correctIndex) {
      return <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />;
    }
    return null;
  };

  const optionLetters = ["A", "B", "C", "D"];

  const isCorrect = effectiveSelected === question.correctIndex;

  return (
    <div className="p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-5">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 text-sm font-bold">
          {questionNumber}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-dark-500 uppercase tracking-wider">
              {question.topic}
            </span>
          </div>
          <p className="text-dark-50 font-medium leading-relaxed">{question.question}</p>
        </div>
        {effectiveAnswered && (
          <div className="flex-shrink-0">
            {isCorrect ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <XCircle size={20} className="text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            className={getOptionStyle(index)}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-md border text-xs font-bold flex items-center justify-center mt-0.5 ${
                  effectiveAnswered
                    ? index === question.correctIndex
                      ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                      : index === effectiveSelected
                      ? "border-red-400 bg-red-100 text-red-700"
                      : "border-dark-600 bg-dark-800 text-dark-500"
                    : "border-dark-600 bg-dark-800 text-dark-300"
                }`}
              >
                {optionLetters[index]}
              </span>
              <span className="flex-1">{option}</span>
              {getOptionIcon(index)}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {effectiveAnswered && (
        <div
          className={`p-4 rounded-xl border space-y-2 ${
            isCorrect
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <HelpCircle
              size={16}
              className={isCorrect ? "text-emerald-600" : "text-amber-600"}
            />
            <span
              className={`text-sm font-medium ${
                isCorrect ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isCorrect ? "Correct!" : "Incorrect — Here's Why:"}
            </span>
          </div>
          <p className="text-sm text-dark-300 leading-relaxed">{question.explanation}</p>

          {onAskAI && (
            <button
              onClick={() =>
                onAskAI(
                  question.question,
                  question.options[effectiveSelected || 0]
                )
              }
              className="flex items-center gap-2 mt-2 text-xs text-brand-600 hover:text-brand-500 transition-colors"
            >
              <MessageSquare size={12} />
              Ask AI to explain this differently
            </button>
          )}
        </div>
      )}
    </div>
  );
}
