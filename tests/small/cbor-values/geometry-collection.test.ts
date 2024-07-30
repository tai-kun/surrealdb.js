import { decode, encode } from "@tai-kun/surreal/cbor";
import {
  TAG_GEOMETRY_COLLECTION,
  TAG_GEOMETRY_LINE,
  TAG_GEOMETRY_MULTILINE,
  TAG_GEOMETRY_MULTIPOINT,
  TAG_GEOMETRY_MULTIPOLYGON,
  TAG_GEOMETRY_POINT,
  TAG_GEOMETRY_POLYGON,
} from "@tai-kun/surreal/cbor-values/encodable";
import {
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
} from "@tai-kun/surreal/cbor-values/standard";
import { expect, test } from "vitest";

test(".collection", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const multiPoint = new GeometryMultiPoint([p1, p2, p3, p4]);
  const multiLine = new GeometryMultiLine([l1, l2, l3, l4]);
  const multiPolygon = new GeometryMultiPolygon([polygon1]);

  const c = new GeometryCollection([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);

  expect(c.collection).toStrictEqual([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);
});

test(".geometries", () => {
  const p1 = new GeometryPoint([0, 0]);
  const p2 = new GeometryPoint([1, 0]);
  const p3 = new GeometryPoint([1, 1]);
  const p4 = new GeometryPoint([0, 1]);

  const l1 = new GeometryLine([p1, p2]);
  const l2 = new GeometryLine([p2, p3]);
  const l3 = new GeometryLine([p3, p4]);
  const l4 = new GeometryLine([p4, p1]);

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const multiPoint = new GeometryMultiPoint([p1, p2, p3, p4]);
  const multiLine = new GeometryMultiLine([l1, l2, l3, l4]);
  const multiPolygon = new GeometryMultiPolygon([polygon1]);

  const c = new GeometryCollection([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);

  expect(c.geometries).toStrictEqual([
    p1.toJSON(),
    l1.toJSON(),
    polygon1.toJSON(),
    multiPoint.toJSON(),
    multiLine.toJSON(),
    multiPolygon.toJSON(),
  ]);
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

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const multiPoint = new GeometryMultiPoint([p1, p2, p3, p4]);
  const multiLine = new GeometryMultiLine([l1, l2, l3, l4]);
  const multiPolygon = new GeometryMultiPolygon([polygon1]);

  const c = new GeometryCollection([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);

  expect(c.toJSON()).toStrictEqual({
    type: "GeometryCollection",
    geometries: [
      p1.toJSON(),
      l1.toJSON(),
      polygon1.toJSON(),
      multiPoint.toJSON(),
      multiLine.toJSON(),
      multiPolygon.toJSON(),
    ],
  });
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

  const multiPoint = new GeometryMultiPoint([p1, p2, p3, p4]);
  const multiLine = new GeometryMultiLine([l1, l2, l3, l4]);
  const multiPolygon = new GeometryMultiPolygon([polygon1]);

  const c1 = new GeometryCollection([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);
  const c2 = c1.clone();

  expect(c1).not.toBe(c2);
  expect(c1.equals(c2)).toBe(true);
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

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const multiPoint = new GeometryMultiPoint([p1, p2, p3, p4]);
  const multiLine = new GeometryMultiLine([l1, l2, l3, l4]);
  const multiPolygon = new GeometryMultiPolygon([polygon1]);

  const c = new GeometryCollection([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);

  expect(c.toSurql()).toBe(
    `{geometries:[{coordinates:[0,0],type:'Point'},{coordinates:[[0,0],[1,0]],type:'LineString'},{coordinates:[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]],type:'Polygon'},{coordinates:[[0,0],[1,0],[1,1],[0,1]],type:'MultiPoint'},{coordinates:[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]],type:'MultiLineString'},{coordinates:[[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]]],type:'MultiPolygon'}],type:'GeometryCollection'}`,
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

  const polygon1 = new GeometryPolygon([l1, l2, l3, l4]);

  const multiPoint = new GeometryMultiPoint([p1, p2, p3, p4]);
  const multiLine = new GeometryMultiLine([l1, l2, l3, l4]);
  const multiPolygon = new GeometryMultiPolygon([polygon1]);

  const c = new GeometryCollection([
    p1,
    l1,
    polygon1,
    multiPoint,
    multiLine,
    multiPolygon,
  ]);
  const bytes = encode(c);
  const g = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case TAG_GEOMETRY_POINT:
            return new GeometryPoint(t.value as any);

          case TAG_GEOMETRY_LINE:
            return new GeometryLine(t.value as any);

          case TAG_GEOMETRY_POLYGON:
            return new GeometryPolygon(t.value as any);

          case TAG_GEOMETRY_MULTIPOINT:
            return new GeometryMultiPoint(t.value as any);

          case TAG_GEOMETRY_MULTILINE:
            return new GeometryMultiLine(t.value as any);

          case TAG_GEOMETRY_MULTIPOLYGON:
            return new GeometryMultiPolygon(t.value as any);

          case TAG_GEOMETRY_COLLECTION:
            return new GeometryCollection(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(c);
});
