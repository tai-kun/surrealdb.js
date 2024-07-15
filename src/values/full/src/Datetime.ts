import Base from "../../standard/src/Datetime";

export default class Datetime extends Base {
  isInvalid(): boolean {
    return Number.isNaN(this.getTime());
  }
}
