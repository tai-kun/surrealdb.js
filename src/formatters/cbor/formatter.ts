import {
  CONTINUE,
  decode,
  type DecodeOptions as CborDecodeOptions,
  decodeStream,
  encode,
  type EncodeOptions as CborEncodeOptions,
  Tagged,
} from "@tai-kun/surrealdb/cbor";
import type {
  DatetimeSource,
  DecimalSource,
  DurationSource,
  GeometryLineSource,
  GeometryMultiLineSource,
  GeometryMultiPointSource,
  GeometryMultiPolygonSource,
  GeometryPointSource,
  GeometryPolygonSource,
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
  CBOR_TAG_SPEC_UUID,
  CBOR_TAG_STRING_DECIMAL,
  CBOR_TAG_STRING_DURATION,
  CBOR_TAG_TABLE,
} from "@tai-kun/surrealdb/data-types/encodable";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import {
  type Data,
  EncodedCBOR,
  type Formatter,
} from "@tai-kun/surrealdb/formatter";
import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import {
  isArrayBuffer,
  type StatefulPromise,
  utf8,
} from "@tai-kun/surrealdb/utils";

const hasBuffer = typeof Buffer !== "undefined";

export interface CborDataTypes {
  readonly Uuid: new(source: UuidSource) => any;
  readonly Table: new(source: TableSource) => any;
  readonly Thing: new(source: ThingSource) => any;
  readonly Decimal: new(source: DecimalSource) => any;
  readonly Datetime: new(source: DatetimeSource) => any;
  readonly Duration: new(source: DurationSource) => any;
  readonly GeometryLine: new(source: GeometryLineSource) => any;
  readonly GeometryPoint: new(source: GeometryPointSource) => any;
  readonly GeometryPolygon: new(source: GeometryPolygonSource) => any;
  readonly GeometryMultiLine: new(source: GeometryMultiLineSource) => any;
  readonly GeometryMultiPoint: new(source: GeometryMultiPointSource) => any;
  readonly GeometryCollection: new(source: any) => any;
  readonly GeometryMultiPolygon: new(source: GeometryMultiPolygonSource) => any;
}

export interface EncodeOptions extends CborEncodeOptions {}

export interface DecodeOptions extends CborDecodeOptions {
  readonly streamThreshold?: number | undefined;
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
    this.decodeOptions = Object.assign({
      reviver: {
        tagged: (t: Tagged<any>) => {
          switch (t.tag) {
            case CBOR_TAG_NONE:
              return undefined;

            case CBOR_TAG_TABLE:
              return new Table(t.value);

            case CBOR_TAG_RECORDID:
              return new Thing(t.value);

            case CBOR_TAG_SPEC_UUID:
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
    }, decode);
  }

  toEncoded<T = unknown>(data: T): EncodedCBOR<T> {
    if (data instanceof EncodedCBOR) {
      return data;
    }

    return new EncodedCBOR(
      this.encodeSync(data),
      function toCBOR(w) {
        w.writeBytes(this);
      },
    );
  }

  encodeSync(data: unknown): Uint8Array {
    return encode(data, this.encodeOptions);
  }

  decodeSync(data: Data): unknown {
    return decode(toEncodedData(data), this.decodeOptions);
  }

  decodeStream(
    data: ReadableStream<Uint8Array>,
    signal: AbortSignal,
  ): StatefulPromise<unknown> {
    return decodeStream(data, Object.assign({ signal }, this.decodeOptions));
  }

  // /** @experimental */
  // decodingStrategy(ctx: DecodingContext): DecodingStrategy {
  //   // TODO(tai-kun): 8 KiB は適当。要調整。
  //   if (ctx.length > (this.decodeOptions.streamThreshold || 8192)) {
  //     return "stream";
  //   }

  //   return "sync";
  // }
}

function toEncodedData(data: Data): Uint8ArrayLike {
  switch (true) {
    case data instanceof Uint8Array:
      return hasBuffer && data instanceof Buffer
        ? new Uint8Array(data)
        : data as Uint8Array;

    case isArrayBuffer(data):
      return new Uint8Array(data);

    case hasBuffer
      && Array.isArray(data)
      && data.every(b => Buffer.isBuffer(b)):
      return Buffer.concat(data);

    case typeof data === "string":
      return utf8.encode(data);

    default:
      throw new SurrealTypeError(
        ["String", "Buffer", "ArrayBuffer", "Uint8Array", "Buffer[]"],
        data,
      );
  }
}