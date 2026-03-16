"use client";

import Link from "next/link";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto">
          <CheckCircle size={36} className="text-brand-600" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium">
            <Zap size={13} />
            Pro Unlocked
          </div>
          <h1 className="text-3xl font-bold text-dark-50">You're all set!</h1>
          <p className="text-dark-400">
            500 AI tutor prompts are now available. Go ace that certification.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-dark-700 shadow-sm text-left space-y-2">
          {[
            "500 AI tutor prompts unlocked",
            "All 8 domains fully accessible",
            "No expiry on your prompts",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-dark-200">
              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors shadow-sm"
        >
          Start Learning
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
