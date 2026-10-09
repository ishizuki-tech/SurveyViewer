import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SOURCES } from "../src/config/sources";
import { IndexLoadError, loadExport, loadIndex, parseManifest, parseShard } from "../src/data/index-loader";
import { filterAndSortSessions } from "../src/data/session-query";

async function fixture(name: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8")) as unknown;
}

function response(value: unknown): Response {
  return new Response(JSON.stringify(value), { status: 200, headers: { "Content-Type": "application/json" } });
}

test("parses the versioned production manifest and monthly shard", async () => {
  const manifest = parseManifest(await fixture("index-manifest.json"), "production");
  const shard = parseShard(await fixture("index-shard.json"), "production");
  assert.equal(manifest.months[0]?.month, "2026-10");
  assert.equal(shard.entries.length, 2);
  assert.equal(shard.entries[0]?.deviceTag, "Fixture_ABCDEF123456");
});

test("keeps production and development sources distinct", async () => {
  const production = await fixture("index-manifest.json") as Record<string, unknown>;
  assert.throws(() => parseManifest(production, "development"), IndexLoadError);
  const development = { ...production, source: "development", repository: "ishizuki-tech/SurveyExports-Dev" };
  assert.equal(parseManifest(development, "development").source, "development");
  assert.equal(SOURCES.development.repository, "ishizuki-tech/SurveyExports-Dev");
});

test("skips malformed index rows while retaining valid rows", async () => {
  const rows = await fixture("index-shard.json") as unknown[];
  const parsed = parseShard([...rows, { source: "production", survey_id: "incomplete" }], "production");
  assert.equal(parsed.entries.length, 2);
  assert.equal(parsed.invalidRowCount, 1);
});

test("filters by selected survey and device and sorts export dates", async () => {
  const entries = parseShard(await fixture("index-shard.json"), "production").entries;
  assert.deepEqual(filterAndSortSessions(entries, { surveyPath: entries[1]!.path, date: "all", device: "all", sort: "newest" }).map((entry) => entry.surveyId), ["fixture-uuid-two"]);
  assert.deepEqual(filterAndSortSessions(entries, { surveyPath: "all", date: "all", device: "Fixture_ABCDEF123456", sort: "newest" }).map((entry) => entry.surveyId), ["fixture-uuid-one"]);
  assert.deepEqual(filterAndSortSessions(entries, { surveyPath: "all", date: "all", device: "all", sort: "oldest" }).map((entry) => entry.surveyId), ["fixture-uuid-two", "fixture-uuid-one"]);
});

test("filters before every count sort and uses newest as the count tie-breaker", async () => {
  const entries = parseShard(await fixture("index-shard.json"), "production").entries;
  const newest = { ...entries[0]!, path: "new", uploaderDate: "2026-10-07", exportedAt: "2026-10-07T13:00:00Z", answerCount: 2, followupCount: 1, audioReferenceCount: 1 };
  const older = { ...entries[1]!, path: "old", uploaderDate: "2026-10-06", answerCount: 1, followupCount: 0, audioReferenceCount: 0 };
  const equal = { ...newest, path: "equal", exportedAt: "2026-10-07T12:00:00Z" };
  const all = [older, equal, newest];
  for (const sort of ["answers-desc", "answers-asc", "followups-desc", "followups-asc", "audio-desc", "audio-asc"] as const) {
    const result = filterAndSortSessions(all, { surveyPath: "all", date: "all", device: "all", sort });
    assert.equal(result[0]!.path, sort.endsWith("desc") ? "new" : "old");
  }
  assert.deepEqual(filterAndSortSessions(all, { surveyPath: "all", date: "2026-10-07", device: "all", sort: "answers-desc" }).map((entry) => entry.path), ["new", "equal"]);
});

test("loads a selected live export through a mocked fetch", async () => {
  const manifest = await fixture("index-manifest.json");
  const shard = await fixture("index-shard.json");
  const exportJson = await fixture("current-production.json");
  const fetcher: typeof fetch = async (url) => {
    const target = String(url);
    if (target.endsWith("manifest.json")) return response(manifest);
    if (target.endsWith("2026-10.json")) return response(shard);
    return response(exportJson);
  };
  const loaded = await loadIndex(SOURCES.production, undefined, undefined, fetcher);
  const selected = await loadExport(loaded.entries[0]!, undefined, fetcher);
  assert.deepEqual(selected, exportJson);
});
