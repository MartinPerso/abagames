const LOCAL_REWARD_VIDEO_DB_NAME = 'abagames-local-reward-videos'
const LOCAL_REWARD_VIDEO_DB_VERSION = 1
const LOCAL_REWARD_VIDEO_STORE_NAME = 'videos'

const MAX_SINGLE_LOCAL_REWARD_VIDEO_BYTES = 80 * 1024 * 1024
const MAX_TOTAL_LOCAL_REWARD_VIDEO_BYTES = 400 * 1024 * 1024

type LocalRewardVideoRecord = {
  id: string
  blob: Blob
  sizeBytes: number
  updatedAtMs: number
}

type LocalRewardVideoStore = {
  put(value: LocalRewardVideoRecord): IDBRequest<IDBValidKey>
  get(query: IDBValidKey | IDBKeyRange): IDBRequest<LocalRewardVideoRecord | undefined>
  delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined>
  openCursor(query?: IDBValidKey | IDBKeyRange | null): IDBRequest<IDBCursorWithValue | null>
}

export const localRewardVideoLimits = {
  maxSingleVideoBytes: MAX_SINGLE_LOCAL_REWARD_VIDEO_BYTES,
  maxTotalBytes: MAX_TOTAL_LOCAL_REWARD_VIDEO_BYTES,
}

export type LocalRewardVideoCapacityFailureReason = 'single-video-too-large' | 'total-capacity-exceeded'

export type LocalRewardVideoCapacityCheck =
  | {
      ok: true
      totalBytesAfterSave: number
    }
  | {
      ok: false
      reason: LocalRewardVideoCapacityFailureReason
      totalBytesAfterSave: number
    }

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }
  return String(error)
}

function getIndexedDbFactory(): IDBFactory {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB unavailable on this device.')
  }
  return window.indexedDB
}

function openLocalRewardVideoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest
    try {
      request = getIndexedDbFactory().open(
        LOCAL_REWARD_VIDEO_DB_NAME,
        LOCAL_REWARD_VIDEO_DB_VERSION,
      )
    } catch (error) {
      reject(new Error(`Unable to open local video database: ${toErrorMessage(error)}`))
      return
    }

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(LOCAL_REWARD_VIDEO_STORE_NAME)) {
        database.createObjectStore(LOCAL_REWARD_VIDEO_STORE_NAME, {
          keyPath: 'id',
        })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`Unable to open local video database: ${toErrorMessage(request.error)}`))
    }
  })
}

function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error(`IndexedDB request failed: ${toErrorMessage(request.error)}`))
    }
  })
}

async function withVideoStore<T>(
  mode: IDBTransactionMode,
  run: (store: LocalRewardVideoStore, transaction: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const database = await openLocalRewardVideoDatabase()

  try {
    const transaction = database.transaction(LOCAL_REWARD_VIDEO_STORE_NAME, mode)
    const store = transaction.objectStore(LOCAL_REWARD_VIDEO_STORE_NAME) as LocalRewardVideoStore
    const result = await run(store, transaction)

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve()
      }
      transaction.onabort = () => {
        reject(new Error(`IndexedDB transaction aborted: ${toErrorMessage(transaction.error)}`))
      }
      transaction.onerror = () => {
        reject(new Error(`IndexedDB transaction failed: ${toErrorMessage(transaction.error)}`))
      }
    })

    return result
  } finally {
    database.close()
  }
}

async function sumAllStoredLocalRewardVideoBytes(): Promise<number> {
  return withVideoStore('readonly', async (store) => {
    const cursorRequest = store.openCursor()
    let totalBytes = 0

    await new Promise<void>((resolve, reject) => {
      cursorRequest.onerror = () => {
        reject(new Error(`Unable to read local videos: ${toErrorMessage(cursorRequest.error)}`))
      }

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result
        if (!cursor) {
          resolve()
          return
        }

        const value = cursor.value as LocalRewardVideoRecord
        totalBytes += Number.isFinite(value.sizeBytes) ? Math.max(0, Math.floor(value.sizeBytes)) : 0
        cursor.continue()
      }
    })

    return totalBytes
  })
}

export async function getLocalRewardVideoSizeBytes(videoId: string): Promise<number> {
  if (videoId.trim() === '') {
    return 0
  }

  const record = await withVideoStore('readonly', async (store) => {
    const result = await waitForRequest(store.get(videoId))
    return result ?? null
  })

  if (!record) {
    return 0
  }

  return Number.isFinite(record.sizeBytes) ? Math.max(0, Math.floor(record.sizeBytes)) : 0
}

export async function getTotalLocalRewardVideoBytes(): Promise<number> {
  return sumAllStoredLocalRewardVideoBytes()
}

export async function checkLocalRewardVideoCapacity(
  nextVideoSizeBytes: number,
  replacingVideoId: string | null,
): Promise<LocalRewardVideoCapacityCheck> {
  const sanitizedNextSizeBytes = Math.max(0, Math.floor(nextVideoSizeBytes))

  if (sanitizedNextSizeBytes > MAX_SINGLE_LOCAL_REWARD_VIDEO_BYTES) {
    return {
      ok: false,
      reason: 'single-video-too-large',
      totalBytesAfterSave: sanitizedNextSizeBytes,
    }
  }

  const [totalStoredBytes, currentSizeBytes] = await Promise.all([
    sumAllStoredLocalRewardVideoBytes(),
    replacingVideoId ? getLocalRewardVideoSizeBytes(replacingVideoId) : Promise.resolve(0),
  ])

  const totalBytesAfterSave = totalStoredBytes - currentSizeBytes + sanitizedNextSizeBytes
  if (totalBytesAfterSave > MAX_TOTAL_LOCAL_REWARD_VIDEO_BYTES) {
    return {
      ok: false,
      reason: 'total-capacity-exceeded',
      totalBytesAfterSave,
    }
  }

  return {
    ok: true,
    totalBytesAfterSave,
  }
}

export async function setStoredLocalRewardVideoBlob(videoId: string, blob: Blob): Promise<void> {
  if (videoId.trim() === '') {
    throw new Error('Cannot store a local reward video without an id.')
  }

  const sizeBytes = Math.max(0, Math.floor(blob.size))

  await withVideoStore('readwrite', async (store) => {
    await waitForRequest(
      store.put({
        id: videoId,
        blob,
        sizeBytes,
        updatedAtMs: Date.now(),
      }),
    )
  })
}

export async function getStoredLocalRewardVideoBlob(videoId: string): Promise<Blob | null> {
  if (videoId.trim() === '') {
    return null
  }

  const record = await withVideoStore('readonly', async (store) => {
    const result = await waitForRequest(store.get(videoId))
    return result ?? null
  })

  if (!record) {
    return null
  }

  return record.blob
}

export async function deleteStoredLocalRewardVideo(videoId: string): Promise<void> {
  if (videoId.trim() === '') {
    return
  }

  await withVideoStore('readwrite', async (store) => {
    await waitForRequest(store.delete(videoId))
  })
}

export async function cleanupUnusedStoredLocalRewardVideos(validVideoIds: Set<string>): Promise<void> {
  await withVideoStore('readwrite', async (store) => {
    const staleVideoIds: string[] = []
    const cursorRequest = store.openCursor()

    await new Promise<void>((resolve, reject) => {
      cursorRequest.onerror = () => {
        reject(new Error(`Unable to read local video entries: ${toErrorMessage(cursorRequest.error)}`))
      }

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result
        if (!cursor) {
          resolve()
          return
        }

        const value = cursor.value as LocalRewardVideoRecord
        if (!validVideoIds.has(value.id)) {
          staleVideoIds.push(value.id)
        }
        cursor.continue()
      }
    })

    await Promise.all(staleVideoIds.map((videoId) => waitForRequest(store.delete(videoId))))
  })
}

export async function requestPersistentStorageIfAvailable(): Promise<boolean | null> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return null
  }

  try {
    return await navigator.storage.persist()
  } catch {
    return null
  }
}

export async function getStorageEstimateIfAvailable(): Promise<
  | {
      usageBytes: number
      quotaBytes: number
    }
  | null
> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage
    const quota = estimate.quota
    if (
      typeof usage !== 'number' ||
      typeof quota !== 'number' ||
      !Number.isFinite(usage) ||
      !Number.isFinite(quota)
    ) {
      return null
    }

    return {
      usageBytes: Math.max(0, Math.floor(usage)),
      quotaBytes: Math.max(0, Math.floor(quota)),
    }
  } catch {
    return null
  }
}
