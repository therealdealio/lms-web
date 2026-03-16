"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Award, Lock, CheckCircle, Copy, Check, ImageDown } from "lucide-react";
import { loadProgress, saveProgress } from "@/lib/progress";
import { AppProgress } from "@/lib/types";
import { domains, PASSING_SCORE } from "@/lib/curriculum";
import Certificate from "@/components/Certificate";
import ProgressBar from "@/components/ProgressBar";

const SITE_URL = "https://learnagentarchitecture.com";

const SHARE_MESSAGES = {
  linkedin: (name: string) =>
    `Excited to share that I just completed the Agentic AI Architecture — Practitioner course! 🎓\n\nOver 8 sections I deepened my understanding of:\n• Agentic system design\n• Tool orchestration & integration\n• Prompt engineering\n• Multi-agent coordination\n• Context & memory management\n• Production deployment\n\nThis community study course is a great way to level up on modern AI development.\n👉 ${SITE_URL}\n\n#AgenticAI #AIArchitecture #MachineLearning #ArtificialIntelligence`,

  twitter: (name: string) =>
    `Just completed the Agentic AI Architecture — Practitioner course! 🎓\n\nCovered agentic systems, tool design, prompt engineering, multi-agent coordination & production deployment.\n\n👉 ${SITE_URL}\n\n#AgenticAI #AIArchitecture #MachineLearning`,

  facebook: (name: string) =>
    `I just earned my Agentic AI Architecture — Practitioner recognition! 🎓\n\nThis community course covers everything from agentic system design to multi-agent coordination and production deployment.\n\nHighly recommend if you're building or working with AI systems!\n👉 ${SITE_URL}`,

  copy: (name: string) =>
    `I just completed the Agentic AI Architecture — Practitioner course! 🎓 Mastered agentic system design, tool orchestration, prompt engineering, multi-agent coordination, and production deployment. ${SITE_URL} #AgenticAI #AIArchitecture`,
};

export default function CertificatePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<AppProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) {
      router.push("/");
      return;
    }

    fetch("/api/progress")
      .then((r) => r.ok ? r.json() : null)
      .then((dbDomains: { domainId: number; completed: boolean; examScore: number | null; examAttempts: number }[] | null) => {
        if (dbDomains && dbDomains.length > 0) {
          const merged = { ...p };
          merged.domains = p.domains.map((d) => {
            const db = dbDomains.find((x) => x.domainId === d.domainId);
            if (db && db.completed && !d.completed) {
              return { ...d, completed: true, examScore: db.examScore ?? 100, examAttempts: Math.max(d.examAttempts, db.examAttempts) };
            }
            return d;
          });
          const allPassed = merged.domains.every((d) => d.completed);
          if (allPassed) merged.certificateEarned = true;
          saveProgress(merged);
          setProgress(merged);
        } else {
          setProgress(p);
        }
      })
      .catch(() => setProgress(p));
  }, [router]);

  const handlePrint = () => window.print();

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const el = certificateRef.current;
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        // Capture full element dimensions regardless of viewport
        width: el.scrollWidth,
        height: el.scrollHeight,
        style: {
          overflow: "visible",
        },
      });
      const link = document.createElement("a");
      link.download = `certificate-${progress?.user?.name?.replace(/\s+/g, "-").toLowerCase() ?? "agentic-ai"}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const shareOn = (platform: "twitter" | "linkedin" | "facebook") => {
    const name = progress?.user?.name ?? "I";
    const text = SHARE_MESSAGES[platform](name);
    const encoded = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(SITE_URL);

    const urls = {
      twitter: `https://x.com/intent/tweet?text=${encoded}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent("Agentic AI Architecture — Practitioner")}&summary=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const handleCopy = async () => {
    const name = progress?.user?.name ?? "I";
    await navigator.clipboard.writeText(SHARE_MESSAGES.copy(name));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!progress || !progress.user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEligible = progress.certificateEarned;
  const completedDomains = progress.domains.filter(
    (d) => d.examScore !== null && d.examScore >= PASSING_SCORE
  ).length;

  if (!isEligible) {
    return (
      <div className="min-h-screen bg-dark-950">
        <nav className="border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard" className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm w-fit">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-white border border-dark-700 shadow-sm flex items-center justify-center mx-auto">
              <Lock size={36} className="text-dark-500" />
            </div>
            <h1 className="text-3xl font-bold text-dark-50">Recognition Not Yet Earned</h1>
            <p className="text-dark-400 text-lg">
              You need to pass all 8 section exams with ≥{PASSING_SCORE}% to earn your recognition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-dark-50">Progress: {completedDomains}/8 sections passed</h2>
              <span className="text-brand-600 font-bold">{Math.round((completedDomains / 8) * 100)}%</span>
            </div>
            <ProgressBar value={Math.round((completedDomains / 8) * 100)} color="brand" size="lg" animated />
            <div className="space-y-3 pt-2">
              {domains.map((domain) => {
                const dp = progress.domains.find((d) => d.domainId === domain.id);
                const score = dp?.examScore;
                const passed = score !== null && score !== undefined && score >= PASSING_SCORE;
                return (
                  <div key={domain.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-950 border border-dark-700">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{domain.icon}</span>
                      <div>
                        <div className="font-medium text-dark-100 text-sm">{domain.title}</div>
                        <div className="text-dark-400 text-xs">Section {domain.id} · {domain.weight}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {score !== null && score !== undefined ? (
                        <>
                          <span className={`font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>{score}%</span>
                          {passed ? <CheckCircle size={18} className="text-emerald-500" /> : <span className="text-red-500 text-xs">Need {PASSING_SCORE}%</span>}
                        </>
                      ) : (
                        <Link href={`/domain/${domain.id}/practice`} className="text-xs text-brand-600 hover:text-brand-500 transition-colors">Take Exam →</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all shadow-sm">
              Continue Learning <Award size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Nav */}
      <nav className="no-print border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-medium transition-all shadow-sm"
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Congrats banner */}
        <div className="no-print p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2 shadow-sm">
          <div className="text-4xl">🎓</div>
          <h1 className="text-2xl font-bold text-amber-800">Congratulations, {progress.user.name}!</h1>
          <p className="text-amber-700">You&apos;ve completed the Agentic AI Architecture — Practitioner course.</p>
        </div>

        {/* Certificate (wrapped in ref for image capture) */}
        <div ref={certificateRef}>
          <Certificate progress={progress} />
        </div>

        {/* Share card */}
        <div className="no-print p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-5">
          <div>
            <h3 className="font-semibold text-dark-50 text-base">Share Your Achievement</h3>
            <p className="text-dark-400 text-sm mt-0.5">
              Download your certificate as an image to attach when posting, or click a platform to open with a pre-written message.
            </p>
          </div>

          {/* Download image — primary action */}
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold transition-all shadow-sm disabled:opacity-60"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ImageDown size={18} />
            )}
            {downloading ? "Generating image…" : "Download Certificate as Image (PNG)"}
          </button>

          <p className="text-dark-500 text-xs text-center -mt-2">
            Download first, then attach the image when posting on LinkedIn, Instagram, or any platform.
          </p>

          {/* Social buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* LinkedIn */}
            <button
              onClick={() => shareOn("linkedin")}
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border border-dark-700 bg-dark-900 hover:bg-[#0077B5] hover:border-[#0077B5] hover:text-white text-dark-300 transition-all"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-xs font-medium">LinkedIn</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={() => shareOn("twitter")}
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border border-dark-700 bg-dark-900 hover:bg-black hover:border-black hover:text-white text-dark-300 transition-all"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs font-medium">X (Twitter)</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => shareOn("facebook")}
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border border-dark-700 bg-dark-900 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white text-dark-300 transition-all"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-xs font-medium">Facebook</span>
            </button>

            {/* Copy text */}
            <button
              onClick={handleCopy}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border transition-all ${
                copied
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-dark-700 bg-dark-900 hover:bg-dark-800 text-dark-300 hover:text-dark-100"
              }`}
            >
              {copied ? <Check size={24} /> : <Copy size={24} />}
              <span className="text-xs font-medium">{copied ? "Copied!" : "Copy Text"}</span>
            </button>
          </div>

          {/* Message preview */}
          <div className="p-4 rounded-xl bg-dark-950 border border-dark-700">
            <p className="text-dark-500 text-xs mb-2 uppercase tracking-wide font-medium">Message preview (Copy Text)</p>
            <p className="text-dark-300 text-xs leading-relaxed whitespace-pre-line">
              {SHARE_MESSAGES.copy(progress.user.name)}
            </p>
          </div>
        </div>

        {/* Print instructions */}
        <div className="no-print p-5 rounded-2xl bg-white border border-dark-700 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🖨️</span>
            <div>
              <p className="font-medium text-dark-200 text-sm">Save as PDF</p>
              <p className="text-dark-400 text-sm mt-0.5">Click "Print / Save PDF" above, then choose "Save as PDF" in the print dialog to download a copy of your certificate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
