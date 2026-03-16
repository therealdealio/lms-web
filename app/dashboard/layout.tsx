import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your progress across all 8 domains of the Anthropic Architecture Certification. View completed sections, practice exam scores, and earn your certificate.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
