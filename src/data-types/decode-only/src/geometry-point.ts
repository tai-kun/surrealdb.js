import { defineAsGeometryPoint } from "~/data-types/_internals/define";
import {
  type Coord,
  coord,
  type CoordArg,
  type CoordValue,
  type Geometry,
  map,
} from "~/data-types/_internals/geometry";

export type GeometryPointTypes<C extends Coord = Coord> = {
  readonly Coord: C;
};

export type GeometryPointSource<
  T extends GeometryPointTypes = GeometryPointTypes,
> = readonly [
  x: CoordArg<T["Coord"]> | CoordValue<T["Coord"]>,
  y: CoordArg<T["Coord"]> | CoordValue<T["Coord"]>,
];

export class GeometryPointBase<T extends GeometryPointTypes>
  implements Geometry
{
  readonly type = "Point" as const;

  readonly point: readonly [
    x: CoordValue<T["Coord"]>,
    y: CoordValue<T["Coord"]>,
  ];

  constructor(source: GeometryPointSource<T>, readonly types: T) {
    this.point = map(source, arg => coord(types.Coord, arg));
    defineAsGeometryPoint(this);
  }
}

export class GeometryPoint
  extends GeometryPointBase<GeometryPointTypes<typeof Number>>
{
  static readonly Coord = Number;

  constructor(source: GeometryPointSource<typeof GeometryPoint>) {
    super(source, GeometryPoint);
  }
}
