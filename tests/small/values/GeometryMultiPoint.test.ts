import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";
import { isGeometryMultiPoint } from "surreal-js";
import { GeometryMultiPoint, GeometryPoint } from "surreal-js/full";
import { GeometryMultiPoint as GeometryMultiPointStandard } from "surreal-js/standard";
import { GeometryMultiPoint as GeometryMultiPointTiny } from "surreal-js/tiny";

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
