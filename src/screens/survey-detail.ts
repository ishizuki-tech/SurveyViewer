import type { SurveySource } from "../config/sources";
import { resolveQuestionOrder } from "../data/questionnaire-order";
import type { NormalizedSession } from "../domain/normalized-session";
import { questionCard } from "../components/question-card";
import { unavailable } from "../components/state-panel";

export function surveyDetail(
  session: NormalizedSession | undefined,
  source: SurveySource,
  exportPath?: string,
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
  section.append(metadata("Survey UUID", session.surveyId));
  section.append(metadata("Build", session.build));
  section.append(metadata("Exported at", session.exportedAt));
  section.append(metadata("Session identifier", undefined));
  section.append(metadata("Completion status", undefined));
  for (const id of resolveQuestionOrder(session)) section.append(questionCard(session, source, exportPath, id));
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
