export interface User {
  name: string;
  email: string;
  startedAt: string;
}

export interface DomainProgress {
  domainId: string;
  started: boolean;
  completed: boolean;
  examScore: number | null;
  examAttempts: number;
  lastAttemptAt: string | null;
}

export interface CourseProgress {
  courseId: string;
  domains: DomainProgress[];
  certificateEarned: boolean;
  certificateEarnedAt: string | null;
}

export interface Membership {
  tier: "free" | "pro";
  promptsUsed: number;
  promptLimit?: number;
  licenseKey?: string;
  upgradedAt?: string;
}

export interface AppProgress {
  user: User | null;
  courses: Record<string, CourseProgress>;
}

export interface Concept {
  title: string;
  content: string;
  keyPoints: string[];
  examTrap?: string;
  codeExample?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain: string;
  topic: string;
}

export interface Domain {
  id: string;
  courseId: string;
  title: string;
  weight: number;
  description: string;
  tagline: string;
  plainEnglish: string;
  icon: string;
  color: string;
  concepts: Concept[];
  questions: Question[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  domains: Domain[];
  passingScore: number;
  examTraps: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface EvaluateRequest {
  question: string;
  userAnswer: string;
  domain: string;
  correctAnswer?: string;
}

export interface ExplainRequest {
  concept: string;
  domain: string;
  userQuestion: string;
  context?: string;
}
