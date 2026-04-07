"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
            <FileText size={20} className="text-primary" />
          </div>
          <h1 className="font-headline font-bold text-on-surface text-2xl sm:text-3xl">
            Terms of Service
          </h1>
        </div>
        <p className="text-on-surface-variant text-sm mb-10 font-label">
          Effective Date: April 6, 2026 &middot; Last Updated: April 6, 2026
        </p>

        <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Learn Agent Architecture (&quot;the Platform&quot;), operated at
              learnagentarchitecture.com, you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree, please do not use the Platform.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Learn Agent Architecture is an independent community study platform designed to help
              learners prepare for AI certifications, including but not limited to the Anthropic
              Architecture Certification and Prompt Engineering Expert Certification. The Platform
              provides study materials, AI-powered explanations, practice exams, community forums,
              and certificates of completion.
            </p>
            <p className="mt-3 font-medium text-on-surface">
              This Platform is not affiliated with, endorsed by, or officially connected to Anthropic
              PBC or any certification body.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              You may create an account using third-party OAuth providers (Google, GitHub, LinkedIn)
              or email/password credentials. You are responsible for maintaining the security of your
              account and for all activity that occurs under it. You must provide accurate information
              and promptly update it if it changes.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to Platform systems or other user accounts</li>
              <li>Scrape, crawl, or use automated tools to extract content in bulk</li>
              <li>Post harmful, abusive, or misleading content in the community forum</li>
              <li>Redistribute or resell Platform content without written permission</li>
              <li>Circumvent usage limits or membership restrictions</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All content on the Platform — including study materials, questions, AI-generated
              explanations, and design assets — is owned by or licensed to Learn Agent Architecture.
              You may use the content for personal, non-commercial study purposes only.
            </p>
          </Section>

          <Section title="6. Memberships and Payments">
            <p>
              The Platform offers free and paid membership tiers. Paid memberships are processed
              through Gumroad. All purchases are final unless otherwise required by law. We reserve
              the right to modify pricing with reasonable notice.
            </p>
          </Section>

          <Section title="7. AI-Generated Content">
            <p>
              The Platform uses AI models to generate explanations and evaluate answers. AI-generated
              content is provided for educational purposes only and may contain inaccuracies. It
              should not be relied upon as a sole source of truth for certification preparation.
            </p>
          </Section>

          <Section title="8. Community Forum">
            <p>
              You are solely responsible for content you post in the community forum. We reserve the
              right to remove content or suspend accounts that violate these Terms or community
              guidelines. By posting, you grant us a non-exclusive license to display your content on
              the Platform.
            </p>
          </Section>

          <Section title="9. Certificates">
            <p>
              Certificates issued by the Platform are informal recognitions of study completion.
              They do not represent official certifications from Anthropic PBC or any other
              organization.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              The Platform is provided &quot;as is&quot; without warranties of any kind, express or
              implied. To the fullest extent permitted by law, Learn Agent Architecture shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages
              arising from your use of the Platform.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your access to the Platform at any time for violation of
              these Terms. You may delete your account at any time by contacting us.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may update these Terms from time to time. Material changes will be communicated via
              the Platform. Continued use after changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms are governed by the laws of the State of California, United States, without
              regard to conflict of law principles.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms, please visit our{" "}
              <Link href="/about" className="text-primary hover:underline font-medium">
                About page
              </Link>{" "}
              or reach out through the community forum.
            </p>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-outline-variant/20 flex flex-wrap gap-6 text-xs font-label text-on-surface-variant/60">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
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
