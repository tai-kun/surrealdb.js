import {
  CONTINUE,
  decode,
  type DecodeOptions,
  encode,
  type EncodeOptions,
  Tagged,
} from "@tai-kun/surrealdb/cbor";
import type {
  DatetimeSource,
  DecimalSource,
  DurationSource,
  TableSource,
  ThingSource,
  UuidSource,
} from "@tai-kun/surrealdb/data-types/decode-only";
import {
  CBOR_TAG_CUSTOM_DATETIME,
  CBOR_TAG_CUSTOM_DURATION,
  CBOR_TAG_GEOMETRY_COLLECTION,
  CBOR_TAG_GEOMETRY_LINE,
  CBOR_TAG_GEOMETRY_MULTILINE,
  CBOR_TAG_GEOMETRY_MULTIPOINT,
  CBOR_TAG_GEOMETRY_MULTIPOLYGON,
  CBOR_TAG_GEOMETRY_POINT,
  CBOR_TAG_GEOMETRY_POLYGON,
  CBOR_TAG_NONE,
  CBOR_TAG_RECORDID,
  CBOR_TAG_STRING_DECIMAL,
  CBOR_TAG_STRING_DURATION,
  CBOR_TAG_STRING_UUID,
  CBOR_TAG_TABLE,
} from "@tai-kun/surrealdb/data-types/encodable";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { Data, Formatter } from "@tai-kun/surrealdb/formatter";
import { isArrayBuffer, isBrowser } from "@tai-kun/surrealdb/utils";

export interface CborDataTypes {
  readonly Uuid: new(_: UuidSource) => any;
  readonly Table: new(_: TableSource) => any;
  readonly Thing: new(_: ThingSource) => any;
  readonly Decimal: new(_: DecimalSource) => any;
  readonly Datetime: new(_: DatetimeSource) => any;
  readonly Duration: new(_: DurationSource) => any;
  // TODO(tai-kun): Geometry???Source を追加
  readonly GeometryLine: new(_: any) => any;
  readonly GeometryPoint: new(_: any) => any;
  readonly GeometryPolygon: new(_: any) => any;
  readonly GeometryMultiLine: new(_: any) => any;
  readonly GeometryMultiPoint: new(_: any) => any;
  readonly GeometryCollection: new(_: any) => any;
  readonly GeometryMultiPolygon: new(_: any) => any;
}

export interface CborFormatterOptions extends CborDataTypes {
  readonly encode?: EncodeOptions | undefined;
  readonly decode?: DecodeOptions | undefined;
}

export default class CborFormatter implements Formatter {
  protected dataTypes: CborDataTypes;
  protected encodeOptions: EncodeOptions;
  protected decodeOptions: DecodeOptions;

  mimeType = "application/cbor";
  wsFormat = "cbor";

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
        tagged: (t: Tagged<any>) => {
          switch (t.tag) {
            case CBOR_TAG_NONE:
              return undefined;

            case CBOR_TAG_TABLE:
              return new Table(t.value);

            case CBOR_TAG_RECORDID:
              return new Thing(t.value);

            case CBOR_TAG_STRING_UUID:
              return new Uuid(t.value);

            case CBOR_TAG_STRING_DECIMAL:
              return new Decimal(t.value);

            case CBOR_TAG_CUSTOM_DATETIME:
              return new Datetime(t.value);

            case CBOR_TAG_STRING_DURATION:
              return new Duration(t.value);

            case CBOR_TAG_CUSTOM_DURATION:
              return new Duration(t.value);

            case CBOR_TAG_GEOMETRY_POINT:
              return new GeometryPoint(t.value);

            case CBOR_TAG_GEOMETRY_LINE:
              return new GeometryLine(t.value);

            case CBOR_TAG_GEOMETRY_POLYGON:
              return new GeometryPolygon(t.value);

            case CBOR_TAG_GEOMETRY_MULTIPOINT:
              return new GeometryMultiPoint(t.value);

            case CBOR_TAG_GEOMETRY_MULTILINE:
              return new GeometryMultiLine(t.value);

            case CBOR_TAG_GEOMETRY_MULTIPOLYGON:
              return new GeometryMultiPolygon(t.value);

            case CBOR_TAG_GEOMETRY_COLLECTION:
              return new GeometryCollection(t.value);

            default:
              return CONTINUE;
          }
        },
      },
      ...decode,
    };
  }

  encodeSync(
    data: unknown,
    options: EncodeOptions | undefined = {},
  ): Uint8Array {
    return encode(data, {
      ...this.encodeOptions,
      // TODO(tai-kun): options から undefined を持つプロパティを取り除く
      ...options,
    });
  }

  decodeSync(
    data: Data,
    options: DecodeOptions | undefined = {},
  ): unknown {
    if (typeof data === "string") {
      data = stringToArrayBuffer(data);
    } else if (!isBrowser()) {
      if (data instanceof Buffer) {
        data = bufferToArrayBuffer(data);
      } else if (Array.isArray(data)) {
        data = buffersToArrayBuffer(data);
      }
    }

    if (!isArrayBuffer(data)) {
      throw new SurrealTypeError(
        "string | ArrayBuffer | Buffer | Buffer[]",
        typeof data,
      );
    }

    return decode(new Uint8Array(data), {
      ...this.decodeOptions,
      // TODO(tai-kun): options から undefined を持つプロパティを取り除く
      ...options,
    });
  }
}

const encoder = /* @__PURE__ */ new TextEncoder();

function stringToArrayBuffer(string: string): ArrayBuffer {
  return encoder.encode(string).buffer;
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

function buffersToArrayBuffer(buffers: Buffer[]): ArrayBuffer {
  return bufferToArrayBuffer(Buffer.concat(buffers));
}
