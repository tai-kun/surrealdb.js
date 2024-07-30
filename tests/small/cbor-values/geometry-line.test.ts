import { decode, encode } from "@tai-kun/surreal/cbor";
import {
  TAG_GEOMETRY_LINE,
  TAG_GEOMETRY_POINT,
} from "@tai-kun/surreal/cbor-values/encodable";
import {
  GeometryLine,
  GeometryPoint,
} from "@tai-kun/surreal/cbor-values/standard";
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
          case TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          case TAG_GEOMETRY_LINE:
            return new GeometryLine(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});
