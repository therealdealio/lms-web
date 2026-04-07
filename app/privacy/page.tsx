"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-outline-variant/20 bg-surface-container/50">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield size={20} className="text-primary" />
          </div>
          <h1 className="font-headline font-bold text-on-surface text-2xl sm:text-3xl">
            Privacy Policy
          </h1>
        </div>
        <p className="text-on-surface-variant text-sm mb-10 font-label">
          Effective Date: April 6, 2026 &middot; Last Updated: April 6, 2026
        </p>

        <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed">
          <Section title="1. Introduction">
            <p>
              Learn Agent Architecture (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the
              website at learnagentarchitecture.com. This Privacy Policy describes how we collect,
              use, and share your personal information, and your rights under the California Consumer
              Privacy Act (CCPA) and other applicable privacy laws.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 className="font-headline font-bold text-on-surface text-xs mt-4 mb-2 uppercase tracking-wider">
              Information you provide
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account information (name, email address, profile image) via OAuth sign-in or email registration</li>
              <li>Forum posts, replies, and other content you submit</li>
              <li>Payment information processed securely through Gumroad (we do not store card details)</li>
              <li>License keys for membership verification</li>
            </ul>

            <h3 className="font-headline font-bold text-on-surface text-xs mt-4 mb-2 uppercase tracking-wider">
              Information collected automatically
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Page view analytics (pages visited, timestamps)</li>
              <li>Study progress and quiz scores</li>
              <li>AI prompt usage counts</li>
              <li>Browser type, device information, and IP address</li>
              <li>Cookies and local storage data</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the Platform</li>
              <li>To personalize your learning experience and track progress</li>
              <li>To generate AI-powered explanations and evaluations</li>
              <li>To process payments and manage memberships</li>
              <li>To moderate community forum content</li>
              <li>To analyze usage patterns and improve the Platform</li>
              <li>To communicate important updates about the Platform</li>
            </ul>
          </Section>

          <Section title="4. Cookies and Tracking Technologies">
            <p>We use the following types of cookies and local storage:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <span className="font-medium text-on-surface">Essential cookies:</span> Required for
                authentication (NextAuth session) and core Platform functionality
              </li>
              <li>
                <span className="font-medium text-on-surface">Functional storage:</span> Local
                storage for study progress, membership status, and user preferences
              </li>
              <li>
                <span className="font-medium text-on-surface">Analytics cookies:</span> Page view
                tracking to understand Platform usage and improve the experience
              </li>
            </ul>
            <p className="mt-3">
              You can manage your cookie preferences through the consent banner displayed on your
              first visit. Essential cookies cannot be disabled as they are required for the Platform
              to function.
            </p>
          </Section>

          <Section title="5. Your Rights Under the CCPA">
            <p>If you are a California resident, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <span className="font-medium text-on-surface">Right to Know:</span> Request
                disclosure of the personal information we collect, use, and share about you
              </li>
              <li>
                <span className="font-medium text-on-surface">Right to Delete:</span> Request
                deletion of your personal information, subject to certain exceptions
              </li>
              <li>
                <span className="font-medium text-on-surface">Right to Opt-Out:</span> Opt out of
                the sale or sharing of your personal information
              </li>
              <li>
                <span className="font-medium text-on-surface">Right to Non-Discrimination:</span>{" "}
                We will not discriminate against you for exercising your privacy rights
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information. You may opt out of non-essential tracking
              through the cookie consent banner or by contacting us.
            </p>
          </Section>

          <Section title="6. Data Sharing">
            <p>We may share your information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <span className="font-medium text-on-surface">Anthropic:</span> AI prompt content is
                sent to Anthropic&apos;s API for generating explanations and evaluations
              </li>
              <li>
                <span className="font-medium text-on-surface">Gumroad:</span> Payment information for
                processing membership purchases
              </li>
              <li>
                <span className="font-medium text-on-surface">OAuth Providers:</span> Authentication
                data exchanged with Google, GitHub, and LinkedIn during sign-in
              </li>
              <li>
                <span className="font-medium text-on-surface">Hosting Provider:</span> Data
                processed by our hosting infrastructure
              </li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to third parties for marketing
              purposes.
            </p>
          </Section>

          <Section title="7. Data Security">
            <p>
              We implement reasonable security measures to protect your personal information,
              including encrypted connections (HTTPS), secure authentication via NextAuth, and
              secure payment processing through Gumroad. However, no method of transmission over the
              Internet is 100% secure.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed
              to provide the Platform. You may request deletion of your account and associated data
              at any time.
            </p>
          </Section>

          <Section title="9. Children&apos;s Privacy">
            <p>
              The Platform is not directed to children under 13. We do not knowingly collect
              personal information from children under 13. If we learn that we have collected such
              information, we will promptly delete it.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via the Platform. Continued use after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For privacy-related requests or questions, please visit our{" "}
              <Link href="/about" className="text-primary hover:underline font-medium">
                About page
              </Link>{" "}
              or reach out through the community forum. We will respond to verified requests within
              45 days as required by the CCPA.
            </p>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-outline-variant/20 flex flex-wrap gap-6 text-xs font-label text-on-surface-variant/60">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-headline font-bold text-on-surface text-base mb-3">{title}</h2>
      {children}
    </section>
  );
}
