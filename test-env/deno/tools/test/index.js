export const ENV = "Deno";

export function test(...args) {
  const [name, options, fn] = args.length === 3
    ? args
    : [args[0], {}, args[1]];
  const { skip = false, timeout = 5_000 } = options;

  if (skip) {
    if (typeof skip === "string") {
      return Deno.test({
        name: name + "  # Skip" + skip,
        ignore: true,
        fn,
      });
    } else {
      return Deno.test({
        name: name + "  # Skip",
        ignore: true,
        fn,
      });
    }
  } else {
    return Deno.test(name, fn, timeout);
  }
}

if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function withResolvers() {
    let resolve, reject;
    const promise = new this((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}
