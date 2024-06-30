import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";
import { isGeometryLine } from "surreal-js";
import { GeometryLine, GeometryPoint } from "surreal-js/full";
import { GeometryLine as GeometryLineStandard } from "surreal-js/standard";
import { GeometryLine as GeometryLineTiny } from "surreal-js/tiny";

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
