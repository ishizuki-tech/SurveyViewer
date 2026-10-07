import type { ViewerIndexEntry } from "../domain/viewer-index";
import { statePanel } from "../components/state-panel";

export function sessionList(entries: readonly ViewerIndexEntry[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "session-list";
  const heading = document.createElement("h2");
  heading.textContent = "Survey sessions";
  section.append(heading);
  if (entries.length === 0) {
    section.append(statePanel("No indexed sessions", "Generated repository indexes are planned for Phase 2."));
    return section;
  }
  const list = document.createElement("ul");
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.exportedAt ?? "Unavailable in this export"} · ${entry.surveyId}`;
    list.append(item);
  });
  section.append(list);
  return section;
}
