import { _defineAssertTable } from "../utils";

/**
 * A class representing a table.
 *
 * @template T - The type of the table.
 */
export class Table<T extends string = string> {
  /**
   * The table name.
   */
  name: T;

  /**
   * @param name - The table name.
   */
  constructor(name: T) {
    _defineAssertTable(this);
    this.name = name;
  }

  /**
   * Returns the string representation of the table.
   */
  toString() {
    return this.name;
  }

  /**
   * Returns the JSON representation of the table.
   * This is the same as `toString`.
   */
  toJSON() {
    return this.toString();
  }
}
