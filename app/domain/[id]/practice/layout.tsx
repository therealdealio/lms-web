import type { Metadata } from "next";
import { getDomain, getDomainNumber } from "@/lib/curriculum";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = getDomain(params.id);

  if (!domain) {
    return { title: "Practice Exam" };
  }

  const num = getDomainNumber(domain.id);
  const title = `Practice Exam — Domain ${num}: ${domain.title}`;
  const description = `Test your knowledge of ${domain.title} with ${domain.questions?.length ?? "multiple"} practice exam questions. Covers ${domain.weight}% of the exam.`;
  const url = `https://www.learnagentarchitecture.com/domain/${domain.id}/practice`;

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
