import {
  GeometryMultiPoint,
  GeometryPoint,
  isGeometryMultiPoint,
} from "@tai-kun/surrealdb/full";
import { GeometryMultiPoint as GeometryMultiPointStandard } from "@tai-kun/surrealdb/standard";
import { GeometryMultiPoint as GeometryMultiPointTiny } from "@tai-kun/surrealdb/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryMultiPoint を作成する", () => {
  const point = new GeometryMultiPoint([new GeometryPoint([1, 2])]);

  assertInstanceOf(point, GeometryMultiPoint);
  assertJsonEquals(point, {
    type: "MultiPoint",
    coordinates: [
      // Point
      ["1", "2"],
    ],
  });
});

test("GeometryMultiPoint であると判定する", () => {
  assert(isGeometryMultiPoint(new GeometryMultiPoint([])));
  assert(isGeometryMultiPoint(new GeometryMultiPointStandard([])));
  assert(isGeometryMultiPoint(new GeometryMultiPointTiny([])));

  assert(!isGeometryMultiPoint({}));
  assert(
    !isGeometryMultiPoint({
      type: "MultiPoint",
      coordinates: [],
    }),
  );
});
