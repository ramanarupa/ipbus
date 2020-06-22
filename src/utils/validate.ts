
export const assertNotNull = <T>(value: T, message?: string):T => {
  if (value === null || value === undefined) {
    throw new Error(message || "assertNotNull failed");
  }
  return value;
}


export const assertNull = <T>(value: T, message?: string):T => {
  if (value !== null && value !== undefined) {
    throw new Error(message || "assertNull failed");
  }
  return value;
}
