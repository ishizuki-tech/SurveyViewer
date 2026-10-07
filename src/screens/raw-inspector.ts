import type { SurveySource } from "../config/sources";
import { githubBlobUrl } from "../data/github-links";
import type { NormalizedSession } from "../domain/normalized-session";

export function rawInspector(session: NormalizedSession | undefined, source: SurveySource, exportPath?: string): HTMLElement {
  const section = document.createElement("section");
  section.className = "raw-inspector";
  const heading = document.createElement("h2");
  heading.textContent = "Raw JSON";
  section.append(heading);
  if (exportPath !== undefined) {
    const link = document.createElement("a");
    link.href = githubBlobUrl(source, exportPath);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open corresponding GitHub file";
    section.append(link);
  }
  const pre = document.createElement("pre");
  pre.textContent = session === undefined
    ? "Raw JSON will be available after a survey session is selected."
    : JSON.stringify(session.raw.value, null, 2);
  section.append(pre);
  return section;
}
