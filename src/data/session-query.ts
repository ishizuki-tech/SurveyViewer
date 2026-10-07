import type { ViewerIndexEntry } from "../domain/viewer-index";

export interface SessionFilters {
  readonly uuid: string;
  readonly device: string;
  readonly sort: "newest" | "oldest";
}

export function filterAndSortSessions(entries: readonly ViewerIndexEntry[], filters: SessionFilters): readonly ViewerIndexEntry[] {
  const uuid = filters.uuid.trim().toLocaleLowerCase();
  const device = filters.device.trim().toLocaleLowerCase();
  return [...entries]
    .filter((entry) => (uuid === "" || entry.surveyId.toLocaleLowerCase().includes(uuid)) && (device === "" || entry.deviceTag?.toLocaleLowerCase().includes(device) === true))
    .sort((left, right) => {
      const comparison = (left.exportedAt ?? left.uploaderDate).localeCompare(right.exportedAt ?? right.uploaderDate);
      return filters.sort === "oldest" ? comparison : -comparison;
    });
}
