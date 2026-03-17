"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Zap, Check, Sparkles, Lock, ExternalLink, Key, AlertCircle, XCircle } from "lucide-react";
import { loadMembership, upgradeToPro, FREE_LIMIT, PRO_LIMIT } from "@/lib/membership";
import { Membership } from "@/lib/types";

export default function UpgradePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.email ?? "";
  const [membership, setMembership] = useState<Membership>({ tier: "free", promptsUsed: 0 });

  useEffect(() => {
    if (userId) {
      const local = loadMembership(userId);
      setMembership(local);
      // Sync from DB
      fetch("/api/membership")
        .then((r) => r.ok ? r.json() : null)
        .then((db) => {
          if (db?.tier !== undefined) {
            const m = { tier: db.tier, promptsUsed: db.promptsUsed, promptLimit: db.promptLimit };
            setMembership(m);
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  const limit = membership.promptLimit ?? (membership.tier === "pro" ? PRO_LIMIT : FREE_LIMIT);
  const remaining = Math.max(0, limit - membership.promptsUsed);

  const [licenseKey, setLicenseKey] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!licenseKey.trim()) return;
    if (!userId) {
      setError("Please log in before activating a license key.");
      return;
    }
    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      });
      const data = await res.json();

      if (data.valid) {
        const updated = upgradeToPro(userId, licenseKey.trim());
        // Sync to DB including the new additive promptLimit
        await fetch("/api/membership", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: updated.tier,
            promptLimit: updated.promptLimit,
            licenseKey: licenseKey.trim(),
            upgradedAt: new Date().toISOString(),
          }),
        });
        router.push("/upgrade/success");
      } else {
        setError(data.error || "Invalid license key. Please check and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (userId && membership.tier === "pro") {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto">
            <Zap size={28} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-dark-50">You're on Pro!</h1>
          <p className="text-dark-400">
            {remaining} of {limit} prompts remaining.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
          >
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/20 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LAA Logo" className="w-9 h-9 rounded-xl shadow-sm" />
            <div className="hidden sm:block">
              <div className="font-bold text-dark-50 leading-tight text-sm">Anthropic Architecture Certification</div>
              <div className="text-xs text-brand-600 font-medium">Upgrade to Pro</div>
            </div>
          </Link>
          {session?.user && (
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <span>Welcome,</span>
              <span className="text-dark-100 font-medium">{session.user.name}</span>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium">
            <Sparkles size={14} />
            Unlock More AI Learning
          </div>
          <h1 className="text-4xl font-bold text-dark-50">Get More AI Prompts</h1>
          <p className="text-dark-400 text-lg">
            Each $5 purchase adds{" "}
            <span className="text-brand-600 font-semibold">500 prompts</span>{" "}
            to your account. You have {remaining} prompt{remaining !== 1 ? "s" : ""} remaining.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-4">
            <div>
              <div className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1">Current Plan</div>
              <div className="text-2xl font-bold text-dark-50">Free</div>
              <div className="text-dark-400 text-sm mt-1">Great for getting started</div>
            </div>
            <div className="text-3xl font-bold text-dark-50">$0</div>
            <ul className="space-y-2">
              {[
                `${FREE_LIMIT} AI tutor prompts`,
                "All 8 certification domains",
                "Practice exams",
                "Certificate on completion",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-dark-300">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm text-dark-500">
                <Lock size={14} className="flex-shrink-0" />
                Limited AI access
              </li>
            </ul>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-orange-50 border-2 border-brand-400 shadow-sm space-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold">RECOMMENDED</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Upgrade To</div>
              <div className="text-2xl font-bold text-dark-50">Pro</div>
              <div className="text-dark-400 text-sm mt-1">For serious exam prep</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-dark-50">$5</span>
              <span className="text-dark-400 text-sm">one-time</span>
            </div>
            <ul className="space-y-2">
              {[
                `${PRO_LIMIT} AI tutor prompts`,
                "All 8 certification domains",
                "Practice exams",
                "Certificate on completion",
                "Priority AI responses",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-dark-100">
                  <Check size={14} className="text-brand-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="https://uncachable.gumroad.com/l/lzycjc"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap size={16} />
              Buy on Gumroad — $5
              <ExternalLink size={13} className="opacity-70" />
            </a>
          </div>
        </div>

        {/* License key entry */}
        <div className="p-6 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-brand-600" />
            <h2 className="font-semibold text-dark-50">Already purchased? Enter your license key</h2>
          </div>
          <p className="text-dark-400 text-sm">
            After buying on Gumroad, you'll receive a license key by email. Enter it below to unlock Pro.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              className="flex-1 px-4 py-2.5 rounded-xl bg-dark-950 border border-dark-700 text-dark-50 placeholder-dark-500 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors font-mono"
            />
            <button
              onClick={handleVerify}
              disabled={!licenseKey.trim() || verifying}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {verifying ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Unlock Pro"
              )}
            </button>
          </div>
          {error && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              error.includes("already been used")
                ? "bg-red-50 border-red-300"
                : "bg-amber-50 border-amber-300"
            }`}>
              {error.includes("already been used") ? (
                <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-semibold ${error.includes("already been used") ? "text-red-700" : "text-amber-700"}`}>
                  {error.includes("already been used") ? "License Key Already Claimed" : "Invalid License Key"}
                </p>
                <p className={`text-sm mt-0.5 ${error.includes("already been used") ? "text-red-600" : "text-amber-600"}`}>
                  {error.includes("already been used")
                    ? "This key has already been activated on another account. Each purchase can only be used once. If you believe this is a mistake, reply to your Gumroad receipt email for support."
                    : error}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-dark-500 text-xs">
          Secure payment via Gumroad · One-time charge · No subscription
        </p>
      </div>
    </div>
  );
}
