import {
  CborMemoryBlockConflictError,
  CborMemoryBlockInUseError,
  CborUndefinedMemoryBlockError,
} from "@tai-kun/surrealdb/errors";

export type MemoryAddress = string | number;

export type DefinedMemoryBlock = {
  busy: false;
  readonly data: null;
  readonly size: number;
};

export type AllocatedMemoryBlock = {
  busy: boolean;
  readonly data: Uint8Array;
  readonly view: DataView;
  readonly size: number;
};

export type MemoryBlock = DefinedMemoryBlock | AllocatedMemoryBlock;

export class Memory {
  protected readonly blocks: Map<MemoryAddress, MemoryBlock> = new Map();

  define(address: MemoryAddress, size: number): void {
    const b = this.blocks.get(address);

    if (b) {
      if (b.size !== size) {
        throw new CborMemoryBlockConflictError(address, b.size, size);
      }
    } else {
      this.blocks.set(address, {
        busy: false,
        data: null,
        size,
      });
    }
  }

  remove(address: MemoryAddress): void {
    const b = this.blocks.get(address);

    if (b) {
      if (b.busy) {
        throw new CborMemoryBlockInUseError(
          `Cannot remove memory block at address ${address} because it is `
            + "currently in use.",
        );
      }

      this.blocks.delete(address);
    }
  }

  alloc(address: MemoryAddress): AllocatedMemoryBlock {
    let b = this.blocks.get(address);

    if (!b) {
      throw new CborUndefinedMemoryBlockError(address);
    }

    if (b.busy) {
      throw new CborMemoryBlockInUseError(
        `Memory block at address ${address} is currently in use and cannot be `
          + "modified.",
      );
    }

    if (b.data === null) {
      const data = new Uint8Array(b.size);
      this.blocks.set(
        address,
        b = {
          busy: false,
          data,
          view: new DataView(data.buffer, 0, b.size),
          size: b.size,
        },
      );
    }

    b.busy = true;

    return b;
  }

  free(address: MemoryAddress): void {
    const b = this.blocks.get(address);

    if (b) {
      b.busy = false;
    }
  }
}
