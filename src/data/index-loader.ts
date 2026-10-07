import type { SurveySource } from "../config/sources";
import type { ViewerIndexEntry, ViewerIndexManifest } from "../domain/viewer-index";
import { githubRawUrl } from "./github-links";

const INDEX_ROOT = "viewer-index/v1";

export async function loadManifest(source: SurveySource, signal?: AbortSignal): Promise<ViewerIndexManifest> {
  return fetchJson<ViewerIndexManifest>(githubRawUrl(source, `${INDEX_ROOT}/manifest.json`), signal);
}

export async function loadShard(
  source: SurveySource,
  path: string,
  signal?: AbortSignal,
): Promise<readonly ViewerIndexEntry[]> {
  return fetchJson<readonly ViewerIndexEntry[]>(githubRawUrl(source, path), signal);
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not load index (${response.status}).`);
  return (await response.json()) as T;
}
