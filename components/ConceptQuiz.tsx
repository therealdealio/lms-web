"use client";

import { useState, useRef } from "react";
import { Send, Lightbulb, HelpCircle, RotateCcw, Shuffle, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ConceptQuizProps {
  conceptTitle: string;
  conceptContent: string;
  keyPoints: string[];
  domainName: string;
}

export default function ConceptQuiz({
  conceptTitle,
  conceptContent,
  keyPoints,
  domainName,
}: ConceptQuizProps) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedText, setSubmittedText] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);

  // Follow-up state
  const [followUp, setFollowUp] = useState("");
  const [followUpFeedback, setFollowUpFeedback] = useState("");
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const [hasFollowedUp, setHasFollowedUp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const followUpRef = useRef<HTMLTextAreaElement>(null);

  const callQuizApi = async (
    body: object,
    onChunk: (text: string) => void
  ) => {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) onChunk(parsed.text);
          } catch {
            // skip malformed
          }
        }
      }
    }
  };

  const submit = async (overrideText?: string) => {
    const text = overrideText ?? answer.trim();
    if (!text || isStreaming) return;

    setIsStreaming(true);
    setFeedback("");
    setHasSubmitted(true);
    setSubmittedText(text);
    setFollowUp("");
    setFollowUpFeedback("");
    setHasFollowedUp(false);

    try {
      let full = "";
      await callQuizApi(
        { conceptTitle, conceptContent, keyPoints, userAnswer: text, domainName, question: currentQuestion },
        (chunk) => { full += chunk; setFeedback(full); }
      );
    } catch {
      setFeedback("Something went wrong. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const submitFollowUp = async () => {
    const text = followUp.trim();
    if (!text || isFollowUpStreaming) return;

    setIsFollowUpStreaming(true);
    setFollowUpFeedback("");
    setHasFollowedUp(true);

    try {
      let full = "";
      await callQuizApi(
        {
          conceptTitle,
          conceptContent,
          keyPoints,
          userAnswer: text,
          domainName,
          question: currentQuestion,
          previousHint: feedback,
          isFollowUp: true,
        },
        (chunk) => { full += chunk; setFollowUpFeedback(full); }
      );
    } catch {
      setFollowUpFeedback("Something went wrong. Please try again.");
    } finally {
      setIsFollowUpStreaming(false);
    }
  };

  const reset = () => {
    setAnswer("");
    setFeedback("");
    setHasSubmitted(false);
    setSubmittedText("");
    setFollowUp("");
    setFollowUpFeedback("");
    setHasFollowedUp(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const nextQuestion = () => {
    setAnswer("");
    setFeedback("");
    setHasSubmitted(false);
    setSubmittedText("");
    setFollowUp("");
    setFollowUpFeedback("");
    setHasFollowedUp(false);
    setQuestionIndex((i) => (i + 1) % questions.length);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const shortTitle = conceptTitle.replace(/^\d+\.\d+\s+/, "");

  const questions = [
    `In your own words, explain **${shortTitle}**. Why does it matter?`,
    `What would go wrong if a developer ignored **${shortTitle}**? Give a concrete example.`,
    `How would you explain **${shortTitle}** to a junior developer who has never heard of it?`,
    `What is the most common mistake people make with **${shortTitle}**, and how do you avoid it?`,
    `Finish this sentence in as much detail as you can: "${shortTitle} matters because..."`,
  ];

  const currentQuestion = questions[questionIndex];

  // Show follow-up section after a hint or "I don't know" response finishes
  const isHintOrDontKnow =
    submittedText === "Give me a hint" || submittedText === "I don't know";
  const showFollowUp = isHintOrDontKnow && !!feedback && !isStreaming;

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-200 bg-white">
        <HelpCircle size={15} className="text-brand-500 flex-shrink-0" />
        <span className="text-brand-700 text-sm font-medium">Test your understanding</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Prompt */}
        <div className="text-dark-200 text-sm leading-relaxed prose prose-sm max-w-none prose-strong:text-dark-50 prose-p:my-0">
          <ReactMarkdown>{currentQuestion}</ReactMarkdown>
        </div>

        {/* Input area */}
        {!hasSubmitted && (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Type your answer here... or use the buttons below"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-dark-700 text-dark-50 placeholder-dark-500 text-sm resize-none focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors"
              disabled={isStreaming}
            />

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => submit()}
                disabled={!answer.trim() || isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={12} />
                Submit
              </button>

              <button
                onClick={() => submit("Give me a hint")}
                disabled={isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors border border-amber-200 disabled:opacity-40"
              >
                <Lightbulb size={12} />
                Give me a hint
              </button>

              <button
                onClick={() => submit("I don't know")}
                disabled={isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-dark-300 text-xs font-medium transition-colors border border-dark-700 disabled:opacity-40"
              >
                I don&apos;t know
              </button>

              <span className="text-dark-500 text-xs ml-auto hidden sm:block">
                Enter to submit · Shift+Enter for new line
              </span>
            </div>
          </div>
        )}

        {/* Streaming / feedback */}
        {(isStreaming || feedback) && (
          <div className="space-y-3">
            {hasSubmitted && answer && submittedText !== "Give me a hint" && submittedText !== "I don't know" && (
              <div className="px-3 py-2 rounded-lg bg-white border border-dark-700 text-dark-300 text-sm italic">
                &ldquo;{answer}&rdquo;
              </div>
            )}

            <div className="px-3 py-3 rounded-lg bg-white border border-dark-700 text-sm">
              {feedback ? (
                <div className="prose prose-sm max-w-none
                  prose-p:my-1 prose-p:leading-relaxed prose-p:text-dark-200
                  prose-strong:text-dark-50
                  prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-dark-200">
                  <ReactMarkdown>{feedback}</ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-brand-500 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              ) : (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up section — shown after hint / I don't know */}
            {showFollowUp && (
              <div className="space-y-3 pt-1 border-t border-brand-200">
                <div className="flex items-center gap-2">
                  <MessageCircle size={13} className="text-brand-500" />
                  <span className="text-brand-700 text-xs font-medium">Have a follow-up question?</span>
                </div>

                {!hasFollowedUp ? (
                  <div className="space-y-2">
                    <textarea
                      ref={followUpRef}
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitFollowUp();
                        }
                      }}
                      placeholder="Ask anything about this concept..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-dark-700 text-dark-50 placeholder-dark-500 text-sm resize-none focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors"
                      disabled={isFollowUpStreaming}
                    />
                    <button
                      onClick={submitFollowUp}
                      disabled={!followUp.trim() || isFollowUpStreaming}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Send size={12} />
                      Ask
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded-lg bg-white border border-dark-700 text-dark-300 text-sm italic">
                      &ldquo;{followUp}&rdquo;
                    </div>
                    <div className="px-3 py-3 rounded-lg bg-white border border-dark-700 text-sm">
                      {followUpFeedback ? (
                        <div className="prose prose-sm max-w-none
                          prose-p:my-1 prose-p:leading-relaxed prose-p:text-dark-200
                          prose-strong:text-dark-50
                          prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-dark-200">
                          <ReactMarkdown>{followUpFeedback}</ReactMarkdown>
                          {isFollowUpStreaming && (
                            <span className="inline-block w-1.5 h-4 bg-brand-500 ml-0.5 animate-pulse align-middle" />
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {!isFollowUpStreaming && (
                      <button
                        onClick={() => { setHasFollowedUp(false); setFollowUp(""); setFollowUpFeedback(""); setTimeout(() => followUpRef.current?.focus(), 50); }}
                        className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-500 transition-colors"
                      >
                        <MessageCircle size={11} />
                        Ask another follow-up
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isStreaming && (
              <div className="flex items-center gap-3">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-dark-100 transition-colors"
                >
                  <RotateCcw size={11} />
                  Try again
                </button>
                <span className="text-dark-600 text-xs">·</span>
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-500 transition-colors"
                >
                  <Shuffle size={11} />
                  Try another question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
