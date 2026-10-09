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
  if (questionId === "Introduction") {
    card.classList.add("question-card--introduction");
    card.append(introductionDisclosure(answer?.question));
    const audio = audioLinks(source, exportPath, questionId, answer?.audio ?? [], session.voiceFiles);
    if (audio.childElementCount > 1) card.append(audio);
    return card;
  }
  const heading = document.createElement("h3");
  heading.textContent = questionId;
  card.append(heading);
  card.append(field("Question", answer?.question));
  card.append(field("Answer", answer?.answer));
  const outcome = session.aiOutcomes.get(questionId);
  if (outcome !== undefined) card.append(outcomeField(outcome));

  const followups = session.followups.get(questionId);
  if (followups !== undefined && followups.length > 0) {
    const followupSection = document.createElement("section");
    followupSection.className = "followups";
    const followupTitle = document.createElement("h4");
    followupTitle.textContent = "Follow-up trail";
    followupSection.append(followupTitle);
    followups.forEach((followup, index) => {
      const item = document.createElement("div");
      item.className = "followup";
      item.append(field(`Follow-up ${index + 1}`, followup.question));
      item.append(field("Follow-up answer", followup.answer));
      followupSection.append(item);
    });
    card.append(followupSection);
  }
  const audio = audioLinks(source, exportPath, questionId, answer?.audio ?? [], session.voiceFiles);
  if (audio.childElementCount > 1) card.append(audio);
  return card;
}

function introductionDisclosure(text: string | undefined): HTMLDetailsElement {
  const disclosure = document.createElement("details");
  disclosure.className = "introduction-disclosure";
  const summary = document.createElement("summary");
  summary.textContent = "Introduction";
  disclosure.append(summary);
  if (text !== undefined && text !== "") {
    const content = document.createElement("p");
    content.textContent = text;
    disclosure.append(content);
  }
  return disclosure;
}

function outcomeField(outcome: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "field field--outcome";
  const heading = document.createElement("h4");
  heading.textContent = "AI outcome";
  const badge = document.createElement("span");
  badge.className = "outcome-badge";
  badge.textContent = outcome;
  wrapper.append(heading, badge);
  return wrapper;
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
