import { isGeometryMultiPolygon } from "@tai-kun/surrealdb";
import {
  GeometryLine,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
} from "@tai-kun/surrealdb/full";
import { GeometryMultiPolygon as GeometryMultiPolygonStandard } from "@tai-kun/surrealdb/standard";
import { GeometryMultiPolygon as GeometryMultiPolygonTiny } from "@tai-kun/surrealdb/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryMultiPolygon を作成する", () => {
  const point = new GeometryMultiPolygon([
    new GeometryPolygon([
      new GeometryLine([
        new GeometryPoint([1, 2]),
      ]),
    ]),
  ]);

  assertInstanceOf(point, GeometryMultiPolygon);
  assertJsonEquals(point, {
    type: "MultiPolygon",
    coordinates: [
      // Polygon
      [
        // LineString
        [
          // Point
          ["1", "2"],
        ],
      ],
    ],
  });
});

test("GeometryMultiPolygon であると判定する", () => {
  assert(isGeometryMultiPolygon(new GeometryMultiPolygon([])));
  assert(isGeometryMultiPolygon(new GeometryMultiPolygonStandard([])));
  assert(isGeometryMultiPolygon(new GeometryMultiPolygonTiny([])));

  assert(!isGeometryMultiPolygon({}));
  assert(
    !isGeometryMultiPolygon({
      type: "MultiPolygon",
      coordinates: [],
    }),
  );
});
