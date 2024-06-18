import { isGeometryMultiPolygon } from "@tai-kun/surrealdb";
import {
  GeometryLine,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
} from "@tai-kun/surrealdb/full";
import {
  GeometryLine as GeometryLineStandard,
  GeometryMultiPolygon as GeometryMultiPolygonStandard,
  GeometryPoint as GeometryPointStandard,
  GeometryPolygon as GeometryPolygonStandard,
} from "@tai-kun/surrealdb/standard";
import {
  GeometryLine as GeometryLineTiny,
  GeometryMultiPolygon as GeometryMultiPolygonTiny,
  GeometryPoint as GeometryPointTiny,
  GeometryPolygon as GeometryPolygonTiny,
} from "@tai-kun/surrealdb/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryMultiPolygon を作成する", () => {
  const multiPolygon = new GeometryMultiPolygon([
    new GeometryPolygon([
      new GeometryLine([
        new GeometryPoint([1, 2]),
      ]),
    ]),
  ]);

  assertInstanceOf(multiPolygon, GeometryMultiPolygon);
  assertJsonEquals(multiPolygon, {
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
  assert(isGeometryMultiPolygon(
    new GeometryMultiPolygon([
      new GeometryPolygon([
        new GeometryLine([
          new GeometryPoint([1, 2]),
        ]),
      ]),
    ]),
  ));
  assert(isGeometryMultiPolygon(
    new GeometryMultiPolygonStandard([
      new GeometryPolygonStandard([
        new GeometryLineStandard([
          new GeometryPointStandard([1, 2]),
        ]),
      ]),
    ]),
  ));
  assert(isGeometryMultiPolygon(
    new GeometryMultiPolygonTiny([
      new GeometryPolygonTiny([
        new GeometryLineTiny([
          new GeometryPointTiny([1, 2]),
        ]),
      ]),
    ]),
  ));

  assert(!isGeometryMultiPolygon({}));
  assert(
    !isGeometryMultiPolygon({
      type: "MultiPolygon",
      coordinates: [],
    }),
  );
});
