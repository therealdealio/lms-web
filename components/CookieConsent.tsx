"use client";

import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";

const CONSENT_KEY = "laa-cookie-consent";

type ConsentValue = "accepted" | "declined";

export function getCookieConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function respond(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] p-4 sm:p-6 animate-slide-up">
      <div className="max-w-2xl mx-auto bg-surface-container border border-outline-variant/30 rounded-2xl shadow-xl shadow-on-surface/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mt-0.5">
            <Shield size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-headline font-bold text-on-surface text-sm">Your Privacy Matters</h3>
              <button
                onClick={() => respond("declined")}
                className="sm:hidden shrink-0 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
              We use cookies and similar technologies to track page views and improve your experience.
              Under the California Consumer Privacy Act (CCPA), you have the right to opt out of the
              sale or sharing of your personal information.{" "}
              <a href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </a>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => respond("accepted")}
                className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-label font-bold hover:bg-primary/90 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => respond("declined")}
                className="px-5 py-2 bg-surface border border-outline-variant/40 text-on-surface rounded-xl text-xs font-label font-bold hover:bg-surface-container transition-colors"
              >
                Decline Non-Essential
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
