import { AppProgress, DomainProgress, User } from "./types";
import { PASSING_SCORE, domains } from "./curriculum";

const STORAGE_KEY = "anthropic_lms_progress";

export const defaultProgress = (): AppProgress => ({
  user: null,
  domains: [1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({
    domainId: id,
    started: false,
    completed: false,
    examScore: null,
    examAttempts: 0,
    lastAttemptAt: null,
  })),
  certificateEarned: false,
  certificateEarnedAt: null,
});

export const loadProgress = (): AppProgress => {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress();
    const parsed = JSON.parse(stored) as AppProgress;
    // Ensure all domains exist
    const domains = [1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
      const existing = parsed.domains?.find((d) => d.domainId === id);
      return (
        existing || {
          domainId: id,
          started: false,
          completed: false,
          examScore: null,
          examAttempts: 0,
          lastAttemptAt: null,
        }
      );
    });
    return { ...parsed, domains };
  } catch {
    return defaultProgress();
  }
};

export const saveProgress = (progress: AppProgress): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const setUser = (user: User): AppProgress => {
  const progress = loadProgress();
  progress.user = user;
  saveProgress(progress);
  return progress;
};

export const markDomainStarted = (domainId: number): AppProgress => {
  const progress = loadProgress();
  const domain = progress.domains.find((d) => d.domainId === domainId);
  if (domain) {
    domain.started = true;
  }
  saveProgress(progress);
  return progress;
};

export const saveDomainExamScore = (
  domainId: number,
  score: number
): AppProgress => {
  const progress = loadProgress();
  const domain = progress.domains.find((d) => d.domainId === domainId);
  if (domain) {
    domain.examScore = score;
    domain.examAttempts += 1;
    domain.lastAttemptAt = new Date().toISOString();
    domain.completed = score >= PASSING_SCORE;
  }

  // Check if all domains completed with passing scores
  const allPassed = progress.domains.every(
    (d) => d.examScore !== null && d.examScore >= PASSING_SCORE
  );
  if (allPassed && !progress.certificateEarned) {
    progress.certificateEarned = true;
    progress.certificateEarnedAt = new Date().toISOString();
  }

  saveProgress(progress);
  return progress;
};

export const getOverallProgress = (progress: AppProgress): number => {
  const completed = progress.domains.filter((d) => d.completed).length;
  return Math.round((completed / domains.length) * 100);
};

export const getDomainProgress = (
  progress: AppProgress,
  domainId: number
): DomainProgress => {
  return (
    progress.domains.find((d) => d.domainId === domainId) || {
      domainId,
      started: false,
      completed: false,
      examScore: null,
      examAttempts: 0,
      lastAttemptAt: null,
    }
  );
};

export const clearProgress = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};
