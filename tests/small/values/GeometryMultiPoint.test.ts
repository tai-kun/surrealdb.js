import { isGeometryMultiPoint } from "@tai-kun/surreal";
import {
  GeometryMultiPoint,
  GeometryPoint,
} from "@tai-kun/surreal/values/full";
import { GeometryMultiPoint as GeometryMultiPointStandard } from "@tai-kun/surreal/values/standard";
import { GeometryMultiPoint as GeometryMultiPointTiny } from "@tai-kun/surreal/values/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

test("GeometryMultiPoint を作成する", () => {
  const multiPoint = new GeometryMultiPoint([new GeometryPoint([1, 2])]);

  assertInstanceOf(multiPoint, GeometryMultiPoint);
  assertJsonEquals(multiPoint, {
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
