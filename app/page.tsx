"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { BookOpen, Brain, Award, ArrowRight, CheckCircle, Zap, Heart, Eye, EyeOff } from "lucide-react";
import { loadProgress, setUser } from "@/lib/progress";
import { domains } from "@/lib/curriculum";

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

  // Bridge OAuth session → localStorage progress
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
    if (progress.user) {
      setExistingUser(progress.user.name);
    }
  }, []);

  const handleSSO = async (provider: string) => {
    setSsoLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    // success — useEffect will redirect once session loads
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setIsLoading(false);
      return;
    }

    // Auto sign in after signup
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created! Please sign in.");
      setAuthMode("signin");
      setIsLoading(false);
      return;
    }
    // useEffect will redirect
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <nav className="border-b border-dark-700 bg-dark-950/80 backdrop-blur-sm px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="LAA Logo" className="w-9 h-9 rounded-xl shadow-sm" />
              <div>
                <div className="font-bold text-dark-50 leading-tight">Agentic AI Architecture</div>
                <div className="text-xs text-brand-600 font-medium">Community study resource · Unofficial</div>
              </div>
            </div>
            <Link
              href="/about"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-colors text-sm font-medium"
            >
              <Heart size={14} />
              About
            </Link>
          </div>
        </nav>

        {/* Disclaimer banner */}
        <div className="bg-dark-900 border-b border-dark-700 px-6 py-2.5 text-center">
          <p className="text-dark-400 text-xs">
            Community study resource — not affiliated with or endorsed by Anthropic PBC, but designed to help you prepare for their certifications. More top AI certifications coming soon.
          </p>
        </div>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium">
                <Zap size={14} />
                Unofficial community study resource
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-dark-50">Master</span>{" "}
                <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                  Agentic AI Architecture
                </span>
              </h1>

              <p className="text-dark-300 text-xl leading-relaxed">
                Comprehensive coverage of agentic systems, tool design, prompt engineering, context management, and multi-agent coordination — a community-built study course designed to help you prepare for Anthropic&apos;s certifications and beyond.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: "8 Sections", sub: "Full exam coverage" },
                  { icon: Brain, label: "AI Q&A", sub: "AI-powered feedback" },
                  { icon: Award, label: "Recognition", sub: "Earned on completion" },
                  { icon: CheckCircle, label: "58 Questions", sub: "Realistic MCQ exams" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-dark-700">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-dark-50 text-sm">{label}</div>
                      <div className="text-dark-400 text-xs">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section Overview */}
              <div className="space-y-2">
                <p className="text-dark-400 text-sm font-medium uppercase tracking-wider">Course Sections</p>
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <span
                      key={d.id}
                      className="px-3 py-1 rounded-full text-xs bg-dark-800 border border-dark-700 text-dark-200"
                    >
                      S{d.id}: {d.title.split(" ").slice(0, 2).join(" ")} ({d.weight}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Auth Form */}
            <div className="animate-fade-in">
              {existingUser ? (
                <div className="p-8 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto shadow-sm">
                      <span className="text-2xl font-bold text-white">
                        {existingUser[0].toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-dark-50">Welcome back, {existingUser}!</h2>
                    <p className="text-dark-400">Continue where you left off.</p>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all shadow-sm"
                  >
                    Continue Learning
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => setExistingUser(null)}
                    className="w-full py-3 text-dark-400 hover:text-dark-200 text-sm transition-colors"
                  >
                    Sign in with a different account
                  </button>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-dark-50">
                      {authMode === "signin" ? "Sign In" : "Create Account"}
                    </h2>
                    <p className="text-dark-400">
                      {authMode === "signin"
                        ? "Sign in to continue your certification journey."
                        : "Create an account to start your certification journey."}
                    </p>
                  </div>

                  {/* SSO Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSSO("google")}
                      disabled={!!ssoLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-dark-700 hover:bg-dark-950 text-dark-100 font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ssoLoading === "google" ? (
                        <div className="w-5 h-5 border-2 border-dark-400 border-t-brand-600 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Continue with Google
                    </button>

                    <button
                      onClick={() => handleSSO("github")}
                      disabled={!!ssoLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ssoLoading === "github" ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 flex-shrink-0 fill-white" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      )}
                      Continue with GitHub
                    </button>

                    <button
                      onClick={() => handleSSO("linkedin")}
                      disabled={!!ssoLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#0077B5] hover:bg-[#006399] text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ssoLoading === "linkedin" ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 flex-shrink-0 fill-white" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
                      Continue with LinkedIn
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-dark-700" />
                    <span className="text-dark-500 text-xs">or use email</span>
                    <div className="flex-1 h-px bg-dark-700" />
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                    {authMode === "signup" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark-200">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Johnson"
                          className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-dark-700 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400 transition-colors"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-200">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-dark-700 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-200">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={authMode === "signup" ? "At least 6 characters" : "Your password"}
                          className="w-full px-4 py-3 pr-11 rounded-xl bg-dark-950 border border-dark-700 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          {authMode === "signin" ? "Signing in..." : "Creating account..."}
                        </>
                      ) : (
                        <>
                          {authMode === "signin" ? "Sign In" : "Create Account"}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-dark-400 text-sm">
                    {authMode === "signin" ? (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          onClick={() => { setAuthMode("signup"); setError(""); }}
                          className="text-brand-600 hover:text-brand-500 font-medium transition-colors"
                        >
                          Create one
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          onClick={() => { setAuthMode("signin"); setError(""); }}
                          className="text-brand-600 hover:text-brand-500 font-medium transition-colors"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="border-t border-dark-700 bg-dark-900">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-center text-2xl font-bold text-dark-50 mb-12">
              Everything You Need to Learn Agentic AI Architecture
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🤖",
                  title: "AI-Powered Q&A",
                  description: "Ask an AI tutor about any concept in the course. Get instant, detailed explanations tailored to your question level.",
                },
                {
                  icon: "📝",
                  title: "Realistic Practice Exams",
                  description: "58 multiple-choice questions across 8 sections. Each question includes detailed explanations of why answers are correct or incorrect.",
                },
                {
                  icon: "🎓",
                  title: "Certification Prep + Recognition",
                  description: "Content aligned to help you prepare for Anthropic's certifications. Earn a printable community recognition when you pass all section exams. Not an official credential — future tracks for other top AI certifications coming soon.",
                },
              ].map(({ icon, title, description }) => (
                <div key={title} className="p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-4">
                  <div className="text-4xl">{icon}</div>
                  <h3 className="text-lg font-bold text-dark-50">{title}</h3>
                  <p className="text-dark-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal story section */}
        <div className="border-t border-dark-700">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="relative">
              <div className="absolute -top-4 -left-2 text-8xl text-brand-200 font-serif leading-none select-none">&ldquo;</div>

              <div className="relative z-10 space-y-8 pl-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium">
                  <Zap size={14} />
                  Why this course matters
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-dark-50 leading-snug">
                  Agentic AI is a{" "}
                  <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                    paradigm shift
                  </span>
                  {" "}— and most people aren&apos;t ready.
                </h2>

                <div className="space-y-5 text-lg text-dark-300 leading-relaxed">
                  <p>
                    Here&apos;s why this matters — especially if you&apos;re a developer, engineer, or any professional who feels like the AI wave is moving too fast.
                  </p>

                  <div className="pl-5 border-l-2 border-brand-400 space-y-2">
                    <p className="text-dark-100 font-medium">Agentic AI coding tools changed everything.</p>
                    <p>Not an incremental upgrade. A fundamentally different way of building software.</p>
                    <p className="text-dark-400 text-base">
                      While this course is an independent community resource and is not affiliated with or endorsed by Anthropic PBC,
                      it is built to prepare you for their certifications. We plan to expand to other leading AI certifications in this space.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { term: "Agentic architecture", desc: "Systems that act, not just respond" },
                      { term: "Tool orchestration", desc: "Claude calling and coordinating tools" },
                      { term: "MCP integration", desc: "Model Context Protocol at scale" },
                      { term: "Context management", desc: "Reliability at a systems level" },
                    ].map(({ term, desc }) => (
                      <div key={term} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-dark-700">
                        <CheckCircle size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-dark-50 font-semibold text-sm">{term}</div>
                          <div className="text-dark-400 text-xs mt-0.5">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-dark-50 text-xl font-medium">
                    It covers everything from agentic orchestration to prompt engineering to Claude Code workflows.
                  </p>

                  <p className="text-dark-400">
                    You don&apos;t need to figure it out alone. This course walks you through every concept, tests your understanding with real exam-style questions, and gives you AI-powered feedback every step of the way.
                  </p>
                </div>

                <div className="pt-4">
                  <a
                    href="#top"
                    onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all shadow-sm"
                  >
                    Start Learning Now
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
