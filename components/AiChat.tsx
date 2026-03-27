"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, Sparkles, ChevronDown, ChevronUp, Zap, AlertTriangle } from "lucide-react";
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

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isStreaming || isAtLimit) return;

    // Deduct prompt before sending — update localStorage and DB
    const updatedMembership = incrementPromptCount(userId);
    const newRemaining = getPromptsRemaining(userId);
    setRemaining(newRemaining);
    fetch("/api/membership", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membership: { tier: updatedMembership.tier, promptsUsed: updatedMembership.promptsUsed } }),
    }).catch(() => {});  // fire-and-forget, localStorage is already updated
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
        content: `I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please check that your ANTHROPIC_API_KEY is configured in .env.local and try again.`,
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
    `Explain the key concepts of ${domainName} in simple terms`,
    `What are the most common exam traps for Domain ${domainId}?`,
    `Give me a code example for the main pattern in this domain`,
    `What's the difference between correct and incorrect approaches here?`,
  ];

  return (
    <div className="rounded-2xl bg-white border border-dark-700 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-dark-50 text-sm">AI Learning Assistant</div>
            <div className="text-dark-400 text-xs">
              <span className={`font-medium ${remaining <= 3 && remaining > 0 ? "text-amber-600" : remaining <= 0 ? "text-red-500" : tier === "pro" ? "text-brand-600" : ""}`}>
                {remaining} prompt{remaining !== 1 ? "s" : ""} left
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearChat();
              }}
              className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
              title="Clear chat"
            >
              <RefreshCw size={14} />
            </button>
          )}
          {isCollapsed ? (
            <ChevronDown size={16} className="text-dark-400" />
          ) : (
            <ChevronUp size={16} className="text-dark-400" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <>
          {/* Near-limit warning banner */}
          {isNearLimit && (
            <div className="mx-4 mb-0 mt-0 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span><strong>{remaining} prompt{remaining !== 1 ? "s" : ""}</strong> remaining on your free plan.</span>
              </div>
              <button
                onClick={() => router.push("/upgrade")}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors"
              >
                <Zap size={12} />
                Upgrade $5
              </button>
            </div>
          )}

          {/* Hit limit wall */}
          {isAtLimit && (
            <div className="m-4 p-6 rounded-xl bg-brand-50 border border-brand-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto">
                <Zap size={22} className="text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-dark-50">You've used all {limit} free prompts</h3>
                <p className="text-dark-400 text-sm mt-1">
                  Upgrade to Pro for 500 prompts and keep learning.
                </p>
              </div>
              <button
                onClick={() => router.push("/upgrade")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors shadow-sm text-sm"
              >
                <Zap size={15} />
                Upgrade to Pro — $5
              </button>
            </div>
          )}

          {/* Messages */}
          {!isAtLimit && (
            <div className="h-80 overflow-y-auto p-4 space-y-4 border-t border-dark-700">
              {messages.length === 0 && !streamingContent && (
                <div className="space-y-4">
                  <div className="text-center text-dark-500 text-sm py-4">
                    <Bot size={32} className="mx-auto mb-2 text-dark-600" />
                    Ask any question about {domainName}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-dark-500 uppercase tracking-wider">Suggested questions</p>
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-dark-900 hover:bg-dark-800 text-dark-300 hover:text-dark-100 text-xs transition-colors border border-dark-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-brand-600"
                        : "bg-gradient-to-br from-brand-500 to-brand-700"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={14} className="text-white" />
                    ) : (
                      <Bot size={14} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-50 border border-brand-200 text-dark-100 rounded-tr-sm"
                        : "bg-dark-900 border border-dark-700 text-dark-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none
                        prose-p:my-1 prose-p:leading-relaxed prose-p:text-dark-200
                        prose-headings:text-dark-50 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
                        prose-strong:text-dark-50 prose-strong:font-semibold
                        prose-code:text-brand-700 prose-code:bg-brand-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-dark-900 prose-pre:border prose-pre:border-dark-700 prose-pre:rounded-xl prose-pre:text-xs
                        prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-dark-200
                        prose-ol:my-1 prose-ol:pl-4
                        prose-blockquote:border-brand-400 prose-blockquote:text-dark-300">
                        <ReactMarkdown allowedElements={["p","strong","em","code","pre","ul","ol","li","h1","h2","h3","blockquote"]} unwrapDisallowed>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming message */}
              {streamingContent && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-dark-900 border border-dark-700 text-dark-200 text-sm leading-relaxed">
                    <div className="prose prose-sm max-w-none
                      prose-p:my-1 prose-p:text-dark-200
                      prose-headings:text-dark-50
                      prose-strong:text-dark-50
                      prose-code:text-brand-700 prose-code:bg-brand-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                      prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-dark-200
                      prose-ol:my-1 prose-ol:pl-4">
                      <ReactMarkdown allowedElements={["p","strong","em","code","pre","ul","ol","li","h1","h2","h3","blockquote"]} unwrapDisallowed>{streamingContent}</ReactMarkdown>
                      <span className="inline-block w-2 h-4 bg-brand-500 ml-1 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-dark-900 border border-dark-700">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
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
            <div className="p-4 border-t border-dark-700 bg-dark-950">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or type your understanding of a concept..."
                  rows={2}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-dark-700 text-dark-50 placeholder-dark-500 text-sm resize-none focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors"
                  disabled={isStreaming}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="flex-shrink-0 w-10 h-10 my-auto rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {isStreaming ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <p className="text-xs text-dark-500 mt-2">Press Enter to send · Shift+Enter for new line</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
