import type { SourceId, SurveySource } from "../config/sources";
import type { ViewerIndexEntry, ViewerIndexManifest } from "../domain/viewer-index";
import { githubRawUrl } from "./github-links";

const INDEX_ROOT = "viewer-index/v1";
export type FetchLike = typeof fetch;

export class IndexLoadError extends Error {
  constructor(readonly kind: "missing-manifest" | "invalid-manifest" | "missing-shard" | "invalid-shard" | "network", message: string) {
    super(message);
  }
}

export interface LoadedIndex {
  readonly manifest: ViewerIndexManifest;
  readonly entries: readonly ViewerIndexEntry[];
  readonly invalidRowCount: number;
}

export async function loadManifest(source: SurveySource, signal?: AbortSignal, fetcher: FetchLike = fetch): Promise<ViewerIndexManifest> {
  const url = githubRawUrl(source, `${INDEX_ROOT}/manifest.json`);
  let value: unknown;
  try {
    value = await fetchJson(url, signal, fetcher);
  } catch (error) {
    if (error instanceof IndexLoadError && error.kind === "missing-manifest") {
      throw new IndexLoadError("missing-manifest", "This source does not yet publish viewer-index/v1/manifest.json.");
    }
    if (error instanceof IndexLoadError) throw error;
    throw new IndexLoadError("network", "Network failure while loading the index manifest.");
  }
  return parseManifest(value, source.id);
}

export async function loadShard(
  source: SurveySource,
  path: string,
  signal?: AbortSignal,
  fetcher: FetchLike = fetch,
): Promise<{ readonly entries: readonly ViewerIndexEntry[]; readonly invalidRowCount: number }> {
  let value: unknown;
  try {
    value = await fetchJson(githubRawUrl(source, path), signal, fetcher);
  } catch (error) {
    if (error instanceof IndexLoadError && error.kind === "missing-manifest") {
      throw new IndexLoadError("missing-shard", "A required monthly index shard is unavailable.");
    }
    if (error instanceof IndexLoadError && error.kind === "invalid-manifest") {
      throw new IndexLoadError("invalid-shard", "A monthly index shard is not valid JSON.");
    }
    if (error instanceof IndexLoadError) throw error;
    throw new IndexLoadError("network", "Network failure while loading an index shard.");
  }
  return parseShard(value, source.id);
}

export async function loadIndex(source: SurveySource, month?: string, signal?: AbortSignal, fetcher: FetchLike = fetch): Promise<LoadedIndex> {
  const manifest = await loadManifest(source, signal, fetcher);
  const months = month === undefined ? manifest.months : manifest.months.filter((candidate) => candidate.month === month);
  const shards = await Promise.all(months.map((candidate) => loadShard(source, `${INDEX_ROOT}/${candidate.file}`, signal, fetcher)));
  return {
    manifest,
    entries: shards.flatMap((shard) => shard.entries),
    invalidRowCount: shards.reduce((count, shard) => count + shard.invalidRowCount, 0),
  };
}

export async function loadExport(entry: ViewerIndexEntry, signal?: AbortSignal, fetcher: FetchLike = fetch): Promise<unknown> {
  try {
    return await fetchJson(entry.rawJsonUrl, signal, fetcher);
  } catch {
    throw new IndexLoadError("network", "Could not load the selected export JSON.");
  }
}

async function fetchJson(url: string, signal: AbortSignal | undefined, fetcher: FetchLike): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, { signal, headers: { Accept: "application/json" } });
  } catch {
    throw new IndexLoadError("network", "Network request failed.");
  }
  if (!response.ok) {
    throw new IndexLoadError(response.status === 404 ? "missing-manifest" : "network", `Request failed (${response.status}).`);
  }
  try {
    return await response.json();
  } catch {
    throw new IndexLoadError("invalid-manifest", "Response was not valid JSON.");
  }
}

export function parseManifest(value: unknown, expectedSource: SourceId): ViewerIndexManifest {
  if (!isObject(value) || value.version !== 1 || value.source !== expectedSource || typeof value.repository !== "string" || typeof value.commit_sha !== "string" || typeof value.generated_at !== "string" || !Array.isArray(value.months)) {
    throw new IndexLoadError("invalid-manifest", "The index manifest is missing required v1 fields.");
  }
  const months = value.months.map(parseMonth).filter((month): month is ViewerIndexManifest["months"][number] => month !== undefined);
  if (months.length !== value.months.length) throw new IndexLoadError("invalid-manifest", "The index manifest has an invalid month entry.");
  return { version: 1, generatedAt: value.generated_at, source: expectedSource, repository: value.repository, commitSha: value.commit_sha, malformedExportCount: numberOrZero(value.malformed_export_count), months };
}

export function parseShard(value: unknown, expectedSource: SourceId): { readonly entries: readonly ViewerIndexEntry[]; readonly invalidRowCount: number } {
  if (!Array.isArray(value)) throw new IndexLoadError("invalid-shard", "An index shard must be an array.");
  const entries = value.map((row) => parseEntry(row, expectedSource));
  return { entries: entries.filter((entry): entry is ViewerIndexEntry => entry !== undefined), invalidRowCount: entries.filter((entry) => entry === undefined).length };
}

function parseMonth(value: unknown): ViewerIndexManifest["months"][number] | undefined {
  if (!isObject(value) || typeof value.month !== "string" || !/^\d{4}-\d{2}$/.test(value.month) || typeof value.file !== "string" || !/^\d{4}-\d{2}\.json$/.test(value.file) || !isNonNegativeInteger(value.count)) return undefined;
  return { month: value.month, file: value.file, count: value.count };
}

function parseEntry(value: unknown, expectedSource: SourceId): ViewerIndexEntry | undefined {
  if (!isObject(value) || value.source !== expectedSource || !isObject(value.availability)) return undefined;
  const path = optionalString(value.path);
  const githubBlobUrl = optionalString(value.github_blob_url);
  const rawJsonUrl = optionalString(value.raw_json_url);
  const uploaderDate = optionalString(value.uploader_date);
  const surveyId = optionalString(value.survey_id);
  if (path === undefined || githubBlobUrl === undefined || rawJsonUrl === undefined || uploaderDate === undefined || surveyId === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(uploaderDate) || !isNonNegativeInteger(value.question_count) || !isNonNegativeInteger(value.followup_count) || !isNonNegativeInteger(value.audio_reference_count)) return undefined;
  const availability = value.availability;
  if (typeof availability.build !== "boolean" || typeof availability.ai_outcomes !== "boolean" || typeof availability.followups !== "boolean" || typeof availability.audio_references !== "boolean") return undefined;
  return {
    source: expectedSource, path, githubBlobUrl, rawJsonUrl,
    uploaderDate, surveyId, exportedAt: optionalString(value.exported_at), build: optionalString(value.build), deviceTag: optionalString(value.device_tag),
    questionCount: value.question_count, followupCount: value.followup_count, audioReferenceCount: value.audio_reference_count,
    availability: { build: availability.build, aiOutcomes: availability.ai_outcomes, followups: availability.followups, audioReferences: availability.audio_references },
  };
}

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function optionalString(value: unknown): string | undefined { return typeof value === "string" ? value : undefined; }
function isNonNegativeInteger(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function numberOrZero(value: unknown): number { return isNonNegativeInteger(value) ? value : 0; }
