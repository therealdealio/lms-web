import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import PageViewTracker from "@/components/PageViewTracker";

const BASE_URL = "https://www.learnagentarchitecture.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Learn Agent Architecture — Anthropic Certification Prep",
    template: "%s | Learn Agent Architecture",
  },
  description:
    "Master Claude API, Claude Code, Agent SDK, and MCP. AI-powered study guide with practice exams and instant explanations to prepare for the Anthropic Architecture Certification.",
  keywords: [
    "Anthropic certification",
    "Claude API tutorial",
    "Agent SDK course",
    "MCP learning",
    "how to use Claude API",
    "agentic AI certification",
    "prompt engineering course",
    "Anthropic Architecture Certification",
    "Claude Code",
    "AI agent development",
    "multi-agent orchestration",
  ],
  authors: [{ name: "Learn Agent Architecture" }],
  creator: "Learn Agent Architecture",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Learn Agent Architecture",
    title: "Learn Agent Architecture — Anthropic Certification Prep",
    description:
      "Master Claude API, Claude Code, Agent SDK, and MCP. AI-powered study guide with practice exams and instant explanations.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Learn Agent Architecture — Anthropic Certification Prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Agent Architecture — Anthropic Certification Prep",
    description:
      "Master Claude API, Claude Code, Agent SDK, and MCP. AI-powered study guide with practice exams.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Anthropic Agent Architecture Certification Prep",
  description:
    "AI-powered study guide covering Claude API, Claude Code, Agent SDK, MCP, prompt engineering, and safety. Includes practice exams and instant AI explanations.",
  url: BASE_URL,
  provider: {
    "@type": "Organization",
    name: "Learn Agent Architecture",
    url: BASE_URL,
  },
  educationalLevel: "Intermediate",
  teaches: [
    "Agentic Architecture & Orchestration",
    "Tool Design & MCP Integration",
    "Claude Code Configuration & Workflows",
    "Prompt Engineering & Structured Output",
    "Context Management & Reliability",
    "Claude Fundamentals",
    "Safety & Responsible Use",
    "Vision & Multimodal Capabilities",
  ],
  courseMode: "online",
  isAccessibleForFree: true,
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-dark-950 text-white antialiased">
        <AuthProvider>
          <PageViewTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
