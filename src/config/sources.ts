export type SourceId = "production" | "development";

export interface SurveySource {
  readonly id: SourceId;
  readonly label: string;
  readonly repository: string;
  readonly branch: string;
}

export const SOURCES: Record<SourceId, SurveySource> = {
  production: {
    id: "production",
    label: "Production",
    repository: "ishizuki-tech/SurveyExports",
    branch: "main",
  },
  development: {
    id: "development",
    label: "Development",
    repository: "ishizuki-tech/SurveyExports-Dev",
    branch: "main",
  },
};
