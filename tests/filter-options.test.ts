import assert from "node:assert/strict";
import test from "node:test";
import { dateOptions, deviceOptions, surveyLabel, surveyOptions } from "../src/data/filter-options";
import type { ViewerIndexEntry } from "../src/domain/viewer-index";

const entries: readonly ViewerIndexEntry[] = [
  {
    source: "production", path: "2026-10-07/exports/one.json", githubBlobUrl: "", rawJsonUrl: "", uploaderDate: "2026-10-07",
    exportedAt: "2026-10-07_14-32-00", surveyId: "5eee6221-42bf-49af-a8d4-955c19ae5c7a", deviceTag: "SM-S731U", build: "abc123", questionCount: 1, followupCount: 0, audioReferenceCount: 0,
    answerCount: 1, availability: { build: true, aiOutcomes: true, followups: true, audioReferences: false },
  },
  {
    source: "production", path: "2026-10-06/exports/two.json", githubBlobUrl: "", rawJsonUrl: "", uploaderDate: "2026-10-06",
    surveyId: "another-survey", questionCount: 1, followupCount: 0, audioReferenceCount: 0,
    answerCount: 0, availability: { build: false, aiOutcomes: false, followups: false, audioReferences: false },
  },
];

test("builds concise survey options using session metadata and stable paths", () => {
  assert.deepEqual(surveyOptions(entries).map((option) => option.value), ["all", "2026-10-07/exports/one.json", "2026-10-06/exports/two.json"]);
  assert.equal(surveyLabel(entries[0]!), "2026-10-07_14-32-00 · 5eee6221…5c7a · SM-S731U · abc123");
});

test("builds unique device options and represents missing metadata without inventing an identity", () => {
  assert.deepEqual(deviceOptions(entries), [
    { value: "all", label: "All devices" },
    { value: "SM-S731U", label: "SM-S731U" },
    { value: "__missing__", label: "Missing device identity" },
  ]);
});

test("builds newest-first exact date options", () => {
  assert.deepEqual(dateOptions(entries), [{ value: "all", label: "All dates" }, { value: "2026-10-07", label: "2026-10-07" }, { value: "2026-10-06", label: "2026-10-06" }]);
});
