# SurveyViewer

SurveyViewer is a lightweight, read-only static browser application for inspecting exported Survey2026 sessions. It is intentionally separate from the Android application and the repositories that hold export data.

## Architecture

The Vite + vanilla TypeScript application has a schema normalization layer between raw exports and the UI. Raw JSON remains retained for inspection; the normalizer never invents a session ID, formal completion state, device identity, or missing answer/AI data.

The Production source is `ishizuki-tech/SurveyExports`; Development is `ishizuki-tech/SurveyExports-Dev`. The browser loads each source's public `viewer-index/v1/manifest.json`, then only its required monthly JSON shards. Selecting a session fetches exactly that export JSON. Normal browser use never walks a GitHub repository tree or uses a GitHub API token.

Each shard deliberately contains metadata only: paths and links, uploader date, export timestamp, survey ID, safely parsed device tag, build, counts, and availability flags. It does not contain answers, transcripts, follow-up text, AI text, or audio content. HTTP caching is left to the browser; Phase 2 adds no local persistence.

## Development

```sh
npm install
npm run dev
npm run check
npm test
npm run build
```

GitHub Pages builds with the `/SurveyViewer/` Vite base path.

## Data and privacy

The viewer is designed for public, anonymous reads of generated static indexes and individual raw export files. It contains no GitHub token and must never embed one in browser code. No real survey answers, transcripts, device identifiers, or audio are included in source or test fixtures.

Global answer/transcript search is intentionally deferred: building an index containing that text would increase its discoverability, even if the source repository is public. Current filters cover source, month, device tag, survey selection, and newest/oldest ordering. The selector and session list use shortened UUIDs while detail and copy actions retain the full underlying UUID.

## Current schema limitations

Observed exports have `survey_id`, optional `build`, `exported_at`, `meta`, `answers`, optional/null `ai_outcomes`, `followups`, and `voice_files`. Historic files can omit `build` and AI outcomes. They do not currently provide a formal completion status, a session identifier, an export schema version, or a questionnaire revision. The UI therefore displays `Unavailable in this export` for absent optional information.
