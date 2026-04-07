import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Learn Agent Architecture. Learn how we collect, use, and protect your data under CCPA and applicable privacy laws.",
  alternates: {
    canonical: "https://www.learnagentarchitecture.com/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
