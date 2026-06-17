/** Convierte Timestamp Firestore / ISO / ms a epoch ms para countdowns locales. */
export function timestampToMs(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.toMillis === "function") {
      return (obj.toMillis as () => number)();
    }
    if (typeof obj._seconds === "number") return obj._seconds * 1000;
    if (typeof obj.seconds === "number") return obj.seconds * 1000;
  }
  return null;
}
