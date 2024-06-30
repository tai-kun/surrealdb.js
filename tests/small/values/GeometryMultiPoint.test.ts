import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";
import { isGeometryMultiPoint } from "surrealjs";
import { GeometryMultiPoint, GeometryPoint } from "surrealjs/full";
import { GeometryMultiPoint as GeometryMultiPointStandard } from "surrealjs/standard";
import { GeometryMultiPoint as GeometryMultiPointTiny } from "surrealjs/tiny";

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
