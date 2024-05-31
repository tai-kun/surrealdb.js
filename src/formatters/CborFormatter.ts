import { decode, encode, TaggedValue } from "cbor-redux";
import { UnknownCborTag } from "../common/errors";
import type { RpcResponseData } from "../common/RpcResponseData";
import {
  isDatetime,
  isDecimal,
  isDuration,
  isGeometryCollection,
  isGeometryLine,
  isGeometryMultiLine,
  isGeometryMultiPoint,
  isGeometryMultiPolygon,
  isGeometryPoint,
  isGeometryPolygon,
  isTable,
  isThing,
  isUuid,
} from "../values/utils";
import { Formatter } from "./Formatter";

// Tags from the spec - https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml
const TAG_SPEC_DATETIME = 0;
const TAG_SPEC_UUID = 37;

// Custom tags
const TAG_NONE = 6;
const TAG_TABLE = 7;
const TAG_RECORDID = 8;
const TAG_STRING_UUID = 9;
const TAG_STRING_DECIMAL = 10;
// const TAG_BINARY_DECIMAL = 11;
const TAG_CUSTOM_DATETIME = 12;
const TAG_STRING_DURATION = 13;
const TAG_CUSTOM_DURATION = 14;

// Custom Geometries
const TAG_GEOMETRY_POINT = 88;
const TAG_GEOMETRY_LINE = 89;
const TAG_GEOMETRY_POLYGON = 90;
const TAG_GEOMETRY_MULTIPOINT = 91;
const TAG_GEOMETRY_MULTILINE = 92;
const TAG_GEOMETRY_MULTIPOLYGON = 93;
const TAG_GEOMETRY_COLLECTION = 94;

/**
 * Values for CBOR encoding and decoding.
 */
export type CborValues = {
  Datetime: new(value: string | [seconds: number, nanoseconds: number]) => any;
  Table: new(value: string) => any;
  Thing: new(tb: string, id: any) => any;
  Uuid: new(value: Uint8Array | string) => any;
  Decimal: new(value: string) => any;
  Duration: new(value: string | [seconds: bigint, nanoseconds: bigint]) => any;
  GeometryPoint: new(value: any) => any;
  GeometryLine: new(value: any) => any;
  GeometryPolygon: new(value: any) => any;
  GeometryMultiPoint: new(value: any) => any;
  GeometryMultiLine: new(value: any) => any;
  GeometryMultiPolygon: new(value: any) => any;
  GeometryCollection: new(value: any) => any;
};

/**
 * A CBOR formatter for encoding and decoding data.
 */
export class CborFormatter extends Formatter {
  readonly #values: CborValues;

  /**
   * Creates a new CBOR formatter.
   *
   * @param values - The values for encoding and decoding.
   */
  constructor(values: Readonly<CborValues>) {
    super("application/cbor", "cbor");
    this.#values = { ...values };
  }

  encode(data: unknown): ArrayBuffer {
    return encode(data, (_, v: unknown) => {
      switch (true) {
        case isDatetime(v):
          // TODO(tai-kun): Handle invalid dates
          return new TaggedValue(
            [
              Math.floor(v.getTime() / 1000),
              v.getUTCNanoseconds(),
            ],
            TAG_CUSTOM_DATETIME,
          );

        case v instanceof Date:
          // TODO(tai-kun): Handle invalid dates
          return new TaggedValue(
            [
              Math.floor(v.getTime() / 1000),
              (v.getUTCMilliseconds() % 1_000) * 1_000_000,
            ],
            TAG_CUSTOM_DATETIME,
          );

        case v === undefined:
          return new TaggedValue(null, TAG_NONE);

        case isTable(v):
          return new TaggedValue(v.toString(), TAG_TABLE);

        case isThing(v):
          return new TaggedValue([v.tb, v.id], TAG_RECORDID);

        case isUuid(v):
          return new TaggedValue(v.bytes.buffer, TAG_SPEC_UUID);

        case isDecimal(v):
          return new TaggedValue(v.toString(), TAG_STRING_DECIMAL);

        case isDuration(v):
          return new TaggedValue(
            [v.seconds, v.nanoseconds],
            TAG_CUSTOM_DURATION,
          );

        case isGeometryPoint(v):
          return new TaggedValue(v.point, TAG_GEOMETRY_POINT);

        case isGeometryLine(v):
          return new TaggedValue(v.points, TAG_GEOMETRY_LINE);

        case isGeometryPolygon(v):
          return new TaggedValue(v.rings, TAG_GEOMETRY_POLYGON);

        case isGeometryMultiPoint(v):
          return new TaggedValue(v.points, TAG_GEOMETRY_MULTIPOINT);

        case isGeometryMultiLine(v):
          return new TaggedValue(v.lines, TAG_GEOMETRY_MULTILINE);

        case isGeometryMultiPolygon(v):
          return new TaggedValue(v.polygons, TAG_GEOMETRY_MULTIPOLYGON);

        case isGeometryCollection(v):
          return new TaggedValue(v.geometries, TAG_GEOMETRY_COLLECTION);

        default:
          return v;
      }
    });
  }

  async decode(data: RpcResponseData): Promise<unknown> {
    const {
      Uuid,
      Table,
      Thing,
      Decimal,
      Datetime,
      Duration,
      GeometryLine,
      GeometryPoint,
      GeometryPolygon,
      GeometryMultiLine,
      GeometryCollection,
      GeometryMultiPoint,
      GeometryMultiPolygon,
    } = this.#values;

    return decode(await data.arrayBuffer(), (_, v) => {
      if (!(v instanceof TaggedValue)) {
        return v;
      }

      switch (v.tag) {
        case TAG_SPEC_DATETIME:
          return new Datetime(v.value);

        case TAG_SPEC_UUID:
          return new Uuid(new Uint8Array(v.value));

        case TAG_NONE:
          return undefined;

        case TAG_TABLE:
          return new Table(v.value);

        case TAG_RECORDID:
          return new Thing(v.value[0], v.value[1]);

        case TAG_STRING_UUID:
          return new Uuid(v.value);

        case TAG_STRING_DECIMAL:
          return new Decimal(v.value);

        case TAG_CUSTOM_DATETIME:
          return new Datetime(v.value);

        case TAG_STRING_DURATION:
          return new Duration(v.value);

        case TAG_CUSTOM_DURATION:
          return new Duration(v.value);

        case TAG_GEOMETRY_POINT:
          return new GeometryPoint(v.value);

        case TAG_GEOMETRY_LINE:
          return new GeometryLine(v.value);

        case TAG_GEOMETRY_POLYGON:
          return new GeometryPolygon(v.value);

        case TAG_GEOMETRY_MULTIPOINT:
          return new GeometryMultiPoint(v.value);

        case TAG_GEOMETRY_MULTILINE:
          return new GeometryMultiLine(v.value);

        case TAG_GEOMETRY_MULTIPOLYGON:
          return new GeometryMultiPolygon(v.value);

        case TAG_GEOMETRY_COLLECTION:
          return new GeometryCollection(v.value);

        default:
          throw new UnknownCborTag(v.tag);
      }
    });
  }
}
