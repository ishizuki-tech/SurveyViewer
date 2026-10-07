export function statePanel(title: string, detail: string, kind: "info" | "error" = "info"): HTMLElement {
  const panel = document.createElement("section");
  panel.className = `state-panel state-panel--${kind}`;
  const heading = document.createElement("h2");
  heading.textContent = title;
  const paragraph = document.createElement("p");
  paragraph.textContent = detail;
  panel.append(heading, paragraph);
  return panel;
}

export function unavailable(): HTMLElement {
  const value = document.createElement("span");
  value.className = "unavailable";
  value.textContent = "Unavailable in this export";
  return value;
}
