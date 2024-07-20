import type Payload from "../../_shared/Payload";
import type { Formatter } from "../../_shared/types";
import decode, { type DecodeOptions } from "./decode";
import encode, { type EncodeOptions } from "./encode";

// Tags from the spec - https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml
const TAG_IANA_DATETIME = 0; // text string
const TAG_IANA_UUID = 37; // byte string

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
 * COBR エンコード/デコードする値。
 */
export interface CborDataTypes {
  readonly Datetime: new(value: any) => any;
  readonly Table: new(value: any) => any;
  readonly Thing: new(tb: any, id: any) => any;
  readonly Uuid: new(value: any) => any;
  readonly Decimal: new(value: any) => any;
  readonly Duration: new(value: any) => any;
  readonly GeometryPoint: new(value: any) => any;
  readonly GeometryLine: new(value: any) => any;
  readonly GeometryPolygon: new(value: any) => any;
  readonly GeometryMultiPoint: new(value: any) => any;
  readonly GeometryMultiLine: new(value: any) => any;
  readonly GeometryMultiPolygon: new(value: any) => any;
  readonly GeometryCollection: new(value: any) => any;
}

export interface CborFormatterOptions extends CborDataTypes {
  readonly encode?: EncodeOptions | undefined;
  readonly decode?: DecodeOptions | undefined;
}

/**
 * CBOR 形式のデータのシリアライザーとデシリアライザー。
 */
export default class CborFormatter implements Formatter {
  protected dataTypes: CborDataTypes;
  protected encodeOptions: EncodeOptions;
  protected decodeOptions: DecodeOptions;

  mimeType: string = "application/cbor";
  wsFormat: string = "cbor";

  constructor(options: CborFormatterOptions) {
    const {
      encode = {},
      decode = {},
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
    } = options;
    this.dataTypes = {
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
    };
    this.encodeOptions = encode;
    this.decodeOptions = {
      reviver: {
        tagged: v => {
          switch (v.tag) {
            case TAG_IANA_DATETIME:
              return new Datetime(v.value);

            case TAG_IANA_UUID:
              return new Uuid(v.value);

            case TAG_NONE:
              return undefined;

            case TAG_TABLE:
              return new Table(v.value);

            case TAG_RECORDID:
              return new Thing((v.value as any)[0], (v.value as any)[1]);

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
          }
        },
      },
      ...decode,
    };
  }

  encode(data: unknown, options: EncodeOptions | undefined = {}): ArrayBuffer {
    return encode(data, {
      ...this.encodeOptions,
      // TODO(tai-kun): options から undefined を持つプロパティを取り除く
      ...options,
    }).buffer;
  }

  async decode(
    payload: Payload,
    options: DecodeOptions | undefined = {},
  ): Promise<unknown> {
    return decode(new Uint8Array(await payload.arrayBuffer()), {
      ...this.decodeOptions,
      // TODO(tai-kun): options から undefined を持つプロパティを取り除く
      ...options,
    });
  }
}
