import type { DataItem } from "./spec";
import type { Writer } from "./writer";

export interface ToCBOR {
  readonly toCBOR: (writer: Writer) =>
    | [tag: DataItem.Tag["value"], value: unknown]
    | [value: unknown]
    | void;
}

export function hasToCBOR(value: object): value is ToCBOR {
  return "toCBOR" in value && typeof value.toCBOR === "function";
}
