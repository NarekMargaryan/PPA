type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const deepMerge = <T>(base: T, override: unknown): T => {
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (!isPlainObject(base)) {
    return (override === undefined ? base : override) as T;
  }

  const baseObject = base as PlainObject;
  const overrideObject = isPlainObject(override) ? override : {};
  const result: PlainObject = { ...baseObject };

  for (const [key, overrideValue] of Object.entries(overrideObject)) {
    const baseValue = result[key];

    if (Array.isArray(baseValue)) {
      result[key] = Array.isArray(overrideValue) ? overrideValue : baseValue;
      continue;
    }

    if (isPlainObject(baseValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result as T;
};

export const asRecord = (value: unknown): PlainObject | null =>
  isPlainObject(value) ? value : null;
