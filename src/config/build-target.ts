import type { SourceId } from "./sources";

export const DEVELOPMENT_BUILD_MODE = "viewer-development";

export interface BuildTarget {
  readonly source: SourceId;
  readonly base: string;
  readonly outDir: string;
}

const PRODUCTION_TARGET: BuildTarget = {
  source: "production",
  base: "/SurveyViewer/",
  outDir: "dist",
};

const DEVELOPMENT_TARGET: BuildTarget = {
  source: "development",
  base: "/SurveyViewer/dev/",
  outDir: "dist/dev",
};

export function buildTargetForMode(mode: string): BuildTarget {
  return mode === DEVELOPMENT_BUILD_MODE ? DEVELOPMENT_TARGET : PRODUCTION_TARGET;
}
