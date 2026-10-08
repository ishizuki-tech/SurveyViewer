import type { ViewerIndexEntry } from "../domain/viewer-index";

export interface SessionFilters {
  readonly surveyPath: string;
  readonly device: string;
  readonly sort: "newest" | "oldest";
}

export function filterAndSortSessions(entries: readonly ViewerIndexEntry[], filters: SessionFilters): readonly ViewerIndexEntry[] {
  return [...entries]
    .filter((entry) => (filters.surveyPath === "all" || entry.path === filters.surveyPath) && matchesDevice(entry, filters.device))
    .sort((left, right) => {
      const comparison = (left.exportedAt ?? left.uploaderDate).localeCompare(right.exportedAt ?? right.uploaderDate);
      return filters.sort === "oldest" ? comparison : -comparison;
    });
}

function matchesDevice(entry: ViewerIndexEntry, device: string): boolean {
  if (device === "all") return true;
  if (device === "__missing__") return entry.deviceTag === undefined || entry.deviceTag === "";
  return entry.deviceTag === device;
}
