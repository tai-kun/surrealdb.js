import { isGeometryMultiLine } from "@tai-kun/surreal";
import {
  GeometryLine,
  GeometryMultiLine,
  GeometryPoint,
} from "@tai-kun/surreal/full";
import { GeometryMultiLine as GeometryMultiLineStandard } from "@tai-kun/surreal/standard";
import { GeometryMultiLine as GeometryMultiLineTiny } from "@tai-kun/surreal/tiny";
import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";

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
