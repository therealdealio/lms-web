import { aaiCourse } from "./aai";
import { peCourse } from "./pe";
import { Course, Domain } from "../types";

export const PASSING_SCORE = 70;

export const courses: Course[] = [aaiCourse, peCourse];

export const getCourse = (courseId: string): Course | undefined =>
  courses.find((c) => c.id === courseId);

export const getDomain = (domainId: string): Domain | undefined =>
  courses.flatMap((c) => c.domains).find((d) => d.id === domainId);

export const getDomainsForCourse = (courseId: string): Domain[] =>
  getCourse(courseId)?.domains ?? [];

export const getCourseForDomain = (domainId: string): Course | undefined =>
  courses.find((c) => c.domains.some((d) => d.id === domainId));

export const getTotalQuestions = (): number =>
  courses.flatMap((c) => c.domains).reduce((sum, d) => sum + d.questions.length, 0);

// Backward compat: flat array of all domains across all courses
export const domains = courses.flatMap((c) => c.domains);

// Helper to extract the numeric part from a domain ID like "aai-3" -> 3
export const getDomainNumber = (domainId: string): number => {
  const parts = domainId.split("-");
  return parseInt(parts[parts.length - 1], 10);
};

// Helper to extract the course prefix from a domain ID like "pe-3" -> "pe"
export const getCourseIdFromDomainId = (domainId: string): string => {
  const idx = domainId.lastIndexOf("-");
  return idx > 0 ? domainId.substring(0, idx) : domainId;
};
