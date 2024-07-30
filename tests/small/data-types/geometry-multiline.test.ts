import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_GEOMETRY_LINE,
  CBOR_TAG_GEOMETRY_MULTILINE,
  CBOR_TAG_GEOMETRY_POINT,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  GeometryLine,
  GeometryMultiLine,
  GeometryPoint,
} from "@tai-kun/surrealdb/data-types/standard";
import { expect, test } from "vitest";

test(".lines", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);
  const p4 = new GeometryPoint([3, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p3, p4]);

  const ml = new GeometryMultiLine([l1, l2]);

  expect(ml.lines).toStrictEqual([l1, l2]);
});

test(".coordinates", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);
  const p4 = new GeometryPoint([3, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p3, p4]);

  const ml = new GeometryMultiLine([l1, l2]);

  expect(ml.coordinates)
    .toStrictEqual([[[0, 0], [1, 1]], [[2, 2], [3, 3]]]);
});

test(".clone, .equals", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);
  const p4 = new GeometryPoint([3, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p3, p4]);

  const ml1 = new GeometryMultiLine([l1, l2]);
  const ml2 = ml1.clone();

  expect(ml1).not.toBe(ml2);
  expect(ml1.equals(ml2)).toBe(true);
});

test(".toJSON", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);
  const p4 = new GeometryPoint([3, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p3, p4]);

  const ml = new GeometryMultiLine([l1, l2]);

  expect(ml.toJSON()).toStrictEqual({
    type: "MultiLineString",
    coordinates: [[[0, 0], [1, 1]], [[2, 2], [3, 3]]],
  });
});

test(".toSurql", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);
  const p4 = new GeometryPoint([3, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p3, p4]);

  const ml = new GeometryMultiLine([l1, l2]);

  expect(ml.toSurql()).toBe(
    `{coordinates:[[[0,0],[1,1]],[[2,2],[3,3]]],type:'MultiLineString'}`,
  );
});

test(".toCBOR", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 1]);
  const p3 = new GeometryPoint([2, 2]);
  const p4 = new GeometryPoint([3, 3]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p3, p4]);

  const input = new GeometryMultiLine([l1, l2]);
  const output = new GeometryMultiLine([l1, l2]);
  const bytes = encode(input);
  const dt = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          case CBOR_TAG_GEOMETRY_LINE:
            return new GeometryLine(t.value as any);

          case CBOR_TAG_GEOMETRY_MULTILINE:
            return new GeometryMultiLine(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(dt).toStrictEqual(output);
});
