import { defineAsGeometryPoint } from "../_internals/define";
import {
  type Coord,
  coord,
  type CoordArg,
  type CoordValue,
  type Geometry,
  map,
} from "../_internals/geometry";

export type GeometryPointTypes<TCoord extends Coord = Coord> = {
  readonly Coord: TCoord;
};

export type GeometryPointSource<
  TTypes extends GeometryPointTypes = GeometryPointTypes,
> = readonly [
  x: CoordArg<TTypes["Coord"]> | CoordValue<TTypes["Coord"]>,
  y: CoordArg<TTypes["Coord"]> | CoordValue<TTypes["Coord"]>,
];

export class GeometryPointBase<TTypes extends GeometryPointTypes>
  implements Geometry
{
  readonly type = "Point" as const;

  readonly point: readonly [
    x: CoordValue<TTypes["Coord"]>,
    y: CoordValue<TTypes["Coord"]>,
  ];

  constructor(source: GeometryPointSource<TTypes>, readonly types: TTypes) {
    this.point = map(source, arg => coord(types.Coord, arg));
    defineAsGeometryPoint(this);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-point)
 */
export class GeometryPoint
  extends GeometryPointBase<GeometryPointTypes<typeof Number>>
{
  static readonly Coord = Number;

  constructor(source: GeometryPointSource<typeof GeometryPoint>) {
    super(source, GeometryPoint);
  }
}
