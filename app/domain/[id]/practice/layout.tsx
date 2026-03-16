import type { Metadata } from "next";
import { getDomain } from "@/lib/curriculum";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  const domain = getDomain(id);

  if (!domain) {
    return { title: "Practice Exam" };
  }

  const title = `Practice Exam — Domain ${id}: ${domain.title}`;
  const description = `Test your knowledge of ${domain.title} with ${domain.questions?.length ?? "multiple"} practice exam questions. Covers ${domain.weight}% of the Anthropic Architecture Certification.`;
  const url = `https://www.learnagentarchitecture.com/domain/${id}/practice`;

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

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
