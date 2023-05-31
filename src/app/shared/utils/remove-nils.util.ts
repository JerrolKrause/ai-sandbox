/**
 * Recursively removes all null, undefined, empty string, empty object and empty array values
 * from an object or array.
 *
 * @param {T} obj - The object or array to clean up.
 * @returns {T} The cleaned up object or array.
 * @template T - The type of the input and output objects or arrays.
 */
export function removeNils<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(val => removeNils(val)).filter(val => !isEmpty(val)) as unknown as T;
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc: any, [key, val]) => {
      const newVal = removeNils(val);
      if (!isEmpty(newVal) && acc && typeof acc === 'object') {
        acc[key] = newVal;
      }
      return acc;
    }, {} as T);
  }
  return obj;
}

function isEmpty(value: any) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}
