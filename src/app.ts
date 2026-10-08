import "./style.css";
import { filters } from "./components/filters";
import { DEFAULT_REVIEW_FILTERS, type ReviewFilters } from "./components/review-utils";
import { statePanel } from "./components/state-panel";
import { SOURCES, type SourceId } from "./config/sources";
import { IndexLoadError, loadExport, loadIndex } from "./data/index-loader";
import { normalizeExport } from "./data/normalize-export";
import { filterAndSortSessions } from "./data/session-query";
import type { NormalizedSession } from "./domain/normalized-session";
import type { ViewerIndexEntry, ViewerIndexManifest } from "./domain/viewer-index";
import { rawInspector } from "./screens/raw-inspector";
import { sessionList } from "./screens/session-list";
import { surveyDetail } from "./screens/survey-detail";

const root = applicationRoot();
let selectedSource: SourceId = "production";
let manifest: ViewerIndexManifest | undefined;
let entries: readonly ViewerIndexEntry[] = [];
let invalidRowCount = 0;
let indexError: string | undefined;
let loadingIndex = false;
let selectedEntry: ViewerIndexEntry | undefined;
let selectedSession: NormalizedSession | undefined;
let detailError: string | undefined;
let rawExpanded = false;
let narrowDetailMode = false;
let focusDetailAfterRender = false;
let restoreListPosition = false;
let listScrollTop = 0;
const filtersState: ReviewFilters = { ...DEFAULT_REVIEW_FILTERS };

void refreshIndex();

async function refreshIndex(): Promise<void> {
  loadingIndex = true;
  indexError = undefined;
  selectedEntry = undefined;
  selectedSession = undefined;
  detailError = undefined;
  rawExpanded = false;
  render();
  try {
    const loaded = await loadIndex(SOURCES[selectedSource], filtersState.month === "all" ? undefined : filtersState.month);
    manifest = loaded.manifest;
    entries = loaded.entries;
    invalidRowCount = loaded.invalidRowCount;
  } catch (error) {
    manifest = undefined;
    entries = [];
    indexError = error instanceof IndexLoadError ? error.message : "Could not load the viewer index.";
  } finally {
    loadingIndex = false;
    render();
  }
}

async function selectSession(entry: ViewerIndexEntry): Promise<void> {
  rememberListPosition();
  selectedEntry = entry;
  selectedSession = undefined;
  detailError = undefined;
  rawExpanded = false;
  if (isNarrowViewport()) {
    narrowDetailMode = true;
    focusDetailAfterRender = true;
  }
  render();
  try {
    selectedSession = normalizeExport(await loadExport(entry));
  } catch (error) {
    detailError = error instanceof Error ? error.message : "Could not load the selected export.";
  }
  render();
}

function render(): void {
  root.replaceChildren();
  root.className = narrowDetailMode ? "app app--detail-mode" : "app";
  const header = document.createElement("header");
  const titleGroup = document.createElement("div");
  titleGroup.className = "title-group";
  const title = document.createElement("h1");
  title.textContent = "Survey Viewer";
  const sourceIndicator = document.createElement("span");
  sourceIndicator.className = `source-indicator source-indicator--${selectedSource}`;
  sourceIndicator.textContent = selectedSource === "production" ? "Production" : "Development";
  titleGroup.append(title, sourceIndicator);
  const status = document.createElement("p");
  status.className = "index-status";
  status.textContent = indexStatus();
  header.append(titleGroup, status);
  const layout = document.createElement("main");
  layout.className = "layout";
  const sidebar = document.createElement("aside");
  const controls = filters(selectedSource, filtersState, (source) => {
    selectedSource = source;
    filtersState.month = "all";
    narrowDetailMode = false;
    void refreshIndex();
  }, () => {
    Object.assign(filtersState, DEFAULT_REVIEW_FILTERS);
    selectedEntry = undefined;
    selectedSession = undefined;
    detailError = undefined;
    rawExpanded = false;
    void refreshIndex();
  });
  populateMonths(controls.month);
  controls.uuid.addEventListener("input", () => { filtersState.uuid = controls.uuid.value; render(); });
  controls.device.addEventListener("input", () => { filtersState.device = controls.device.value; render(); });
  controls.sort.addEventListener("change", () => { filtersState.sort = controls.sort.value; render(); });
  controls.month.addEventListener("change", () => { filtersState.month = controls.month.value; void refreshIndex(); });
  sidebar.append(controls.element, sessionList(filteredEntries(), selectedEntry?.path, (entry) => { void selectSession(entry); }, emptyListMessage()));
  const detail = document.createElement("section");
  detail.className = "detail-column";
  detail.tabIndex = -1;
  if (narrowDetailMode) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "button button--secondary back-to-results";
    back.textContent = "Back to results";
    back.addEventListener("click", () => {
      narrowDetailMode = false;
      restoreListPosition = true;
      render();
    });
    detail.append(back);
  }
  if (loadingIndex) detail.append(statePanel("Loading index", `Loading ${SOURCES[selectedSource].label} metadata…`));
  if (indexError !== undefined) detail.append(statePanel("Index unavailable", indexError, "error"));
  if (invalidRowCount > 0) detail.append(statePanel("Some index rows were skipped", `${invalidRowCount} malformed index row(s) were ignored; the remaining sessions are usable.`, "error"));
  if (detailError !== undefined) detail.append(statePanel("Selected export unavailable", detailError, "error"));
  detail.append(surveyDetail(selectedSession, SOURCES[selectedSource], selectedEntry, () => {
    rawExpanded = true;
    render();
    document.querySelector<HTMLElement>("#raw-json")?.scrollIntoView({ block: "start" });
  }));
  detail.append(rawInspector(selectedSession, selectedEntry?.githubBlobUrl, rawExpanded, (expanded) => { rawExpanded = expanded; }));
  layout.append(sidebar, detail);
  root.append(header, layout);
  const list = sidebar.querySelector<HTMLElement>(".session-list");
  if (list !== null) list.scrollTop = listScrollTop;
  if (focusDetailAfterRender) {
    focusDetailAfterRender = false;
    window.requestAnimationFrame(() => { detail.focus(); window.scrollTo({ top: 0 }); });
  }
  if (restoreListPosition) {
    restoreListPosition = false;
    window.requestAnimationFrame(() => window.scrollTo({ top: listScrollTop }));
  }
}

function rememberListPosition(): void {
  listScrollTop = document.querySelector<HTMLElement>(".session-list")?.scrollTop ?? window.scrollY;
}

function isNarrowViewport(): boolean {
  return window.matchMedia("(max-width: 760px)").matches;
}

function populateMonths(select: HTMLSelectElement): void {
  for (const month of manifest?.months ?? []) {
    const option = document.createElement("option");
    option.value = month.month;
    option.textContent = `${month.month} (${month.count})`;
    option.selected = month.month === filtersState.month;
    select.append(option);
  }
}

function filteredEntries(): readonly ViewerIndexEntry[] {
  return filterAndSortSessions(entries, { uuid: filtersState.uuid, device: filtersState.device, sort: filtersState.sort === "oldest" ? "oldest" : "newest" });
}

function indexStatus(): string {
  if (loadingIndex) return "Index status: loading…";
  if (indexError !== undefined) return "Index status: unavailable";
  if (manifest === undefined) return "Index status: awaiting source";
  return `Index: ${manifest.source} · ${manifest.repository} · ${manifest.generatedAt} · ${manifest.commitSha.slice(0, 12)}`;
}

function emptyListMessage(): string {
  if (loadingIndex) return "Loading session metadata…";
  if (indexError !== undefined) return "The index could not be loaded; adjust the source or retry.";
  if (entries.length > 0) return "No sessions match the active UUID or device filters.";
  return "The selected repository currently has no indexed exports.";
}

function applicationRoot(): HTMLDivElement {
  const element = document.querySelector<HTMLDivElement>("#app");
  if (element === null) throw new Error("Application root is missing.");
  return element;
}
