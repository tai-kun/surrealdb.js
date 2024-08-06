export default class Encoded<T = unknown> {
  // @ts-expect-error 型だけ。
  __type: T;
}
