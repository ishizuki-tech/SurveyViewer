import type { SurveySource } from "../config/sources";
import type { ViewerIndexEntry } from "../domain/viewer-index";
import { resolveQuestionOrder } from "../data/questionnaire-order";
import type { NormalizedSession } from "../domain/normalized-session";
import { questionCard } from "../components/question-card";
import { unavailable } from "../components/state-panel";

export function surveyDetail(
  session: NormalizedSession | undefined,
  source: SurveySource,
  entry?: ViewerIndexEntry,
  onOpenRaw?: () => void,
): HTMLElement {
  const section = document.createElement("section");
  section.className = "survey-detail";
  const heading = document.createElement("h2");
  heading.textContent = "Survey detail";
  section.append(heading);
  if (session === undefined) {
    const message = document.createElement("p");
    message.textContent = "Select a survey session when an index is available.";
    section.append(message);
    return section;
  }
  const detailHeader = document.createElement("div");
  detailHeader.className = "detail-header";
  detailHeader.append(metadata("Exported at", session.exportedAt));
  detailHeader.append(metadata("Survey UUID", session.surveyId));
  const secondary = document.createElement("div");
  secondary.className = "detail-header__secondary";
  secondary.append(metadata("Source", source.label));
  secondary.append(metadata("Device", entry?.deviceTag));
  secondary.append(metadata("Build", session.build ?? entry?.build));
  detailHeader.append(secondary);
  const actions = document.createElement("div");
  actions.className = "detail-actions";
  if (entry !== undefined) {
    const github = document.createElement("a");
    github.href = entry.githubBlobUrl;
    github.target = "_blank";
    github.rel = "noreferrer";
    github.textContent = "GitHub file";
    actions.append(github);
  }
  const raw = document.createElement("button");
  raw.type = "button";
  raw.className = "button button--secondary";
  raw.textContent = "View raw JSON";
  raw.addEventListener("click", onOpenRaw ?? (() => undefined));
  actions.append(raw);
  detailHeader.append(actions);
  section.append(detailHeader);
  if (session.aiOutcomes.size === 0 && session.followups.size === 0 && session.voiceFiles.length === 0) {
    const note = document.createElement("p");
    note.className = "optional-fields-note";
    note.textContent = "Optional AI outcomes, follow-ups, and referenced audio are not present in this export.";
    section.append(note);
  }
  for (const id of resolveQuestionOrder(session)) section.append(questionCard(session, source, entry?.path, id));
  return section;
}

function metadata(label: string, value: string | undefined): HTMLElement {
  const item = document.createElement("div");
  item.className = "metadata";
  const title = document.createElement("strong");
  title.textContent = `${label}: `;
  item.append(title);
  if (value === undefined) item.append(unavailable());
  else item.append(document.createTextNode(value));
  return item;
}
