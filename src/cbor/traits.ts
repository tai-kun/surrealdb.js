import type { DataItem } from "./spec";
import type { Writer } from "./writer";

export interface ToCBOR {
  readonly toCBOR: (writer: Writer) =>
    | [tag: DataItem.Tag["value"], value: unknown]
    | [value: unknown]
    | void;
}

export function canToCBOR(value: unknown): value is ToCBOR {
  return typeof value === "object"
    && value !== null
    && "toCBOR" in value
    && typeof value.toCBOR === "function";
}
