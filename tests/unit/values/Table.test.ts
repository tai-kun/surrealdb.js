"use prelude";

import { isTable, Table as NormalTable } from "@tai-kun/surrealdb";
import { Table } from "@tai-kun/surrealdb/full";
import { Table as TinyTable } from "@tai-kun/surrealdb/tiny";

test("should check if a value is a table", () => {
  assert(isTable(new Table("person")));
  assert(isTable(new TinyTable("person")));
  assert(isTable(new NormalTable("person")));
  assert(!isTable("person"));
  assert(!isTable(["person"]));
  assert(!isTable({ name: "person" }));
});

test("should to be person from person", () => {
  const table = new Table("person");

  assertEquals(table.toString(), "person");
});

test("should escape a table name", () => {
  assertEquals(Table.escape("foo-bar"), "⟨foo-bar⟩");
});
