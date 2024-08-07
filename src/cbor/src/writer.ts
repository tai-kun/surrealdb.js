import type { DataItem } from "./spec";

export interface ToCBOR {
  readonly toCBOR: (writer: Writer) =>
    | [tag: DataItem.Tag["value"], value: unknown]
    | [value: unknown]
    | void;
}

export interface WriterOptions {
  readonly chunkSize?: number | undefined;
  readonly maxChunkSize?: number | undefined;
  readonly maxDepth?: number | undefined;
}

export class Writer {
  readonly maxDepth: number;
  protected chunkSize: number;
  protected maxChunkSize: number;

  constructor(options: WriterOptions | undefined = {}) {
    const {
      maxDepth = 64,
      chunkSize = 128,
      maxChunkSize = 2048,
    } = options;
    this.maxDepth = maxDepth;
    this.chunkSize = chunkSize;
    this.maxChunkSize = maxChunkSize;

    this.view = undefined as any;
    this.depth = 0;
    this.chunks = [];
    this.length = 0;
    this.offset = 0;
    this.alloc();
  }

  depth: number;
  protected view: DataView;
  protected chunks: Uint8Array[];
  protected length: number;
  protected offset: number;

  private alloc(size = this.chunkSize): void {
    const chunk = new Uint8Array(size);
    this.chunks.push(chunk);
    this.offset = 0;
    this.view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  }

  private claim(size: number): void {
    if (size <= this.chunkSize) {
      const last = this.chunks.length - 1;
      const free = this.chunks[last]!.length - this.offset;

      if (free < size) {
        if (free > 0) {
          this.trim();
        }

        if (this.chunkSize < this.maxChunkSize) {
          this.chunkSize *= 2;

          if (this.chunkSize > this.maxChunkSize) {
            this.chunkSize = this.maxChunkSize;
          }
        }

        this.alloc();
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

  output(): Uint8Array {
    this.trim();
    const acc = new Uint8Array(this.length);

    for (
      let offset = 0, chunk: Uint8Array | undefined;
      (chunk = this.chunks.shift());
    ) {
      acc.set(chunk, offset);
      offset += chunk.length;
    }

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

  // writeFloat16(value: number): void {
  //   this.claim(2);
  //   setFloat16(this.view, this.offset, value);
  //   this.next(2);
  // }

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
