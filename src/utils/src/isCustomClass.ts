const toString = Function.prototype.toString;

// class MyClass { ... }
// class MyClass{ ... }
// class { ... }
// class{ ... }
const CLASS_REGEX = /^class[\s{]/;

// function MyClass {}
const CLASS_LIKE_REGEX = /^function\s[A-Z]/;

const NATIVE_CODE_REGEX = /{\s*\[native code\]\s*}$/;

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
      is = (CLASS_REGEX.test(code) || CLASS_LIKE_REGEX.test(code))
        && !NATIVE_CODE_REGEX.test(code),
    );
  }

  return is;
}
