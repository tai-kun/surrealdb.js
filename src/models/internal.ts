export const ASSERT_VALUE = /* @__PURE__ */ Symbol();

function defineAssertValue(
  errors: Map<object, object>,
  instance: object,
): void {
  Object.defineProperty(instance, ASSERT_VALUE, {
    configurable: false,
    enumerable: false,
    get: () => (key: object) => {
      throw errors.get(key);
    },
  });
}

/******************************************************************************
 * Datetime
 *****************************************************************************/

export const datetimeErrors = new Map();

export const _defineAssertDatetime = (instance: object) =>
  defineAssertValue(datetimeErrors, instance);

/******************************************************************************
 * Decimal
 *****************************************************************************/

export const decimalErrors = new Map();

export const _defineAssertDecimal = (instance: object) =>
  defineAssertValue(decimalErrors, instance);

/******************************************************************************
 * Duration
 *****************************************************************************/

export const durationErrors = new Map();

export const _defineAssertDuration = (instance: object) =>
  defineAssertValue(durationErrors, instance);

/******************************************************************************
 * GeometryPoint
 *****************************************************************************/

export const geometryPointErrors = new Map();

export const _defineAssertGeometryPoint = (instance: object) =>
  defineAssertValue(geometryPointErrors, instance);

/******************************************************************************
 * GeometryLine
 *****************************************************************************/

export const geometryLineErrors = new Map();

export const _defineAssertGeometryLine = (instance: object) =>
  defineAssertValue(geometryLineErrors, instance);

/******************************************************************************
 * GeometryPolygon
 *****************************************************************************/

export const geometryPolygonErrors = new Map();

export const _defineAssertGeometryPolygon = (instance: object) =>
  defineAssertValue(geometryPolygonErrors, instance);

/******************************************************************************
 * GeometryMultiPoint
 *****************************************************************************/

export const geometryMultiPointErrors = new Map();

export const _defineAssertGeometryMultiPoint = (
  instance: object,
) => defineAssertValue(geometryMultiPointErrors, instance);

/******************************************************************************
 * GeometryMultiLine
 *****************************************************************************/

export const geometryMultiLineErrors = new Map();

export const _defineAssertGeometryMultiLine = (instance: object) =>
  defineAssertValue(geometryMultiLineErrors, instance);

/******************************************************************************
 * GeometryMultiPolygon
 *****************************************************************************/

export const geometryMultiPolygonErrors = new Map();

export const _defineAssertGeometryMultiPolygon = (
  instance: object,
) => defineAssertValue(geometryMultiPolygonErrors, instance);

/******************************************************************************
 * GeometryCollection
 *****************************************************************************/

export const geometryCollectionErrors = new Map();

export const _defineAssertGeometryCollection = (
  instance: object,
) => defineAssertValue(geometryCollectionErrors, instance);

/******************************************************************************
 * Table
 *****************************************************************************/

export const tableErrors = new Map();

export const _defineAssertTable = (instance: object) =>
  defineAssertValue(tableErrors, instance);

/******************************************************************************
 * Thing
 *****************************************************************************/

export const thingErrors = new Map();

export const _defineAssertThing = (instance: object) =>
  defineAssertValue(thingErrors, instance);

/******************************************************************************
 * Uuid
 *****************************************************************************/

export const uuidErrors = new Map();

export const _defineAssertUuid = (instance: object) =>
  defineAssertValue(uuidErrors, instance);
