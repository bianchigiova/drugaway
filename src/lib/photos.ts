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

const DB_NAME = "drugaway";
const DB_VERSION = 1;
const STORE = "photos";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
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
  return dbPromise;
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
