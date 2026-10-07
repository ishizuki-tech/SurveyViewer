import type { SurveySource } from "../config/sources";

export function githubBlobUrl(source: SurveySource, path: string): string {
  return `https://github.com/${source.repository}/blob/${source.branch}/${encodePath(path)}`;
}

export function githubRawUrl(source: SurveySource, path: string): string {
  return `https://raw.githubusercontent.com/${source.repository}/${source.branch}/${encodePath(path)}`;
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}
