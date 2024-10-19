import { isGeometryPoint } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import { CBOR_TAG_GEOMETRY_POINT } from "@tai-kun/surrealdb/encodable-datatypes";
import { GeometryPoint } from "@tai-kun/surrealdb/standard-datatypes";
import { expect, test } from "vitest";

test(".point", () => {
  const g = new GeometryPoint([0, 1]);

  expect(g.point).toStrictEqual([0, 1]);
});

test(".coordinates", () => {
  const g = new GeometryPoint([0, 1]);

  expect(g.coordinates).toStrictEqual([0, 1]);
});

test(".clone, .equals", () => {
  const g1 = new GeometryPoint([0, 1]);
  const g2 = g1.clone();

  expect(g1).not.toBe(g2);
  expect(g1.equals(g2)).toBe(true);
});

test(".toJSON", () => {
  const g = new GeometryPoint([0, 1]);

  expect(g.toJSON()).toStrictEqual({
    type: "Point",
    coordinates: [0, 1],
  });
});

test(".toSurql", () => {
  const g = new GeometryPoint([0, 1]);

  expect(g.toSurql()).toBe(`{coordinates:[0,1],type:'Point'}`);
});

test(".toCBOR", () => {
  const input = new GeometryPoint([0, 1]);
  const output = new GeometryPoint([0, 1]);
  const bytes = encode(input);
  const g = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});

test("GeometryPoint であると判定できる", () => {
  expect(isGeometryPoint(new GeometryPoint([0, 1]))).toBe(true);
  expect(isGeometryPoint({ type: "GeometryPoint", coordinates: [0, 1] }))
    .toBe(false);
});
