import type { ViewerIndexEntry } from "../domain/viewer-index";
import { statePanel } from "../components/state-panel";

export function sessionList(entries: readonly ViewerIndexEntry[], onSelect: (entry: ViewerIndexEntry) => void, emptyMessage: string): HTMLElement {
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "session-row";
    button.addEventListener("click", () => onSelect(entry));
    button.textContent = `${entry.source} · ${entry.exportedAt ?? entry.uploaderDate} · ${entry.surveyId} · ${entry.deviceTag ?? "Unavailable in this export"} · ${entry.questionCount} questions · ${entry.followupCount} follow-ups · ${entry.audioReferenceCount} audio`;
    item.append(button);
    list.append(item);
  });
  section.append(list);
  return section;
}
