import type { Metadata } from "next";
import { getDomain } from "@/lib/curriculum";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  const domain = getDomain(id);

  if (!domain) {
    return { title: "Domain Not Found" };
  }

  const title = `Domain ${id}: ${domain.title}`;
  const description = `${domain.description} Covers ${domain.concepts.length} concepts (${domain.weight}% of the Anthropic Architecture Certification exam).`;
  const url = `https://www.learnagentarchitecture.com/domain/${id}`;

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
  return [1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({ id: String(id) }));
}

export default function DomainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
