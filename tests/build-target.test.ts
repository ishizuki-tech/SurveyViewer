import assert from "node:assert/strict";
import test from "node:test";
import { DEVELOPMENT_BUILD_MODE, buildTargetForMode } from "../src/config/build-target";
import { SOURCES } from "../src/config/sources";
import { FILTER_CONTROL_LABELS } from "../src/components/filters";

test("maps the production build to the production export source", () => {
  const target = buildTargetForMode("production");
  assert.deepEqual(target, { source: "production", base: "/SurveyViewer/", outDir: "dist" });
  assert.equal(SOURCES[target.source].repository, "ishizuki-tech/SurveyExports");
});

test("maps the development build to the development export source", () => {
  const target = buildTargetForMode(DEVELOPMENT_BUILD_MODE);
  assert.deepEqual(target, { source: "development", base: "/SurveyViewer/dev/", outDir: "dist/dev" });
  assert.equal(SOURCES[target.source].repository, "ishizuki-tech/SurveyExports-Dev");
});

test("does not expose a runtime source selector", () => {
  assert.equal((FILTER_CONTROL_LABELS as readonly string[]).includes("Source"), false);
});
