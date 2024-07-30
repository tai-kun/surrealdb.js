import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_GEOMETRY_LINE,
  CBOR_TAG_GEOMETRY_MULTIPOLYGON,
  CBOR_TAG_GEOMETRY_POINT,
  CBOR_TAG_GEOMETRY_POLYGON,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  GeometryLine,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
} from "@tai-kun/surrealdb/data-types/standard";
import { expect, test } from "vitest";

test(".polygons", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);
  const p5 = new GeometryPoint([2, 2]);
  const p6 = new GeometryPoint([3, 2]);
  const p7 = new GeometryPoint([3, 3]);
  const p8 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const l5 = new GeometryLine([p5, p6]);
  const l6 = new GeometryLine([p6, p7]);
  const l7 = new GeometryLine([p7, p8]);
  const l8 = new GeometryLine([p8, p5]);

  const polygon2 = new GeometryPolygon([l5, l6, l7, l8]);

  const mp = new GeometryMultiPolygon([polygon1, polygon2]);

  expect(mp.polygons).toStrictEqual([polygon1, polygon2]);
});

test(".coordinates", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);
  const p5 = new GeometryPoint([2, 2]);
  const p6 = new GeometryPoint([3, 2]);
  const p7 = new GeometryPoint([3, 3]);
  const p8 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const l5 = new GeometryLine([p5, p6]);
  const l6 = new GeometryLine([p6, p7]);
  const l7 = new GeometryLine([p7, p8]);
  const l8 = new GeometryLine([p8, p5]);

  const polygon2 = new GeometryPolygon([l5, l6, l7, l8]);

  const mp = new GeometryMultiPolygon([polygon1, polygon2]);

  expect(mp.coordinates).toStrictEqual([
    [
      [[0, 0], [1, 0]], // [p1, p2] -> l1
      [[1, 0], [1, 1]], // [p2, p3] -> l2
      [[1, 1], [0, 1]], // [p3, p4] -> l3
      [[0, 1], [0, 0]], // [p4, p1] -> l4
    ], // -> polygon1
    [
      [[2, 2], [3, 2]], // [p5, p6] -> l5
      [[3, 2], [3, 3]], // [p6, p7] -> l6
      [[3, 3], [2, 3]], // [p7, p8] -> l7
      [[2, 3], [2, 2]], // [p8, p5] -> l8
    ], // -> polygon2
  ]);
});

test(".clone, .equals", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);
  const p5 = new GeometryPoint([2, 2]);
  const p6 = new GeometryPoint([3, 2]);
  const p7 = new GeometryPoint([3, 3]);
  const p8 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const l5 = new GeometryLine([p5, p6]);
  const l6 = new GeometryLine([p6, p7]);
  const l7 = new GeometryLine([p7, p8]);
  const l8 = new GeometryLine([p8, p5]);

  const polygon2 = new GeometryPolygon([l5, l6, l7, l8]);

  const mp1 = new GeometryMultiPolygon([polygon1, polygon2]);
  const mp2 = mp1.clone();

  expect(mp1).not.toBe(mp2);
  expect(mp1.equals(mp2)).toBe(true);
});

test(".toJSON", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);
  const p5 = new GeometryPoint([2, 2]);
  const p6 = new GeometryPoint([3, 2]);
  const p7 = new GeometryPoint([3, 3]);
  const p8 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const l5 = new GeometryLine([p5, p6]);
  const l6 = new GeometryLine([p6, p7]);
  const l7 = new GeometryLine([p7, p8]);
  const l8 = new GeometryLine([p8, p5]);

  const polygon2 = new GeometryPolygon([l5, l6, l7, l8]);

  const mp = new GeometryMultiPolygon([polygon1, polygon2]);

  expect(mp.toJSON()).toStrictEqual({
    type: "MultiPolygon",
    coordinates: [
      [
        [[0, 0], [1, 0]], // [p1, p2] -> l1
        [[1, 0], [1, 1]], // [p2, p3] -> l2
        [[1, 1], [0, 1]], // [p3, p4] -> l3
        [[0, 1], [0, 0]], // [p4, p1] -> l4
      ], // -> polygon1
      [
        [[2, 2], [3, 2]], // [p5, p6] -> l5
        [[3, 2], [3, 3]], // [p6, p7] -> l6
        [[3, 3], [2, 3]], // [p7, p8] -> l7
        [[2, 3], [2, 2]], // [p8, p5] -> l8
      ], // -> polygon2
    ],
  });
});

test(".toSurql", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);
  const p5 = new GeometryPoint([2, 2]);
  const p6 = new GeometryPoint([3, 2]);
  const p7 = new GeometryPoint([3, 3]);
  const p8 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const l5 = new GeometryLine([p5, p6]);
  const l6 = new GeometryLine([p6, p7]);
  const l7 = new GeometryLine([p7, p8]);
  const l8 = new GeometryLine([p8, p5]);

  const polygon2 = new GeometryPolygon([l5, l6, l7, l8]);

  const mp = new GeometryMultiPolygon([polygon1, polygon2]);

  expect(mp.toSurql()).toBe(
    `{coordinates:[[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]],[[[2,2],[3,2]],[[3,2],[3,3]],[[3,3],[2,3]],[[2,3],[2,2]]]],type:'MultiPolygon'}`,
  );
});

test(".toCBOR", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);
  const p5 = new GeometryPoint([2, 2]);
  const p6 = new GeometryPoint([3, 2]);
  const p7 = new GeometryPoint([3, 3]);
  const p8 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const l5 = new GeometryLine([p5, p6]);
  const l6 = new GeometryLine([p6, p7]);
  const l7 = new GeometryLine([p7, p8]);
  const l8 = new GeometryLine([p8, p5]);

  const polygon2 = new GeometryPolygon([l5, l6, l7, l8]);

  const input = new GeometryMultiPolygon([polygon1, polygon2]);
  const output = new GeometryMultiPolygon([polygon1, polygon2]);
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

          case CBOR_TAG_GEOMETRY_MULTIPOLYGON:
            return new GeometryMultiPolygon(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});
