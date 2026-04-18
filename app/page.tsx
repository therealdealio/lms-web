"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { ArrowUpRight, Eye, EyeOff, X } from "lucide-react";
import { loadProgress, setUser } from "@/lib/progress";
import { courses, getDomainsForCourse } from "@/lib/curriculum";

function useCountUp(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);
  return { ref, count };
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); observer.unobserve(el); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

type AuthMode = "signin" | "signup";

const DOSSIER_META = {
  fileNo: "№ 01 / CERT-AAC",
  classification: "PUBLIC · COMMUNITY DOSSIER",
  edition: "Edition IV — Spring 2026",
};

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState("aai");
  const [clock, setClock] = useState("");
  const revealProof = useReveal();
  const revealFeatures = useReveal();
  const revealHowItWorks = useReveal();
  const revealTestimonials = useReveal();
  const revealCurriculum = useReveal();
  const counter2 = useCountUp(2);
  const counter16 = useCountUp(16);
  const counter138 = useCountUp(138);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userName = session.user.name || "Learner";
      const userEmail = session.user.email || "";
      setUser({ name: userName, email: userEmail, startedAt: new Date().toISOString() });
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const progress = loadProgress();
    if (progress.user) setExistingUser(progress.user.name);
  }, []);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss} UTC`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSSO = async (provider: string) => {
    setSsoLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter email and password."); return; }
    setIsLoading(true);
    const result = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    if (result?.error) { setError("Invalid credentials."); setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Enter a username."); return; }
    if (name.trim().length < 2 || name.trim().length > 30) { setError("Username 2–30 characters."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email."); return; }
    if (password.length < 6) { setError("Password min 6 characters."); return; }
    setIsLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Something went wrong."); setIsLoading(false); return; }
    const result = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    if (result?.error) { setError("Account created. Please sign in."); setAuthMode("signin"); setIsLoading(false); }
  };

  const openModal = (mode: AuthMode = "signup") => {
    setAuthMode(mode);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const tickerItems = [
    "AGENT ARCHITECTURE",
    "TOOL DESIGN & MCP",
    "CLAUDE CODE",
    "PROMPT ENGINEERING",
    "CONTEXT MANAGEMENT",
    "CLAUDE FUNDAMENTALS",
    "SAFETY & RESPONSIBLE USE",
    "VISION & MULTIMODAL",
  ];

  return (
    <div className="min-h-screen bg-paper text-ink paper-fiber">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-paper/90 backdrop-blur-sm border-b border-ink">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-ink text-lg leading-none tracking-tight">L·A·A</span>
              <div className="hidden sm:block h-5 w-px bg-ink/40" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-ink-fade">Dossier</span>
                <span className="font-display text-[13px] font-semibold text-ink -mt-0.5 italic">Learn Agent Architecture</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <a href="#curriculum" onClick={(e) => { e.preventDefault(); document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" }); }}
              className="hidden md:inline-block font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep px-2">
              Syllabus
            </a>
            <a href="#dossier" onClick={(e) => { e.preventDefault(); document.getElementById("dossier")?.scrollIntoView({ behavior: "smooth" }); }}
              className="hidden md:inline-block font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep px-2">
              Dossier
            </a>
            <Link href="/about" className="hidden md:inline-block font-label text-[11px] uppercase tracking-[0.18em] text-ink hover:text-oxide transition-colors link-sweep px-2">
              About
            </Link>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => {
                  setUser({ name: "Dev User", email: "dev@local.test", startedAt: new Date().toISOString() });
                  router.push("/dashboard");
                }}
                className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade border border-dashed border-ink-fade px-2.5 py-1 hover:text-oxide hover:border-oxide transition-colors">
                Dev
              </button>
            )}
            <button onClick={() => openModal("signin")} className="btn-ink">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-[73px]">

        {/* ── Dossier masthead ── */}
        <div className="border-b border-ink">
          <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-wrap items-center justify-between gap-4 dossier-meta">
            <span className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-oxide rounded-full animate-pulse" />
              {DOSSIER_META.fileNo}
            </span>
            <span className="hidden sm:block">{DOSSIER_META.classification}</span>
            <span className="hidden md:block tabular">{clock || "—"}</span>
            <span>{DOSSIER_META.edition}</span>
          </div>
        </div>

        {/* ── Ticker ── */}
        <div className="border-b-2 border-ink bg-ink text-paper overflow-hidden">
          <div className="py-3 flex items-center">
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="font-label text-xs tracking-[0.22em] mx-10 flex items-center gap-4">
                  <span className="text-oxide">✕</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hero: editorial broadsheet ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 hairline-grid pointer-events-none opacity-70" />
          <div className="relative z-10 max-w-[1440px] mx-auto px-8 py-14 lg:py-24">

            {/* Top rail */}
            <div className="flex flex-wrap items-end justify-between mb-10 gap-4">
              <div className="animate-hero-1 space-y-1">
                <div className="dossier-meta">Volume I · Chapter One</div>
                <div className="font-label text-[11px] tracking-[0.2em] text-oxide uppercase">Prepared for Candidates of the Anthropic Architecture Certification</div>
              </div>
              <div className="animate-hero-1 text-right hidden sm:block">
                <div className="dossier-meta">Authorisation</div>
                <div className="stamp text-oxide border-oxide">✓ Community Cleared</div>
              </div>
            </div>

            <div className="rule-thick mb-12" />

            {/* Headline */}
            <div className="grid grid-cols-12 gap-6 lg:gap-10 items-end">
              <div className="col-span-12 lg:col-span-9">
                <h1 className="animate-hero-2 font-display font-display-opsz text-[14vw] sm:text-[11vw] lg:text-[9.5rem] xl:text-[11rem] leading-[0.82] tracking-[-0.045em] text-ink">
                  <span className="block">A School</span>
                  <span className="block italic font-light" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                    for the
                  </span>
                  <span className="block text-oxide">Agentic Era.</span>
                </h1>
              </div>
              <div className="col-span-12 lg:col-span-3 space-y-5 pb-3">
                <div className="animate-hero-3">
                  <div className="dossier-meta mb-1">Subject</div>
                  <p className="font-body text-[15px] leading-snug text-ink">
                    Community study platform for <em className="font-semibold not-italic">Anthropic&apos;s</em> two certifications — <span className="font-semibold">Agent Architecture</span> and <span className="font-semibold">Prompt Engineering</span>.
                  </p>
                </div>
                <div className="rule-hair" />
                <div className="animate-hero-3 font-label text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                  Directed Self-Study · 16 Domains · 138+ Questions
                </div>
              </div>
            </div>

            {/* Hero footer */}
            <div className="rule-thick mt-16 mb-6" />
            <div className="grid grid-cols-12 gap-6 lg:gap-10">
              <div className="col-span-12 lg:col-span-5 animate-hero-3">
                <p className="font-body text-lg leading-[1.55] text-ink-soft first-letter:font-display first-letter:font-bold first-letter:text-[4.5rem] first-letter:float-left first-letter:leading-[0.85] first-letter:mr-3 first-letter:mt-1 first-letter:text-oxide">
                  Every candidate for an Anthropic certification eventually confronts the same problem: scattered documents, no structured curriculum, no community, no practice exams worth the name. This dossier exists to solve that.
                </p>
              </div>

              <div className="col-span-12 lg:col-span-4 animate-hero-4 space-y-4">
                <div className="dossier-meta">Contents</div>
                <ol className="space-y-3">
                  {[
                    { n: "I", t: "AI tutor for every concept, every domain." },
                    { n: "II", t: "138+ exam-style practice questions, explained." },
                    { n: "III", t: "Domain-by-domain forum, moderated by peers." },
                    { n: "IV", t: "Certificate upon mastery of all domains." },
                  ].map(({ n, t }) => (
                    <li key={n} className="grid grid-cols-[2rem_1fr] gap-3 items-baseline border-b border-ink/10 pb-2">
                      <span className="font-display italic text-oxide tabular text-lg">{n}.</span>
                      <span className="font-body text-[15px] text-ink leading-snug">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="col-span-12 lg:col-span-3 animate-hero-4 flex flex-col gap-3 justify-end">
                <button onClick={() => openModal("signup")} className="btn-ink w-full justify-between">
                  <span>Open Dossier</span>
                  <ArrowUpRight size={16} />
                </button>
                <a href="#curriculum" onClick={(e) => { e.preventDefault(); document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" }); }}
                   className="btn-ghost w-full justify-between">
                  <span>Read Syllabus</span>
                  <ArrowUpRight size={16} />
                </a>
                <p className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade text-center mt-1">
                  No payment · 15 AI prompts gratis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Statistics rail ── */}
        <section ref={revealProof} className="reveal border-y-2 border-ink bg-paper-deep">
          <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-5 divide-x divide-ink/20">
            {[
              { label: "Certifications", value: <span ref={counter2.ref}>{counter2.count}</span>, suffix: "" },
              { label: "Exam Domains", value: <span ref={counter16.ref}>{counter16.count}</span>, suffix: "" },
              { label: "Questions", value: <span ref={counter138.ref}>{counter138.count}</span>, suffix: "+" },
              { label: "AI Tutor", value: <span>∞</span>, suffix: "" },
              { label: "To Begin", value: <span className="italic font-display">Free</span>, suffix: "" },
            ].map(({ label, value, suffix }, i) => (
              <div key={i} className="px-6 first:pl-0 last:pr-0">
                <div className="dossier-meta mb-2">§ 0{i + 1}</div>
                <div className="font-display text-5xl md:text-6xl font-bold text-ink tabular leading-none">
                  {value}{suffix}
                </div>
                <div className="mt-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink-soft">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Exhibit A — animated specimen sheet ── */}
        <section className="py-24 bg-paper hairline-grid border-b border-ink/15">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-12 gap-10 items-start">
              {/* Left — caption block */}
              <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-32">
                <div className="section-no">№ 02</div>
                <div className="rule-thick my-4 w-16" />
                <div className="dossier-meta mb-2">Exhibit A · Specimen Sheet</div>
                <h2 className="font-display font-display-tight text-5xl lg:text-6xl font-bold leading-[0.92] tracking-[-0.03em] text-ink">
                  A page from <br />the candidate&apos;s<br /><span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>dossier.</span>
                </h2>
                <p className="font-body text-[16px] leading-[1.6] text-ink-soft mt-6 max-w-sm">
                  The candidate dashboard — rendered below as a specimen — tracks mastery per domain, preserves attempt history, and returns you to the concept that last gave trouble. Progress persists across sessions.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Progress by Domain", "Attempt History", "AI Tutor Quota", "Certificate Ledger"].map((tag) => (
                    <span key={tag} className="font-label text-[10px] uppercase tracking-[0.16em] text-ink border border-ink px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-8 dossier-meta">
                  Fig. 01 · Candidate Dashboard · Annotated
                </div>
              </div>

              {/* Right — specimen frame */}
              <div className="col-span-12 lg:col-span-8">
                <figure className="relative">
                  {/* Corner ticks */}
                  <span aria-hidden className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-ink pointer-events-none" />
                  <span aria-hidden className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-ink pointer-events-none" />
                  <span aria-hidden className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-ink pointer-events-none" />
                  <span aria-hidden className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-ink pointer-events-none" />

                  {/* Specimen title bar */}
                  <div className="border-2 border-ink border-b-0 bg-ink text-paper px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-oxide" />
                        <span className="w-2.5 h-2.5 rounded-full bg-foil" />
                        <span className="w-2.5 h-2.5 rounded-full bg-paper/40" />
                      </span>
                      <span className="dossier-meta !text-paper/80">Specimen · /dashboard</span>
                    </div>
                    <span className="dossier-meta !text-paper/50 hidden sm:block">annotated · do not redistribute</span>
                  </div>

                  {/* Specimen body */}
                  <div className="relative border-2 border-ink bg-paper-fade p-4 md:p-6">
                    {/* Overlay stamp */}
                    <span aria-hidden className="hidden md:flex absolute top-6 right-6 stamp text-oxide border-oxide bg-paper-fade/90 z-10">
                      ✕ Sample
                    </span>

                    {/* Inner dashboard mock — reskinned to paper/ink */}
                    <div className="space-y-4">
                      {/* Welcome strip — ink on paper with oxide underline */}
                      <div className="border-2 border-ink bg-ink text-paper p-5">
                        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                          <div>
                            <p className="dossier-meta !text-paper/60">Candidate File</p>
                            <div className="font-display text-3xl font-bold tracking-[-0.02em] leading-none mt-1">Richard</div>
                          </div>
                          <div className="font-label text-[10px] uppercase tracking-[0.18em] text-foil">
                            3 / 8 Domains · Passed
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-baseline">
                          <span className="dossier-meta !text-paper/60">Overall Progress</span>
                          <span className="font-display text-xl font-bold text-paper tabular">38<span className="text-foil">%</span></span>
                        </div>
                        <div className="h-[3px] bg-paper/15 overflow-hidden mt-2">
                          <div className="h-full bg-foil animate-progress-loop" />
                        </div>
                      </div>

                      {/* Stat cards row */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: "3/8",  label: "Passed",  accent: "text-ink",       numeral: "I"   },
                          { value: "5/8",  label: "Started", accent: "text-oxide",     numeral: "II"  },
                          { value: "12",   label: "Prompts", accent: "text-ink",       numeral: "III" },
                          { value: "—",    label: "Cert",    accent: "text-ink-fade",  numeral: "IV"  },
                        ].map((s) => (
                          <div key={s.label} className="border border-ink p-2.5 bg-paper">
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="font-display italic text-oxide text-xs leading-none">{s.numeral}</span>
                              <span className="font-label text-[8px] uppercase tracking-[0.14em] text-ink-fade">§</span>
                            </div>
                            <div className={`font-display text-lg font-bold tabular leading-none ${s.accent}`}>{s.value}</div>
                            <div className="mt-1 font-label text-[9px] uppercase tracking-[0.16em] text-ink-soft">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Course tabs */}
                      <div className="flex gap-0 border-b border-ink/30">
                        <span className="px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-ink border-b-2 border-ink -mb-px font-semibold">
                          <span className="font-display italic text-oxide mr-1.5">I</span>Agentic AI
                        </span>
                        <span className="px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-ink-fade -mb-px">
                          <span className="font-display italic mr-1.5">II</span>Prompt Eng.
                        </span>
                        <span className="px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-ink-fade -mb-px">
                          Forum
                        </span>
                      </div>

                      {/* Domain cards grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { num: "01", title: "Agentic Architecture", weight: 27, score: 85,  passed: true  },
                          { num: "02", title: "Tool Design & MCP",    weight: 18, score: 78,  passed: true  },
                          { num: "03", title: "Claude Code Config",   weight: 20, score: null, passed: false },
                          { num: "04", title: "Prompt Engineering",   weight: 20, score: null, passed: false },
                        ].map((d) => (
                          <div key={d.num} className="border border-ink bg-paper p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-label text-[9px] uppercase tracking-[0.16em] text-oxide">
                                  Domain {d.num} · {d.weight}%
                                </div>
                                <div className="font-display font-bold text-ink text-[13px] leading-tight mt-0.5 tracking-[-0.01em]">
                                  {d.title}
                                </div>
                              </div>
                              {d.passed && (
                                <span className="font-display italic text-oxide text-xl leading-none ml-2">✓</span>
                              )}
                            </div>
                            {d.score !== null ? (
                              <div className="space-y-1">
                                <div className="flex justify-between font-label text-[9px] uppercase tracking-[0.14em]">
                                  <span className="text-ink-fade">Best</span>
                                  <span className={`font-bold tabular ${d.passed ? "text-emerald-700" : "text-oxide"}`}>{d.score}%</span>
                                </div>
                                <div className="h-[2px] bg-ink/10 overflow-hidden">
                                  <div className={`h-full ${d.passed ? "bg-emerald-700" : "bg-oxide"}`} style={{ width: `${d.score}%` }} />
                                </div>
                              </div>
                            ) : (
                              <div className="h-[2px] bg-ink/10" />
                            )}
                            <div className="flex gap-1.5 pt-0.5">
                              <span className={`flex-1 text-center font-label text-[9px] uppercase tracking-[0.16em] px-2 py-1 font-semibold ${
                                d.passed ? "bg-ink text-paper" : "bg-oxide text-paper"
                              }`}>
                                {d.passed ? "Review" : "Start"}
                              </span>
                              {d.score !== null && (
                                <span className="text-center font-label text-[9px] uppercase tracking-[0.16em] text-ink bg-paper-deep border border-ink px-2 py-1">
                                  Exam
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 font-label text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    <span>Fig. 01 — Candidate Dashboard · /dashboard</span>
                    <span className="text-ink-fade">Rendered at candidate tempo · progress bar animated</span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dossier — What's Included (replaces bento) ── */}
        <section id="dossier" ref={revealFeatures} className="reveal py-24 bg-paper">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-12 gap-10 mb-14">
              <div className="col-span-12 lg:col-span-4">
                <div className="section-no">№ 03</div>
                <div className="rule-thick my-4 w-16" />
                <div className="dossier-meta mb-2">Included in this Dossier</div>
                <h2 className="font-display font-display-tight text-5xl lg:text-6xl font-bold leading-[0.92] tracking-[-0.03em] text-ink">
                  What you <span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>receive</span>.
                </h2>
              </div>
              <div className="col-span-12 lg:col-span-7 lg:col-start-6 flex items-end">
                <p className="font-body text-[17px] leading-[1.6] text-ink-soft max-w-lg">
                  Four instruments, each designed for a specific stage of preparation — from unfamiliar concept, to confident answer, to certified candidate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
              {[
                { n: "I",   tag: "Instrument",  title: "Two Anthropic Certifications",     desc: "Agent Architecture & Prompt Engineering — every objective mapped to a domain, every domain to a study module.", span: "lg:col-span-7", accent: "oxide" },
                { n: "II",  tag: "Study Tool",  title: "AI Tutor, on demand",               desc: "Ask the AI anything about any concept. Streaming explanations grounded in course material.", span: "lg:col-span-5", accent: "ink" },
                { n: "III", tag: "Practice",    title: "138+ Exam-grade Questions",         desc: "Multiple-choice items written to match the real certification format, with detailed rationale.", span: "lg:col-span-5", accent: "ink" },
                { n: "IV",  tag: "Community",   title: "Forum for every Domain",            desc: "Peer discussion, exam traps, unofficial commentary. Domain-scoped so nothing bleeds.", span: "lg:col-span-7", accent: "oxide" },
              ].map(({ n, tag, title, desc, span, accent }) => (
                <article key={n} className={`col-span-12 ${span} dossier-card p-10 flex flex-col gap-6 min-h-[320px]`}>
                  <header className="flex items-start justify-between gap-6">
                    <div className="flex items-baseline gap-4">
                      <span className={`font-display italic text-6xl leading-none ${accent === "oxide" ? "text-oxide" : "text-ink"}`}>
                        {n}
                      </span>
                      <div>
                        <div className="dossier-meta">{tag}</div>
                        <h3 className="font-display font-display-tight text-3xl font-bold tracking-tight text-ink leading-tight mt-1">
                          {title}
                        </h3>
                      </div>
                    </div>
                    <ArrowUpRight size={22} className="text-ink mt-2 flex-shrink-0" />
                  </header>
                  <div className="rule-hair" />
                  <p className="font-body text-[16px] leading-[1.55] text-ink-soft">
                    {desc}
                  </p>
                  <div className="mt-auto font-label text-[10px] uppercase tracking-[0.22em] text-ink-fade">
                    Item {n} of IV
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Procedure (How It Works) ── */}
        <section ref={revealHowItWorks} className="reveal py-24 bg-paper-deep border-y-2 border-ink paper-grain">
          <div className="max-w-[1440px] mx-auto px-8 relative z-10">
            <div className="grid grid-cols-12 gap-10 mb-16">
              <div className="col-span-12 lg:col-span-5">
                <div className="section-no">№ 04</div>
                <div className="rule-thick my-4 w-16" />
                <div className="dossier-meta mb-2">Procedure</div>
                <h2 className="font-display font-display-tight text-5xl lg:text-6xl font-bold leading-[0.92] tracking-[-0.03em] text-ink">
                  Three moves.<br /><span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>One outcome.</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 border-2 border-ink bg-paper">
              {[
                { step: "I",   title: "Enrol",                  desc: "Create an account in 30 seconds. No card. Both courses unlock instantly. Pick up where prior visitors left off via saved progress." },
                { step: "II",  title: "Study & Drill",          desc: "Walk the 16 domains at your tempo. Concepts, then AI tutor, then questions. Revisit what still feels soft." },
                { step: "III", title: "Earn the Certificate",   desc: "Pass every domain exam at seventy percent or above. Print a signed certificate. Ship it to recruiters or paste it into LinkedIn." },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className={`col-span-12 md:col-span-4 p-10 relative ${i > 0 ? "md:border-l-2 md:border-ink" : ""} ${i < 2 ? "border-b-2 border-ink md:border-b-0" : ""}`}>
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-display italic text-8xl text-oxide leading-none">{step}</span>
                    <span className="dossier-meta mt-3">Step {i + 1} / 3</span>
                  </div>
                  <h3 className="font-display font-display-tight text-3xl font-bold text-ink leading-tight mb-4">
                    {title}
                  </h3>
                  <p className="font-body text-[15px] leading-[1.6] text-ink-soft">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials as field reports ── */}
        <section ref={revealTestimonials} className="reveal py-24 bg-paper">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-12 gap-10 mb-14">
              <div className="col-span-12 lg:col-span-6">
                <div className="section-no">№ 05</div>
                <div className="rule-thick my-4 w-16" />
                <div className="dossier-meta mb-2">Field Reports</div>
                <h2 className="font-display font-display-tight text-5xl lg:text-6xl font-bold leading-[0.92] tracking-[-0.03em] text-ink">
                  Correspondence<br /><span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>from the certified.</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {[
                { quote: "The AI tutor is a game-changer. I'd get stuck, ask, and receive an explanation I could actually work with. Passed on my first attempt.", name: "Sarah K.", role: "ML Engineer",       loc: "Berlin",   date: "02.26" },
                { quote: "Superior to reading docs alone. Realistic practice exams. Domain-by-domain approach kept me moving. Both certifications inside three weeks.",         name: "James L.", role: "Solutions Architect", loc: "Toronto",  date: "01.26" },
                { quote: "The forum was the surprise. Watching how others handled the traps gave me confidence before the real exam. Would recommend without qualification.",     name: "Priya M.", role: "AI Developer",    loc: "Bangalore", date: "03.26" },
              ].map(({ quote, name, role, loc, date }, i) => (
                <article key={name} className="col-span-12 md:col-span-4 bento-card bg-paper-fade border-2 border-ink p-8 flex flex-col gap-5">
                  <header className="flex items-start justify-between">
                    <div className="dossier-meta">Report № {String(i + 1).padStart(2, "0")}</div>
                    <div className="dossier-meta text-oxide">{date}</div>
                  </header>
                  <div className="rule-hair" />
                  <p className="font-display italic text-[20px] leading-[1.35] text-ink font-light" style={{ fontVariationSettings: '"opsz" 44, "SOFT" 60' }}>
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="rule-hair mt-auto" />
                  <footer className="flex items-end justify-between">
                    <div>
                      <div className="font-display text-lg font-bold text-ink leading-tight">{name}</div>
                      <div className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade mt-1">{role}</div>
                    </div>
                    <div className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade">{loc}</div>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Syllabus ── */}
        <section id="curriculum" ref={revealCurriculum} className="reveal py-28 bg-ink text-paper">
          <div className="max-w-[1440px] mx-auto px-8 grid lg:grid-cols-12 gap-14">
            <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
              <div className="font-display italic text-7xl text-paper/70 leading-none">№ 06</div>
              <div className="h-[3px] bg-paper my-4 w-16" />
              <div className="dossier-meta text-paper/70 mb-3">The Syllabus</div>
              <h2 className="font-display font-display-tight text-5xl lg:text-6xl font-bold leading-[0.92] tracking-[-0.03em] text-paper">
                16 domains.<br />2 courses.<br /><span className="italic font-light text-foil" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>Every concept.</span>
              </h2>
              <p className="font-body text-[16px] leading-[1.6] text-paper/65 mt-6 mb-8">
                Each domain maps directly to an objective on the Anthropic certification examination. Study at your pace, test yourself with exam-grade questions, track mastery domain by domain.
              </p>
              <button onClick={() => openModal("signup")}
                className="inline-flex items-center gap-3 bg-paper text-ink px-6 py-3.5 font-label text-xs uppercase tracking-[0.18em] font-semibold border border-paper hover:bg-oxide hover:text-paper hover:border-oxide transition-all">
                Begin the Syllabus <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="lg:col-span-8">
              <div className="flex gap-0 mb-8 border-b border-paper/30">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setActiveCourseTab(course.id)}
                    className={`flex items-center gap-2.5 px-5 py-4 font-label text-xs uppercase tracking-[0.18em] font-semibold border-b-2 -mb-px transition-colors ${
                      activeCourseTab === course.id
                        ? "text-foil border-foil"
                        : "text-paper/50 hover:text-paper border-transparent"
                    }`}
                  >
                    <span className="font-display italic text-base normal-case tracking-normal">{course.id.toUpperCase()}</span>
                    <span className="hidden sm:inline">{course.title}</span>
                  </button>
                ))}
              </div>

              {(() => {
                const activeCourse = courses.find((c) => c.id === activeCourseTab);
                return activeCourse ? (
                  <p className="font-body text-[15px] leading-[1.6] text-paper/60 mb-8 max-w-2xl italic">
                    {activeCourse.description}
                  </p>
                ) : null;
              })()}

              <ol>
                {getDomainsForCourse(activeCourseTab).map((d, i) => (
                  <li key={d.id} className="group border-b border-paper/15 last:border-0">
                    <div className="flex items-baseline gap-6 py-5">
                      <span className="font-display italic text-paper/40 group-hover:text-foil transition-colors tabular text-2xl w-12 flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 flex items-baseline gap-4 flex-wrap">
                        <h4 className="font-display font-display-tight text-xl lg:text-2xl font-semibold text-paper group-hover:text-foil transition-colors tracking-[-0.01em]">
                          {d.title}
                        </h4>
                        <span className="flex-1 border-b border-dotted border-paper/20 translate-y-[-4px] hidden sm:block" />
                        <span className="font-label text-[11px] uppercase tracking-[0.16em] text-foil tabular">
                          {d.weight}% · exam
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Closing colophon / footer ── */}
        <footer className="bg-paper border-t-2 border-ink">
          <div className="max-w-[1440px] mx-auto px-8 py-16">

            <div className="grid grid-cols-12 gap-8 mb-12">
              <div className="col-span-12 lg:col-span-5">
                <div className="dossier-meta mb-2">Colophon</div>
                <div className="font-display font-display-tight text-3xl lg:text-4xl font-bold text-ink leading-tight mb-4 tracking-[-0.02em]">
                  Learn Agent Architecture.
                </div>
                <p className="font-body text-[15px] leading-[1.6] text-ink-soft max-w-sm">
                  An independent dossier prepared for candidates of the Anthropic Agent Architecture and Prompt Engineering certifications. Set in Fraunces, Newsreader, and IBM Plex Mono.
                </p>
              </div>

              <div className="col-span-6 lg:col-span-3">
                <div className="dossier-meta mb-4">Sections</div>
                <ul className="space-y-2">
                  {[
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/forum",     label: "Forum" },
                    { href: "/about",     label: "About" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="font-body text-[15px] text-ink link-sweep">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-6 lg:col-span-2">
                <div className="dossier-meta mb-4">Legal</div>
                <ul className="space-y-2">
                  <li><Link href="/terms"   className="font-body text-[15px] text-ink link-sweep">Terms</Link></li>
                  <li><Link href="/privacy" className="font-body text-[15px] text-ink link-sweep">Privacy</Link></li>
                </ul>
              </div>

              <div className="col-span-12 lg:col-span-2">
                <div className="dossier-meta mb-4">Disclaimer</div>
                <p className="font-body text-[12px] leading-[1.5] text-ink-fade">
                  Independent community resource. Not affiliated with or endorsed by Anthropic PBC.
                </p>
              </div>
            </div>

            <div className="rule-double" />

            <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="stamp stamp-rotate-back text-oxide border-oxide">
                  ✕ Community Cleared
                </span>
                <span className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-fade">
                  © {new Date().getFullYear()} · learnagentarchitecture.com
                </span>
              </div>
              <span className="font-display italic text-lg text-ink">— Fin —</span>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Auth Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md bg-paper border-2 border-ink overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dossier header */}
            <div className="bg-ink text-paper px-6 py-3 flex items-center justify-between">
              <div className="dossier-meta !text-paper/80">
                {authMode === "signup" ? "Form 01-A · Enrolment" : "Form 01-B · Re-entry"}
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-paper/70 hover:text-oxide transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="font-display font-display-tight text-3xl font-bold text-ink tracking-[-0.02em] leading-tight">
                  {existingUser
                    ? <>Welcome back, <span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>{existingUser}</span>.</>
                    : authMode === "signup"
                    ? <>Open your <span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>dossier</span>.</>
                    : <>Sign in to <span className="italic font-light text-oxide" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>continue</span>.</>}
                </h2>
                <div className="rule-hair" />
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  {existingUser
                    ? "Resume where you left off."
                    : authMode === "signup"
                    ? "Complimentary access. Both certifications. No card required."
                    : "Access your progress and the full dossier."}
                </p>
              </div>

              {/* Tab switcher */}
              {!existingUser && (
                <div className="flex border border-ink">
                  {(["signup", "signin"] as AuthMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setAuthMode(m); setError(""); }}
                      className={`flex-1 py-2.5 font-label text-[11px] uppercase tracking-[0.16em] font-semibold transition-all ${
                        authMode === m
                          ? "bg-ink text-paper"
                          : "bg-paper text-ink-soft hover:text-ink"
                      }`}
                    >
                      {m === "signup" ? "Enrol" : "Re-enter"}
                    </button>
                  ))}
                </div>
              )}

              {/* SSO buttons */}
              <div className="space-y-2">
                {[
                  { provider: "google",   label: "Google",   icon: "G"  },
                  { provider: "github",   label: "GitHub",   icon: "⌥"  },
                  { provider: "linkedin", label: "LinkedIn", icon: "in" },
                ].map(({ provider, label, icon }) => (
                  <button
                    key={provider}
                    onClick={() => handleSSO(provider)}
                    disabled={!!ssoLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-ink/40 hover:border-ink hover:bg-paper-deep transition-all font-label text-sm text-ink disabled:opacity-50"
                  >
                    <span className="w-6 h-6 border border-ink flex items-center justify-center font-display font-bold text-xs text-ink flex-shrink-0">
                      {ssoLoading === provider ? "…" : icon}
                    </span>
                    <span className="font-body text-[14px]">Continue with {label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-ink/15" />
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-ink-fade">or by email</span>
                <div className="flex-1 h-px bg-ink/15" />
              </div>

              {/* Email/password form */}
              <form onSubmit={authMode === "signup" ? handleSignUp : handleSignIn} className="space-y-3">
                {authMode === "signup" && !existingUser && (
                  <div className="space-y-1">
                    <label className="dossier-meta block">Given Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      autoComplete="name"
                      className="w-full px-3 py-3 border border-ink/40 bg-paper-fade focus:outline-none focus:border-ink focus:bg-paper text-ink font-body text-sm transition-all placeholder:text-ink-fade/60"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="dossier-meta block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-3 py-3 border border-ink/40 bg-paper-fade focus:outline-none focus:border-ink focus:bg-paper text-ink font-body text-sm transition-all placeholder:text-ink-fade/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="dossier-meta block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === "signup" ? "At least 6 characters" : "Your password"}
                      autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      className="w-full px-3 py-3 pr-10 border border-ink/40 bg-paper-fade focus:outline-none focus:border-ink focus:bg-paper text-ink font-body text-sm transition-all placeholder:text-ink-fade/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-fade hover:text-ink transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="font-label text-[11px] uppercase tracking-[0.14em] text-oxide border border-oxide/40 bg-oxide/5 px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-ink w-full justify-center mt-2 disabled:opacity-60"
                >
                  {isLoading
                    ? "Please wait…"
                    : authMode === "signup"
                    ? "File Enrolment"
                    : "Sign In"}
                </button>
              </form>

              {!existingUser && (
                <p className="text-center font-label text-[11px] uppercase tracking-[0.14em] text-ink-fade">
                  {authMode === "signup" ? "Have a dossier? " : "New here? "}
                  <button
                    onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); setError(""); }}
                    className="text-oxide font-semibold hover:underline normal-case tracking-normal font-body"
                  >
                    {authMode === "signup" ? "Sign in" : "Enrol, complimentary."}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
