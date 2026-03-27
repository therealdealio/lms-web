import type { Metadata } from "next";
import { getDomain, getDomainNumber } from "@/lib/curriculum";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = getDomain(params.id);

  if (!domain) {
    return { title: "Domain Not Found" };
  }

  const num = getDomainNumber(domain.id);
  const title = `Domain ${num}: ${domain.title}`;
  const description = `${domain.description} Covers ${domain.concepts.length} concepts (${domain.weight}% of the exam).`;
  const url = `https://www.learnagentarchitecture.com/domain/${domain.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Learn Agent Architecture`,
      description,
      url,
    },
  };
}

export async function generateStaticParams() {
  // Import all courses to generate params for all domains
  const { domains } = await import("@/lib/curriculum");
  return domains.map((d) => ({ id: d.id }));
}

export default function DomainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
