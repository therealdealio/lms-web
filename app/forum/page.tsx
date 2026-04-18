"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { loadProgress } from "@/lib/progress";

const ROMANS = ["I","II","III","IV","V","VI","VII","VIII"];

const CATEGORIES = [
  { id: "general",     label: "General",                                                  description: "Introduce yourself and share how you use agents day-to-day.",            icon: "👋", domain: false },
  { id: "suggestions", label: "Website Suggestions & Support",                            description: "Ideas to improve the site, bug reports, general help.",                  icon: "💡", domain: false },
  { id: "1",           label: "Agentic Architecture & Orchestration",                     description: "Agentic loops, multi-agent coordination, subagent isolation patterns.",   icon: "🤖", domain: true },
  { id: "2",           label: "Tool Design & MCP Integration",                            description: "Tool design patterns, MCP integration, API surface design.",             icon: "🔧", domain: true },
  { id: "3",           label: "Claude Code Configuration & Workflows",                    description: "Claude Code setup, CLAUDE.md configuration, dev workflows.",             icon: "💻", domain: true },
  { id: "4",           label: "Prompt Engineering & Structured Output",                   description: "Prompt techniques, structured output, JSON schemas, eval strategies.",    icon: "✍️", domain: true },
  { id: "5",           label: "Context Management & Reliability",                         description: "Context windows, caching, memory patterns, production reliability.",      icon: "🧠", domain: true },
  { id: "6",           label: "Claude Fundamentals",                                      description: "Core Claude API concepts, models, token usage, fundamentals.",            icon: "⚡", domain: true },
  { id: "7",           label: "Safety & Responsible Use",                                 description: "Safety principles, responsible deployment, ethical best practice.",       icon: "🛡️", domain: true },
  { id: "8",           label: "Vision & Multimodal Capabilities",                         description: "Image understanding, document processing, multimodal applications.",      icon: "👁️", domain: true },
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
    if (!p.user) { router.push("/"); return; }
    fetch("/api/forum/stats")
      .then((r) => r.ok ? r.json() : {})
      .then((data: CategoryStats) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const totalPosts = Object.values(stats).reduce((sum, s) => sum + s.postCount, 0);

  return (
    <div className="min-h-screen bg-paper text-ink paper-fiber">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-paper/92 backdrop-blur-sm border-b border-ink">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-8 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep">
            <ArrowLeft size={13} />
            Dashboard
          </Link>
          <Link href="/" className="hidden sm:flex items-center gap-3">
            <span className="font-display font-black text-ink text-lg leading-none tracking-tight">L·A·A</span>
            <span className="h-4 w-px bg-ink/40" />
            <span className="font-label text-[10px] uppercase tracking-[0.22em] text-ink-fade">Forum</span>
          </Link>
        </div>
      </nav>

      {/* Dossier strip */}
      <div className="border-b border-ink">
        <div className="max-w-4xl mx-auto px-8 py-3 flex flex-wrap items-center justify-between gap-3 dossier-meta">
          <span className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-oxide rounded-full animate-pulse" />
            Community Correspondence
          </span>
          <span className="hidden md:block">10 channels · domain-scoped</span>
          {!loading && (
            <span className="tabular">{totalPosts} {totalPosts === 1 ? "entry" : "entries"} in register</span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 space-y-10">

        {/* Header */}
        <header className="space-y-4">
          <div className="section-no">§</div>
          <div className="rule-thick w-16" />
          <div className="dossier-meta">The Forum</div>
          <h1 className="font-display font-bold text-ink text-5xl lg:text-6xl leading-[0.92] tracking-[-0.03em]">
            Correspondence<br /><span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>between candidates.</span>
          </h1>
          <p className="font-body text-[17px] leading-[1.6] text-ink-soft max-w-xl">
            Ten channels — two general, eight domain-scoped. Post a question, leave a ruling, read what others have surfaced before you.
          </p>
        </header>

        {/* Category list */}
        <section className="border-2 border-ink">
          {CATEGORIES.map((cat, i) => {
            const catStats = stats[cat.id];
            const postCount = catStats?.postCount ?? 0;
            const ref = cat.domain ? `Dom. ${ROMANS[Number(cat.id) - 1] || cat.id}` : (cat.id === "general" ? "Gen." : "Supp.");
            return (
              <Link
                key={cat.id}
                href={`/forum/${cat.id}`}
                className={`flex items-center gap-6 p-5 bg-paper-fade hover:bg-paper transition-colors group ${i > 0 ? "border-t-2 border-ink" : ""}`}
              >
                <span className="font-display italic text-oxide text-3xl leading-none tabular w-12 flex-shrink-0 text-center">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-2xl leading-none flex-shrink-0 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="font-display font-bold text-ink group-hover:text-oxide transition-colors text-lg leading-tight tracking-[-0.01em]">
                      {cat.label}
                    </h2>
                    <span className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade">
                      {ref}
                    </span>
                  </div>
                  <p className="font-body text-[14px] text-ink-soft mt-0.5 leading-snug line-clamp-1">{cat.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {loading ? (
                    <div className="w-16 h-4 bg-ink/10 animate-pulse" />
                  ) : (
                    <span className="font-label text-[10px] uppercase tracking-[0.18em] text-ink tabular">
                      {postCount} {postCount === 1 ? "entry" : "entries"}
                    </span>
                  )}
                  <ArrowUpRight size={16} className="text-ink-fade group-hover:text-oxide transition-colors" />
                </div>
              </Link>
            );
          })}
        </section>

        <footer className="pt-6 border-t-2 border-ink flex items-center justify-between">
          <span className="dossier-meta">© {new Date().getFullYear()} · Learn Agent Architecture · Forum</span>
          <span className="font-display italic text-ink">— End of Register —</span>
        </footer>
      </div>
    </div>
  );
}
