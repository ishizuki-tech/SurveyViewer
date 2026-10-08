export interface ReviewFilters {
  uuid: string;
  device: string;
  month: string;
  sort: string;
}

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  uuid: "",
  device: "",
  month: "all",
  sort: "newest",
};

export function hasActiveFilters(filters: ReviewFilters): boolean {
  return filters.uuid !== "" || filters.device !== "" || filters.month !== "all" || filters.sort !== "newest";
}

export function shortenIdentifier(value: string, prefixLength = 8, suffixLength = 4): string {
  if (value.length <= prefixLength + suffixLength + 1) return value;
  return `${value.slice(0, prefixLength)}…${value.slice(-suffixLength)}`;
}
