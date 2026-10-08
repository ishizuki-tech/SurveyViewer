import type { ViewerIndexEntry } from "../domain/viewer-index";
import { statePanel } from "../components/state-panel";
import { shortenIdentifier } from "../components/review-utils";

export function sessionList(
  entries: readonly ViewerIndexEntry[],
  selectedPath: string | undefined,
  onSelect: (entry: ViewerIndexEntry) => void,
  emptyMessage: string,
): HTMLElement {
  const section = document.createElement("section");
  section.className = "session-list";
  const heading = document.createElement("h2");
  heading.textContent = "Survey sessions";
  section.append(heading);
  if (entries.length === 0) {
    section.append(statePanel("No indexed sessions", emptyMessage));
    return section;
  }
  const list = document.createElement("ul");
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "session-item";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "session-row";
    button.dataset.entryPath = entry.path;
    const selected = entry.path === selectedPath;
    button.classList.toggle("session-row--selected", selected);
    if (selected) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => onSelect(entry));
    const date = document.createElement("span");
    date.className = "session-row__date";
    date.textContent = entry.exportedAt ?? entry.uploaderDate;
    const metadata = document.createElement("span");
    metadata.className = "session-row__metadata";
    metadata.textContent = `${shortenIdentifier(entry.surveyId)} · ${entry.deviceTag ?? "Device unavailable"}${entry.build === undefined ? "" : ` · ${entry.build}`}`;
    metadata.title = `${entry.surveyId}${entry.deviceTag === undefined ? "" : ` · ${entry.deviceTag}`}`;
    const counts = document.createElement("span");
    counts.className = "session-row__counts";
    for (const text of [`${entry.questionCount} questions`, `${entry.followupCount} follow-ups`, `${entry.audioReferenceCount} audio`]) {
      const badge = document.createElement("span");
      badge.className = "count-badge";
      badge.textContent = text;
      counts.append(badge);
    }
    button.append(date, metadata, counts);
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-uuid";
    copy.setAttribute("aria-label", `Copy full survey UUID ${entry.surveyId}`);
    copy.textContent = "Copy UUID";
    copy.addEventListener("click", () => { void copyUuid(copy, entry.surveyId); });
    item.append(button, copy);
    list.append(item);
  });
  section.append(list);
  return section;
}

async function copyUuid(button: HTMLButtonElement, uuid: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(uuid);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy unavailable";
  }
  window.setTimeout(() => { button.textContent = "Copy UUID"; }, 1800);
}
