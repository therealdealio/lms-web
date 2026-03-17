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
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "1",
    label: "Domain 1: Agentic Architecture & Orchestration",
    description: "Discuss agentic loops, multi-agent coordination, subagent isolation, and orchestration patterns.",
    icon: "🤖",
    color: "from-purple-600 to-indigo-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    id: "2",
    label: "Domain 2: Tool Design & MCP Integration",
    description: "Share insights on tool design patterns, MCP integration, and API surface design.",
    icon: "🔧",
    color: "from-blue-600 to-cyan-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    label: "Domain 3: Claude Code Configuration & Workflows",
    description: "Explore Claude Code setup, CLAUDE.md configuration, and development workflows.",
    icon: "💻",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    id: "4",
    label: "Domain 4: Prompt Engineering & Structured Output",
    description: "Discuss prompt techniques, structured outputs, JSON schemas, and evaluation strategies.",
    icon: "✍️",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
  },
  {
    id: "5",
    label: "Domain 5: Context Management & Reliability",
    description: "Talk about context windows, caching, memory patterns, and reliability in production.",
    icon: "🧠",
    color: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "6",
    label: "Domain 6: Claude Fundamentals",
    description: "Core Claude API concepts, models, token usage, and fundamental usage patterns.",
    icon: "⚡",
    color: "from-brand-500 to-brand-700",
    bg: "bg-brand-50",
    border: "border-brand-200",
    badge: "bg-brand-100 text-brand-700",
  },
  {
    id: "7",
    label: "Domain 7: Safety & Responsible Use",
    description: "Safety principles, responsible deployment, ethical considerations, and best practices.",
    icon: "🛡️",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  {
    id: "8",
    label: "Domain 8: Vision & Multimodal Capabilities",
    description: "Discuss image understanding, document processing, and multimodal AI applications.",
    icon: "👁️",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
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

    // Fetch post counts for each category
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
    <div className="min-h-screen bg-dark-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-50 flex items-center gap-3">
              <MessageSquare className="text-brand-600" size={32} />
              Community Forum
            </h1>
            <p className="text-dark-400 mt-2">
              Share your thoughts, ask questions, and connect with fellow learners.
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-dark-700 text-sm text-dark-400">
              <Users size={14} />
              {totalPosts} {totalPosts === 1 ? "post" : "posts"}
            </div>
          )}
        </div>

        {/* Category list */}
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const catStats = stats[cat.id];
            return (
              <Link
                key={cat.id}
                href={`/forum/${cat.id}`}
                className="block p-5 rounded-2xl bg-white border border-dark-700 hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-dark-50 group-hover:text-brand-600 transition-colors">
                        {cat.label}
                      </h2>
                      {cat.id !== "general" && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.badge}`}>
                          Domain {cat.id}
                        </span>
                      )}
                    </div>
                    <p className="text-dark-400 text-sm mt-0.5 line-clamp-1">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {loading ? (
                      <div className="w-8 h-4 bg-dark-800 rounded animate-pulse" />
                    ) : (
                      <span className="text-sm text-dark-400">
                        {catStats?.postCount ?? 0} posts
                      </span>
                    )}
                    <ChevronRight size={16} className="text-dark-500 group-hover:text-brand-600 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
