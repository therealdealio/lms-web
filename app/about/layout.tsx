import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn Agent Architecture was built by a 15-year data and AI veteran to help developers prepare for the Anthropic Architecture Certification. An independent community resource.",
  alternates: {
    canonical: "https://www.learnagentarchitecture.com/about",
  },
  openGraph: {
    title: "About | Learn Agent Architecture",
    description:
      "Built by a 15-year data and AI veteran. An independent AI-powered study guide for the Anthropic Architecture Certification.",
    url: "https://www.learnagentarchitecture.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
