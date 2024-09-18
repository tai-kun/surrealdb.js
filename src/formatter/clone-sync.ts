import type { Formatter } from "./types";

export default function cloneSync<TData>(
  formatter: Formatter,
  data: TData,
): TData {
  const encoded = formatter.encodeSync(data);
  const deocded = formatter.decodeSync(encoded);

  return deocded as TData;
}
