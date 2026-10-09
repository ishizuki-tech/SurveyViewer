import type { ViewerIndexEntry } from "../domain/viewer-index";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export function deviceOptions(entries: readonly ViewerIndexEntry[]): readonly SelectOption[] {
  const devices = [...new Set(entries.map((entry) => entry.deviceTag).filter((device): device is string => device !== undefined && device !== ""))]
    .sort((left, right) => left.localeCompare(right));
  const hasMissingDevice = entries.some((entry) => entry.deviceTag === undefined || entry.deviceTag === "");
  return [
    { value: "all", label: "All devices" },
    ...devices.map((device) => ({ value: device, label: device })),
    ...(hasMissingDevice ? [{ value: "__missing__", label: "Missing device identity" }] : []),
  ];
}
export function dateOptions(entries: readonly ViewerIndexEntry[]): readonly SelectOption[] { return [{ value: "all", label: "All dates" }, ...[...new Set(entries.map((entry) => entry.uploaderDate))].sort().reverse().map((date) => ({ value: date, label: date }))]; }

export function surveyOptions(entries: readonly ViewerIndexEntry[]): readonly SelectOption[] {
  return [
    { value: "all", label: "All surveys" },
    ...entries.map((entry) => ({ value: entry.path, label: surveyLabel(entry) })),
  ];
}

export function surveyLabel(entry: ViewerIndexEntry): string {
  const date = (entry.exportedAt ?? entry.uploaderDate).replace("T", " ").replace(/:\d{2}(?:\.\d+)?Z?$/, "");
  const identifier = entry.surveyId.length > 13 ? `${entry.surveyId.slice(0, 8)}…${entry.surveyId.slice(-4)}` : entry.surveyId;
  return [date, identifier, entry.deviceTag ?? "Device unavailable", entry.build].filter((value) => value !== undefined && value !== "").join(" · ");
}
