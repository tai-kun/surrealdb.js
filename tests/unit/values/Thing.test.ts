"use prelude";

import { isThing, Thing as NormalThing } from "@tai-kun/surrealdb";
import { Thing } from "@tai-kun/surrealdb/full";
import { Thing as TinyThing } from "@tai-kun/surrealdb/tiny";

test("should check if a value is a thing", () => {
  assert(isThing(new Thing("person", "john")));
  assert(isThing(new TinyThing("person", "john")));
  assert(isThing(new NormalThing("person", "john")));
  assert(!isThing("person:john"));
  assert(!isThing(["person", "john"]));
  assert(!isThing({ tb: "person", id: "john" }));
});

for (
  const [tb, id, expected] of [
    ["person", "john", "person:john"],
    ["person", 42, "person:42"],
    ["person", 3.14, "person:3.14"],
    ["person", { a: ["b", 0, true] }, "person:{\"a\":[\"b\",0,true]}"],
    [
      "person",
      "5ad773df-4c0d-4034-b0e4-6417dbc27b67",
      "person:⟨5ad773df-4c0d-4034-b0e4-6417dbc27b67⟩",
    ],
  ] satisfies [string, any, string][]
) {
  test(`should to be ${expected} from ${tb} and ${id}`, () => {
    const thing = new Thing(tb, id);

    assertEquals(thing.toString(), expected);
  });
}
