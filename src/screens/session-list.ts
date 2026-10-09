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
    const identifier = document.createElement("span");
    identifier.className = "session-row__identifier";
    identifier.textContent = shortenIdentifier(entry.surveyId);
    identifier.title = entry.surveyId;

    const device = document.createElement("span");
    device.className = "session-row__device";
    device.textContent = entry.deviceTag ?? "Device unavailable";
    device.title = entry.deviceTag ?? "Device unavailable";

    metadata.append(identifier, device);

    if (entry.build !== undefined) {
      const build = document.createElement("span");
      build.className = "session-row__build";
      build.textContent = entry.build;
      build.title = `Build: ${entry.build}`;
      metadata.append(build);
    }
    const counts = document.createElement("span");
    counts.className = "session-row__counts";
    for (const text of [`${entry.answerCount} answers`, `${entry.followupCount} follow-ups`, `${entry.audioReferenceCount} audio`]) {
      const badge = document.createElement("span");
      badge.className = "count-badge";
      badge.textContent = text;
      counts.append(badge);
    }
    button.append(date, metadata, counts);
    item.append(button);
    list.append(item);
  });
  section.append(list);
  return section;
}
