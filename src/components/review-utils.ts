import type { SessionFilters } from "../data/session-query";

export interface ReviewFilters {
  surveyPath: string;
  device: string;
  month: string;
  date: string;
  sort: SessionFilters["sort"];
}

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  surveyPath: "all",
  device: "all",
  month: "all",
  date: "all",
  sort: "newest",
};

export function hasActiveFilters(filters: ReviewFilters): boolean {
  return filters.surveyPath !== "all" || filters.device !== "all" || filters.month !== "all" || filters.date !== "all" || filters.sort !== "newest";
}

export function clearReviewFilters(filters: ReviewFilters): void {
  Object.assign(filters, DEFAULT_REVIEW_FILTERS);
}

export function shortenIdentifier(value: string, prefixLength = 8, suffixLength = 4): string {
  if (value.length <= prefixLength + suffixLength + 1) return value;
  return `${value.slice(0, prefixLength)}…${value.slice(-suffixLength)}`;
}
