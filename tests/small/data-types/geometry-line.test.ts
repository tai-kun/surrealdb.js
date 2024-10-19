import { isGeometryLine } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_GEOMETRY_LINE,
  CBOR_TAG_GEOMETRY_POINT,
} from "@tai-kun/surrealdb/encodable-datatypes";
import {
  GeometryLine,
  GeometryPoint,
} from "@tai-kun/surrealdb/standard-datatypes";
import { expect, test } from "vitest";

test(".line", () => {
  const p1 = new GeometryPoint([0, 1]);
  const p2 = new GeometryPoint([2, 3]);

  const l = new GeometryLine([p1, p2]);

  expect(l.line).toStrictEqual([p1, p2]);
});

test(".coordinates", () => {
  const p1 = new GeometryPoint([0, 1]);
  const p2 = new GeometryPoint([2, 3]);

  const l = new GeometryLine([p1, p2]);

  expect(l.coordinates).toStrictEqual([[0, 1], [2, 3]]);
});

test(".clone, .equals", () => {
  const p1 = new GeometryPoint([0, 1]);
  const p2 = new GeometryPoint([2, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = l1.clone();

  expect(l1).not.toBe(l2);
  expect(l1.equals(l2)).toBe(true);
});

test(".toJSON", () => {
  const p1 = new GeometryPoint([0, 1]);
  const p2 = new GeometryPoint([2, 3]);

  const l = new GeometryLine([p1, p2]);

  expect(l.toJSON()).toStrictEqual({
    type: "LineString",
    coordinates: [[0, 1], [2, 3]],
  });
});

test(".toCBOR", () => {
  const p1 = new GeometryPoint([0, 1]);
  const p2 = new GeometryPoint([2, 3]);

  const input = new GeometryLine([p1, p2]);
  const output = new GeometryLine([p1, p2]);
  const bytes = encode(input);
  const g = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          case CBOR_TAG_GEOMETRY_LINE:
            return new GeometryLine(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});

test(".close, .toClosed, isClosed", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([0, 1]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([1, 0]);

  const l1 = new GeometryLine([p1, p2, p3, p4]);

  expect(l1.isClosed()).toBe(false);

  const l2 = l1.toClosed();
  l1.close();

  expect(l1.coordinates).toStrictEqual([
    [0, 0], // 始点
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0], // 終点
  ]);
  expect(l1.isClosed()).toBe(true);
  expect(l2.isClosed()).toBe(true);
  expect(l2).not.toBe(l1);
  expect(l2.equals(l1)).toBe(true);
});

test("GeometryLine であると判定できる", () => {
  expect(
    isGeometryLine(
      new GeometryLine([
        new GeometryPoint([0, 0]),
        new GeometryPoint([0, 0]),
      ]),
    ),
  ).toBe(true);
  expect(isGeometryLine({
    type: "GeometryLine",
    coordinates: [
      [0, 0],
      [0, 0],
    ],
  })).toBe(false);
});
