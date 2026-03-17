"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, ChevronRight, Trash2, Send, Clock } from "lucide-react";
import { loadProgress } from "@/lib/progress";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  "1": "Domain 1: Agentic Architecture",
  "2": "Domain 2: Tool Design & MCP",
  "3": "Domain 3: Claude Code",
  "4": "Domain 4: Prompt Engineering",
  "5": "Domain 5: Context Management",
  "6": "Domain 6: Claude Fundamentals",
  "7": "Domain 7: Safety & Responsible Use",
  "8": "Domain 8: Vision & Multimodal",
};

const ADMIN_EMAIL = "rrthai88@gmail.com";

interface Reply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  replies: Reply[];
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

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colors = ["bg-brand-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-teal-500"];
  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return (
    <div className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const postId = params.postId as string;
  const { data: session } = useSession();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingReply, setDeletingReply] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) {
      router.push("/");
      return;
    }
    fetchPost();
    // Fetch current user ID for ownership checks
    if (session?.user?.email) {
      fetch("/api/membership").then(async (r) => {
        if (r.ok) {
          // Use a simple user lookup instead
        }
      });
    }
  }, [postId, router, session]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}`);
      if (res.ok) {
        setPost(await res.json());
      } else {
        router.push(`/forum/${category}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        fetchPost();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post? All replies will also be deleted.")) return;
    setDeletingPost(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}`, { method: "DELETE" });
      if (res.ok) router.push(`/forum/${category}`);
    } finally {
      setDeletingPost(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Delete this reply?")) return;
    setDeletingReply(replyId);
    try {
      const res = await fetch(`/api/forum/replies/${replyId}`, { method: "DELETE" });
      if (res.ok) {
        setPost((prev) =>
          prev ? { ...prev, replies: prev.replies.filter((r) => r.id !== replyId) } : prev
        );
      }
    } finally {
      setDeletingReply(null);
    }
  };

  const canDeletePost = isAdmin || (post?.authorId && currentUserId === post.authorId);
  const canDeleteReply = (reply: Reply) => isAdmin || currentUserId === reply.authorId;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-dark-400 flex-wrap">
          <Link href="/dashboard" className="hover:text-dark-100 transition-colors">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/forum" className="hover:text-dark-100 transition-colors">Community Forum</Link>
          <ChevronRight size={14} />
          <Link href={`/forum/${category}`} className="hover:text-dark-100 transition-colors">
            {CATEGORY_LABELS[category] ?? category}
          </Link>
          <ChevronRight size={14} />
          <span className="text-dark-100 line-clamp-1 max-w-[200px]">{post.title}</span>
        </div>

        {/* Original post */}
        <div className="bg-white border border-dark-700 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-dark-50 flex-1">{post.title}</h1>
            {(isAdmin) && (
              <button
                onClick={handleDeletePost}
                disabled={deletingPost}
                title="Delete post"
                className="text-dark-500 hover:text-red-500 transition-colors flex-shrink-0 p-1"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3 mb-4 text-sm text-dark-400">
            <Avatar name={post.authorName} />
            <span className="font-medium text-dark-300">{post.authorName}</span>
            <span className="flex items-center gap-1 text-xs">
              <Clock size={11} />
              {timeAgo(post.createdAt)}
            </span>
          </div>

          <p className="text-dark-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          <h2 className="font-semibold text-dark-100 text-sm uppercase tracking-wide">
            {post.replies.length} {post.replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          {post.replies.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">
              No replies yet. Be the first to respond!
            </div>
          ) : (
            post.replies.map((reply, index) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar name={reply.authorName} />
                <div className="flex-1 bg-white border border-dark-700 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-dark-300">{reply.authorName}</span>
                      <span className="flex items-center gap-1 text-xs text-dark-500">
                        <Clock size={10} />
                        {timeAgo(reply.createdAt)}
                      </span>
                    </div>
                    {(isAdmin) && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        disabled={deletingReply === reply.id}
                        className="text-dark-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply composer */}
        {session ? (
          <form onSubmit={handleReply} className="bg-white border border-dark-700 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-dark-50 text-sm">Add your reply</h3>
            <textarea
              placeholder="Share your thoughts or advice..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-dark-700 bg-dark-950 text-dark-50 text-sm placeholder-dark-500 focus:outline-none focus:border-brand-400 resize-none"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
              >
                <Send size={14} />
                {submitting ? "Posting..." : "Reply"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-dark-700 text-center text-sm text-dark-400">
            <Link href="/" className="text-brand-600 hover:underline font-medium">Sign in</Link> to reply.
          </div>
        )}
      </div>
    </div>
  );
}
