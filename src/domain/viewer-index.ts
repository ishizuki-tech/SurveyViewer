import type { SourceId } from "../config/sources";

export interface ViewerIndexEntry {
  readonly source: SourceId;
  readonly path: string;
  readonly githubBlobUrl: string;
  readonly rawJsonUrl: string;
  readonly uploaderDate: string;
  readonly surveyId: string;
  readonly exportedAt?: string;
  readonly build?: string;
  readonly deviceTag?: string;
  readonly questionCount: number;
  readonly followupCount: number;
  readonly audioReferenceCount: number;
  readonly availability: {
    readonly build: boolean;
    readonly aiOutcomes: boolean;
    readonly followups: boolean;
    readonly audioReferences: boolean;
  };
}

export interface ViewerIndexManifest {
  readonly version: 1;
  readonly generatedAt: string;
  readonly source: SourceId;
  readonly repository: string;
  readonly commitSha: string;
  readonly malformedExportCount: number;
  readonly months: readonly { readonly month: string; readonly file: string; readonly count: number }[];
}
