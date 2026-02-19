/**
 * Onboarding session management.
 *
 * - Metadata (fileName, fileSize, contractId, status) is stored in sessionStorage
 *   so it survives page refreshes.
 * - The actual File object is kept in:
 *   1. An in-memory globalThis map (fastest, survives SPA nav)
 *   2. IndexedDB (survives full page reloads / OAuth redirects)
 *
 * URL: /onboarding/processing/[sessionId]
 */

const STORAGE_PREFIX = 'ch_onboarding_'
const FILE_MAP_KEY = '__chOnboardingFiles'
const IDB_NAME = 'ch_onboarding_files'
const IDB_STORE = 'files'

// ─── Types ────────────────────────────────────────────────────────────

export interface OnboardingSession {
  id: string
  fileName: string
  fileSize: number
  contractId: string | null
  status: 'processing' | 'sign-in-required' | 'uploading' | 'complete'
  createdAt: number // timestamp for ordering
}

// ─── File map (in-memory, survives SPA nav) ───────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function getFileMap(): Map<string, File> {
  const g = globalThis as any
  if (!g[FILE_MAP_KEY]) {
    g[FILE_MAP_KEY] = new Map<string, File>()
  }
  return g[FILE_MAP_KEY]
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── IndexedDB helpers (persist files across full page reloads) ───────

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveFileToIDB(id: string, file: File): Promise<void> {
  try {
    const db = await openIDB()
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(file, id)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // IndexedDB may not be available — fall back to in-memory only
  }
}

async function loadFileFromIDB(id: string): Promise<File | null> {
  try {
    const db = await openIDB()
    const tx = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(id)
    const result = await new Promise<File | null>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

async function deleteFileFromIDB(id: string): Promise<void> {
  try {
    const db = await openIDB()
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).delete(id)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────

/** Generate a random session ID */
function generateId(): string {
  return crypto.randomUUID()
}

/** Create a new onboarding session. Returns the session ID. */
export function createOnboardingSession(file: File): string {
  const id = generateId()
  const session: OnboardingSession = {
    id,
    fileName: file.name,
    fileSize: file.size,
    contractId: null,
    status: 'processing',
    createdAt: Date.now(),
  }

  // Persist metadata to sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(session))
  }

  // Keep File in memory (immediate access)
  getFileMap().set(id, file)

  // Also persist to IndexedDB (survives OAuth redirects / full reloads)
  saveFileToIDB(id, file)

  return id
}

/** Read session metadata (from sessionStorage). */
export function getOnboardingSession(id: string): OnboardingSession | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(STORAGE_PREFIX + id)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Update session metadata fields. */
export function updateOnboardingSession(
  id: string,
  updates: Partial<Pick<OnboardingSession, 'contractId' | 'status'>>
): void {
  const session = getOnboardingSession(id)
  if (!session) return
  Object.assign(session, updates)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(session))
  }
}

/** Get the in-memory File object. Falls back to IndexedDB if not in memory. */
export function getOnboardingFile(id: string): File | null {
  return getFileMap().get(id) ?? null
}

/**
 * Get the File object, trying in-memory first, then IndexedDB.
 * Use this when the file may have been lost from memory (e.g. after OAuth redirect).
 */
export async function getOnboardingFileAsync(id: string): Promise<File | null> {
  // Try in-memory first
  const memFile = getFileMap().get(id)
  if (memFile) return memFile

  // Fall back to IndexedDB
  const idbFile = await loadFileFromIDB(id)
  if (idbFile) {
    // Re-populate in-memory map for fast access
    getFileMap().set(id, idbFile)
  }
  return idbFile
}

/** Remove session data entirely. */
export function clearOnboardingSession(id: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_PREFIX + id)
  }
  getFileMap().delete(id)
  deleteFileFromIDB(id)
}

/**
 * Find the most recent active (non-complete) onboarding session.
 * Returns the session ID or null if none found.
 */
export function findActiveOnboardingSessionId(): string | null {
  if (typeof window === 'undefined') return null

  let bestId: string | null = null
  let bestCreatedAt = 0

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    try {
      const session: OnboardingSession = JSON.parse(
        sessionStorage.getItem(key) || ''
      )
      if (session.status === 'complete') continue

      // Prefer the most recently created session
      const ts = session.createdAt ?? 0
      if (ts >= bestCreatedAt) {
        bestCreatedAt = ts
        bestId = session.id
      }
    } catch {
      // skip malformed entries
    }
  }

  return bestId
}

/**
 * Clean up ALL stale onboarding sessions (e.g. after the infinite-loop bug
 * left orphaned sessions). Keeps only the session with the given ID.
 */
export function cleanupStaleOnboardingSessions(keepId?: string): void {
  if (typeof window === 'undefined') return

  const keysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    try {
      const session: OnboardingSession = JSON.parse(
        sessionStorage.getItem(key) || ''
      )
      if (keepId && session.id === keepId) continue
      keysToRemove.push(key)
      getFileMap().delete(session.id)
      deleteFileFromIDB(session.id)
    } catch {
      keysToRemove.push(key!)
    }
  }

  keysToRemove.forEach((k) => sessionStorage.removeItem(k))
}
