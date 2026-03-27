"use client";

export const MAX_HISTORY_ENTRIES = 50;
const DB_NAME = "paper2notebook";
const STORE_NAME = "history";
const DB_VERSION = 1;

export interface HistoryEntry {
  id: string;
  createdAt: string;
  paperTitle: string;
  fileName: string;
  notebookJson: string;
  warnings: string[];
}

/**
 * Extracts a paper title from the first non-empty line of text.
 */
export function extractPaperTitle(text: string): string {
  if (!text) return "Untitled Paper";
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      return trimmed.length > 100 ? trimmed.slice(0, 100) + "..." : trimmed;
    }
  }
  return "Untitled Paper";
}

/**
 * Creates a HistoryEntry object (without saving to DB).
 */
export function createHistoryEntry(params: {
  fileName: string;
  paperText: string;
  notebookJson: string;
  warnings: string[];
}): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    paperTitle: extractPaperTitle(params.paperText),
    fileName: params.fileName,
    notebookJson: params.notebookJson,
    warnings: params.warnings,
  };
}

/**
 * Opens the IndexedDB database.
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Saves a history entry to IndexedDB with FIFO eviction.
 */
export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // Get all entries to check count
  const allRequest = store.getAll();
  await new Promise<void>((resolve, reject) => {
    allRequest.onsuccess = () => {
      const entries = allRequest.result as HistoryEntry[];
      // Sort by date ascending (oldest first)
      entries.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      // FIFO eviction: remove oldest if at capacity
      const toRemove = entries.length - MAX_HISTORY_ENTRIES + 1;
      if (toRemove > 0) {
        for (let i = 0; i < toRemove; i++) {
          store.delete(entries[i].id);
        }
      }
      store.put(entry);
      resolve();
    };
    allRequest.onerror = () => reject(allRequest.error);
  });
  db.close();
}

/**
 * Gets all history entries, sorted by most recent first.
 */
export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const entries = request.result as HistoryEntry[];
      entries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      db.close();
      resolve(entries);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Clears all history entries.
 */
export async function clearHistory(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  await new Promise<void>((resolve) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}
