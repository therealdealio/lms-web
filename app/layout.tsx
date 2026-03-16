import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Learn Agent Architecture",
  description:
    "Master Claude API, Claude Code, Agent SDK, and MCP. Prepare for the Anthropic Architecture Certification with AI-powered learning.",
  keywords: [
    "Anthropic",
    "Claude",
    "AI certification",
    "LMS",
    "Agent SDK",
    "MCP",
    "prompt engineering",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-white antialiased">
        <AuthProvider>
          <PageViewTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
