import { isGeometryPoint } from "@tai-kun/surreal";
import { Decimal, GeometryPoint } from "@tai-kun/surreal/values/full";
import { GeometryPoint as GeometryPointStandard } from "@tai-kun/surreal/values/standard";
import { GeometryPoint as GeometryPointTiny } from "@tai-kun/surreal/values/tiny";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("GeometryPoint を作成する", () => {
  const point = new GeometryPoint([1, 2]);

  assert(point instanceof GeometryPoint);
  assert(point.x instanceof Decimal);
  assert(point.y instanceof Decimal);
  assert.jsonEqual(point, {
    type: "Point",
    coordinates: ["1", "2"],
  });
});

test("GeometryPoint の座標を変更する", () => {
  const point = new GeometryPoint([1, 2]);
  const prevPoint = point.point;
  point.x = 3;
  point.y = "4";

  assert.notEqual(point.point, prevPoint, "配列自体が変更されている");
  assert.jsonEqual(point, {
    type: "Point",
    coordinates: ["3", "4"],
  });
});

test("GeometryPoint であると判定する", () => {
  assert(isGeometryPoint(new GeometryPoint([1, 2])));
  assert(isGeometryPoint(new GeometryPointStandard([1, 2])));
  assert(isGeometryPoint(new GeometryPointTiny([1, 2])));

  assert(!isGeometryPoint({}));
  assert(
    !isGeometryPoint({
      type: "Point",
      coordinates: [1, 2],
    }),
  );
});
