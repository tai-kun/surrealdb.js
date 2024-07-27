import {
  CborSyntaxError,
  CborTooLittleDataError,
  CborUnsafeMapKeyError,
  unreachable,
} from "@tai-kun/surreal/errors";
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
  type Simple,
} from "./spec";
import Tagged from "./tagged";

type Parent = {
  put(value: unknown): boolean;
  out(): unknown;
};

function reviveValue<T>(
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

function toRevivers(reviver: DecoderOptions["reviver"]): {
  tagged: readonly TaggedItemReviver[];
  simple: readonly SimpleItemReviver[];
} {
  if (!reviver) {
    return {
      tagged: [],
      simple: [],
    };
  }

  if (typeof reviver === "function") {
    return {
      tagged: [reviver],
      simple: [reviver],
    };
  }

  if (Array.isArray(reviver)) {
    const tagged: TaggedItemReviver[] = [];
    const simple: SimpleItemReviver[] = [];

    for (const r of reviver) {
      if (typeof r === "function") {
        tagged.push(r);
        simple.push(r);
      } else {
        r.tagged && tagged.push(r.tagged);
        r.simple && simple.push(r.simple);
      }
    }

    return {
      tagged,
      simple,
    };
  }

  return {
    tagged: reviver.tagged ? [reviver.tagged] : [],
    simple: reviver.simple ? [reviver.simple] : [],
  };
}

export const CONTINUE = Symbol.for("@tai-kun/surreal/cbor/continue");

export type TaggedItemReviver = (tagged: Tagged) => unknown | typeof CONTINUE;

export type SimpleItemReviver = (simple: Simple) => unknown | typeof CONTINUE;

export interface ReviverObject {
  readonly tagged?: TaggedItemReviver | undefined;
  readonly simple?: SimpleItemReviver | undefined;
}

export type Reviver = (value: Tagged | Simple) => unknown | typeof CONTINUE;

export interface DecoderOptions {
  readonly map?: boolean | undefined;
  readonly reviver?:
    | Reviver
    | ReviverObject
    | readonly (Reviver | ReviverObject)[]
    | undefined;
  readonly isSafeMapKey?:
    | ((key: unknown, map: Map<unknown, unknown>) => boolean)
    | undefined;
  readonly isSafeObjectKey?:
    | ((key: string | number, obj: Record<string, unknown>) => boolean)
    | undefined;
}

export class Decoder {
  private parent = undefined as unknown as Parent;
  private parents: Parent[] = [];
  private revivers: {
    tagged: readonly TaggedItemReviver[];
    simple: readonly SimpleItemReviver[];
  };
  private map: boolean;
  private isSafeMapKey: (key: unknown, map: Map<unknown, unknown>) => boolean;
  private isSafeObjectKey: (
    key: string | number,
    obj: Record<string, unknown>,
  ) => boolean;

  constructor(options: DecoderOptions | undefined = {}) {
    const {
      map = false,
      reviver,
      isSafeMapKey = k => k !== "__proto__" && k !== "constructor",
      isSafeObjectKey = k => k !== "__proto__" && k !== "constructor",
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
        throw new CborTooLittleDataError({
          cause: this.parents,
        });
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

            throw new CborSyntaxError(
              "For a byte string of indefinite length, only a Uint8Array is "
                + `expected before the "break" stop code, but a ${typeof value}`
                + " was received.",
            );
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

              return false; // continue
            }

            throw new CborSyntaxError(
              "For a utf-8 string of indefinite length, only a string is "
                + `expected before the "break" stop code, but a ${typeof value}`
                + " was received.",
            );
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
        } else if (dataItem.value <= 0) {
          this.putValue([]);
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
        if (dataItem.value <= 0) {
          this.putValue(this.map ? new Map() : {});
          break;
        }

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
                if (!this.v8n(value, this.acc)) {
                  throw new CborUnsafeMapKeyError(value);
                }

                this.key = value;
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
              if (this.len === Infinity && value === BREAK) {
                // TODO(tai-kun): ペアが揃う前に BREAK されたらエラー
                return true; // done
              }

              if (this.key === this.non) {
                if (
                  (typeof value !== "string" && typeof value !== "number")
                  || !this.v8n(value, this.acc)
                ) {
                  throw new CborUnsafeMapKeyError(value);
                }

                this.key = value;
              } else if (value !== BREAK) {
                this.acc[this.key] = value;
                this.key = this.non;
                this.idx += 1;
              }

              return this.idx === this.len;
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
          rev: reviveValue,
          tag: dataItem.value,
          val: undefined as unknown,
          put(value): boolean {
            this.val = value;

            return true;
          },
          out(): unknown {
            return this.rev(this.fns, new Tagged(this.tag, this.val));
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
            this.putValue(reviveValue(this.revivers.simple, dataItem.value));
        }

        break;

      default:
        unreachable(dataItem);
    }
  }
}
