import assert from "node:assert/strict";
import test from "node:test";
import { audioRawUrl } from "../src/components/audio-links";
import { SOURCES } from "../src/config/sources";

const exportPath = "2026-10-01/exports/survey.json";
const recording = "2026-10-01_23-30-46_voice_SM-S931U_Q7.wav";

test("constructs production and development audio raw URLs from export metadata", () => {
  assert.equal(audioRawUrl(SOURCES.production, exportPath, recording), "https://raw.githubusercontent.com/ishizuki-tech/SurveyExports/main/2026-10-01/voice/2026-10-01_23-30-46_voice_SM-S931U_Q7.wav");
  assert.equal(audioRawUrl(SOURCES.development, exportPath, recording), "https://raw.githubusercontent.com/ishizuki-tech/SurveyExports-Dev/main/2026-10-01/voice/2026-10-01_23-30-46_voice_SM-S931U_Q7.wav");
});

test("does not construct URLs for missing or malformed audio references", () => {
  assert.equal(audioRawUrl(SOURCES.production, undefined, recording), undefined);
  assert.equal(audioRawUrl(SOURCES.production, exportPath, "../recording.wav"), undefined);
  assert.equal(audioRawUrl(SOURCES.production, "not-a-date/exports/survey.json", recording), undefined);
});
