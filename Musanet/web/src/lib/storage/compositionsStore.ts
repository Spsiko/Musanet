/* Storage logic partially generated with AI assistance. */

const STORAGE_KEY_V1 = "musanet.compositions.v1";
const STORAGE_KEY_V2 = "musanet.compositions.v2";
// const SCHEMA_VERSION = 2;

export interface StoredCompositionV2 {
  schemaVersion: 2;
  id: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  rawInput: string;
  tempo: number;

  // Not “validation” in the strict sense, just a snapshot of the editor state.
  lastErrorCount: number;
  lastErrors: string[]; // kept small-ish by caller
}

interface StorageShapeV2 {
  schemaVersion: 2;
  items: StoredCompositionV2[];
}

// V1 legacy shape (for migration)
interface StoredCompositionV1 {
  id: string;
  title: string;
  updatedAt: string; // ISO string
  rawInput: string;
  tempo: number;
}
interface StorageShapeV1 {
  items: StoredCompositionV1[];
}

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readV2(): StorageShapeV2 {
  if (typeof window === "undefined") return { schemaVersion: 2, items: [] };

  // Try V2 first
  const v2Raw = window.localStorage.getItem(STORAGE_KEY_V2);
  const parsedV2 = safeParseJSON<StorageShapeV2>(v2Raw);
  if (
    parsedV2 &&
    parsedV2.schemaVersion === 2 &&
    Array.isArray(parsedV2.items)
  ) {
    return parsedV2;
  }

  // If no V2, try migrating from V1
  const v1Raw = window.localStorage.getItem(STORAGE_KEY_V1);
  const parsedV1 = safeParseJSON<StorageShapeV1>(v1Raw);
  if (parsedV1 && Array.isArray(parsedV1.items) && parsedV1.items.length > 0) {
    const migrated: StorageShapeV2 = {
      schemaVersion: 2,
      items: parsedV1.items.map((it) => ({
        schemaVersion: 2,
        id: it.id,
        title: it.title,
        createdAt: it.updatedAt, // best we can do
        updatedAt: it.updatedAt,
        rawInput: it.rawInput,
        tempo: it.tempo,
        lastErrorCount: 0,
        lastErrors: [],
      })),
    };

    // Write migration forward (don’t delete V1; just stop using it)
    writeV2(migrated);
    return migrated;
  }

  return { schemaVersion: 2, items: [] };
}

function writeV2(data: StorageShapeV2) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
}

function makeId() {
  return `comp-${
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  }`;
}

export function listCompositions(): StoredCompositionV2[] {
  const data = readV2();
  return data.items
    .slice()
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export function saveCompositionToLibrary(args: {
  id?: string;
  title: string;
  rawInput: string;
  tempo: number;
  errors?: string[];
}): StoredCompositionV2[] {
  const data = readV2();
  const now = new Date().toISOString();

  const id = args.id ?? makeId();
  const existingIndex = data.items.findIndex((item) => item.id === id);

  const trimmedTitle = args.title.trim() || "Untitled";
  const errors = Array.isArray(args.errors) ? args.errors : [];
  const cappedErrors = errors.slice(0, 25); // keep storage sane

  const record: StoredCompositionV2 = {
    schemaVersion: 2,
    id,
    title: trimmedTitle,
    createdAt:
      existingIndex >= 0 ? data.items[existingIndex].createdAt : now,
    updatedAt: now,
    rawInput: args.rawInput,
    tempo: args.tempo,
    lastErrorCount: errors.length,
    lastErrors: cappedErrors,
  };

  if (existingIndex >= 0) {
    data.items[existingIndex] = record;
  } else {
    data.items.push(record);
  }

  writeV2({ schemaVersion: 2, items: data.items });
  return listCompositions();
}

export function loadCompositionFromLibrary(id: string): StoredCompositionV2 | null {
  const data = readV2();
  return data.items.find((item) => item.id === id) ?? null;
}

export function deleteCompositionFromLibrary(id: string): StoredCompositionV2[] {
  const data = readV2();
  const filtered = data.items.filter((item) => item.id !== id);
  writeV2({ schemaVersion: 2, items: filtered });
  return listCompositions();
}

/* Storage logic partially generated with AI assistance. */

export interface LibraryExportV2 {
  schemaVersion: 2;
  exportedAt: string; // ISO
  items: StoredCompositionV2[];
}

export function exportLibraryToJSON(): string {
  const items = listCompositions();
  const payload: LibraryExportV2 = {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    items,
  };
  return JSON.stringify(payload, null, 2);
}

export function importLibraryFromJSON(jsonText: string): {
  ok: true;
  imported: number;
  overwritten: number;
  total: number;
} | {
  ok: false;
  error: string;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "Invalid JSON file." };
  }

  const obj = parsed as Partial<LibraryExportV2>;
  if (obj.schemaVersion !== 2 || !Array.isArray(obj.items)) {
    return {
      ok: false,
      error: "Unsupported export format (missing schemaVersion=2 or items[]).",
    };
  }

  // Read existing library
  const existing = listCompositions();
  const existingById = new Map(existing.map((x) => [x.id, x]));

  let imported = 0;
  let overwritten = 0;

  for (const item of obj.items) {
    // Minimal sanity checks
    if (
      !item ||
      item.schemaVersion !== 2 ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.rawInput !== "string" ||
      typeof item.tempo !== "number" ||
      typeof item.createdAt !== "string" ||
      typeof item.updatedAt !== "string"
    ) {
      // Skip garbage rows rather than exploding the whole import
      continue;
    }

    if (existingById.has(item.id)) overwritten++;
    else imported++;

    // Save using the existing writer path so storage stays consistent.
    // Preserve timestamps from imported data by directly writing V2 storage:
    // We'll just update via saveCompositionToLibrary but it overwrites updatedAt.
    // So instead, we do a direct merge into storage below.
  }

  // Direct merge into storage so createdAt/updatedAt survive.
  const data = (function () {
    // reuse internal readV2 via listCompositions + localStorage key.
    // We don't have readV2 exported, so reconstruct from current library:
    return { schemaVersion: 2 as const, items: existing.slice() };
  })();

  const mergedById = new Map(data.items.map((x) => [x.id, x]));
  for (const item of obj.items as StoredCompositionV2[]) {
    if (
      item &&
      item.schemaVersion === 2 &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.rawInput === "string" &&
      typeof item.tempo === "number" &&
      typeof item.createdAt === "string" &&
      typeof item.updatedAt === "string"
    ) {
      mergedById.set(item.id, item);
    }
  }

  const merged = Array.from(mergedById.values());
  // Write merged library back
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "musanet.compositions.v2",
      JSON.stringify({ schemaVersion: 2, items: merged })
    );
  }

  return {
    ok: true,
    imported,
    overwritten,
    total: merged.length,
  };
}

