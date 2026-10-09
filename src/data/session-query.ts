import type { ViewerIndexEntry } from "../domain/viewer-index";

export interface SessionFilters {
  readonly surveyPath: string;
  readonly date: string;
  readonly device: string;
  readonly sort: "newest" | "oldest" | "answers-desc" | "answers-asc" | "followups-desc" | "followups-asc" | "audio-desc" | "audio-asc";
}

export function filterAndSortSessions(entries: readonly ViewerIndexEntry[], filters: SessionFilters): readonly ViewerIndexEntry[] {
  return [...entries]
    .filter((entry) => (filters.surveyPath === "all" || entry.path === filters.surveyPath) && (filters.date === "all" || entry.uploaderDate === filters.date) && matchesDevice(entry, filters.device))
    .sort((left, right) => {
      const newest = -((left.exportedAt ?? left.uploaderDate).localeCompare(right.exportedAt ?? right.uploaderDate));
      if (filters.sort === "oldest") return -newest;
      const metric = filters.sort.startsWith("answers") ? left.answerCount - right.answerCount : filters.sort.startsWith("followups") ? left.followupCount - right.followupCount : filters.sort.startsWith("audio") ? left.audioReferenceCount - right.audioReferenceCount : 0;
      return metric === 0 ? newest : filters.sort.endsWith("desc") ? -metric : metric;
    });
}

function matchesDevice(entry: ViewerIndexEntry, device: string): boolean {
  if (device === "all") return true;
  if (device === "__missing__") return entry.deviceTag === undefined || entry.deviceTag === "";
  return entry.deviceTag === device;
}
