import { decode, encode } from "@tai-kun/surrealdb/cbor";
import { expect, test } from "vitest";

test.each<[string]>([
  ["ns"],
  ["db"],
  ["ac"],
  ["use"],
  ["let"],
  ["run"],
  ["user"],
  ["pass"],
  ["ping"],
  ["info"],
  ["live"],
  ["kill"],
  ["unset"],
  ["query"],
  ["merge"],
  ["patch"],
  ["method"],
  ["params"],
  ["signup"],
  ["signin"],
  ["select"],
  ["create"],
  ["insert"],
  ["update"],
  ["upsert"],
  ["delete"],
  ["relate"],
  ["version"],
  ["invalidate"],
  ["authenticate"],
])("%s をエンコード/デコードする", value => {
  expect(decode(encode(value))).toBe(value);
});
