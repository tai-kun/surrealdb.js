import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import type { AllocatedMemoryBlock } from "./memory";
import type { DataItem } from "./spec";

export interface ToCBOR {
  readonly toCBOR: (writer: Writer) =>
    | [tag: DataItem.Tag["value"], value: unknown]
    | [value: unknown]
    | void;
}

export interface WriterOptions {
  readonly maxDepth?: number | undefined;
}

export class Writer {
  readonly maxDepth: number;

  constructor(
    memory: AllocatedMemoryBlock,
    options: WriterOptions | undefined = {},
  ) {
    const {
      maxDepth = 64,
    } = options;
    this.maxDepth = maxDepth;

    this.data = memory.data;
    this.view = memory.view;
    this.depth = 0;
    this.total = 0;
    this.offset = 0;
    this.chunks = [memory.data];
    this.memory = memory;
  }

  data: Uint8Array;
  view: DataView;
  depth: number;
  total: number;
  offset: number;
  protected chunks: [Uint8Array, ...Uint8Array[]];
  protected readonly memory: AllocatedMemoryBlock;

  protected datacopy(): Uint8Array {
    return this.offset >= this.data.length
      ? this.data.slice()
      : this.data.slice(0, this.offset);
  }

  protected dataref(): Uint8Array {
    if (this.offset <= this.data.length) {
      return this.data.subarray(0, this.offset); // trim
    }

    return this.data;
  }

  claim(size: number): void {
    if (size > this.memory.size) {
      // 事前に用意されたメモリーサイズを超える要求があれば:
      // (1) 現チャンクに内容があれば必要なだけ複製を記録する。
      // (2) 要求サイズちょうどのデータを作成する。
      // (3) 総容量を更新する。
      // (4) オフセットを 0 に戻す。

      let last = this.chunks.length - 1;

      // (1)
      if (this.offset > 0) {
        this.chunks[last++] = this.datacopy();
      }

      this.data = this.chunks[last] = new Uint8Array(size); // (2)
      this.view = new DataView(this.data.buffer, 0, size); // (2)
      this.total += this.offset; // (3)
      this.offset = 0; // (4)
    } else if (size > (this.data.length - this.offset)) {
      // 要求サイズがチャンクに収まらない場合:
      // (1) 現チャンクが事前に用意されたメモリーなら必要なだけ複製を記録する。
      // (2) 現チャンクがカスタムサイズのメモリーなら必要なだけ参照を記録する。
      // (3) 現チャンクを事前に用意されたメモリーにする。
      // (4) 総容量を更新する。
      // (5) オフセットを 0 に戻す。

      const last = this.chunks.length - 1;

      // (1)
      if (this.data === this.memory.data) {
        this.chunks[last] = this.datacopy();
      } //
      // (2)
      else if (this.data.length < this.offset) {
        this.chunks[last] = this.dataref();
      }

      this.data = this.chunks[last + 1] = this.memory.data; // (3)
      this.view = this.memory.view; // (3)
      this.total += this.offset; // (4)
      this.offset = 0; // (5)
    }
  }

  output(): Uint8Array {
    if (this.chunks.length < 2) {
      if (this.data === this.memory.data) {
        return this.datacopy();
      }

      return this.data;
    }

    const last = this.chunks.length - 1;
    this.chunks[last] = this.dataref(); // コピーされるので参照で構わない。

    const acc = new Uint8Array(this.total + this.offset);

    for (
      let offset = 0, chunk: Uint8Array | undefined;
      (chunk = this.chunks.shift());
    ) {
      acc.set(chunk, offset);
      offset += chunk.length;
    }

    return acc;
  }

  writeBytes(value: Uint8ArrayLike): void {
    this.claim(value.length);
    this.data.set(value, this.offset);
    this.offset += value.length;
  }

  writeUint8(value: number): void {
    this.claim(1);
    this.view.setUint8(this.offset, value);
    this.offset += 1;
  }

  writeUint16(value: number): void {
    this.claim(2);
    this.view.setUint16(this.offset, value);
    this.offset += 2;
  }

  writeUint32(value: number): void {
    this.claim(4);
    this.view.setUint32(this.offset, value);
    this.offset += 4;
  }

  writeBigUint64(value: bigint): void {
    this.claim(8);
    this.view.setBigUint64(this.offset, value);
    this.offset += 8;
  }

  // writeFloat16(value: number): void {
  //   this.claim(2);
  //   setFloat16(this.view, this.offset, value);
  //   this.offset += 2;
  // }

  writeFloat32(value: number): void {
    this.claim(4);
    this.view.setFloat32(this.offset, value);
    this.offset += 4;
  }

  writeFloat64(value: number): void {
    this.claim(8);
    this.view.setFloat64(this.offset, value);
    this.offset += 8;
  }
}
