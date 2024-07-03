declare module "@tools/assert" {
  import assert, {
    deepStrictEqual,
    deepStrictEqual,
    ifError,
    notDeepStrictEqual,
    notStrictEqual,
    ok,
    strict,
    strictEqual,
    strictEqual,
  } from "node:assert";

  namespace tools {
    type AssertionError = assert.AssertionError;
    type AssertPredicate = assert.AssertPredicate;
    type CallTrackerCall = assert.CallTrackerCall;
    type CallTrackerReportInformation = assert.CallTrackerReportInformation;
  }
  const tools:
    & Omit<
      typeof assert,
      | "equal"
      | "notEqual"
      | "deepEqual"
      | "notDeepEqual"
      | "ok"
      | "strictEqual"
      | "deepStrictEqual"
      | "ifError"
      | "strict"
    >
    & {
      (value: unknown, message?: string | Error): asserts value;
      equal: typeof strictEqual;
      notEqual: typeof notStrictEqual;
      deepEqual: typeof deepStrictEqual;
      notDeepEqual: typeof notDeepStrictEqual;
      ok: typeof ok;
      strictEqual: typeof strictEqual;
      deepStrictEqual: typeof deepStrictEqual;
      ifError: typeof ifError;
    }
    & {
      jsonEqual: {
        <T extends import("type-fest").Jsonifiable>(
          actual: unknown,
          expected: T,
          message?: string | Error,
        ): asserts actual is T;
      };
      jsonNotEqual: {
        (
          actual: unknown,
          expected: import("type-fest").Jsonifiable,
          message?: string | Error,
        ): void;
      };
    };

  export = tools;
}
