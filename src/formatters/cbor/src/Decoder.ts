import { unreachable } from "@tai-kun/surreal/errors";
import {
  AI_EIGHT_BYTES,
  AI_FOUR_BYTES,
  AI_INDEFINITE_NUM_BYTES,
  AI_SIMPLE_FALSE,
  AI_SIMPLE_NULL,
  AI_SIMPLE_TRUE,
  AI_SIMPLE_UNDEFINED,
  AI_TWO_BYTES,
  BREAK,
  type DataItem,
  MT_ARRAY,
  MT_BYTE_STRING,
  MT_MAP,
  MT_NEGATIVE_INTEGER,
  MT_SIMPLE_FLOAT,
  MT_TAG,
  MT_UNSIGNED_INTEGER,
  MT_UTF8_STRING,
  Simple,
} from "./spec";
import Tagged from "./Tagged";

type Parent = {
  put(value: unknown): boolean;
  out(): unknown;
};

const toArray = <T>(v: T | readonly T[]): readonly T[] =>
  Array.isArray(v) ? v : [v];

function replaceCborItem<T>(
  revivers: readonly ((value: T) => unknown)[],
  value: T,
): unknown {
  for (let i = 0, len = revivers.length, ret; i < len; i++) {
    if ((ret = revivers[i]!(value)) !== CONTINUE) {
      return ret;
    }
  }

  return value;
}

// https://github.com/fastify/secure-json-parse/blob/master/index.js#L4-L5
const SUSPECT_PROTO_REGEX =
  /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
const SUSPECT_CONSTRUCTOR_REGEX =
  /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;

function isSafeKey(ins: string, key: string): string | true {
  return SUSPECT_PROTO_REGEX.test(key)
    ? ins + " contains forbidden `__proto__` property"
    : SUSPECT_CONSTRUCTOR_REGEX.test(key)
    ? ins + "Map contains forbidden `constructor` property"
    : true;
}

function defaultIsSafeMapKey(
  key: unknown,
  map: Map<unknown, unknown>,
): string | true {
  return map.has(key)
    ? "Duplicate key"
    : typeof key !== "string" || isSafeKey("Map", key);
}

function defaultIsSafeObjectKey(
  key: string | number,
  obj: Record<string, unknown>,
): string | true {
  return key in obj
    ? "Duplicate key"
    : typeof key !== "string" || isSafeKey("Object", key);
}

export const CONTINUE = Symbol.for("@tai-kun/surreal/cbor/continue");

export type TaggedItemReviver = (tagged: Tagged) => unknown | typeof CONTINUE;

export type SimpleItemReviver = (simple: Simple) => unknown | typeof CONTINUE;

export interface ReviverObject {
  readonly tagged?:
    | TaggedItemReviver
    | readonly TaggedItemReviver[]
    | undefined;
  readonly simple?:
    | SimpleItemReviver
    | readonly SimpleItemReviver[]
    | undefined;
}

export type Reviver = (value: Tagged | Simple) => unknown | typeof CONTINUE;

export interface DecoderOptions {
  readonly map?: boolean | undefined;
  readonly isSafeMapKey?:
    | ((key: unknown, map: Map<unknown, unknown>) => boolean | string)
    | undefined;
  readonly isSafeObjectKey?:
    | ((key: string | number, obj: Record<string, unknown>) => boolean | string)
    | undefined;
  readonly reviver?:
    | Reviver
    | readonly Reviver[]
    | ReviverObject
    | undefined;
}

export function toRevivers(
  reviver: DecoderOptions["reviver"],
): {
  tagged: readonly TaggedItemReviver[];
  simple: readonly SimpleItemReviver[];
} {
  reviver ||= [];

  if (typeof reviver === "function") {
    return {
      tagged: [reviver],
      simple: [reviver],
    };
  }

  if (Array.isArray(reviver)) {
    return {
      tagged: reviver,
      simple: reviver,
    };
  }

  return {
    tagged: toArray(reviver.tagged || []),
    simple: toArray(reviver.simple || []),
  };
}

export default class Decoder {
  private parent = undefined as unknown as Parent;
  private parents: Parent[] = [];
  private revivers: {
    tagged: readonly TaggedItemReviver[];
    simple: readonly SimpleItemReviver[];
  };
  private map;
  private isSafeMapKey: (
    key: unknown,
    map: Map<unknown, unknown>,
  ) => boolean | string;
  private isSafeObjectKey: (
    key: string | number,
    obj: Record<string, unknown>,
  ) => boolean | string;

  constructor(options: DecoderOptions | undefined = {}) {
    const {
      map = false,
      reviver,
      isSafeMapKey = defaultIsSafeMapKey,
      isSafeObjectKey = defaultIsSafeObjectKey,
    } = options;
    this.map = map;
    this.revivers = toRevivers(reviver);
    this.isSafeMapKey = isSafeMapKey;
    this.isSafeObjectKey = isSafeObjectKey;
    this.clear(); // init
  }

  private clear(): void {
    this.parents = [];
    // root data
    this.addData({
      val: undefined as unknown,
      put(value): boolean {
        this.val = value;

        return false;
      },
      out(): unknown {
        return this.val;
      },
    });
  }

  private addData<T extends Parent>(parent: T): void {
    this.parents.push(this.parent = parent);
  }

  private putValue(value: unknown): void {
    // @ts-ignore (TS6133): 何故かエラーになる
    let done = false;

    while ((done = this.parent.put(value))) {
      value = this.parents.pop()!.out();
      this.parent = this.parents[this.parents.length - 1]!;
    }
  }

  end(): unknown {
    try {
      if (this.parents.length !== 1) {
        throw new Error(`parents.length: ${this.parents.length}`);
      }

      return this.parent.out();
    } finally {
      this.clear();
    }
  }

  process(dataItem: DataItem): void {
    switch (dataItem.mt) {
      case MT_UNSIGNED_INTEGER:
      case MT_NEGATIVE_INTEGER:
        this.putValue(dataItem.value);
        break;

      case MT_BYTE_STRING:
        if (dataItem.ai !== AI_INDEFINITE_NUM_BYTES) {
          this.putValue(dataItem.value);
          break;
        }

        this.addData({
          len: 0,
          acc: [] as Uint8Array[],
          put(value): boolean {
            if (value === BREAK) {
              return true; // done
            }

            if (value instanceof Uint8Array) {
              this.acc.push(value);
              this.len += value.length;

              return false; // continue
            }

            throw new Error("Invalid type");
          },
          out(): unknown {
            const out = new Uint8Array(this.len);

            for (
              let offset = 0, chunk: Uint8Array | undefined;
              (chunk = this.acc.shift());
            ) {
              out.set(chunk, offset);
              offset += chunk.length;
            }

            return out;
          },
        });
        break;

      case MT_UTF8_STRING:
        if (dataItem.ai !== AI_INDEFINITE_NUM_BYTES) {
          this.putValue(dataItem.value);
          break;
        }

        this.addData({
          acc: "",
          put(value): boolean {
            if (value === BREAK) {
              return true; // done
            }

            if (typeof value === "string") {
              this.acc += value;
            }

            throw new Error("invalid type");
          },
          out(): unknown {
            return this.acc;
          },
        });
        break;

      case MT_ARRAY:
        if (dataItem.ai === AI_INDEFINITE_NUM_BYTES) {
          this.addData({
            acc: [] as unknown[],
            put(value): boolean {
              if (value !== BREAK) {
                this.acc.push(value);
              }

              return value === BREAK;
            },
            out(): unknown {
              return this.acc;
            },
          });
        } else {
          this.addData({
            len: dataItem.value,
            idx: 0,
            acc: Array.from({ length: dataItem.value }),
            put(value): boolean {
              this.acc[this.idx++] = value;

              return this.idx === this.len;
            },
            out(): unknown {
              return this.acc;
            },
          });
        }

        break;

      case MT_MAP: {
        const NONE: any = {}; // symbol

        if (this.map) {
          this.addData({
            v8n: this.isSafeMapKey,
            len: dataItem.value,
            idx: 0,
            non: NONE,
            key: NONE,
            acc: new Map(),
            put(value): boolean {
              if (this.key === this.non) {
                const ret = this.v8n(value, this.acc);

                if (ret === true) {
                  this.key = value;
                } else if (ret === false) {
                  throw new Error("invalid key");
                } else {
                  throw new Error(ret);
                }
              } else if (value !== BREAK) {
                this.acc.set(this.key, value);
                this.key = this.non;
                this.idx += 1;
              }

              return this.len === Infinity
                // TODO(tai-kun): ペアが揃う前に BREAK されたらエラー
                ? value === BREAK
                : this.idx === this.len;
            },
            out(): unknown {
              return this.acc;
            },
          });
        } else {
          this.addData({
            v8n: this.isSafeObjectKey,
            len: dataItem.value,
            idx: 0,
            non: NONE,
            key: NONE as string | number,
            acc: {} as Record<string, unknown>,
            put(value): boolean {
              if (
                this.key === this.non
              ) {
                if (typeof value !== "string" && typeof value !== "number") {
                  throw new Error("invalid key type: " + typeof value);
                }

                const ret = this.v8n(value, this.acc);

                if (ret === true) {
                  this.key = value;
                } else if (ret === false) {
                  throw new Error("invalid key");
                } else {
                  throw new Error(ret);
                }
              } else if (value !== BREAK) {
                this.acc[this.key] = value;
                this.key = this.non;
                this.idx += 1;
              }

              return this.len === Infinity
                // TODO(tai-kun): ペアが揃う前に BREAK されたらエラー
                ? value === BREAK
                : this.idx === this.len;
            },
            out(): unknown {
              return this.acc;
            },
          });
        }

        break;
      }

      case MT_TAG:
        this.addData({
          fns: this.revivers.tagged,
          rep: replaceCborItem,
          tag: dataItem.value,
          val: undefined as unknown,
          put(value): boolean {
            this.val = value;

            return true;
          },
          out(): unknown {
            return this.rep(this.fns, new Tagged(this.tag, this.val));
          },
        });
        break;

      case MT_SIMPLE_FLOAT:
        switch (dataItem.ai) {
          // Float
          case AI_TWO_BYTES:
          case AI_FOUR_BYTES:
          case AI_EIGHT_BYTES:
          // Primitive
          case AI_SIMPLE_FALSE:
          case AI_SIMPLE_TRUE:
          case AI_SIMPLE_NULL:
          case AI_SIMPLE_UNDEFINED:
          // "break" stop code
          case AI_INDEFINITE_NUM_BYTES:
            this.putValue(dataItem.value);
            break;

          // Unassigned simple value
          default:
            this.putValue(
              replaceCborItem(this.revivers.simple, dataItem.value),
            );
        }

        break;

      default:
        unreachable(dataItem);
    }
  }
}
