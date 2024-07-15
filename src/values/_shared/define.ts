import {
  kDatetime,
  kDecimal,
  kDuration,
  kGeometryCollection,
  kGeometryLine,
  kGeometryMultiLine,
  kGeometryMultiPoint,
  kGeometryMultiPolygon,
  kGeometryPoint,
  kGeometryPolygon,
  kTable,
  kThing,
  kUuid,
} from "./constants";

function defineAsValue(kType: symbol, instance: object): void {
  Object.defineProperty(instance, kType, {
    configurable: false,
    enumerable: false,
  });
}

export const _defineAsDatetime = (instance: object) =>
  defineAsValue(kDatetime, instance);

export const _defineAsDecimal = (instance: object) =>
  defineAsValue(kDecimal, instance);

export const _defineAsDuration = (instance: object) =>
  defineAsValue(kDuration, instance);

export const _defineAsGeometryPoint = (instance: object) =>
  defineAsValue(kGeometryPoint, instance);

export const _defineAsGeometryLine = (instance: object) =>
  defineAsValue(kGeometryLine, instance);

export const _defineAsGeometryPolygon = (instance: object) =>
  defineAsValue(kGeometryPolygon, instance);

export const _defineAsGeometryMultiPoint = (instance: object) =>
  defineAsValue(kGeometryMultiPoint, instance);

export const _defineAsGeometryMultiLine = (instance: object) =>
  defineAsValue(kGeometryMultiLine, instance);

export const _defineAsGeometryMultiPolygon = (instance: object) =>
  defineAsValue(kGeometryMultiPolygon, instance);

export const _defineAsGeometryCollection = (instance: object) =>
  defineAsValue(kGeometryCollection, instance);

export const _defineAsTable = (instance: object) =>
  defineAsValue(kTable, instance);

export const _defineAsThing = (instance: object) =>
  defineAsValue(kThing, instance);

export const _defineAsUuid = (instance: object) =>
  defineAsValue(kUuid, instance);
