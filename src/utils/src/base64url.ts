import { unreachable } from "@tai-kun/surrealdb/errors";
import utf8 from "./utf8";

let decodeFunction: (url: string) => string;

if (typeof Buffer !== "undefined") {
  decodeFunction = function decode(url: string): string {
    return Buffer.from(url, "base64url").toString("utf8");
  };
} else {
  decodeFunction = function unsafe_decode(url: string): string {
    let s = "", len = url.length;

    for (let i = 0; i < len; i++) {
      switch (url.charCodeAt(i)) {
        case 45: // -
          s += "+";
          break;

        case 95: // _
          s += "/";
          break;

        default:
          s += url[i];
      }
    }

    switch (len % 4) {
      case 0:
        break;

      case 1:
        s += "===";
        break;

      case 2:
        s += "==";
        break;

      case 3:
        s += "=";
        break;

      default:
        unreachable();
    }

    // https://developer.mozilla.org/docs/Glossary/Base64
    return utf8.decode(Uint8Array.from(atob(s), c => c.codePointAt(0)!));
  };
}

export default {
  decode: decodeFunction,
};
