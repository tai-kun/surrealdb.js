import { isGeometryMultiLine } from "@tai-kun/surreal";
import {
  GeometryLine,
  GeometryMultiLine,
  GeometryPoint,
} from "@tai-kun/surreal/values/full";
import { GeometryMultiLine as GeometryMultiLineStandard } from "@tai-kun/surreal/values/standard";
import { GeometryMultiLine as GeometryMultiLineTiny } from "@tai-kun/surreal/values/tiny";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("GeometryMultiLine を作成する", () => {
  const multiLine = new GeometryMultiLine([
    new GeometryLine([
      new GeometryPoint([1, 2]),
    ]),
  ]);

  assert(multiLine instanceof GeometryMultiLine);
  assert.jsonEqual(multiLine, {
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
