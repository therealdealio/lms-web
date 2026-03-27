"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, CheckCircle, X } from "lucide-react";
import { loadProgress, setUser } from "@/lib/progress";
import { getDomainsForCourse } from "@/lib/curriculum";

const domains = getDomainsForCourse("aai");

type AuthMode = "signin" | "signup";

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

  const handleSSO = async (provider: string) => {
    setSsoLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setIsLoading(true);
    const result = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    if (result?.error) { setError("Invalid email or password. Please try again."); setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter a username."); return; }
    if (name.trim().length < 2 || name.trim().length > 30) { setError("Username must be 2–30 characters."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Something went wrong."); setIsLoading(false); return; }
    const result = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    if (result?.error) { setError("Account created! Please sign in."); setAuthMode("signin"); setIsLoading(false); }
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

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-headline font-bold text-on-surface tracking-tight">Learn Agent Architecture</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#curriculum" onClick={(e) => { e.preventDefault(); document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium hidden md:block px-3 py-2">
              Curriculum
            </a>
            <Link href="/about" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium hidden md:block px-3 py-2">
              About
            </Link>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => {
                  setUser({ name: "Dev User", email: "dev@local.test", startedAt: new Date().toISOString() });
                  router.push("/dashboard");
                }}
                className="text-xs px-3 py-1.5 rounded border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors font-label">
                Dev Login
              </button>
            )}
            <button onClick={() => openModal("signin")}
              className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-bold text-sm hover:opacity-90 transition-all active:scale-95">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-[73px]">

        {/* ── Hero — sell first, show a visual ── */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-center">
          <div className="absolute inset-0 blueprint-grid pointer-events-none" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-container/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div className="space-y-8">
              <span className="inline-block text-xs tracking-[0.25em] uppercase text-primary font-headline font-bold bg-primary/8 px-3 py-1.5 rounded-full">
                Anthropic Certification Prep
              </span>

              <h1 className="text-6xl lg:text-7xl font-headline font-black leading-[0.88] tracking-tighter text-on-surface">
                Master<br /><span className="text-primary">Agent</span><br />Architecture.
              </h1>

              <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg">
                The community study platform for the <strong className="text-on-surface font-semibold">Anthropic Architecture Certification</strong> — built by engineers, for engineers. AI-powered explanations, real practice questions, community forum.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  "58+ exam-style practice questions across 8 domains",
                  "AI tutor for instant concept explanations",
                  "Community forum with domain-specific discussions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-on-surface-variant text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button onClick={() => openModal("signup")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-md font-headline font-bold text-lg shadow-lg shadow-primary/15 hover:scale-[1.02] transition-transform">
                  Start Learning Free <ArrowRight size={20} />
                </button>
                <a href="#curriculum" onClick={(e) => { e.preventDefault(); document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex items-center gap-2 border-2 border-primary/25 text-primary px-8 py-4 rounded-md font-headline font-bold text-lg hover:border-primary/60 hover:bg-primary/5 transition-colors">
                  View Curriculum
                </a>
              </div>
            </div>

            {/* Right: product preview mockup */}
            <div className="hidden lg:block relative">
              {/* Outer glow frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-primary-container/5 rounded-2xl blur-xl" />

              {/* Mock dashboard card */}
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden border border-outline-variant/20">
                {/* Mock nav bar */}
                <div className="bg-surface-container-low px-5 py-3 flex items-center justify-between border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="" className="w-5 h-5 rounded" />
                    <span className="text-xs font-headline font-bold text-on-surface">Dashboard</span>
                  </div>
                  <span className="text-[10px] font-label font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                    Sample Preview
                  </span>
                </div>

                {/* Mock content */}
                <div className="p-5 space-y-4">
                  {/* Progress bar block */}
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-headline font-bold text-on-surface">Your Progress</span>
                      <span className="text-xs font-label text-primary font-bold">3 / 8 Domains</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full w-[38%] bg-gradient-to-r from-primary to-primary-container rounded-full" />
                    </div>
                  </div>

                  {/* Domain cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: "Claude Fundamentals", pct: 85, done: true },
                      { title: "Prompt Engineering", pct: 72, done: true },
                      { title: "Agent SDK", pct: 40, done: false },
                      { title: "Tool Design & MCP", pct: 0, done: false },
                    ].map((d) => (
                      <div key={d.title} className={`rounded-lg p-3 ${d.done ? "bg-primary/8" : "bg-surface-container-low"}`}>
                        <div className="text-[10px] font-headline font-bold text-on-surface mb-2 leading-tight">{d.title}</div>
                        <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <div className="text-[9px] font-label text-on-surface-variant mt-1">{d.pct}% complete</div>
                      </div>
                    ))}
                  </div>

                  {/* AI Q&A mock */}
                  <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
                    <div className="text-xs font-headline font-bold text-on-surface">AI Study Assistant</div>
                    <div className="bg-surface-container rounded-lg p-3">
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        &ldquo;What is the difference between ReAct and Chain-of-Thought prompting?&rdquo;
                      </p>
                    </div>
                    <div className="bg-primary/8 rounded-lg p-3 border-l-2 border-primary">
                      <p className="text-[10px] text-on-surface leading-relaxed">
                        ReAct interleaves reasoning and acting — the model reasons, takes an action, observes the result, then reasons again. Chain-of-Thought is purely reasoning...
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <div className="text-[9px] text-primary font-label font-bold">AI-powered explanations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating trust badge */}
              <div className="absolute -bottom-4 -left-4 bg-surface-container-lowest rounded-xl shadow-lg shadow-primary/10 px-4 py-3 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="text-on-primary text-xs font-headline font-black">✓</span>
                </div>
                <div>
                  <div className="text-xs font-headline font-bold text-on-surface">Community Driven</div>
                  <div className="text-[10px] text-on-surface-variant font-label">Free to start, always</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof strip ── */}
        <div className="bg-surface-container border-y border-outline-variant/20 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10 text-center">
            {[
              { stat: "8", label: "Exam Domains" },
              { stat: "58+", label: "Practice Questions" },
              { stat: "100%", label: "Free to Start" },
              { stat: "AI", label: "Powered Explanations" },
              { stat: "Forum", label: "Community Support" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-xl font-headline font-black text-primary">{stat}</div>
                <div className="text-xs text-on-surface-variant font-label uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features Bento ── */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-headline font-bold">What&apos;s Included</span>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tight mt-3 mb-4 text-on-surface">
                Everything you need<br />to get certified.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Certification — large */}
              <div className="md:col-span-2 bg-surface rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="h-56 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&auto=format&fit=crop"
                    alt="Professional working toward AI certification" fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" priority />
                </div>
                <div className="p-8">
                  <span className="text-xs font-label font-bold uppercase tracking-widest text-primary mb-3 block">Certification Prep</span>
                  <h3 className="text-2xl font-headline font-bold mb-2 text-on-surface">Anthropic Architecture Certification</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    One of the most prestigious AI credentials — built by the team behind Claude. Covers every domain from agentic orchestration to Claude Code workflows.
                  </p>
                </div>
              </div>

              {/* AI Q&A */}
              <div className="bg-primary rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="h-56 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80&auto=format&fit=crop"
                    alt="AI visualization" fill className="object-cover opacity-40" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary" />
                </div>
                <div className="p-8 text-on-primary">
                  <span className="text-xs font-label font-bold uppercase tracking-widest opacity-70 mb-3 block">Study Tool</span>
                  <h3 className="text-2xl font-headline font-bold mb-2">AI-Powered Q&A</h3>
                  <p className="opacity-75 text-sm leading-relaxed">Ask any concept question and get an instant, detailed explanation from an AI tutor. Available anytime you need it.</p>
                </div>
              </div>

              {/* Practice Exams */}
              <div className="bg-surface rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="h-56 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80&auto=format&fit=crop"
                    alt="Person studying" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-8">
                  <span className="text-xs font-label font-bold uppercase tracking-widest text-primary mb-3 block">Practice</span>
                  <h3 className="text-2xl font-headline font-bold mb-2 text-on-surface">Realistic Practice Exams</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">58 multiple-choice questions with detailed answer explanations. Learn from every attempt.</p>
                </div>
              </div>

              {/* Community Forum — wide */}
              <div className="md:col-span-2 bg-inverse-surface rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="h-56 overflow-hidden relative">
                  <Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
                    alt="Team collaborating" fill className="object-cover opacity-30" sizes="(max-width: 768px) 100vw, 66vw" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-inverse-surface/95" />
                </div>
                <div className="p-8 text-inverse-on-surface">
                  <span className="text-xs font-label font-bold uppercase tracking-widest opacity-50 mb-3 block">Community</span>
                  <h3 className="text-2xl font-headline font-bold mb-2">Community Forum</h3>
                  <p className="opacity-60 text-sm leading-relaxed mb-5">Domain-specific discussions, peer support, and exam tips from engineers working through the same material.</p>
                  <div className="flex gap-2 flex-wrap">
                    {["8 Domains", "Open to All", "Free Forever"].map((tag) => (
                      <span key={tag} className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-headline font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Curriculum ── */}
        <section id="curriculum" className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-headline font-bold">The Syllabus</span>
              <h2 className="text-4xl font-headline font-black tracking-tighter mt-3 mb-4 text-on-surface">
                8 domains.<br />Every concept<br />covered.
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                Each domain maps directly to the Anthropic Architecture Certification exam. Study at your own pace, track progress, and test with real exam-style questions.
              </p>
              <button onClick={() => openModal("signup")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-md font-headline font-bold text-sm hover:opacity-90 transition-all">
                Start Studying Free <ArrowRight size={16} />
              </button>
            </div>

            <div className="lg:col-span-8">
              {domains.map((d, i) => (
                <div key={d.id} className="group border-b border-outline-variant/25 last:border-0">
                  <div className="flex items-center gap-6 py-5">
                    <span className="text-3xl font-headline font-light text-outline-variant group-hover:text-primary transition-colors duration-300 w-10 flex-shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="flex-1 text-lg font-headline font-bold text-on-surface group-hover:text-primary transition-colors duration-300">
                      {d.title}
                    </h4>
                    <span className="text-xs font-label font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                      {d.weight}% of exam
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-16 bg-inverse-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo.svg" alt="LAA Logo" className="w-8 h-8 rounded-lg" />
                  <span className="font-headline font-bold text-inverse-on-surface">Learn Agent Architecture</span>
                </div>
                <p className="text-inverse-on-surface/60 text-sm leading-relaxed">
                  The community study platform for the Anthropic Architecture Certification and future AI certifications.
                </p>
              </div>
              <div>
                <p className="font-headline font-bold text-inverse-on-surface/50 text-xs mb-4 uppercase tracking-wider">Platform</p>
                <div className="space-y-3">
                  <Link href="/dashboard" className="block text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors text-sm font-label">Study Dashboard</Link>
                  <Link href="/forum" className="block text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors text-sm font-label">Community Forum</Link>
                  <Link href="/about" className="block text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors text-sm font-label">About</Link>
                </div>
              </div>
              <div>
                <p className="font-headline font-bold text-inverse-on-surface/50 text-xs mb-4 uppercase tracking-wider">Disclaimer</p>
                <p className="text-inverse-on-surface/50 text-xs leading-relaxed">
                  Independent community learning platform. Not affiliated with or endorsed by Anthropic PBC. Built to prepare learners for top AI certifications.
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-inverse-on-surface/40 text-xs font-label">© {new Date().getFullYear()} Learn Agent Architecture</p>
              <p className="text-inverse-on-surface/40 text-xs font-label">learnagentarchitecture.com</p>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Auth Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl shadow-primary/10 border border-outline-variant/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="space-y-1 pr-8">
                <h2 className="text-2xl font-headline font-black text-on-surface tracking-tight">
                  {existingUser
                    ? `Welcome back, ${existingUser}!`
                    : authMode === "signup"
                    ? "Create your free account"
                    : "Sign in to continue"}
                </h2>
                <p className="text-on-surface-variant text-sm font-label">
                  {existingUser
                    ? "Sign in to pick up where you left off."
                    : authMode === "signup"
                    ? "Start studying for the Anthropic Architecture Certification."
                    : "Access your study dashboard and progress."}
                </p>
              </div>

              {/* Tab switcher */}
              {!existingUser && (
                <div className="flex bg-surface-container rounded-lg p-1">
                  {(["signup", "signin"] as AuthMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setAuthMode(m); setError(""); }}
                      className={`flex-1 py-2 rounded-md text-sm font-headline font-bold transition-all ${
                        authMode === m
                          ? "bg-surface text-on-surface shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {m === "signup" ? "Create Account" : "Sign In"}
                    </button>
                  ))}
                </div>
              )}

              {/* SSO buttons */}
              <div className="space-y-3">
                {[
                  { provider: "google", label: "Continue with Google", icon: "G" },
                  { provider: "github", label: "Continue with GitHub", icon: "⌥" },
                  { provider: "linkedin", label: "Continue with LinkedIn", icon: "in" },
                ].map(({ provider, label, icon }) => (
                  <button
                    key={provider}
                    onClick={() => handleSSO(provider)}
                    disabled={!!ssoLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-outline-variant/40 hover:border-primary/30 hover:bg-surface-container-low transition-all text-sm font-label font-medium text-on-surface disabled:opacity-50"
                  >
                    <span className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-xs font-headline font-black text-primary flex-shrink-0">
                      {ssoLoading === provider ? "…" : icon}
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant/30" />
                <span className="text-xs font-label text-on-surface-variant">or with email</span>
                <div className="flex-1 h-px bg-outline-variant/30" />
              </div>

              {/* Email/password form */}
              <form onSubmit={authMode === "signup" ? handleSignUp : handleSignIn} className="space-y-4">
                {authMode === "signup" && !existingUser && (
                  <div className="space-y-1">
                    <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary/60 focus:bg-surface text-on-surface text-sm font-label transition-all placeholder:text-on-surface-variant/40"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary/60 focus:bg-surface text-on-surface text-sm font-label transition-all placeholder:text-on-surface-variant/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === "signup" ? "At least 6 characters" : "Your password"}
                      autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary/60 focus:bg-surface text-on-surface text-sm font-label transition-all placeholder:text-on-surface-variant/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-error text-sm font-label bg-error-container/20 border border-error/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 shadow-sm shadow-primary/20"
                >
                  {isLoading
                    ? "Please wait…"
                    : authMode === "signup"
                    ? "Create Free Account"
                    : "Sign In"}
                </button>
              </form>

              {/* Switch mode link */}
              {!existingUser && (
                <p className="text-center text-xs font-label text-on-surface-variant">
                  {authMode === "signup" ? "Already have an account? " : "Don't have an account? "}
                  <button
                    onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); setError(""); }}
                    className="text-primary font-bold hover:underline"
                  >
                    {authMode === "signup" ? "Sign in" : "Create one free"}
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