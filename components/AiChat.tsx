"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpRight, ChevronDown, ChevronUp, Send, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/lib/types";
import {
  loadMembership,
  incrementPromptCount,
  getPromptsRemaining,
  FREE_LIMIT,
  PRO_LIMIT,
} from "@/lib/membership";
import ReactMarkdown from "react-markdown";

interface AiChatProps {
  domainName: string;
  domainId: string;
  context?: string;
  initialPrompt?: string;
  compact?: boolean;
}

export default function AiChat({
  domainName,
  domainId,
  context,
  initialPrompt,
  compact = false,
}: AiChatProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt || "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(compact);
  const [streamingContent, setStreamingContent] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [tier, setTier] = useState<"free" | "pro">("free");

  useEffect(() => {
    if (userId) {
      setRemaining(getPromptsRemaining(userId));
      const m = loadMembership(userId);
      setTier(m.tier);
    }
  }, [userId]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length === 0 && !streamingContent) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const limit = tier === "pro" ? PRO_LIMIT : FREE_LIMIT;
  const isAtLimit = remaining <= 0;
  const isNearLimit = !isAtLimit && remaining <= 3;

  const userInitials = (session?.user?.name || session?.user?.email || "U").slice(0, 2).toUpperCase();

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isStreaming || isAtLimit) return;

    const updatedMembership = incrementPromptCount(userId);
    const newRemaining = getPromptsRemaining(userId);
    setRemaining(newRemaining);
    fetch("/api/membership", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membership: { tier: updatedMembership.tier, promptsUsed: updatedMembership.promptsUsed } }),
    }).catch(() => {});
    fetch("/api/track/prompt", { method: "POST" }).catch(() => {});

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: text,
          domain: domainName,
          userQuestion: text,
          context: context,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setStreamingContent(fullContent);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fullContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Transmission error: ${error instanceof Error ? error.message : "Unknown error"}. Verify ANTHROPIC_API_KEY in .env.local and retry.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent("");
  };

  const suggestedQuestions = [
    `Explain the key concepts of ${domainName} in plain terms.`,
    `What are the most common exam traps for ${domainId.toUpperCase()}?`,
    `Provide a code example for the principal pattern in this domain.`,
    `Distinguish the correct approach from the common incorrect ones.`,
  ];

  const remainingTone =
    remaining <= 0 ? "text-oxide"
    : remaining <= 3 ? "text-oxide"
    : tier === "pro" ? "text-foil"
    : "text-ink-fade";

  return (
    <div className="border-2 border-ink bg-paper-fade overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-5 py-4 bg-ink text-paper hover:bg-oxide transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-display italic text-foil text-3xl leading-none">§</span>
          <div className="text-left">
            <div className="dossier-meta !text-paper/70">Instrument II · AI Tutor</div>
            <div className="font-display font-bold text-paper text-lg leading-tight">
              Consulting Desk
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-label text-[10px] uppercase tracking-[0.18em] tabular ${remainingTone === "text-oxide" ? "text-oxide" : remainingTone === "text-foil" ? "text-foil" : "text-paper/60"}`}>
            {remaining} prompt{remaining !== 1 ? "s" : ""} · {tier === "pro" ? "Pro" : "Free"}
          </span>
          {messages.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearChat(); }}
              className="p-1.5 text-paper/60 hover:text-paper transition-colors"
              title="Clear ledger"
            >
              <RefreshCw size={13} />
            </button>
          )}
          {isCollapsed ? <ChevronDown size={16} className="text-paper/60" /> : <ChevronUp size={16} className="text-paper/60" />}
        </div>
      </button>

      {!isCollapsed && (
        <>
          {/* Near-limit banner */}
          {isNearLimit && (
            <div className="mx-5 mt-5 border-2 border-oxide bg-oxide/5 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display italic text-oxide text-xl leading-none">!</span>
                <span className="font-body text-[14px] text-ink">
                  <strong>{remaining} prompt{remaining !== 1 ? "s" : ""}</strong> remain on the Free tier.
                </span>
              </div>
              <button
                onClick={() => router.push("/upgrade")}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-oxide text-paper hover:bg-ink font-label text-[10px] uppercase tracking-[0.18em] font-semibold transition-colors"
              >
                Replenish $5 <ArrowUpRight size={11} />
              </button>
            </div>
          )}

          {/* At-limit wall */}
          {isAtLimit && (
            <div className="m-5 border-2 border-ink bg-paper p-8 text-center space-y-5">
              <div className="stamp mx-auto text-oxide border-oxide">✕ Quota Exhausted</div>
              <div>
                <h3 className="font-display font-bold text-ink text-2xl tracking-[-0.02em] leading-tight">
                  All {limit} complimentary prompts spent.
                </h3>
                <p className="font-body text-[15px] leading-snug text-ink-soft mt-2 max-w-sm mx-auto">
                  Replenish with 500 additional prompts on the Pro tier — <strong>$5</strong>.
                </p>
              </div>
              <button
                onClick={() => router.push("/upgrade")}
                className="btn-ink"
              >
                Replenish — Pro <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* Messages */}
          {!isAtLimit && (
            <div className="h-96 overflow-y-auto px-5 py-6 space-y-5 border-t border-ink/20">
              {messages.length === 0 && !streamingContent && (
                <div className="space-y-5">
                  <div className="text-center py-4">
                    <div className="font-display italic text-oxide text-5xl leading-none mb-2">?</div>
                    <p className="font-body text-[15px] text-ink-soft italic">
                      The Tutor is receiving, candidate. Pose your inquiry on <strong className="not-italic font-semibold text-ink">{domainName}</strong>.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="dossier-meta mb-2">Suggested Inquiries</p>
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left flex items-start gap-3 px-4 py-3 border border-ink/30 bg-paper hover:bg-ink hover:text-paper text-ink font-body text-[14px] leading-snug transition-colors group"
                      >
                        <span className="font-display italic text-oxide group-hover:text-foil text-base leading-none flex-shrink-0 w-4">
                          {String.fromCharCode(97 + i)}.
                        </span>
                        <span className="flex-1">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 border border-ink flex items-center justify-center flex-shrink-0 font-display font-bold text-xs ${
                    msg.role === "user" ? "bg-paper text-ink" : "bg-ink text-paper"
                  }`}>
                    {msg.role === "user" ? userInitials : "C"}
                  </div>
                  <div className={`flex-1 min-w-0 ${msg.role === "user" ? "border-l-2 border-oxide pl-4" : "border-l-2 border-ink pl-4"}`}>
                    <div className="dossier-meta mb-1">
                      {msg.role === "user" ? "Candidate" : "Tutor · Claude"}
                    </div>
                    {msg.role === "user" ? (
                      <div className="font-body text-[15px] leading-[1.6] text-ink whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none
                        prose-p:my-1.5 prose-p:text-ink prose-p:font-body prose-p:text-[15px] prose-p:leading-[1.6]
                        prose-headings:text-ink prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-3 prose-headings:mb-1
                        prose-strong:text-ink prose-strong:font-semibold
                        prose-em:text-ink prose-em:italic
                        prose-code:text-oxide prose-code:bg-paper prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-ink prose-pre:text-paper prose-pre:border-2 prose-pre:border-ink prose-pre:rounded-none
                        prose-ul:my-2 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-ink prose-li:marker:text-oxide
                        prose-ol:my-2 prose-ol:pl-4
                        prose-blockquote:border-l-2 prose-blockquote:border-oxide prose-blockquote:text-ink-soft prose-blockquote:italic prose-blockquote:not-italic">
                        <ReactMarkdown allowedElements={["p","strong","em","code","pre","ul","ol","li","h1","h2","h3","blockquote"]} unwrapDisallowed>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 border border-ink bg-ink text-paper flex items-center justify-center flex-shrink-0 font-display font-bold text-xs">
                    C
                  </div>
                  <div className="flex-1 border-l-2 border-ink pl-4 min-w-0">
                    <div className="dossier-meta mb-1">Tutor · Claude · Transmitting</div>
                    <div className="prose prose-sm max-w-none
                      prose-p:my-1.5 prose-p:text-ink prose-p:font-body prose-p:text-[15px] prose-p:leading-[1.6]
                      prose-headings:text-ink prose-headings:font-display prose-headings:font-bold
                      prose-strong:text-ink prose-strong:font-semibold
                      prose-code:text-oxide prose-code:bg-paper prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-ink prose-pre:text-paper
                      prose-ul:my-2 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-ink prose-li:marker:text-oxide
                      prose-ol:my-2 prose-ol:pl-4">
                      <ReactMarkdown allowedElements={["p","strong","em","code","pre","ul","ol","li","h1","h2","h3","blockquote"]} unwrapDisallowed>{streamingContent}</ReactMarkdown>
                      <span className="inline-block w-2 h-4 bg-oxide ml-1 animate-pulse align-middle" />
                    </div>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 border border-ink bg-ink text-paper flex items-center justify-center flex-shrink-0 font-display font-bold text-xs">
                    C
                  </div>
                  <div className="flex-1 border-l-2 border-ink pl-4">
                    <div className="dossier-meta mb-2">Tutor · Claude · Preparing reply</div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-oxide animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {!isAtLimit && (
            <div className="p-5 border-t-2 border-ink bg-paper-deep">
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Dictate your inquiry…"
                  rows={2}
                  className="flex-1 px-4 py-3 bg-paper border-2 border-ink/40 text-ink placeholder-ink-fade/60 font-body text-[15px] leading-snug resize-none focus:outline-none focus:border-ink transition-colors"
                  disabled={isStreaming}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="flex-shrink-0 px-5 bg-ink text-paper hover:bg-oxide flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-stretch"
                >
                  {isStreaming ? (
                    <div className="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <p className="dossier-meta mt-3">Enter to transmit · Shift + Enter new line</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
