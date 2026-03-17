"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, MessageSquare, Plus, ChevronRight, Clock, X } from "lucide-react";
import { loadProgress } from "@/lib/progress";
import EmojiTextarea from "@/components/EmojiTextarea";

const CATEGORY_META: Record<string, { label: string; description: string; icon: string; badge: string; bg: string; border: string }> = {
  general: {
    label: "General",
    description: "Introduce yourself and share how you use agents in your day-to-day life or job.",
    icon: "👋",
    badge: "bg-emerald-100 text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  suggestions: {
    label: "Website Suggestions & Support",
    description: "Share ideas to improve the site, report bugs, or get help with anything.",
    icon: "💡",
    badge: "bg-violet-100 text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  "1": { label: "Domain 1: Agentic Architecture & Orchestration", description: "Discuss agentic loops, multi-agent coordination, and orchestration patterns.", icon: "🤖", badge: "bg-purple-100 text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  "2": { label: "Domain 2: Tool Design & MCP Integration", description: "Share insights on tool design patterns and MCP integration.", icon: "🔧", badge: "bg-blue-100 text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "3": { label: "Domain 3: Claude Code Configuration & Workflows", description: "Explore Claude Code setup and development workflows.", icon: "💻", badge: "bg-orange-100 text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  "4": { label: "Domain 4: Prompt Engineering & Structured Output", description: "Discuss prompt techniques and structured output strategies.", icon: "✍️", badge: "bg-pink-100 text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
  "5": { label: "Domain 5: Context Management & Reliability", description: "Talk about context windows, caching, and reliability.", icon: "🧠", badge: "bg-yellow-100 text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  "6": { label: "Domain 6: Claude Fundamentals", description: "Core Claude API concepts and fundamental usage patterns.", icon: "⚡", badge: "bg-brand-100 text-brand-700", bg: "bg-brand-50", border: "border-brand-200" },
  "7": { label: "Domain 7: Safety & Responsible Use", description: "Safety principles and responsible deployment practices.", icon: "🛡️", badge: "bg-red-100 text-red-700", bg: "bg-red-50", border: "border-red-200" },
  "8": { label: "Domain 8: Vision & Multimodal Capabilities", description: "Image understanding and multimodal AI applications.", icon: "👁️", badge: "bg-teal-100 text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
};

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  _count: { replies: number };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const { data: session } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const meta = CATEGORY_META[category];

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) {
      router.push("/");
      return;
    }
    fetchPosts();
  }, [category, router]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/posts?category=${category}`);
      if (res.ok) setPosts(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setShowCompose(false);
        fetchPosts();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create post.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!meta) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-dark-400">
          <Link href="/dashboard" className="hover:text-dark-100 transition-colors">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/forum" className="hover:text-dark-100 transition-colors">Community Forum</Link>
          <ChevronRight size={14} />
          <span className="text-dark-100">{meta.label}</span>
        </div>

        {/* Header */}
        <div className={`p-6 rounded-2xl ${meta.bg} border ${meta.border} mb-6`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl">{meta.icon}</span>
            <div className="flex-1">
              <h1 className="font-bold text-dark-50 text-xl">{meta.label}</h1>
              <p className="text-dark-400 text-sm mt-1">{meta.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${meta.badge}`}>
              {posts.length} posts
            </span>
          </div>
        </div>

        {/* New post button / compose form */}
        {session ? (
          !showCompose ? (
            <button
              onClick={() => setShowCompose(true)}
              className="w-full flex items-center gap-2 p-4 rounded-2xl bg-white border border-dashed border-brand-300 text-brand-600 hover:bg-brand-50 hover:border-brand-400 transition-all text-sm font-medium mb-6"
            >
              <Plus size={16} />
              Start a new discussion
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-brand-300 rounded-2xl p-5 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-50">New Discussion</h3>
                <button type="button" onClick={() => { setShowCompose(false); setError(""); }} className="text-dark-400 hover:text-dark-100">
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-dark-700 bg-dark-950 text-dark-50 text-sm placeholder-dark-500 focus:outline-none focus:border-brand-400"
                required
              />
              <EmojiTextarea
                value={content}
                onChange={setContent}
                placeholder="Share your thoughts, questions, or advice..."
                rows={5}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCompose(false); setError(""); }}
                  className="px-4 py-2 rounded-xl text-dark-400 hover:text-dark-100 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-dark-700 text-center text-sm text-dark-400 mb-6">
            <Link href="/" className="text-brand-600 hover:underline font-medium">Sign in</Link> to join the discussion.
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-dark-700 animate-pulse space-y-3">
                <div className="h-4 bg-dark-800 rounded w-3/4" />
                <div className="h-3 bg-dark-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-semibold text-dark-100 mb-2">No posts yet</h3>
            <p className="text-dark-400 text-sm">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/${category}/${post.id}`}
                className="block p-5 rounded-2xl bg-white border border-dark-700 hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-50 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-dark-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-dark-500">
                      <span className="font-medium text-dark-300">{post.authorName}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-sm text-dark-400 bg-dark-800 px-3 py-1.5 rounded-xl">
                    <MessageSquare size={13} />
                    {post._count.replies}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
