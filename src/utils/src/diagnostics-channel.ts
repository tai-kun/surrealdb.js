let map: Map<string, {
  readonly regex: RegExp;
  readonly callbacks: Set<(event: any) => void>;
}>;

if (__DEV__) {
  map = new Map();
}

export default {
  publish(name: string, event: any): void {
    if (__DEV__) {
      for (const { regex, callbacks } of map.values()) {
        if (regex.test(name)) {
          for (const callback of callbacks) {
            callback(event);
          }
        }
      }
    }
  },
  subscribe(name: string, callback: (event: any) => void): () => void {
    if (__DEV__) {
      let value = map.get(name);

      if (!value) {
        map.set(
          name,
          value = {
            regex: new RegExp(`^${
              name
                .split(":")
                .map((part, i, parts) =>
                  part !== "*"
                    ? part
                    : i === parts.length - 1
                    ? ".+"
                    : "[^:]+"
                )
                .join(":")
            }$`),
            callbacks: new Set(),
          },
        );
      }

      value.callbacks.add(callback);

      return function unsubscribe() {
        map.get(name)?.callbacks.delete(callback);
      };
    }

    return () => {};
  },
};
