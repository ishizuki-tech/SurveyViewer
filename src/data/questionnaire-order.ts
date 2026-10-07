import type { NormalizedSession } from "../domain/normalized-session";

const KNOWN_QUESTION_ORDER = [
  "Start", "Introduction", "Consent", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
  "Q9", "Q10", "Q11", "Q12", "Q13", "Q14", "Q15", "Q16", "Review", "Done",
] as const;

const knownRank: ReadonlyMap<string, number> = new Map(KNOWN_QUESTION_ORDER.map((id, index) => [id, index]));

export function resolveQuestionOrder(session: NormalizedSession): readonly string[] {
  const ids = new Set<string>([
    ...session.answers.keys(),
    ...session.aiOutcomes.keys(),
    ...session.followups.keys(),
    ...session.voiceFiles.map((voice) => voice.questionId).filter((id): id is string => id !== undefined),
  ]);
  const capturedRank = new Map((session.capturedQuestionOrder ?? []).map((id, index) => [id, index]));

  return [...ids].sort((left, right) => compareQuestionIds(left, right, capturedRank));
}

function compareQuestionIds(left: string, right: string, capturedRank: ReadonlyMap<string, number>): number {
  const capturedLeft = capturedRank.get(left);
  const capturedRight = capturedRank.get(right);
  if (capturedLeft !== undefined || capturedRight !== undefined) {
    if (capturedLeft === undefined) return 1;
    if (capturedRight === undefined) return -1;
    return capturedLeft - capturedRight;
  }

  const knownLeft = knownRank.get(left);
  const knownRight = knownRank.get(right);
  if (knownLeft !== undefined || knownRight !== undefined) {
    if (knownLeft === undefined) return 1;
    if (knownRight === undefined) return -1;
    return knownLeft - knownRight;
  }

  const numericLeft = numericQuestion(left);
  const numericRight = numericQuestion(right);
  if (numericLeft !== undefined || numericRight !== undefined) {
    if (numericLeft === undefined) return 1;
    if (numericRight === undefined) return -1;
    return numericLeft - numericRight || left.localeCompare(right);
  }
  return left.localeCompare(right);
}

function numericQuestion(id: string): number | undefined {
  const match = /^Q(\d+)$/i.exec(id);
  return match === null ? undefined : Number(match[1]);
}
