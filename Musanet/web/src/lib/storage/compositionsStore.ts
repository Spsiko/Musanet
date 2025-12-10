/* Storage logic partially generated with AI assistance. */

const STORAGE_KEY = "musanet.compositions.v1";

export interface StoredComposition {
  id: string;
  title: string;
  updatedAt: string; // ISO string
  rawInput: string;
  tempo: number;
}

interface StorageShape {
  items: StoredComposition[];
}

function readStorage(): StorageShape {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as StorageShape;
    if (!Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function writeStorage(data: StorageShape) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function listCompositions(): StoredComposition[] {
  return readStorage().items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function makeId() {
  return `comp-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export function saveCompositionToLibrary(args: {
  id?: string;
  title: string;
  rawInput: string;
  tempo: number;
}): StoredComposition[] {
  const data = readStorage();
  const now = new Date().toISOString();

  let id = args.id ?? makeId();

  const existingIndex = data.items.findIndex((item) => item.id === id);
  const record: StoredComposition = {
    id,
    title: args.title.trim() || "Untitled",
    updatedAt: now,
    rawInput: args.rawInput,
    tempo: args.tempo,
  };

  if (existingIndex >= 0) {
    data.items[existingIndex] = record;
  } else {
    data.items.push(record);
  }

  writeStorage(data);
  return listCompositions();
}

export function loadCompositionFromLibrary(
  id: string
): StoredComposition | null {
  const data = readStorage();
  return data.items.find((item) => item.id === id) ?? null;
}

export function deleteCompositionFromLibrary(id: string): StoredComposition[] {
  const data = readStorage();
  const filtered = data.items.filter((item) => item.id !== id);
  writeStorage({ items: filtered });
  return listCompositions();
}
