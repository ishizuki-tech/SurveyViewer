import type { ReviewFilters } from "../src/components/review-utils";
import assert from "node:assert/strict";
import test from "node:test";
import { clearReviewFilters, DEFAULT_REVIEW_FILTERS, hasActiveFilters, shortenIdentifier } from "../src/components/review-utils";

test("identifies non-default review filters without treating source as a filter", () => {
  assert.equal(hasActiveFilters(DEFAULT_REVIEW_FILTERS), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, surveyPath: "2026-10-01/exports/fixture.json" }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, device: "Fixture_ABCDEF123456" }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, month: "2026-10" }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, date: "2026-10-07" }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, sort: "oldest" }), true);
});

test("clears month, date, device, and survey selections while retaining default sorting", () => {
  const filters: ReviewFilters = { ...DEFAULT_REVIEW_FILTERS, month: "2026-10", date: "2026-10-07", device: "Fixture_ABCDEF123456", surveyPath: "2026-10-01/exports/fixture.json", sort: "oldest" };
  clearReviewFilters(filters);
  assert.deepEqual(filters, DEFAULT_REVIEW_FILTERS);
});

test("shortens long identifiers while preserving useful leading and trailing context", () => {
  assert.equal(shortenIdentifier("12345678-abcd-efgh-ijkl-1234567890ab"), "12345678…90ab");
  assert.equal(shortenIdentifier("short-id"), "short-id");
});
