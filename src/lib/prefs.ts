/**
 * Small wrapper over localStorage for the scalar state the app keeps: the
 * promise recipient's name, the current sobriety start timestamp, and the
 * journey history used by the stats screen (first-ever start, every relapse,
 * and how many times the user backed out of the "are you sure?" screen).
 *
 * Every access is guarded: in private-browsing modes localStorage can throw on
 * read or write, so we fall back to an in-memory store and the app keeps working
 * for the current session.
 */

const NAME_KEY = "drugaway.promiseName";
const START_KEY = "drugaway.sobrietyStartISO";
const JOURNEY_KEY = "drugaway.journeyStartISO";
const RELAPSES_KEY = "drugaway.relapses";
const CHANGED_MIND_KEY = "drugaway.changedMindCount";

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

/**
 * The date the whole journey began — the first sobriety start, pinned and never
 * moved by later relapses. Back-filled from the current start for anyone who was
 * already using the app before stats existed.
 */
export function getJourneyStartISO(): string {
  const existing = readRaw(JOURNEY_KEY);
  if (existing) return existing;
  const seed = getSobrietyStartISO();
  writeRaw(JOURNEY_KEY, seed);
  return seed;
}

/** Timestamps of every relapse ("I'm doing it"), oldest first. */
export function getRelapseISOs(): string[] {
  const raw = readRaw(RELAPSES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

/** How many times the user chose "I changed my mind". */
export function getChangedMindCount(): number {
  const raw = readRaw(CHANGED_MIND_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Record a relapse: append it to the history and move the current sobriety start
 * to now. Ensures the journey start is pinned first, so it keeps the original
 * date rather than this moment.
 */
export function recordRelapse(): string {
  getJourneyStartISO();
  const now = new Date().toISOString();
  writeRaw(RELAPSES_KEY, JSON.stringify([...getRelapseISOs(), now]));
  writeRaw(START_KEY, now);
  return now;
}

/** Increment and return the "changed my mind" tally. */
export function recordChangedMind(): number {
  const next = getChangedMindCount() + 1;
  writeRaw(CHANGED_MIND_KEY, String(next));
  return next;
}
