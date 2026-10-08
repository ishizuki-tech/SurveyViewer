import type { SourceId } from "../config/sources";
import type { SelectOption } from "../data/filter-options";
import { hasActiveFilters, type ReviewFilters } from "./review-utils";

export interface FilterControls {
  readonly element: HTMLElement;
  readonly source: HTMLSelectElement;
  readonly survey: HTMLSelectElement;
  readonly month: HTMLSelectElement;
  readonly device: HTMLSelectElement;
  readonly sort: HTMLSelectElement;
}

export function filters(
  selectedSource: SourceId,
  values: ReviewFilters,
  deviceOptions: readonly SelectOption[],
  surveyOptions: readonly SelectOption[],
  onSourceChange: (source: SourceId) => void,
  onClear: () => void,
): FilterControls {
  const form = document.createElement("form");
  form.className = "filters";
  form.addEventListener("submit", (event) => event.preventDefault());
  const source = select("Source", [["production", "Production"], ["development", "Development"]], selectedSource);
  source.addEventListener("change", () => onSourceChange(source.value as SourceId));
  const month = select("Month", [["all", "All months"]], "all");
  const device = select("Device", deviceOptions.map(({ value, label }) => [value, label]), values.device);
  const survey = select("Survey", surveyOptions.map(({ value, label }) => [value, label]), values.surveyPath);
  const sort = select("Sort", [["newest", "Newest first"], ["oldest", "Oldest first"]], "newest");
  month.value = values.month;
  sort.value = values.sort;
  form.append(source.parentElement!, month.parentElement!, device.parentElement!, survey.parentElement!, sort.parentElement!);
  if (hasActiveFilters(values)) {
    const summary = document.createElement("p");
    summary.className = "filter-summary";
    summary.textContent = activeFilterSummary(values);
    const clear = document.createElement("button");
    clear.className = "button button--secondary";
    clear.type = "button";
    clear.textContent = "Clear filters";
    clear.addEventListener("click", onClear);
    form.append(summary, clear);
  }
  return { element: form, source, survey, month, device, sort };
}

function activeFilterSummary(values: ReviewFilters): string {
  const active: string[] = [];
  if (values.month !== "all") active.push(`Month: ${values.month}`);
  if (values.device !== "all") active.push("Device");
  if (values.surveyPath !== "all") active.push("Survey");
  if (values.sort !== "newest") active.push("Oldest first");
  return `Active filters: ${active.join(" · ")}`;
}

function select(labelText: string, options: readonly (readonly [string, string])[], selected: string): HTMLSelectElement {
  const label = document.createElement("label");
  label.textContent = labelText;
  const select = document.createElement("select");
  for (const [value, text] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    option.selected = value === selected;
    select.append(option);
  }
  label.append(select);
  return select;
}
