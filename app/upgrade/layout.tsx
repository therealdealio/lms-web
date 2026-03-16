import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade to Pro",
  description:
    "Unlock 500 AI-powered prompts for just $5 one-time. Get unlimited access to the AI Learning Assistant to master Claude API, Agent SDK, MCP, and more.",
  alternates: {
    canonical: "https://www.learnagentarchitecture.com/upgrade",
  },
  openGraph: {
    title: "Upgrade to Pro | Learn Agent Architecture",
    description:
      "Unlock 500 AI prompts for $5 one-time. Master the Anthropic Architecture Certification with unlimited AI explanations.",
    url: "https://www.learnagentarchitecture.com/upgrade",
  },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
