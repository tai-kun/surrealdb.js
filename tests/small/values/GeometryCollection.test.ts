import { assert, assertInstanceOf, assertJsonEquals } from "@tools/assert";
import { test } from "@tools/test";
import { isGeometryCollection } from "surrealjs";
import {
  GeometryCollection,
  GeometryLine,
  GeometryPoint,
} from "surrealjs/full";
import {
  GeometryCollection as GeometryCollectionStandard,
  GeometryPoint as GeometryPointStandard,
} from "surrealjs/standard";
import {
  GeometryCollection as GeometryCollectionTiny,
  GeometryPoint as GeometryPointTiny,
} from "surrealjs/tiny";

test("GeometryCollection を作成する", () => {
  const collection = new GeometryCollection([
    new GeometryPoint([1, 2]),
    new GeometryLine([]),
  ]);

  assertInstanceOf(collection, GeometryCollection);
  assertJsonEquals(collection, {
    type: "GeometryCollection",
    geometries: [
      {
        type: "Point",
        coordinates: ["1", "2"],
      },
      {
        type: "LineString",
        coordinates: [],
      },
    ],
  });
});

test("GeometryCollection であると判定する", () => {
  assert(isGeometryCollection(
    new GeometryCollection([
      new GeometryPoint([1, 2]),
    ]),
  ));
  assert(isGeometryCollection(
    new GeometryCollectionStandard([
      new GeometryPointStandard([1, 2]),
    ]),
  ));
  assert(isGeometryCollection(
    new GeometryCollectionTiny([
      new GeometryPointTiny([1, 2]),
    ]),
  ));

  assert(!isGeometryCollection({}));
  assert(
    !isGeometryCollection({
      type: "GeometryCollection",
      geometries: [
        {
          type: "Point",
          coordinates: ["1", "2"],
        },
      ],
    }),
  );
});
