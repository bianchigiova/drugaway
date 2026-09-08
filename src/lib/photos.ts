/**
 * Photo storage backed by IndexedDB. Photos are kept as Blobs (localStorage is
 * ~5MB and string-only, which is unworkable for images). One object store,
 * `photos`, keyed by a generated id.
 */

export interface PhotoRecord {
  id: string;
  blob: Blob;
  name: string;
  addedAt: number;
}

const DB_NAME = "aurion";
const DB_VERSION = 1;
const STORE = "photos";

// The app used to be called "drugaway"; its photos live in a database of that
// name. IndexedDB can't rename a database, so we copy the records across once.
const LEGACY_DB_NAME = "drugaway";
const MIGRATED_FLAG = "aurion.photosMigrated";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    // Migration is best-effort: on any failure, fall through to a fresh DB.
    dbPromise = migrateLegacyDB()
      .catch(() => {})
      .then(openFreshDB);
  }
  return dbPromise;
}

function openFreshDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Copy every photo from the former "drugaway" database into the current one,
 * then delete the old database. Runs at most once — a localStorage flag records
 * completion — and is a no-op when there was no old database to migrate.
 */
async function migrateLegacyDB(): Promise<void> {
  try {
    if (window.localStorage.getItem(MIGRATED_FLAG) === "1") return;
  } catch {
    // Can't tell whether we've run before and can't record that we have — skip,
    // rather than risk copying on every open.
    return;
  }

  const legacy = await openLegacyDB();
  if (legacy) {
    try {
      const records = await new Promise<PhotoRecord[]>((resolve, reject) => {
        const req = legacy
          .transaction(STORE, "readonly")
          .objectStore(STORE)
          .getAll();
        req.onsuccess = () => resolve(req.result as PhotoRecord[]);
        req.onerror = () => reject(req.error);
      });
      if (records.length) {
        const fresh = await openFreshDB();
        await new Promise<void>((resolve, reject) => {
          const t = fresh.transaction(STORE, "readwrite");
          const os = t.objectStore(STORE);
          for (const r of records) os.put(r);
          t.oncomplete = () => resolve();
          t.onerror = () => reject(t.error);
          t.onabort = () => reject(t.error);
        });
        fresh.close();
      }
    } finally {
      legacy.close();
    }
    await deleteDatabase(LEGACY_DB_NAME);
  }

  try {
    window.localStorage.setItem(MIGRATED_FLAG, "1");
  } catch {
    /* ignore — worst case the copy is attempted again and no-ops */
  }
}

/** Open the legacy database, or resolve null if it doesn't exist / has no store. */
function openLegacyDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    let created = false;
    const req = indexedDB.open(LEGACY_DB_NAME);
    req.onupgradeneeded = () => {
      created = true; // it wasn't there before this call
    };
    req.onsuccess = () => {
      const db = req.result;
      if (created || !db.objectStoreNames.contains(STORE)) {
        db.close();
        if (created) indexedDB.deleteDatabase(LEGACY_DB_NAME);
        resolve(null);
        return;
      }
      resolve(db);
    };
    req.onerror = () => resolve(null);
  });
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listPhotos(): Promise<PhotoRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => {
      const records = (req.result as PhotoRecord[]).sort(
        (a, b) => a.addedAt - b.addedAt,
      );
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addPhoto(file: File): Promise<PhotoRecord> {
  const db = await openDB();
  const record: PhotoRecord = {
    id: newId(),
    blob: file,
    name: file.name || "photo",
    addedAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").add(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function removePhoto(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
