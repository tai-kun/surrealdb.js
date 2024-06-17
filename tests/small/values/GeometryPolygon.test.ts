import { isGeometryPolygon } from "@tai-kun/surrealdb";
import {
  GeometryLine,
  GeometryPoint,
  GeometryPolygon,
} from "@tai-kun/surrealdb/full";
import {
  GeometryLine as GeometryLineStandard,
  GeometryPoint as GeometryPointStandard,
  GeometryPolygon as GeometryPolygonStandard,
} from "@tai-kun/surrealdb/standard";
import {
  GeometryLine as GeometryLineTiny,
  GeometryPoint as GeometryPointTiny,
  GeometryPolygon as GeometryPolygonTiny,
} from "@tai-kun/surrealdb/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryPolygon を作成する", () => {
  const point = new GeometryPolygon([
    // 本来はリングを閉じるために 2 つ以上の点があること、最初と最後が同じ点であることが必要だが、
    // このテストでは省略する。
    new GeometryLine([new GeometryPoint([1, 2])]),
    new GeometryLine([new GeometryPoint([3, 4])]),
  ]);

  assertInstanceOf(point, GeometryPolygon);
  assertJsonEquals(point.exteriorRing, {
    type: "LineString",
    coordinates: [
      // Point
      ["1", "2"],
    ],
  });
  assertJsonEquals(point.interiorRings, [
    {
      type: "LineString",
      coordinates: [
        // Point
        ["3", "4"],
      ],
    },
  ]);
  assertJsonEquals(point, {
    type: "Polygon",
    coordinates: [
      // LineString
      [
        // Point
        ["1", "2"],
      ],
      // LineString
      [
        // Point
        ["3", "4"],
      ],
    ],
  });
});

test("GeometryPolygon であると判定する", () => {
  assert(isGeometryPolygon(
    new GeometryPolygon([
      new GeometryLine([
        new GeometryPoint([1, 2]),
      ]),
    ]),
  ));
  assert(isGeometryPolygon(
    new GeometryPolygonStandard([
      new GeometryLineStandard([
        new GeometryPointStandard([1, 2]),
      ]),
    ]),
  ));
  assert(isGeometryPolygon(
    new GeometryPolygonTiny([
      new GeometryLineTiny([
        new GeometryPointTiny([1, 2]),
      ]),
    ]),
  ));

  assert(!isGeometryPolygon({}));
  assert(
    !isGeometryPolygon({
      type: "GeometryPolygon",
      coordinates: [
        // LineString
        [
          // Point
          ["1", "2"],
        ],
      ],
    }),
  );
});
