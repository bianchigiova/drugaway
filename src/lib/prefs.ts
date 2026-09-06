/**
 * Small wrapper over localStorage for the two scalar preferences the app keeps:
 * the promise recipient's name and the sobriety start timestamp.
 *
 * Every access is guarded: in private-browsing modes localStorage can throw on
 * read or write, so we fall back to an in-memory store and the app keeps working
 * for the current session.
 */

const NAME_KEY = "drugaway.promiseName";
const START_KEY = "drugaway.sobrietyStartISO";

const memory = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    const v = window.localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    /* ignore */
  }
  return memory.has(key) ? memory.get(key)! : null;
}

function writeRaw(key: string, value: string): void {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore — memory fallback already holds it */
  }
}

export function getPromiseName(): string {
  return readRaw(NAME_KEY) ?? "";
}

export function setPromiseName(name: string): void {
  writeRaw(NAME_KEY, name.trim());
}

/**
 * Returns the sobriety start timestamp, initialising it to "now" on first run so
 * the counter has a defined origin.
 */
export function getSobrietyStartISO(): string {
  const existing = readRaw(START_KEY);
  if (existing) return existing;
  const now = new Date().toISOString();
  writeRaw(START_KEY, now);
  return now;
}

/** Reset the counter — used when the user goes through with a relapse. */
export function resetSobrietyStart(): string {
  const now = new Date().toISOString();
  writeRaw(START_KEY, now);
  return now;
}
