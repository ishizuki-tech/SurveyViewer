import type { SelectOption } from "../data/filter-options";
import { hasActiveFilters, type ReviewFilters } from "./review-utils";

export const FILTER_CONTROL_LABELS = ["Month", "Date", "Device", "Survey", "Sort"] as const;

export interface FilterControls {
  readonly element: HTMLElement;
  readonly survey: HTMLSelectElement;
  readonly month: HTMLSelectElement;
  readonly date: HTMLSelectElement;
  readonly device: HTMLSelectElement;
  readonly sort: HTMLSelectElement;
}

export function filters(
  values: ReviewFilters,
  deviceOptions: readonly SelectOption[],
  dateOptions: readonly SelectOption[],
  surveyOptions: readonly SelectOption[],
  onClear: () => void,
): FilterControls {
  const form = document.createElement("form");
  form.className = "filters";
  form.addEventListener("submit", (event) => event.preventDefault());
  const month = select(FILTER_CONTROL_LABELS[0], [["all", "All months"]], "all");
  const date = select(FILTER_CONTROL_LABELS[1], dateOptions.map(({ value, label }) => [value, label]), values.date);
  const device = select(FILTER_CONTROL_LABELS[2], deviceOptions.map(({ value, label }) => [value, label]), values.device);
  const survey = select(FILTER_CONTROL_LABELS[3], surveyOptions.map(({ value, label }) => [value, label]), values.surveyPath);
  const sort = select(FILTER_CONTROL_LABELS[4], [["newest", "Newest first"], ["oldest", "Oldest first"], ["answers-desc", "Most answers"], ["answers-asc", "Fewest answers"], ["followups-desc", "Most follow-ups"], ["followups-asc", "Fewest follow-ups"], ["audio-desc", "Most audio"], ["audio-asc", "Fewest audio"]], "newest");
  month.value = values.month;
  sort.value = values.sort;
  form.append(month.parentElement!, date.parentElement!, device.parentElement!, survey.parentElement!, sort.parentElement!);
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
  return { element: form, survey, month, date, device, sort };
}

function activeFilterSummary(values: ReviewFilters): string {
  const active: string[] = [];
  if (values.month !== "all") active.push(`Month: ${values.month}`);
  if (values.date !== "all") active.push(`Date: ${values.date}`);
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
