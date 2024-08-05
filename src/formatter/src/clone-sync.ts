import type { Formatter } from "./types";

export default function cloneSync<T>(formatter: Formatter, data: T): T {
  const encoded = formatter.encodeSync(data);
  const deocded = formatter.decodeSync(encoded);

  return deocded as T;
}
