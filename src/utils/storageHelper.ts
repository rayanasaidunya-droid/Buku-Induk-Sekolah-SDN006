import { Student } from '../types';

const DB_NAME = 'buku_induk_storage_v1';
const DB_STORE_NAME = 'keyval';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase | null> | null = null;

/**
 * Open or get singleton IndexedDB instance safely
 */
export function getIDBDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          db.createObjectStore(DB_STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.warn('[storageHelper] IndexedDB open error:', e);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn('[storageHelper] IndexedDB open blocked');
        resolve(null);
      };
    } catch (err) {
      console.warn('[storageHelper] IndexedDB not available:', err);
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Put value into IndexedDB asynchronously
 */
export async function idbSet<T = any>(key: string, value: T): Promise<boolean> {
  try {
    const db = await getIDBDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(DB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(DB_STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        console.warn(`[storageHelper] idbSet failed for ${key}:`, err);
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Get value from IndexedDB asynchronously
 */
export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getIDBDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(DB_STORE_NAME, 'readonly');
        const store = tx.objectStore(DB_STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve(req.result !== undefined ? (req.result as T) : null);
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        console.warn(`[storageHelper] idbGet failed for ${key}:`, err);
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Delete key from IndexedDB
 */
export async function idbDelete(key: string): Promise<boolean> {
  try {
    const db = await getIDBDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(DB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(DB_STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Remove stale or volatile localStorage entries when space is tight
 */
export function cleanupVolatileStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('buku_induk_draft_') || k.startsWith('buku_induk_temp_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
  } catch (err) {
    console.warn('[storageHelper] cleanupVolatileStorage error:', err);
  }
}

/**
 * Safely get from localStorage with fallback
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely set localStorage with quota fallback, auto-cleanup, and zero crashes
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    if (isQuota) {
      console.warn(`[storageHelper] Quota exceeded for "${key}". Cleaning volatile items & retrying...`);
      cleanupVolatileStorage();

      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[storageHelper] localStorage still exceeded quota after cleanup for "${key}".`);
        return false;
      }
    }
    console.warn(`[storageHelper] localStorage.setItem failed for "${key}":`, err);
    return false;
  }
}

/**
 * Safely remove from localStorage
 */
export function safeLocalStorageRemove(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Strip heavy base64 images from student records for compact localStorage backup
 * while IndexedDB retains 100% full-resolution scans and pasfoto.
 */
export function createLeanStudentsForLocalStorage(students: Student[]): Student[] {
  return students.map((s) => {
    let lean = { ...s };

    // If fotoUrl is a massive base64 (> 100KB), replace with indicator or keep if small/http
    if (lean.fotoUrl && lean.fotoUrl.startsWith('data:') && lean.fotoUrl.length > 80000) {
      lean = {
        ...lean,
        fotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
      };
    }

    // If mutasi has large base64 scan
    if (lean.mutasi?.fotoIjazah && lean.mutasi.fotoIjazah.startsWith('data:') && lean.mutasi.fotoIjazah.length > 80000) {
      lean = {
        ...lean,
        mutasi: {
          ...lean.mutasi,
          fotoIjazah: '[IDB_STORED]',
        },
      };
    }

    // If sttb has large base64 scan
    if (lean.sttb?.fotoIjazah && lean.sttb.fotoIjazah.startsWith('data:') && lean.sttb.fotoIjazah.length > 80000) {
      lean = {
        ...lean,
        sttb: {
          ...lean.sttb,
          fotoIjazah: '[IDB_STORED]',
        },
      };
    }

    return lean;
  });
}

/**
 * Save students resiliently:
 * 1. Asynchronously into IndexedDB (persists all photos, documents, scans without quota limits).
 * 2. Synchronously into localStorage as fast boot cache:
 *    - First attempt with full data.
 *    - If quota exceeded, clean volatile storage and retry with lean version.
 *    - Never throws QuotaExceededError!
 */
export function persistStudentsResiliently(
  storageKey: string,
  students: Student[]
): void {
  // 1. IndexedDB persistence (unlimited storage, full fidelity)
  idbSet('students', students).catch((err) => {
    console.warn('[storageHelper] Failed to persist students to IndexedDB:', err);
  });

  // 2. LocalStorage persistence (fast synchronous startup cache)
  try {
    const json = JSON.stringify(students);
    const success = safeLocalStorageSet(storageKey, json);
    if (!success) {
      // Save lean version
      const lean = createLeanStudentsForLocalStorage(students);
      safeLocalStorageSet(storageKey, JSON.stringify(lean));
    }
  } catch (err) {
    console.warn('[storageHelper] Failed to serialize students for localStorage:', err);
    try {
      const lean = createLeanStudentsForLocalStorage(students);
      safeLocalStorageSet(storageKey, JSON.stringify(lean));
    } catch {}
  }
}
