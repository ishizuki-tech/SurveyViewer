import type { RawExport } from "../domain/raw-export";
import type {
  AnswerRecord,
  AudioReference,
  FollowupRecord,
  NormalizedSession,
  VoiceFileRecord,
} from "../domain/normalized-session";

/**
 * Converts known export fields into a stable viewer model while retaining the
 * untouched source object for raw inspection. It deliberately does not infer
 * completion, session IDs, device identity, or absent values.
 */
export function normalizeExport(value: unknown): NormalizedSession {
  const root = asObject(value, "Export must be a JSON object.");
  const surveyId = requiredString(root.survey_id, "survey_id");
  const raw: RawExport = { value: root };

  return {
    surveyId,
    build: optionalString(root.build),
    exportedAt: optionalString(root.exported_at),
    meta: objectOrEmpty(root.meta),
    answers: normalizeAnswers(root.answers),
    aiOutcomes: normalizeAiOutcomes(root.ai_outcomes),
    followups: normalizeFollowups(root.followups),
    voiceFiles: normalizeVoiceFiles(root.voice_files),
    capturedQuestionOrder: capturedQuestionOrder(root),
    raw,
  };
}

function normalizeAnswers(value: unknown): ReadonlyMap<string, AnswerRecord> {
  const answers = new Map<string, AnswerRecord>();
  if (!isObject(value)) return answers;
  for (const [questionId, entry] of Object.entries(value)) {
    if (!isObject(entry)) continue;
    answers.set(questionId, {
      questionId,
      question: optionalString(entry.question),
      answer: optionalString(entry.answer),
      audio: arrayOfObjects(entry.audio).map((audio): AudioReference => ({
        file: optionalString(audio.file),
        raw: audio,
      })),
      raw: entry,
    });
  }
  return answers;
}

function normalizeAiOutcomes(value: unknown): ReadonlyMap<string, string> {
  const outcomes = new Map<string, string>();
  if (!isObject(value)) return outcomes;
  for (const [questionId, outcome] of Object.entries(value)) {
    const text = optionalString(outcome);
    if (text !== undefined) outcomes.set(questionId, text);
  }
  return outcomes;
}

function normalizeFollowups(value: unknown): ReadonlyMap<string, readonly FollowupRecord[]> {
  const followups = new Map<string, readonly FollowupRecord[]>();
  if (!isObject(value)) return followups;
  for (const [questionId, entries] of Object.entries(value)) {
    if (!Array.isArray(entries)) continue;
    followups.set(questionId, arrayOfObjects(entries).map((entry): FollowupRecord => ({
      question: optionalString(entry.question),
      answer: optionalString(entry.answer),
      raw: entry,
    })));
  }
  return followups;
}

function normalizeVoiceFiles(value: unknown): readonly VoiceFileRecord[] {
  return arrayOfObjects(value).map((entry): VoiceFileRecord => ({
    file: optionalString(entry.file),
    surveyId: optionalString(entry.survey_id),
    questionId: optionalString(entry.question_id),
    question: optionalString(entry.question),
    answer: optionalString(entry.answer),
    raw: entry,
  }));
}

function capturedQuestionOrder(root: Record<string, unknown>): readonly string[] | undefined {
  // Optional, forward-compatible extension. It is never synthesized.
  return stringArray(root.question_order) ?? stringArray(root.questionOrder);
}

function requiredString(value: unknown, name: string): string {
  const text = optionalString(value);
  if (text === undefined || text.trim() === "") throw new Error(`Export is missing ${name}.`);
  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return isObject(value) ? value : {};
}

function arrayOfObjects(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function stringArray(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) return undefined;
  return value;
}

function asObject(value: unknown, message: string): Record<string, unknown> {
  if (!isObject(value)) throw new Error(message);
  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
