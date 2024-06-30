import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";
import { isGeometryMultiLine } from "surreal-js";
import {
  GeometryLine,
  GeometryMultiLine,
  GeometryPoint,
} from "surreal-js/full";
import { GeometryMultiLine as GeometryMultiLineStandard } from "surreal-js/standard";
import { GeometryMultiLine as GeometryMultiLineTiny } from "surreal-js/tiny";

test("GeometryMultiLine を作成する", () => {
  const multiLine = new GeometryMultiLine([
    new GeometryLine([
      new GeometryPoint([1, 2]),
    ]),
  ]);

  assertInstanceOf(multiLine, GeometryMultiLine);
  assertJsonEquals(multiLine, {
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
