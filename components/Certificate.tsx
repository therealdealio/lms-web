"use client";

import { Award, CheckCircle, Star } from "lucide-react";
import { AppProgress } from "@/lib/types";
import { domains } from "@/lib/curriculum";

interface CertificateProps {
  progress: AppProgress;
}

export default function Certificate({ progress }: CertificateProps) {
  if (!progress.user) return null;

  const completionDate = progress.certificateEarnedAt
    ? new Date(progress.certificateEarnedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const passedDomains = progress.domains.filter((d) => d.completed);
  const avgScore =
    passedDomains.length > 0
      ? Math.round(
          passedDomains.reduce((sum, d) => sum + (d.examScore || 0), 0) /
            passedDomains.length
        )
      : 0;

  return (
    <div className="certificate-print relative w-full max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden border-2 border-amber-300 shadow-2xl print:shadow-none">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-50 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-50 rounded-full translate-x-1/2 translate-y-1/2" />
        {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((pos) => (
          <Star key={pos} size={22} className={`absolute ${pos} text-amber-300 fill-amber-100`} />
        ))}
      </div>

      {/* Top border */}
      <div className="h-3 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-400" />

      <div className="relative z-10 p-12 text-center space-y-7">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-brand-500 flex items-center justify-center shadow-lg">
            <Award size={40} className="text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <p className="text-gray-500 text-xs uppercase tracking-[0.35em] font-semibold">
            Certificate of Completion
          </p>
          <p className="text-gray-400 text-xs">Community Study Recognition · Unofficial</p>
        </div>

        {/* Recipient */}
        <div className="space-y-1.5">
          <p className="text-gray-500 text-sm">This certifies that</p>
          <h1 className="text-5xl font-bold text-gray-900">{progress.user.name}</h1>
          <p className="text-gray-500 text-sm">{progress.user.email}</p>
        </div>

        {/* Achievement */}
        <div className="space-y-2.5">
          <p className="text-gray-600 text-base">has successfully completed all modules of the</p>
          <h2 className="text-3xl font-bold text-gray-900">
            Agentic AI Architecture — Practitioner
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-lg mx-auto text-sm">
            demonstrating working knowledge of agentic system design, tool orchestration,
            prompt engineering, context management, multi-agent coordination, and production deployment
          </p>
        </div>

        {/* Stats */}
        <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-600">{avgScore}%</div>
            <div className="text-gray-500 text-xs mt-0.5">Avg Score</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">8/8</div>
            <div className="text-gray-500 text-xs mt-0.5">Sections Passed</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="text-xl font-bold text-gray-700">{completionDate.split(",")[1]?.trim() || completionDate}</div>
            <div className="text-gray-500 text-xs mt-0.5">Completed</div>
          </div>
        </div>

        {/* Section results */}
        <div className="space-y-3 text-left">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold text-center">
            Section Results
          </p>
          <div className="grid grid-cols-2 gap-2">
            {domains.map((domain) => {
              const dp = progress.domains.find((d) => d.domainId === domain.id);
              const score = dp?.examScore ?? 0;
              return (
                <div
                  key={domain.id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <span className="text-lg flex-shrink-0">{domain.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 text-xs font-semibold truncate">{domain.title}</div>
                    <div className="text-gray-400 text-xs">Section {domain.id}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-emerald-600 font-bold text-sm">{score}%</span>
                    <CheckCircle size={13} className="text-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-0.5">
          <p className="text-gray-400 text-xs">Awarded on</p>
          <p className="text-gray-800 font-semibold">{completionDate}</p>
        </div>

        {/* Signature */}
        <div className="flex justify-center gap-16 pt-4 border-t border-gray-200">
          <div className="text-center space-y-2">
            <div className="w-32 border-b border-gray-400" />
            <p className="text-gray-600 text-xs font-medium">Agentic AI Study</p>
            <p className="text-gray-400 text-xs">Community Platform</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-32 border-b border-gray-400 flex items-end justify-center pb-1">
              <span className="text-brand-500 text-sm font-medium italic">AI Tutor</span>
            </div>
            <p className="text-gray-600 text-xs font-medium">Course Instructor</p>
            <p className="text-gray-400 text-xs">AI-Powered Feedback</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs italic">
          This is an informal community recognition. Not affiliated with or endorsed by Anthropic PBC.
        </p>
      </div>

      {/* Bottom border */}
      <div className="h-3 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-400" />
    </div>
  );
}
