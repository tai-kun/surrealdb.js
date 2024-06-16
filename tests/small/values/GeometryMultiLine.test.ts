import {
  GeometryLine,
  GeometryMultiLine,
  GeometryPoint,
  isGeometryMultiLine,
} from "@tai-kun/surrealdb/full";
import { GeometryMultiLine as GeometryMultiLineStandard } from "@tai-kun/surrealdb/standard";
import { GeometryMultiLine as GeometryMultiLineTiny } from "@tai-kun/surrealdb/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryMultiLine を作成する", () => {
  const point = new GeometryMultiLine([
    new GeometryLine([
      new GeometryPoint([1, 2]),
    ]),
  ]);

  assertInstanceOf(point, GeometryMultiLine);
  assertJsonEquals(point, {
    type: "MultiLineString",
    coordinates: [
      // LineString
      [
        // Point
        ["1", "2"],
      ],
    ],
  });
});

test("GeometryMultiLine であると判定する", () => {
  assert(isGeometryMultiLine(new GeometryMultiLine([])));
  assert(isGeometryMultiLine(new GeometryMultiLineStandard([])));
  assert(isGeometryMultiLine(new GeometryMultiLineTiny([])));

  assert(!isGeometryMultiLine({}));
  assert(
    !isGeometryMultiLine({
      type: "MultiLineString",
      coordinates: [],
    }),
  );
});
