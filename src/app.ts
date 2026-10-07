import "./style.css";
import { filters } from "./components/filters";
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
const filtersState = { uuid: "", device: "", month: "all", sort: "newest" };

void refreshIndex();

async function refreshIndex(): Promise<void> {
  loadingIndex = true;
  indexError = undefined;
  selectedEntry = undefined;
  selectedSession = undefined;
  detailError = undefined;
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
  selectedEntry = entry;
  selectedSession = undefined;
  detailError = undefined;
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
  const header = document.createElement("header");
  const title = document.createElement("h1");
  title.textContent = "Survey Viewer";
  const status = document.createElement("p");
  status.className = "index-status";
  status.textContent = indexStatus();
  header.append(title, status);
  const layout = document.createElement("main");
  layout.className = "layout";
  const sidebar = document.createElement("aside");
  const controls = filters(selectedSource, (source) => { selectedSource = source; filtersState.month = "all"; void refreshIndex(); });
  populateMonths(controls.month);
  controls.uuid.value = filtersState.uuid;
  controls.device.value = filtersState.device;
  controls.sort.value = filtersState.sort;
  controls.uuid.addEventListener("input", () => { filtersState.uuid = controls.uuid.value; render(); });
  controls.device.addEventListener("input", () => { filtersState.device = controls.device.value; render(); });
  controls.sort.addEventListener("change", () => { filtersState.sort = controls.sort.value; render(); });
  controls.month.addEventListener("change", () => { filtersState.month = controls.month.value; void refreshIndex(); });
  sidebar.append(controls.element, sessionList(filteredEntries(), (entry) => { void selectSession(entry); }, emptyListMessage()));
  const detail = document.createElement("section");
  detail.className = "detail-column";
  if (loadingIndex) detail.append(statePanel("Loading index", `Loading ${SOURCES[selectedSource].label} metadata…`));
  if (indexError !== undefined) detail.append(statePanel("Index unavailable", indexError, "error"));
  if (invalidRowCount > 0) detail.append(statePanel("Some index rows were skipped", `${invalidRowCount} malformed index row(s) were ignored; the remaining sessions are usable.`, "error"));
  if (detailError !== undefined) detail.append(statePanel("Selected export unavailable", detailError, "error"));
  detail.append(surveyDetail(selectedSession, SOURCES[selectedSource], selectedEntry?.path));
  detail.append(rawInspector(selectedSession, selectedEntry?.githubBlobUrl));
  layout.append(sidebar, detail);
  root.append(header, layout);
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
