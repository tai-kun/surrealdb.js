import { isGeometryLine } from "@tai-kun/surrealdb";
import { GeometryLine, GeometryPoint } from "@tai-kun/surrealdb/full";
import { GeometryLine as GeometryLineStandard } from "@tai-kun/surrealdb/standard";
import { GeometryLine as GeometryLineTiny } from "@tai-kun/surrealdb/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryLine を作成する", () => {
  const point = new GeometryLine([new GeometryPoint([1, 2])]);

  assertInstanceOf(point, GeometryLine);
  assertJsonEquals(point, {
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
