import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";
import { isGeometryLine } from "surrealjs";
import { GeometryLine, GeometryPoint } from "surrealjs/full";
import { GeometryLine as GeometryLineStandard } from "surrealjs/standard";
import { GeometryLine as GeometryLineTiny } from "surrealjs/tiny";

test("GeometryLine を作成する", () => {
  const line = new GeometryLine([new GeometryPoint([1, 2])]);

  assertInstanceOf(line, GeometryLine);
  assertJsonEquals(line, {
    type: "LineString",
    coordinates: [
      // Point
      ["1", "2"],
    ],
  });
});

test("GeometryLine であると判定する", () => {
  assert(isGeometryLine(new GeometryLine([])));
  assert(isGeometryLine(new GeometryLineStandard([])));
  assert(isGeometryLine(new GeometryLineTiny([])));

  assert(!isGeometryLine({}));
  assert(
    !isGeometryLine({
      type: "LineString",
      coordinates: [],
    }),
  );
});
