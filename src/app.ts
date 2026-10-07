import "./style.css";
import { filters } from "./components/filters";
import { statePanel } from "./components/state-panel";
import { SOURCES, type SourceId } from "./config/sources";
import { rawInspector } from "./screens/raw-inspector";
import { sessionList } from "./screens/session-list";
import { surveyDetail } from "./screens/survey-detail";

const root = applicationRoot();

let selectedSource: SourceId = "production";

function render(): void {
  root.replaceChildren();
  const header = document.createElement("header");
  const title = document.createElement("h1");
  title.textContent = "Survey Viewer";
  const status = document.createElement("p");
  status.className = "index-status";
  status.textContent = "Index status: generated repository indexes are planned for Phase 2.";
  header.append(title, status);

  const layout = document.createElement("main");
  layout.className = "layout";
  const sidebar = document.createElement("aside");
  sidebar.append(filters(selectedSource, (source) => {
    selectedSource = source;
    render();
  }).element, sessionList([]));

  const detail = document.createElement("section");
  detail.className = "detail-column";
  detail.append(
    statePanel("Read-only viewer foundation", `Selected source: ${SOURCES[selectedSource].label}. No live export data is fetched until a generated index is introduced.`),
    surveyDetail(undefined, SOURCES[selectedSource]),
    rawInspector(undefined, SOURCES[selectedSource]),
  );
  layout.append(sidebar, detail);
  root.append(header, layout);
}

render();

function applicationRoot(): HTMLDivElement {
  const element = document.querySelector<HTMLDivElement>("#app");
  if (element === null) throw new Error("Application root is missing.");
  return element;
}
