import type { SurveySource } from "../config/sources";
import type { NormalizedSession } from "../domain/normalized-session";
import { audioLinks } from "./audio-links";
import { unavailable } from "./state-panel";

export function questionCard(
  session: NormalizedSession,
  source: SurveySource,
  exportPath: string | undefined,
  questionId: string,
): HTMLElement {
  const card = document.createElement("article");
  card.className = "question-card";
  const answer = session.answers.get(questionId);
  const heading = document.createElement("h3");
  heading.textContent = questionId;
  card.append(heading);
  card.append(field("Question", answer?.question));
  card.append(field("Answer", answer?.answer));
  card.append(field("AI outcome", session.aiOutcomes.get(questionId)));

  const followups = session.followups.get(questionId);
  const followupSection = document.createElement("section");
  followupSection.className = "followups";
  const followupTitle = document.createElement("h4");
  followupTitle.textContent = "Follow-ups";
  followupSection.append(followupTitle);
  if (followups === undefined || followups.length === 0) {
    followupSection.append(unavailable());
  } else {
    followups.forEach((followup, index) => {
      const item = document.createElement("div");
      item.className = "followup";
      item.append(field(`Follow-up ${index + 1}`, followup.question));
      item.append(field("Follow-up answer", followup.answer));
      followupSection.append(item);
    });
  }
  card.append(followupSection);
  card.append(audioLinks(source, exportPath, questionId, answer?.audio ?? [], session.voiceFiles));
  return card;
}

function field(label: string, value: string | undefined): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const heading = document.createElement("h4");
  heading.textContent = label;
  wrapper.append(heading);
  if (value === undefined || value === "") {
    wrapper.append(unavailable());
  } else {
    const text = document.createElement("p");
    text.textContent = value;
    wrapper.append(text);
  }
  return wrapper;
}
