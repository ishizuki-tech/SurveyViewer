import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_REVIEW_FILTERS, hasActiveFilters, shortenIdentifier } from "../src/components/review-utils";

test("identifies non-default review filters without treating source as a filter", () => {
  assert.equal(hasActiveFilters(DEFAULT_REVIEW_FILTERS), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, uuid: "fixture" }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, month: "2026-10" }), true);
  assert.equal(hasActiveFilters({ ...DEFAULT_REVIEW_FILTERS, sort: "oldest" }), true);
});

test("shortens long identifiers while preserving useful leading and trailing context", () => {
  assert.equal(shortenIdentifier("12345678-abcd-efgh-ijkl-1234567890ab"), "12345678…90ab");
  assert.equal(shortenIdentifier("short-id"), "short-id");
});
