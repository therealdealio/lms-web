export interface User {
  name: string;
  email: string;
  startedAt: string;
}

export interface DomainProgress {
  domainId: number;
  started: boolean;
  completed: boolean;
  examScore: number | null;
  examAttempts: number;
  lastAttemptAt: string | null;
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
  domains: DomainProgress[];
  certificateEarned: boolean;
  certificateEarnedAt: string | null;
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
  domain: number;
  topic: string;
}

export interface Domain {
  id: number;
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
