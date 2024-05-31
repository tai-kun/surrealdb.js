import { Thing as ThingBase } from "../normal/Thing";

export type {
  ThingId,
  ThingIdArray,
  ThingIdObject,
  ThingIdPrimitive,
} from "../tiny/Thing";

export class Thing extends ThingBase {}
