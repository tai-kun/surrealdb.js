import isSafeNumber from "~/_lib/isSafeNumber";
import { SurrealTypeError } from "~/errors";

const POW_MS_TO_NS = 6n;

const POW_US_TO_NS = 3n;

const SCALE_S_NS = 1_000_000_000n;

const SCALE_US_NS = 1_000_000n;

export type Args =
  | []
  | [
    | number
    | bigint
    | string
    | Date
    | readonly [
      seconds?: number | undefined,
      nanoseconds?: number | undefined,
    ]
    | {
      readonly seconds: number;
      readonly nanoseconds: number;
    },
  ]
  | [
    year: number,
    monthIndex: number,
    date?: number | undefined,
    hours?: number | undefined,
    minutes?: number | undefined,
    seconds?: number | undefined,
    milliseconds?: number | undefined,
    microseconds?: number | undefined,
    nanoseconds?: number | undefined,
  ];

const isCompact = (v: unknown): v is [
  seconds?: number | undefined,
  nanoseconds?: number | undefined,
] =>
  Array.isArray(v)
  && (typeof v[0] === "number" || v[0] === undefined)
  && (typeof v[1] === "number" || v[1] === undefined);

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v
  && typeof v === "object";

const isDatetimeLike = (v: unknown): v is {
  readonly seconds: number;
  readonly nanoseconds: number;
} =>
  isObject(v)
  && typeof v["seconds"] === "number"
  && typeof v["nanoseconds"] === "number";

export function init(
  args: Args,
  date: Pick<Date, "setTime" | "getTime">,
): [
  seconds: number,
  nanoseconds: number,
] {
  if (args.length === 0) {
    return split(toBigInt(date.getTime(), POW_MS_TO_NS))[1];
  }

  if (args.length === 1) {
    const [v] = args;
    const nsTime: bigint | null | undefined = isCompact(v)
      ? parseCompact(v)
      : isDatetimeLike(v)
      ? parseCompact([v.seconds, v.nanoseconds])
      : v instanceof Date
      ? toBigInt(v.getTime(), POW_MS_TO_NS)
      : typeof v === "number"
      ? toBigInt(v, POW_MS_TO_NS)
      : typeof v === "string"
      ? toBigInt(Date.parse(v), POW_MS_TO_NS)
      : typeof v === "bigint"
      ? v
      : undefined;

    if (nsTime === undefined) {
      throw new SurrealTypeError("Invalid dateitme arguments");
    }

    const [s, compact] = split(nsTime);
    date.setTime(s);

    return isSafeNumber(date.setTime(s))
      ? [NaN, NaN]
      : compact;
  }

  if (
    typeof args[0] === "number"
    && typeof args[1] === "number"
    && (() => {
      let required = false;

      for (let i = 8; i >= 2; i--) {
        if (typeof args[i] === "number") {
          required = true;
        } else if (args[i] === undefined) {
          if (required) {
            return false;
          }
        } else {
          return false;
        }
      }

      return true;
    })()
  ) {
    const parts = args.filter(a => a !== undefined) as [any, any];
    const time = Date.UTC(...parts);
    const nsTimeOfMs = toBigInt(time, POW_MS_TO_NS);
    const nsTimeOfUs = toBigInt(args[7] ?? 0, POW_US_TO_NS);
    const nsTimeOfNs = toBigInt(args[8] ?? 0);
    const nsTime =
      nsTimeOfMs === null || nsTimeOfUs === null || nsTimeOfNs === null
        ? null
        : nsTimeOfMs + nsTimeOfUs + nsTimeOfNs;
    const [s, compact] = split(nsTime);
    date.setTime(s);

    return isSafeNumber(date.setTime(s))
      ? [NaN, NaN]
      : compact;
  }

  throw new SurrealTypeError("Invalid dateitme arguments");
}

function toBigInt(value: number, power: bigint = 0n): bigint | null {
  return isSafeNumber(value)
    ? BigInt(Math.trunc(value)) * (10n ** power)
    : null;
}

function split(nsTime: bigint | null): [
  msTime: number,
  compact: [seconds: number, nanoseconds: number],
] {
  return nsTime === null
    ? [NaN, [NaN, NaN]]
    : [Number(nsTime / SCALE_US_NS), toCompact(nsTime)];
}

function parseCompact(
  compact: readonly [
    seconds?: number | undefined,
    nanoseconds?: number | undefined,
  ],
): bigint | null {
  const s = toBigInt(compact[0] ?? 0);
  const ns = toBigInt(compact[1] ?? 0);

  return s === null || ns === null
    ? null
    : s * SCALE_S_NS + ns;
}

export function toCompact(time: number | bigint): [
  seconds: number,
  nanoseconds: number,
] {
  return typeof time === "number"
    ? [(time = Math.trunc(time)) / 1e3, time % 1e3]
    : [Number(time / SCALE_S_NS), Number(time % SCALE_S_NS)];
}

export function fromCompact(
  compact: readonly [
    seconds?: number | undefined,
    nanoseconds?: number | undefined,
  ],
) {
  return split(parseCompact(compact));
}

export function toISOString(datetime: Date, nanoseconds: number): string {
  const y = datetime.getUTCFullYear();
  const YYYY = y > 9999
    ? "+" + ("" + y).padStart(6, "0")
    : y < 0
    ? "-" + ("" + Math.abs(y)).padStart(6, "0")
    : ("" + y).padStart(4, "0");
  const MM = ("" + (datetime.getUTCMonth() + 1)).padStart(2, "0");
  const DD = ("" + datetime.getUTCDate()).padStart(2, "0");
  const HH = ("" + datetime.getUTCHours()).padStart(2, "0");
  const mm = ("" + datetime.getUTCMinutes()).padStart(2, "0");
  const ss = ("" + datetime.getUTCSeconds()).padStart(2, "0");
  const s9 = ("" + (nanoseconds < 0 ? 1e9 + nanoseconds : nanoseconds))
    .padStart(9, "0");

  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${s9}Z`;
}
