"use client";

import Link from "next/link";
import { Brain, Heart, Zap, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="LAA Logo" className="w-9 h-9 rounded-xl shadow-sm" />
              <div className="hidden sm:block">
                <div className="font-bold text-dark-50 leading-tight text-sm">Learn Agent Architecture</div>
                <div className="text-xs text-brand-600 font-medium">Community study resource · Unofficial</div>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-16 space-y-20">

          {/* Page title */}
          <div className="text-center space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm">
              <Heart size={14} />
              Why This Exists
            </div>
            <p className="text-brand-600 font-semibold tracking-wide uppercase text-sm">
              Built by a practitioner, for practitioners
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-dark-50 leading-tight">
              About Richard &amp; This Project
            </h1>
          </div>

          {/* Section 1: About Richard & This Project */}
          <section className="space-y-6 animate-slide-up">
            <div className="p-8 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-5">
              <p className="text-xl font-semibold text-dark-50 leading-relaxed">
                Hi, I&apos;m Richard — and I believe the future is AI-powered, and it belongs to all of us.
              </p>
              <p className="text-dark-300 leading-relaxed">
                I&apos;ve spent over 15 years working across data analytics, AI, and now Agentic AI — watching the field evolve from basic reporting pipelines to systems that can reason, plan, and act autonomously. That journey has given me a front-row seat to how transformative — and how disruptive — this technology can be.
              </p>
              <p className="text-dark-300 leading-relaxed">
                We&apos;re living through one of the most significant technological shifts in history. AI agents are no longer a distant concept; they&apos;re here, they&apos;re being deployed, and they&apos;re changing the way we work. With that change comes both opportunity and uncertainty — and if you&apos;ve been following the news lately, you know the uncertainty is real.
              </p>
              <p className="text-dark-300 leading-relaxed">
                That&apos;s exactly why I built this.
              </p>
              <p className="text-dark-300 leading-relaxed">
                Learning by doing has always been the most powerful way to grow. Not by watching from the sidelines, not by reading about it — but by getting your hands dirty and building. The best way to understand how AI agents operate is to work with them, challenge them, and learn their architecture from the inside out.
              </p>
              <p className="text-dark-300 leading-relaxed">
                While this course is an independent community resource and is not affiliated with or endorsed by Anthropic PBC, it is built to prepare you for their certifications — and I plan to expand it to cover other leading AI certifications as the field matures. In a world where this knowledge is becoming invaluable, I wanted to make sure it was accessible to everyone.
              </p>
              <p className="text-dark-300 leading-relaxed">
                So I built this for you. Whether you&apos;re a developer, a career changer, someone worried about what AI means for your job, or just someone curious about where the world is heading — this is your starting point.
              </p>
            </div>
          </section>

          {/* Section 2: The Real Reason — with photo */}
          <section className="space-y-8 animate-slide-up">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark-50">The Real Reason</h2>
              <p className="text-brand-600 text-sm font-medium">Behind every project like this is a deeper why.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Photo */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-brand-300/40 to-accent-300/30 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden border border-dark-700 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/familypic.jpg"
                    alt="The family behind this project"
                    className="w-full h-full object-cover"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
              </div>

              {/* Text */}
              <div className="space-y-4">
                <p className="text-dark-200 leading-relaxed">
                  Mine crawls around on the floor and wears a bucket hat.
                </p>
                <p className="text-dark-300 leading-relaxed">
                  My son is growing up in a world where AI will be as fundamental as reading and writing. I think about his generation constantly — what the workforce will look like by the time he&apos;s ready to enter it, what skills will matter, and what kind of foundation we can give kids today to make them not just survive that world, but thrive in it.
                </p>
                <p className="text-dark-300 leading-relaxed">
                  I want his generation to grow up AI-literate — not just as users of these tools, but as people who understand how they work, how to work alongside them, and how to build with them. That kind of understanding will make them more effective, more valuable, and more adaptable no matter how the technology evolves.
                </p>
                <p className="text-dark-300 leading-relaxed">
                  That&apos;s the other reason I built this. For everyone trying to navigate today&apos;s world — and for the generation who will inherit tomorrow&apos;s.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Built in a Weekend */}
          <section className="space-y-6 animate-slide-up">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark-50">Built in a Weekend</h2>
            </div>
            <div className="p-8 rounded-2xl bg-brand-50 border border-brand-200 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Zap size={20} className="text-white" />
                </div>
                <div className="space-y-4">
                  <p className="text-dark-300 leading-relaxed">
                    This entire platform was built over a weekend through vibe coding. No large team. No six-figure budget. No year-long timeline. Just curiosity, the right tools, and a vision. A project like this would have cost well into five figures and taken the better part of a year not too long ago.
                  </p>
                  <p className="text-dark-300 leading-relaxed">
                    That&apos;s the power of what we&apos;re learning here. The barrier to building has never been lower — and that&apos;s exactly the point.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sign-off */}
          <section className="text-center space-y-6 pb-8 animate-slide-up">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent mx-auto" />
            <p className="text-xl font-semibold text-dark-50">
              Welcome. Let&apos;s build the future together.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all hover:scale-105 shadow-sm"
            >
              Start Learning
              <Brain size={18} />
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
