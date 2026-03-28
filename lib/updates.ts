export interface Update {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: "feature" | "course" | "fix" | "improvement";
  description: string;
}

export const updates: Update[] = [
  {
    id: "pe-course-launch",
    date: "2026-03-27",
    title: "New Course: Prompt Engineering Expert Certification",
    type: "course",
    description:
      "A full 8-domain course covering prompt foundations, role prompting, few-shot techniques, hallucination prevention, prompt chaining, tool use, and more — modeled after the Anthropic prompt engineering curriculum.",
  },
  {
    id: "multi-course-dashboard",
    date: "2026-03-27",
    title: "Multi-Course Dashboard",
    type: "feature",
    description:
      "The dashboard now supports multiple courses with a tabbed interface. Switch between Agent Architecture and Prompt Engineering without leaving the page.",
  },
  {
    id: "build-stability",
    date: "2026-03-27",
    title: "Build Stability Fixes",
    type: "fix",
    description:
      "Resolved production build failures caused by eager initialization of API clients (Anthropic, Resend) and missing Suspense boundaries during static page generation.",
  },
  {
    id: "community-forum",
    date: "2026-03-20",
    title: "Community Forum",
    type: "feature",
    description:
      "A discussion forum for learners to share tips, ask questions, and connect with others preparing for the certification exams.",
  },
  {
    id: "ai-explanations",
    date: "2026-03-15",
    title: "AI-Powered Explanations",
    type: "feature",
    description:
      "Get detailed, AI-generated explanations for every practice question. Available on the Pro plan with 500 prompts.",
  },
  {
    id: "initial-launch",
    date: "2026-03-01",
    title: "Platform Launch",
    type: "feature",
    description:
      "Learn Agent Architecture launched with the Agentic AI Architecture certification course — 8 domains, 80+ practice questions, and a shareable certificate.",
  },
];
