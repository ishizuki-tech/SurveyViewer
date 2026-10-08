import type { SurveySource } from "../config/sources";
import { githubRawUrl } from "../data/github-links";
import type { AudioReference, VoiceFileRecord } from "../domain/normalized-session";
import { shortenIdentifier } from "./review-utils";

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

  if (files.length === 0) {
    return section;
  }

  const list = document.createElement("ul");
  for (const file of [...new Set(files)]) {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.textContent = `Referenced recording: ${shortenIdentifier(file, 18, 8)}`;
    title.title = file;
    item.append(title);
    const url = audioRawUrl(source, exportPath, file);
    if (url === undefined) {
      const status = document.createElement("p");
      status.className = "audio-status audio-status--unavailable";
      status.textContent = "Audio unavailable";
      item.append(status);
      list.append(item);
      continue;
    }
    const status = document.createElement("p");
    status.className = "audio-status";
    status.textContent = "Loading audio metadata…";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = url;
    audio.hidden = true;
    const markAvailable = () => {
      audio.hidden = false;
      status.textContent = "Audio available";
      status.className = "audio-status audio-status--available";
    };
    audio.addEventListener("loadedmetadata", markAvailable, { once: true });
    audio.addEventListener("canplay", markAvailable, { once: true });
    audio.addEventListener("error", () => {
      audio.hidden = true;
      status.textContent = "Audio unavailable";
      status.className = "audio-status audio-status--unavailable";
    }, { once: true });
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open referenced file";
    link.setAttribute("aria-label", `Referenced audio file: ${file}`);
    link.title = file;
    item.append(status, audio, link);
    list.append(item);
  }
  section.append(list);
  return section;
}

export function audioRawUrl(source: SurveySource, exportPath: string | undefined, file: string): string | undefined {
  const dateDirectory = exportPath?.split("/")[0];
  if (dateDirectory === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(dateDirectory) || !isAudioFilename(file)) return undefined;
  return githubRawUrl(source, `${dateDirectory}/voice/${file}`);
}

function isAudioFilename(file: string): boolean {
  return file.trim() !== "" && !file.includes("/") && !file.includes("\\") && file !== "." && file !== "..";
}
