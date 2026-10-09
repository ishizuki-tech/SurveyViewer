import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeExport } from "../src/data/normalize-export";
import { resolveQuestionOrder } from "../src/data/questionnaire-order";

async function fixture(name: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(`./fixtures/${name}`, import.meta.url), "utf8")) as unknown;
}

test("normalizes the current production shape and retains unknown fields", async () => {
  const session = normalizeExport(await fixture("current-production.json"));
  assert.equal(session.surveyId, "fixture-production-001");
  assert.equal(session.build, "example-build-sha");
  assert.equal(session.answers.get("Q10")?.audio[0]?.file, "fixture-q10.wav");
  assert.equal(session.aiOutcomes.get("Q10"), "accepted");
  assert.equal(session.followups.get("Q10")?.[0]?.answer, "Fixture follow-up answer.");
  assert.deepEqual(session.raw.value.future_extension, { retained: true });
});

test("reads historic exports without build or ai outcomes", async () => {
  const session = normalizeExport(await fixture("legacy-no-build.json"));
  assert.equal(session.build, undefined);
  assert.equal(session.aiOutcomes.size, 0);
  assert.equal(session.voiceFiles.length, 0);
});

test("normalizes null ai outcomes without inventing a value", async () => {
  const session = normalizeExport(await fixture("null-ai-outcomes.json"));
  assert.equal(session.aiOutcomes.size, 0);
  assert.equal(session.meta.fixture, "true");
});

test("normalizes a development export with empty optional collections", async () => {
  const session = normalizeExport(await fixture("development.json"));
  assert.equal(session.surveyId, "fixture-development-001");
  assert.equal(session.followups.size, 0);
  assert.equal(session.voiceFiles.length, 0);
});

test("resolves captured, known, natural, then unknown question IDs", () => {
  const session = normalizeExport({
    survey_id: "ordering-fixture",
    question_order: ["CustomB", "Q10"],
    answers: {
      Q2: { question: "Q2", answer: "a" },
      Q10: { question: "Q10", answer: "b" },
      CustomA: { question: "CustomA", answer: "c" },
      CustomB: { question: "CustomB", answer: "d" },
      Q99: { question: "Q99", answer: "e" }
    },
    followups: {},
    voice_files: []
  });
  assert.deepEqual(resolveQuestionOrder(session), ["CustomB", "Q10", "Q2", "Q99", "CustomA"]);
});

test("omits an empty structural Start marker", () => {
  const session = normalizeExport({
    survey_id: "structural-start-fixture",
    answers: {
      Start: { question: "Start", answer: "  " },
      Q1: { question: "Fixture question", answer: "Fixture answer" }
    },
    followups: {},
    voice_files: []
  });

  assert.deepEqual(resolveQuestionOrder(session), ["Q1"]);
});

test("retains Start when it has supporting content", () => {
  const cases = [
    {
      name: "a meaningful answer",
      export: { answers: { Start: { question: "Start", answer: "Fixture answer" } } }
    },
    {
      name: "answer-attached audio",
      export: { answers: { Start: { question: "Start", answer: "", audio: [{ file: "fixture.wav" }] } } }
    },
    {
      name: "an AI outcome",
      export: { answers: { Start: { question: "Start", answer: "" } }, ai_outcomes: { Start: "accepted" } }
    },
    {
      name: "a follow-up",
      export: { answers: { Start: { question: "Start", answer: "" } }, followups: { Start: [{ question: "Follow-up", answer: "Fixture" }] } }
    },
    {
      name: "a voice-file reference",
      export: { answers: { Start: { question: "Start", answer: "" } }, voice_files: [{ question_id: "Start", file: "fixture.wav" }] }
    }
  ];

  for (const { name, export: additions } of cases) {
    const session = normalizeExport({
      survey_id: `start-${name}`,
      followups: {},
      voice_files: [],
      ...additions
    });
    assert.ok(resolveQuestionOrder(session).includes("Start"), name);
  }
});

test("keeps audio-only, follow-up-only, and AI-only question IDs visible", () => {
  const session = normalizeExport({
    survey_id: "auxiliary-question-fixture",
    answers: { Q1: { question: "Fixture question", answer: "Fixture answer" } },
    ai_outcomes: { AiOnly: "accepted" },
    followups: { FollowupOnly: [{ question: "Follow-up", answer: "Fixture" }] },
    voice_files: [{ question_id: "AudioOnly", file: "fixture.wav" }]
  });

  assert.deepEqual(resolveQuestionOrder(session), ["Q1", "AiOnly", "AudioOnly", "FollowupOnly"]);
});
