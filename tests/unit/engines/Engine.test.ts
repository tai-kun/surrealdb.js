"use prelude";

import { CLOSED, CLOSING, CONNECTING, OPEN } from "@tai-kun/surrealdb";

test("connection states should all have different values", () => {
  assertNotEquals(CONNECTING, OPEN);
  assertNotEquals(CONNECTING, CLOSING);
  assertNotEquals(CONNECTING, CLOSED);
  assertNotEquals(OPEN, CLOSING);
  assertNotEquals(OPEN, CLOSED);
});
