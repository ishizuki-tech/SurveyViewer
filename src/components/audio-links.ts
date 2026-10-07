import type { SurveySource } from "../config/sources";
import { githubBlobUrl } from "../data/github-links";
import type { AudioReference, VoiceFileRecord } from "../domain/normalized-session";
import { unavailable } from "./state-panel";

export function audioLinks(
  source: SurveySource,
  exportPath: string | undefined,
  questionId: string,
  answerAudio: readonly AudioReference[],
  voiceFiles: readonly VoiceFileRecord[],
): HTMLElement {
  const section = document.createElement("div");
  section.className = "audio-links";
  const heading = document.createElement("h4");
  heading.textContent = "Audio";
  section.append(heading);

  const files = [...answerAudio.map((reference) => reference.file), ...voiceFiles
    .filter((voice) => voice.questionId === questionId)
    .map((voice) => voice.file)]
    .filter((file): file is string => file !== undefined);

  if (files.length === 0 || exportPath === undefined) {
    section.append(unavailable());
    return section;
  }

  const dateDirectory = exportPath.split("/")[0];
  const list = document.createElement("ul");
  for (const file of [...new Set(files)]) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = githubBlobUrl(source, `${dateDirectory}/voice/${file}`);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = file;
    item.append(link);
    list.append(item);
  }
  section.append(list);
  return section;
}
