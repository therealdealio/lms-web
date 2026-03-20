"use client";

import Link from "next/link";
import { Brain, Zap, ArrowLeft, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-headline font-bold text-on-surface tracking-tight hidden sm:block">Learn Agent Architecture</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="pt-[73px]">

        {/* Hero */}
        <div className="relative bg-surface-container-low border-b border-outline-variant/20 py-20 overflow-hidden">
          <div className="absolute inset-0 blueprint-grid pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-4">
            <span className="inline-block text-xs tracking-[0.25em] uppercase text-primary font-headline font-bold bg-primary/8 px-3 py-1.5 rounded-full">
              Why This Exists
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface">
              About Richard &amp; This Project
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Built by a practitioner, for practitioners.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-20 space-y-16">

          {/* Section 1: About Richard */}
          <section className="space-y-6">
            <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-5">
              <p className="text-xl font-headline font-bold text-on-surface leading-relaxed">
                Hi, I&apos;m Richard — and I believe the future is AI-powered, and it belongs to all of us.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                I&apos;ve spent over 15 years working across data analytics, AI, and now Agentic AI — watching the field evolve from basic reporting pipelines to systems that can reason, plan, and act autonomously. That journey has given me a front-row seat to how transformative — and how disruptive — this technology can be.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                We&apos;re living through one of the most significant technological shifts in history. AI agents are no longer a distant concept; they&apos;re here, they&apos;re being deployed, and they&apos;re changing the way we work. With that change comes both opportunity and uncertainty.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                That&apos;s exactly why I built this.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Learning by doing has always been the most powerful way to grow. Not by watching from the sidelines, not by reading about it — but by getting your hands dirty and building. The best way to understand how AI agents operate is to work with them, challenge them, and learn their architecture from the inside out.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                While this course is an independent community resource and is not affiliated with or endorsed by Anthropic PBC, it is built to prepare you for their certifications — and I plan to expand it to cover other leading AI certifications as the field matures. In a world where this knowledge is becoming invaluable, I wanted to make sure it was accessible to everyone.
              </p>
              <p className="text-on-surface font-semibold leading-relaxed">
                So I built this for you. Whether you&apos;re a developer, a career changer, someone worried about what AI means for your job, or just someone curious about where the world is heading — this is your starting point.
              </p>
            </div>
          </section>

          {/* Section 2: The Real Reason */}
          <section className="space-y-8">
            <div className="space-y-1">
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-headline font-bold">The Real Reason</span>
              <h2 className="text-3xl font-headline font-black tracking-tight text-on-surface">Behind every project is a deeper why.</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Photo */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/15 to-primary-container/10 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm">
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
                <p className="text-on-surface font-semibold leading-relaxed">
                  Mine crawls around on the floor and wears a bucket hat.
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  My son is growing up in a world where AI will be as fundamental as reading and writing. I think about his generation constantly — what the workforce will look like by the time he&apos;s ready to enter it, what skills will matter, and what kind of foundation we can give kids today to make them not just survive that world, but thrive in it.
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  I want his generation to grow up AI-literate — not just as users of these tools, but as people who understand how they work, how to work alongside them, and how to build with them. That kind of understanding will make them more effective, more valuable, and more adaptable no matter how the technology evolves.
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  That&apos;s the other reason I built this. For everyone trying to navigate today&apos;s world — and for the generation who will inherit tomorrow&apos;s.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Built in a Weekend */}
          <section className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-headline font-bold">The Origin</span>
              <h2 className="text-3xl font-headline font-black tracking-tight text-on-surface">Built in a Weekend</h2>
            </div>
            <div className="p-8 rounded-xl bg-primary/5 border border-primary/15 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Zap size={20} className="text-on-primary" />
                </div>
                <div className="space-y-4">
                  <p className="text-on-surface-variant leading-relaxed">
                    This entire platform was built over a weekend through vibe coding. No large team. No six-figure budget. No year-long timeline. Just curiosity, the right tools, and a vision. A project like this would have cost well into five figures and taken the better part of a year not too long ago.
                  </p>
                  <p className="text-on-surface font-semibold leading-relaxed">
                    That&apos;s the power of what we&apos;re learning here. The barrier to building has never been lower — and that&apos;s exactly the point.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sign-off */}
          <section className="text-center space-y-6 pb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto" />
            <p className="text-2xl font-headline font-black text-on-surface">
              Welcome. Let&apos;s build the future together.
            </p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/15">
              Start Learning Free
              <ArrowRight size={18} />
            </Link>
          </section>

        </div>

        {/* Footer */}
        <footer className="border-t border-outline-variant/20 py-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="" className="w-6 h-6 rounded" />
              <span className="font-headline font-bold text-on-surface text-sm">Learn Agent Architecture</span>
            </div>
            <p className="text-on-surface-variant/50 text-xs font-label text-center">
              Independent community resource · Not affiliated with Anthropic PBC
            </p>
            <Brain size={16} className="text-on-surface-variant/30" />
          </div>
        </footer>
      </div>
    </div>
  );
}