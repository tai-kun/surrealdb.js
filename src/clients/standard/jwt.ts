import type { Encodable } from "@tai-kun/surrealdb/data-types/encodable";
import { SurrealValueError } from "@tai-kun/surrealdb/errors";
import { base64url, quoteStr } from "@tai-kun/surrealdb/utils";

const JWT_REGEX =
  /^((?:[0-9a-zA-Z_-]{4})*(?:[0-9a-zA-Z_-]{2,3})?)\.((?:[0-9a-zA-Z_-]{4})*(?:[0-9a-zA-Z_-]{2,3})?)\.((?:[0-9a-zA-Z_-]{4})*(?:[0-9a-zA-Z_-]{2,3})?)$/;

export interface JwtHeader {
  typ: "JWT";
  alg: string;
  [p: string]: unknown;
}

export interface JwtPayload {
  iss: "SurrealDB";
  iat: number;
  nbf: number;
  exp: number;
  jti: string;
  NS?: string;
  DB?: string;
  AC?: string;
  ID: string;
  [p: string]: unknown;
}

export interface JwtOptions {
  readonly redactedText?: string | undefined;
}

export default class Jwt implements Encodable {
  static isWellFormed(jwt: string): boolean {
    return typeof jwt === "string" && JWT_REGEX.test(jwt);
  }

  readonly #parts: [header: string, payload: string];
  readonly #cache: {
    header?: JwtHeader;
    payload?: JwtPayload;
    headerJson?: string;
    payloadJson?: string;
  };

  redactedText: string;
  // @ts-expect-error Object.defineProperty で設定する。
  readonly raw: string;

  constructor(jwt: string, options: JwtOptions | undefined = {}) {
    const {
      redactedText = "[REDACTED]",
    } = options;

    if (typeof jwt !== "string" || !JWT_REGEX.test(jwt)) {
      throw new SurrealValueError("well formed JWT", jwt);
    }

    this.#parts = jwt.split(".", 2) as [string, string];
    this.#cache = {};
    this.redactedText = redactedText;
    Object.defineProperty(this, "raw", {
      configurable: false, // 既定値通り再設定を不可にする。
      enumerable: false, // 既定値通り列挙しない。
      value: jwt,
    });
  }

  get header(): JwtHeader {
    if (this.#cache.headerJson === undefined) {
      this.#cache.headerJson = base64url.decode(this.#parts[0]);
      // @ts-expect-error 消す
      this.#parts[0] = null;
    }

    return JSON.parse(this.#cache.headerJson);
  }

  get payload(): JwtPayload {
    if (this.#cache.payloadJson === undefined) {
      this.#cache.payloadJson = base64url.decode(this.#parts[1]);
      // @ts-expect-error 消す
      this.#parts[1] = null;
    }

    return JSON.parse(this.#cache.payloadJson);
  }

  // get #header(): Readonly<JwtHeader> {
  //   return (this.#cache.header ||= this.header);
  // }

  get #payload(): Readonly<JwtPayload> {
    return (this.#cache.payload ||= this.payload);
  }

  get issuer(): "SurrealDB" {
    return this.#payload.iss;
  }

  get issuedAt(): number {
    return this.#payload.iat;
  }

  get notBefore(): number {
    return this.#payload.nbf;
  }

  get expiresAt(): number {
    return this.#payload.exp;
  }

  get namespace(): string | undefined {
    return this.#payload.NS;
  }

  get database(): string | undefined {
    return this.#payload.DB;
  }

  get access(): string | undefined {
    return this.#payload.AC;
  }

  get user(): string {
    return this.#payload.ID;
  }

  get id(): string {
    return this.#payload.jti;
  }

  getMillisecondsUntilExpiration(): number {
    return this.expiresAt * 1000 - Date.now();
  }

  getSecondsUntilExpiration(): number {
    return this.expiresAt - Math.floor(Date.now() / 1000);
  }

  getExpirationDate(): Date {
    return new Date(this.expiresAt * 1000);
  }

  toString(): string {
    return this.redactedText;
  }

  toCBOR(): [redactedText: string] {
    return [this.redactedText];
  }

  toJSON(): string {
    return this.redactedText;
  }

  toSurql(): string {
    return quoteStr(this.redactedText);
  }

  toPlainObject(): {
    header: JwtHeader;
    payload: JwtPayload;
  } {
    return {
      header: this.header,
      payload: this.payload,
    };
  }
}
