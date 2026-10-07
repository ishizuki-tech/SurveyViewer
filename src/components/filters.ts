import type { SourceId } from "../config/sources";

export interface FilterControls {
  readonly element: HTMLElement;
  readonly source: HTMLSelectElement;
  readonly uuid: HTMLInputElement;
  readonly month: HTMLSelectElement;
  readonly device: HTMLInputElement;
  readonly sort: HTMLSelectElement;
}

export function filters(selectedSource: SourceId, onSourceChange: (source: SourceId) => void): FilterControls {
  const form = document.createElement("form");
  form.className = "filters";
  form.addEventListener("submit", (event) => event.preventDefault());
  const source = select("Source", [["production", "Production"], ["development", "Development"]], selectedSource);
  source.addEventListener("change", () => onSourceChange(source.value as SourceId));
  const uuid = input("UUID search", "Search UUID", "search");
  const month = select("Month", [["all", "All months"]], "all");
  const device = input("Device", "Filter device tag", "search");
  const sort = select("Sort", [["newest", "Newest first"], ["oldest", "Oldest first"]], "newest");
  form.append(source.parentElement!, uuid.parentElement!, month.parentElement!, device.parentElement!, sort.parentElement!);
  return { element: form, source, uuid, month, device, sort };
}

function input(labelText: string, placeholder: string, type: string): HTMLInputElement {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  label.append(input);
  return input;
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
