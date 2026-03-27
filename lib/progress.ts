import { AppProgress, CourseProgress, DomainProgress, User } from "./types";
import { PASSING_SCORE, courses, getCourseIdFromDomainId } from "./curriculum";

const STORAGE_KEY = "anthropic_lms_progress";

const defaultCourseProgress = (courseId: string): CourseProgress => ({
  courseId,
  domains: (courses.find((c) => c.id === courseId)?.domains ?? []).map((d) => ({
    domainId: d.id,
    started: false,
    completed: false,
    examScore: null,
    examAttempts: 0,
    lastAttemptAt: null,
  })),
  certificateEarned: false,
  certificateEarnedAt: null,
});

export const defaultProgress = (): AppProgress => ({
  user: null,
  courses: Object.fromEntries(
    courses.map((c) => [c.id, defaultCourseProgress(c.id)])
  ),
});

// Migrate old single-course format to multi-course format
function migrateFromLegacy(parsed: any): AppProgress {
  // Old format had: { user, domains: DomainProgress[], certificateEarned, certificateEarnedAt }
  if (parsed.domains && !parsed.courses) {
    const progress = defaultProgress();
    progress.user = parsed.user;
    // Migrate old numeric domain IDs to string "aai-N" format
    const aaiDomains = (parsed.domains as any[]).map((d: any) => ({
      ...d,
      domainId: typeof d.domainId === "number" ? `aai-${d.domainId}` : d.domainId,
    }));
    progress.courses.aai = {
      courseId: "aai",
      domains: (courses.find((c) => c.id === "aai")?.domains ?? []).map((cd) => {
        const existing = aaiDomains.find((d: any) => d.domainId === cd.id);
        return existing || {
          domainId: cd.id,
          started: false,
          completed: false,
          examScore: null,
          examAttempts: 0,
          lastAttemptAt: null,
        };
      }),
      certificateEarned: parsed.certificateEarned ?? false,
      certificateEarnedAt: parsed.certificateEarnedAt ?? null,
    };
    return progress;
  }
  return parsed as AppProgress;
}

export const loadProgress = (): AppProgress => {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress();
    const parsed = JSON.parse(stored);
    const progress = migrateFromLegacy(parsed);

    // Ensure all courses and domains exist (handles new courses/domains added after user started)
    for (const course of courses) {
      if (!progress.courses[course.id]) {
        progress.courses[course.id] = defaultCourseProgress(course.id);
      } else {
        // Ensure all domains exist for this course
        const cp = progress.courses[course.id];
        cp.domains = course.domains.map((cd) => {
          const existing = cp.domains.find((d) => d.domainId === cd.id);
          return existing || {
            domainId: cd.id,
            started: false,
            completed: false,
            examScore: null,
            examAttempts: 0,
            lastAttemptAt: null,
          };
        });
      }
    }

    return progress;
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

export const markDomainStarted = (domainId: string): AppProgress => {
  const progress = loadProgress();
  const courseId = getCourseIdFromDomainId(domainId);
  const cp = progress.courses[courseId];
  if (cp) {
    const domain = cp.domains.find((d) => d.domainId === domainId);
    if (domain) {
      domain.started = true;
    }
  }
  saveProgress(progress);
  return progress;
};

export const saveDomainExamScore = (
  domainId: string,
  score: number
): AppProgress => {
  const progress = loadProgress();
  const courseId = getCourseIdFromDomainId(domainId);
  const cp = progress.courses[courseId];
  if (cp) {
    const domain = cp.domains.find((d) => d.domainId === domainId);
    if (domain) {
      domain.examScore = score;
      domain.examAttempts += 1;
      domain.lastAttemptAt = new Date().toISOString();
      domain.completed = score >= PASSING_SCORE;
    }

    // Check if all domains in this course completed with passing scores
    const allPassed = cp.domains.every(
      (d) => d.examScore !== null && d.examScore >= PASSING_SCORE
    );
    if (allPassed && !cp.certificateEarned) {
      cp.certificateEarned = true;
      cp.certificateEarnedAt = new Date().toISOString();
    }
  }

  saveProgress(progress);
  return progress;
};

export const getOverallProgress = (progress: AppProgress, courseId: string): number => {
  const cp = progress.courses[courseId];
  if (!cp) return 0;
  const course = courses.find((c) => c.id === courseId);
  const total = course?.domains.length ?? cp.domains.length;
  const completed = cp.domains.filter((d) => d.completed).length;
  return Math.round((completed / total) * 100);
};

export const getCourseProgress = (
  progress: AppProgress,
  courseId: string
): CourseProgress | undefined => {
  return progress.courses[courseId];
};

export const getDomainProgress = (
  progress: AppProgress,
  domainId: string
): DomainProgress => {
  const courseId = getCourseIdFromDomainId(domainId);
  const cp = progress.courses[courseId];
  return (
    cp?.domains.find((d) => d.domainId === domainId) || {
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
