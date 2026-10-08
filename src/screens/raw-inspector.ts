import type { NormalizedSession } from "../domain/normalized-session";

export function rawInspector(session: NormalizedSession | undefined, githubUrl?: string, expanded = false, onToggle?: (expanded: boolean) => void): HTMLElement {
  const section = document.createElement("section");
  section.className = "raw-inspector";
  section.id = "raw-json";
  const disclosure = document.createElement("details");
  disclosure.open = expanded;
  const heading = document.createElement("summary");
  heading.textContent = "View raw JSON";
  disclosure.append(heading);
  disclosure.addEventListener("toggle", () => onToggle?.(disclosure.open));
  section.append(disclosure);
  if (githubUrl !== undefined) {
    const link = document.createElement("a");
    link.href = githubUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open corresponding GitHub file";
    disclosure.append(link);
  }
  const pre = document.createElement("pre");
  pre.textContent = session === undefined
    ? "Raw JSON will be available after a survey session is selected."
    : JSON.stringify(session.raw.value, null, 2);
  disclosure.append(pre);
  return section;
}
