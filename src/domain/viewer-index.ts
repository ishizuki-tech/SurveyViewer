import type { SourceId } from "../config/sources";

export interface ViewerIndexEntry {
  readonly source: SourceId;
  readonly exportPath: string;
  readonly surveyId: string;
  readonly exportedAt?: string;
  readonly build?: string;
  readonly deviceTag?: string;
  readonly availability: {
    readonly aiOutcomes: boolean;
    readonly followups: boolean;
    readonly audio: boolean;
  };
}

export interface ViewerIndexManifest {
  readonly version: 1;
  readonly generatedAt: string;
  readonly shards: readonly { readonly path: string; readonly month: string }[];
}
