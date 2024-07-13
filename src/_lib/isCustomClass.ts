const toString = Function.prototype.toString;

// class Simplae { ... }
// class Simplae{ ... }
// class { ... }
// class{ ... }
const CLASS_REGEX = /^(class|function)(?:\s[A-Z]|{)/;

const cache = new WeakMap<Function, boolean>();

// TODO(tai-kun): babel
export default function isCustomClass(
  value: unknown,
): value is new(...args: any) => any {
  if (typeof value !== "function") {
    return false;
  }

  let is = cache.get(value);

  if (is === undefined) {
    const code = toString.call(value);
    cache.set(
      value,
      is = CLASS_REGEX.test(code) && !code.endsWith("{ [native code] }"),
    );
  }

  return is;
}
