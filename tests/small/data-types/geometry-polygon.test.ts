import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_GEOMETRY_LINE,
  CBOR_TAG_GEOMETRY_POINT,
  CBOR_TAG_GEOMETRY_POLYGON,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  GeometryLine,
  GeometryPoint,
  GeometryPolygon,
} from "@tai-kun/surrealdb/data-types/standard";
import { expect, test } from "vitest";

test(".polygon", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon = new GeometryPolygon([l1, l2, l3, l4]);

  expect(polygon.polygon).toStrictEqual([l1, l2, l3, l4]);
});

test(".coordinates", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon = new GeometryPolygon([l1, l2, l3, l4]);

  expect(polygon.coordinates).toStrictEqual([
    [[0, 0], [1, 0]], // [p1, p2] -> l1
    [[1, 0], [1, 1]], // [p2, p3] -> l2
    [[1, 1], [0, 1]], // [p3, p4] -> l3
    [[0, 1], [0, 0]], // [p4, p1] -> l4
  ]);
});

test(".clone, .equals", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);
  const polygon2 = polygon1.clone();

  expect(polygon1).not.toBe(polygon2);
  expect(polygon1.equals(polygon2)).toBe(true);
});

test(".toJSON", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon = new GeometryPolygon([l1, l2, l3, l4]);

  expect(polygon.toJSON()).toStrictEqual({
    type: "Polygon",
    coordinates: [
      [[0, 0], [1, 0]], // [p1, p2] -> l1
      [[1, 0], [1, 1]], // [p2, p3] -> l2
      [[1, 1], [0, 1]], // [p3, p4] -> l3
      [[0, 1], [0, 0]], // [p4, p1] -> l4
    ],
  });
});

test(".toSurql", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon = new GeometryPolygon([l1, l2, l3, l4]);

  expect(polygon.toSurql()).toBe(
    `{coordinates:[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]],type:'Polygon'}`,
  );
});

test(".toCBOR", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const input = new GeometryPolygon([l1, l2, l3, l4]);
  const output = new GeometryPolygon([l1, l2, l3, l4]);
  const bytes = encode(input);
  const g = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          case CBOR_TAG_GEOMETRY_LINE:
            return new GeometryLine(t.value as any);

          case CBOR_TAG_GEOMETRY_POLYGON:
            return new GeometryPolygon(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});
