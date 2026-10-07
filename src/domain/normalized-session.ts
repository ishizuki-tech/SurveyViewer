import type { RawExport } from "./raw-export";

export interface AudioReference {
  readonly file?: string;
  readonly raw: Record<string, unknown>;
}

export interface AnswerRecord {
  readonly questionId: string;
  readonly question?: string;
  readonly answer?: string;
  readonly audio: readonly AudioReference[];
  readonly raw: Record<string, unknown>;
}

export interface FollowupRecord {
  readonly question?: string;
  readonly answer?: string;
  readonly raw: Record<string, unknown>;
}

export interface VoiceFileRecord {
  readonly file?: string;
  readonly surveyId?: string;
  readonly questionId?: string;
  readonly question?: string;
  readonly answer?: string;
  readonly raw: Record<string, unknown>;
}

export interface NormalizedSession {
  readonly surveyId: string;
  readonly build?: string;
  readonly exportedAt?: string;
  readonly meta: Record<string, unknown>;
  readonly answers: ReadonlyMap<string, AnswerRecord>;
  readonly aiOutcomes: ReadonlyMap<string, string>;
  readonly followups: ReadonlyMap<string, readonly FollowupRecord[]>;
  readonly voiceFiles: readonly VoiceFileRecord[];
  /** Present only if the source export explicitly supplied an order extension. */
  readonly capturedQuestionOrder?: readonly string[];
  readonly raw: RawExport;
}
