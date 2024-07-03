import { decode, encode, OMIT_VALUE, TaggedValue } from "cbor-redux";
import { UnknownCborTag } from "~/errors";
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
} from "~/index/values";
import type Payload from "./_lib/Payload";
import type { Formatter } from "./_lib/types";

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
 * COBR でエンコード/デコードする値。
 */
export type CborValues = {
  Datetime: new(value: any) => any;
  Table: new(value: any) => any;
  Thing: new(tb: any, id: any) => any;
  Uuid: new(value: any) => any;
  Decimal: new(value: any) => any;
  Duration: new(value: any) => any;
  GeometryPoint: new(value: any) => any;
  GeometryLine: new(value: any) => any;
  GeometryPolygon: new(value: any) => any;
  GeometryMultiPoint: new(value: any) => any;
  GeometryMultiLine: new(value: any) => any;
  GeometryMultiPolygon: new(value: any) => any;
  GeometryCollection: new(value: any) => any;
};

/**
 * CBOR 形式のデータのエンコーダーとデコーダーを作成します。
 *
 * @param values CBOR でエンコード/デコードする特定の値。
 */
export default function createCborFormatter(
  values: Readonly<CborValues>,
): Formatter {
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
  } = values;

  return {
    mimeType: "application/cbor",
    wsFormat: "cbor",
    encode(data: unknown): ArrayBuffer {
      return encode(data, (k, v: unknown) => {
        if (k === "__proto__" || k === "constructor" || k === "prototype") {
          return OMIT_VALUE;
        }

        switch (true) {
          case isDatetime(v):
            // TODO(tai-kun): Handle invalid dates
            return new TaggedValue(
              [
                v.seconds,
                v.nanoseconds,
              ],
              TAG_CUSTOM_DATETIME,
            );

          case v instanceof Date:
            // TODO(tai-kun): Handle invalid dates
            return new TaggedValue(
              [
                Math.trunc(v.getTime() / 1000),
                v.getUTCMilliseconds() * 1_000_000,
              ],
              TAG_CUSTOM_DATETIME,
            );

          case v === undefined:
            return new TaggedValue(null, TAG_NONE);

          case isTable(v):
            return new TaggedValue(v.name, TAG_TABLE);

          case isThing(v):
            return new TaggedValue([v.tb, v.id], TAG_RECORDID);

          case isUuid(v):
            return new TaggedValue(v.bytes.buffer, TAG_SPEC_UUID);

          case isDecimal(v):
            return new TaggedValue(v.valueOf(), TAG_STRING_DECIMAL);

          case isDuration(v):
            return new TaggedValue(
              [
                v.seconds,
                v.nanoseconds,
              ],
              TAG_CUSTOM_DURATION,
            );

          case isGeometryPoint(v):
            return new TaggedValue(v.point, TAG_GEOMETRY_POINT);

          case isGeometryLine(v):
            return new TaggedValue(v.line, TAG_GEOMETRY_LINE);

          case isGeometryPolygon(v):
            return new TaggedValue(v.polygon, TAG_GEOMETRY_POLYGON);

          case isGeometryMultiPoint(v):
            return new TaggedValue(v.points, TAG_GEOMETRY_MULTIPOINT);

          case isGeometryMultiLine(v):
            return new TaggedValue(v.lines, TAG_GEOMETRY_MULTILINE);

          case isGeometryMultiPolygon(v):
            return new TaggedValue(v.polygons, TAG_GEOMETRY_MULTIPOLYGON);

          case isGeometryCollection(v):
            return new TaggedValue(v.collection, TAG_GEOMETRY_COLLECTION);

          default:
            return v;
        }
      });
    },
    async decode(payload: Payload): Promise<unknown> {
      return decode(await payload.arrayBuffer(), (k, v) => {
        if (k === "__proto__" || k === "constructor" || k === "prototype") {
          return;
        }

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
    },
  };
}
