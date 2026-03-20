"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, ArrowLeft, ChevronRight } from "lucide-react";
import { loadProgress } from "@/lib/progress";

const CATEGORIES = [
  {
    id: "general",
    label: "General",
    description: "Introduce yourself and share how you use agents in your day-to-day life or job.",
    icon: "👋",
  },
  {
    id: "suggestions",
    label: "Website Suggestions & Support",
    description: "Share ideas to improve the site, report bugs, or get help with anything.",
    icon: "💡",
  },
  {
    id: "1",
    label: "Domain 1: Agentic Architecture & Orchestration",
    description: "Discuss agentic loops, multi-agent coordination, subagent isolation, and orchestration patterns.",
    icon: "🤖",
  },
  {
    id: "2",
    label: "Domain 2: Tool Design & MCP Integration",
    description: "Share insights on tool design patterns, MCP integration, and API surface design.",
    icon: "🔧",
  },
  {
    id: "3",
    label: "Domain 3: Claude Code Configuration & Workflows",
    description: "Explore Claude Code setup, CLAUDE.md configuration, and development workflows.",
    icon: "💻",
  },
  {
    id: "4",
    label: "Domain 4: Prompt Engineering & Structured Output",
    description: "Discuss prompt techniques, structured outputs, JSON schemas, and evaluation strategies.",
    icon: "✍️",
  },
  {
    id: "5",
    label: "Domain 5: Context Management & Reliability",
    description: "Talk about context windows, caching, memory patterns, and reliability in production.",
    icon: "🧠",
  },
  {
    id: "6",
    label: "Domain 6: Claude Fundamentals",
    description: "Core Claude API concepts, models, token usage, and fundamental usage patterns.",
    icon: "⚡",
  },
  {
    id: "7",
    label: "Domain 7: Safety & Responsible Use",
    description: "Safety principles, responsible deployment, ethical considerations, and best practices.",
    icon: "🛡️",
  },
  {
    id: "8",
    label: "Domain 8: Vision & Multimodal Capabilities",
    description: "Discuss image understanding, document processing, and multimodal AI applications.",
    icon: "👁️",
  },
];

interface CategoryStats {
  [categoryId: string]: { postCount: number; latestAt: string | null };
}

export default function ForumPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CategoryStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) {
      router.push("/");
      return;
    }

    const fetchStats = async () => {
      const results: CategoryStats = {};
      await Promise.all(
        CATEGORIES.map(async (cat) => {
          try {
            const res = await fetch(`/api/forum/posts?category=${cat.id}`);
            if (res.ok) {
              const posts = await res.json();
              results[cat.id] = {
                postCount: posts.length,
                latestAt: posts[0]?.createdAt ?? null,
              };
            }
          } catch {
            results[cat.id] = { postCount: 0, latestAt: null };
          }
        })
      );
      setStats(results);
      setLoading(false);
    };

    fetchStats();
  }, [router]);

  const totalPosts = Object.values(stats).reduce((sum, s) => sum + s.postCount, 0);

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-outline-variant/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="w-7 h-7 rounded" />
            <span className="font-headline font-bold text-on-surface text-sm hidden sm:block">Learn Agent Architecture</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-headline font-bold">Community</span>
            <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface flex items-center gap-3">
              <MessageSquare className="text-primary" size={28} />
              Community Forum
            </h1>
            <p className="text-on-surface-variant font-label">
              Share your thoughts, ask questions, and connect with fellow learners.
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-lowest border border-outline-variant/20 text-sm text-on-surface-variant font-label flex-shrink-0">
              <Users size={14} />
              {totalPosts} {totalPosts === 1 ? "post" : "posts"}
            </div>
          )}
        </div>

        {/* Category list */}
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const catStats = stats[cat.id];
            const isDomain = !["general", "suggestions"].includes(cat.id);
            return (
              <Link
                key={cat.id}
                href={`/forum/${cat.id}`}
                className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-xl flex-shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors text-sm">
                      {cat.label}
                    </h2>
                    {isDomain && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-headline font-bold bg-primary/8 text-primary">
                        Domain {cat.id}
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-xs mt-0.5 line-clamp-1 font-label">{cat.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {loading ? (
                    <div className="w-12 h-4 bg-surface-container rounded animate-pulse" />
                  ) : (
                    <span className="text-xs text-on-surface-variant font-label">
                      {catStats?.postCount ?? 0} posts
                    </span>
                  )}
                  <ChevronRight size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}