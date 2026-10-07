export type JsonObject = Record<string, unknown>;

/** The untouched parsed JSON object. It is retained for raw inspection. */
export interface RawExport {
  readonly value: JsonObject;
}
