import { isGeometryLine } from "@tai-kun/surreal";
import { GeometryLine, GeometryPoint } from "@tai-kun/surreal/values/full";
import { GeometryLine as GeometryLineStandard } from "@tai-kun/surreal/values/standard";
import { GeometryLine as GeometryLineTiny } from "@tai-kun/surreal/values/tiny";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("GeometryLine を作成する", () => {
  const line = new GeometryLine([new GeometryPoint([1, 2])]);

  assert(line instanceof GeometryLine);
  assert.jsonEqual(line, {
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
