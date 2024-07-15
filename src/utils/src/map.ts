export default function map<T extends readonly unknown[], U>(
  list: T,
  func: (item: T[number]) => U,
): { -readonly [K in keyof T]: U } {
  let i = 0,
    len = list.length,
    acc = Array.from({ length: len }) as { -readonly [K in keyof T]: U };

  for (; i < len; i++) {
    acc[i] = func(list[i]);
  }

  return acc;
}
