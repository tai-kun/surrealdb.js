// TODO(tai-kun): エラーが発生したとき人間が読める形式の情報へシリアライズできるようにする。
export default class Encoded<TData = unknown> {
  // @ts-expect-error 型だけ。
  __type: TData;
}
