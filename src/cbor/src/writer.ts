import { setFloat16 } from "./float";
import type { DataItem } from "./spec";

export interface ToCBOR {
  readonly toCBOR: (writer: Writer) =>
    | [tag: DataItem.Tag["value"], value: unknown]
    | [value: unknown]
    | void;
}

export interface WriterOptions {
  readonly chunkSize?: number | undefined;
  readonly maxDepth?: number | undefined;
}

export class Writer {
  private chunkSize: number;
  private chunks: Uint8Array[] = [];
  private length: number = 0;
  private offset: number = 0;
  private view: DataView = undefined as any;

  depth: number = 0;
  maxDepth: number;

  constructor(options: WriterOptions | undefined = {}) {
    const {
      maxDepth = 64,
      chunkSize = 2048,
    } = options;

    this.maxDepth = maxDepth;
    this.chunkSize = chunkSize;
    this.clear(); // init
  }

  private alloc(size = this.chunkSize): void {
    const chunk = new Uint8Array(size);
    this.chunks.push(chunk);
    this.offset = 0;
    this.view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  }

  private claim(size: number): void {
    if (size <= this.chunkSize) {
      if (this.chunks.length <= 0) {
        this.alloc();
      } else {
        const last = this.chunks.length - 1;
        const free = this.chunks[last]!.length - this.offset;

        if (free < size) {
          if (free > 0) {
            this.trim();
          }

          this.alloc();
        }
      }
    } else {
      this.trim();
      this.alloc(size);
    }
  }

  private trim(): void {
    const last = this.chunks.length - 1;
    this.chunks[last] = this.chunks[last]!.subarray(0, this.offset);
  }

  private next(size: number): void {
    this.length += size;
    this.offset += size;
  }

  clear(): void {
    this.chunks = [];
    this.length = 0;
    this.offset = 0;
    this.depth = 0;
  }

  consume(): Uint8Array {
    this.trim();
    const acc = new Uint8Array(this.length);

    for (
      let offset = 0, chunk: Uint8Array | undefined;
      (chunk = this.chunks.shift());
    ) {
      acc.set(chunk, offset);
      offset += chunk.length;
    }

    this.clear(); // consume

    return acc;
  }

  writeBytes(value: Uint8Array): void {
    this.claim(value.length);
    const last = this.chunks.length - 1;
    this.chunks[last]!.set(value, this.offset);
    this.next(value.length);
  }

  writeUint8(value: number): void {
    this.claim(1);
    this.view.setUint8(this.offset, value);
    this.next(1);
  }

  writeUint16(value: number): void {
    this.claim(2);
    this.view.setUint16(this.offset, value);
    this.next(2);
  }

  writeUint32(value: number): void {
    this.claim(4);
    this.view.setUint32(this.offset, value);
    this.next(4);
  }

  writeBigUint64(value: bigint): void {
    this.claim(8);
    this.view.setBigUint64(this.offset, value);
    this.next(8);
  }

  writeFloat16(value: number): void {
    this.claim(2);
    setFloat16(this.view, this.offset, value);
    this.next(2);
  }

  // writeFloat32(value: number): void {
  //   this.claim(4);
  //   this.view.setFloat32(this.offset, value);
  //   this.next(4);
  // }

  writeFloat64(value: number): void {
    this.claim(8);
    this.view.setFloat64(this.offset, value);
    this.next(8);
  }
}
