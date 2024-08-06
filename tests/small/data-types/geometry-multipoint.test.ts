import { isGeometryMultiPoint } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_GEOMETRY_MULTIPOINT,
  CBOR_TAG_GEOMETRY_POINT,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  GeometryMultiPoint,
  GeometryPoint,
} from "@tai-kun/surrealdb/data-types/standard";
import { expect, test } from "vitest";

test(".points", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);

  const mp = new GeometryMultiPoint([p1, p2, p3]);

  expect(mp.points).toStrictEqual([p1, p2, p3]);
});

test(".coordinates", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);

  const mp = new GeometryMultiPoint([p1, p2, p3]);

  expect(mp.coordinates).toStrictEqual([[0, 0], [1, 1], [2, 2]]);
});

test(".clone, .equals", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);

  const mp1 = new GeometryMultiPoint([p1, p2, p3]);
  const mp2 = mp1.clone();

  expect(mp1).not.toBe(mp2);
  expect(mp1.equals(mp2)).toBe(true);
});

test(".toJSON", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);

  const mp = new GeometryMultiPoint([p1, p2, p3]);

  expect(mp.toJSON()).toStrictEqual({
    type: "MultiPoint",
    coordinates: [[0, 0], [1, 1], [2, 2]],
  });
});

test(".toCBOR", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);

  const input = new GeometryMultiPoint([p1, p2, p3]);
  const output = new GeometryMultiPoint([p1, p2, p3]);
  const bytes = encode(input);
  const g = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          case CBOR_TAG_GEOMETRY_MULTIPOINT:
            return new GeometryMultiPoint(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});

test("GeometryMultiPoint であると判定できる", () => {
  expect(isGeometryMultiPoint(new GeometryMultiPoint([]))).toBe(true);
  expect(isGeometryMultiPoint({ type: "GeometryMultiPoint", coordinates: [] }))
    .toBe(false);
});
