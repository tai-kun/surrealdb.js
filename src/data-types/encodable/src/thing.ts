import {
  Thing as Base,
  type ThingIdSource,
  type ThingSource,
  type ThingTbSource,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { escapeRid, quoteStr } from "@tai-kun/surrealdb/utils";
import { escapeId, toString } from "~/data-types/_internals/thing";
import { CBOR_TAG_RECORDID, type Encodable } from "./spec";

export type { ThingIdSource, ThingSource, ThingTbSource };

export default class Thing<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> extends Base<T, I> implements Encodable {
  override valueOf(): string {
    return this.toString();
  }

  override toString(): string {
    return toString(this);
  }

  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: string): string;
  [Symbol.toPrimitive](hint: string): string {
    switch (hint) {
      case "string":
      case "default":
        return this.toString();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_RECORDID,
    value: [tb: string, id: unknown] | string,
  ] {
    // ID ジェネレーターを使いたければ surql`${surql.raw(<...>)}` を使う。
    return [CBOR_TAG_RECORDID, [this.tb, this.id]];
  }

  toJSON(): string {
    return this.toString();
  }

  toSurql(): string {
    return "r" + quoteStr(this.toString());
  }

  toPlain(
    options?: {
      readonly escape?: undefined | false | {
        readonly tb?: boolean | undefined;
        readonly id?: false | undefined;
      };
    },
  ): {
    tb: string;
    id: unknown;
  };

  toPlain(
    options?: {
      readonly escape?: undefined | true | {
        readonly tb?: boolean | undefined;
        readonly id: true;
      };
    },
  ): {
    tb: string;
    id: string;
  };

  toPlain(
    options: {
      readonly escape?: undefined | boolean | {
        readonly tb?: boolean | undefined;
        readonly id?: boolean | undefined;
      };
    } = {},
  ): {
    tb: string;
    id: any;
  } {
    let tb: string = this.tb, id: unknown = this.id;
    const escape = options.escape && (
      options.escape === true
        ? { tb: true, id: true }
        : options.escape
    );

    if (escape) {
      if (escape.tb) {
        tb = escapeRid(tb);
      }

      if (escape.id) {
        tb = escapeId(id);
      }
    }

    return {
      tb,
      id,
    };
  }
}
