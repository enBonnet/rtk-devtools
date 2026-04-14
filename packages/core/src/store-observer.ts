import type {
  RTKQueryApi,
  RTKQueryState,
  RTKQueryCacheEntry,
  RTKMutationCacheEntry,
  DevtoolsQueryEntry,
  DevtoolsMutationEntry,
  DevtoolsSnapshot,
  DevtoolsStats,
  TagDescription,
  QueryStatus,
  EventRecorderInstance,
} from './types'
import { buildTagGraph } from './tag-graph'
import { createCacheTimerTracker } from './cache-timer-tracker'
import type { Store } from 'redux'

export interface StoreObserverConfig {
  api: RTKQueryApi
  store: Store
  recorder: EventRecorderInstance
  throttleMs?: number
}

export function createStoreObserver(config: StoreObserverConfig) {
  const { api, store, recorder, throttleMs = 100 } = config
  const { reducerPath } = api

  const listeners = new Set<(snapshot: DevtoolsSnapshot) => void>()
  const cacheTimerTracker = createCacheTimerTracker(getDefaultKeepUnusedDataFor())

  let unsubscribe: (() => void) | null = null
  let prevApiState: RTKQueryState | null = null
  let currentSnapshot: DevtoolsSnapshot = createEmptySnapshot()
  let throttleTimer: ReturnType<typeof setTimeout> | null = null
  let pendingUpdate = false

  function getDefaultKeepUnusedDataFor(): number {
    try {
      const state = store.getState()
      const apiState = state[reducerPath] as RTKQueryState | undefined
      return apiState?.config?.keepUnusedDataFor ?? 60
    } catch {
      return 60
    }
  }

  function getApiState(): RTKQueryState | undefined {
    try {
      const state = store.getState()
      return state[reducerPath] as RTKQueryState | undefined
    } catch {
      return undefined
    }
  }

  function computeSnapshot(apiState: RTKQueryState): DevtoolsSnapshot {
    const queries = extractQueries(apiState)
    const mutations = extractMutations(apiState)
    const tagGraph = buildTagGraph(apiState, api)
    const timeline = recorder.getEvents()
    const stats = computeStats(queries, mutations, apiState)

    // Update cache timer tracker
    const subscriberCounts = new Map<string, number>()
    const endpointNames = new Map<string, string>()
    for (const [key, entry] of queries) {
      subscriberCounts.set(key, entry.subscriberCount)
      endpointNames.set(key, entry.endpointName)
    }
    cacheTimerTracker.update(subscriberCounts, endpointNames)

    // Enrich queries with cache lifetime
    for (const [key, entry] of queries) {
      entry.cacheLifetimeRemaining = cacheTimerTracker.getRemaining(key)
    }

    return {
      queries,
      mutations,
      tagGraph,
      timeline,
      stats,
      timestamp: Date.now(),
    }
  }

  function extractQueries(apiState: RTKQueryState): Map<string, DevtoolsQueryEntry> {
    const result = new Map<string, DevtoolsQueryEntry>()

    for (const [cacheKey, entry] of Object.entries(apiState.queries)) {
      if (!entry) continue

      const subscriberCount = countSubscribers(apiState, cacheKey)
      const providedTags = getProvidedTagsForCacheKey(apiState, cacheKey)
      const pollingInterval = getPollingInterval(apiState, cacheKey)
      const duration = computeDuration(entry)

      result.set(cacheKey, {
        cacheKey,
        endpointName: entry.endpointName ?? extractEndpointName(cacheKey),
        originalArgs: entry.originalArgs,
        status: entry.status as QueryStatus,
        data: entry.data,
        error: entry.error,
        requestId: entry.requestId,
        startedTimeStamp: entry.startedTimeStamp,
        fulfilledTimeStamp: entry.fulfilledTimeStamp,
        duration,
        subscriberCount,
        providedTags,
        isStale: false, // Updated by timeline events
        cacheLifetimeRemaining: null, // Updated by cache timer tracker
        pollingInterval,
      })
    }

    return result
  }

  function extractMutations(apiState: RTKQueryState): Map<string, DevtoolsMutationEntry> {
    const result = new Map<string, DevtoolsMutationEntry>()

    for (const [id, entry] of Object.entries(apiState.mutations)) {
      if (!entry) continue

      const duration = computeDuration(entry)

      result.set(id, {
        id,
        endpointName: entry.endpointName ?? '',
        status: entry.status as QueryStatus,
        originalArgs: entry.originalArgs,
        data: entry.data,
        error: entry.error,
        startedTimeStamp: entry.startedTimeStamp,
        fulfilledTimeStamp: entry.fulfilledTimeStamp,
        duration,
        invalidatedTags: [], // Populated from timeline events
      })
    }

    return result
  }

  function countSubscribers(apiState: RTKQueryState, cacheKey: string): number {
    const subs = apiState.subscriptions[cacheKey]
    if (!subs) return 0
    return Object.keys(subs).length
  }

  function getProvidedTagsForCacheKey(
    apiState: RTKQueryState,
    cacheKey: string,
  ): TagDescription[] {
    const tags: TagDescription[] = []
    for (const [tagType, tagIdMap] of Object.entries(apiState.provided)) {
      for (const [tagId, cacheKeys] of Object.entries(tagIdMap)) {
        if (cacheKeys.includes(cacheKey)) {
          tags.push(
            tagId === '__internal_without_id'
              ? { type: tagType }
              : { type: tagType, id: parseTagId(tagId) },
          )
        }
      }
    }
    return tags
  }

  function getPollingInterval(apiState: RTKQueryState, cacheKey: string): number | undefined {
    const subs = apiState.subscriptions[cacheKey]
    if (!subs) return undefined

    let minInterval: number | undefined

    for (const sub of Object.values(subs)) {
      if (sub.pollingInterval && sub.pollingInterval > 0) {
        if (minInterval === undefined || sub.pollingInterval < minInterval) {
          minInterval = sub.pollingInterval
        }
      }
    }

    return minInterval
  }

  function computeDuration(
    entry: RTKQueryCacheEntry | RTKMutationCacheEntry,
  ): number | undefined {
    if (entry.startedTimeStamp && entry.fulfilledTimeStamp) {
      return entry.fulfilledTimeStamp - entry.startedTimeStamp
    }
    return undefined
  }

  function computeStats(
    queries: Map<string, DevtoolsQueryEntry>,
    mutations: Map<string, DevtoolsMutationEntry>,
    apiState: RTKQueryState,
  ): DevtoolsStats {
    let activeQueries = 0
    let pendingQueries = 0
    let errorQueries = 0

    for (const entry of queries.values()) {
      if (entry.subscriberCount > 0) activeQueries++
      if (entry.status === 'pending') pendingQueries++
      if (entry.status === 'rejected') errorQueries++
    }

    let pendingMutations = 0
    for (const entry of mutations.values()) {
      if (entry.status === 'pending') pendingMutations++
    }

    let totalSubscriptions = 0
    for (const subs of Object.values(apiState.subscriptions)) {
      if (subs) totalSubscriptions += Object.keys(subs).length
    }

    return {
      totalQueries: queries.size,
      activeQueries,
      pendingQueries,
      errorQueries,
      totalMutations: mutations.size,
      pendingMutations,
      totalSubscriptions,
    }
  }

  function handleStoreChange(): void {
    if (throttleTimer) {
      pendingUpdate = true
      return
    }

    performUpdate()

    throttleTimer = setTimeout(() => {
      throttleTimer = null
      if (pendingUpdate) {
        pendingUpdate = false
        performUpdate()
      }
    }, throttleMs)
  }

  function performUpdate(): void {
    const apiState = getApiState()
    if (!apiState) return

    // Shallow comparison: skip if no RTK Query state slice changed
    if (
      prevApiState &&
      prevApiState.queries === apiState.queries &&
      prevApiState.mutations === apiState.mutations &&
      prevApiState.provided === apiState.provided &&
      prevApiState.subscriptions === apiState.subscriptions
    ) {
      return
    }

    prevApiState = apiState
    currentSnapshot = computeSnapshot(apiState)
    listeners.forEach((listener) => listener(currentSnapshot))
  }

  function start(): void {
    if (unsubscribe) return
    // Compute initial snapshot
    const apiState = getApiState()
    if (apiState) {
      prevApiState = apiState
      currentSnapshot = computeSnapshot(apiState)
    }
    unsubscribe = store.subscribe(handleStoreChange)
  }

  function stop(): void {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer)
      throttleTimer = null
    }
    prevApiState = null
    cacheTimerTracker.clear()
  }

  function getSnapshot(): DevtoolsSnapshot {
    return currentSnapshot
  }

  function subscribe(listener: (snapshot: DevtoolsSnapshot) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return { start, stop, getSnapshot, subscribe }
}

function createEmptySnapshot(): DevtoolsSnapshot {
  return {
    queries: new Map(),
    mutations: new Map(),
    tagGraph: [],
    timeline: [],
    stats: {
      totalQueries: 0,
      activeQueries: 0,
      pendingQueries: 0,
      errorQueries: 0,
      totalMutations: 0,
      pendingMutations: 0,
      totalSubscriptions: 0,
    },
    timestamp: Date.now(),
  }
}

function extractEndpointName(cacheKey: string): string {
  const parenIndex = cacheKey.indexOf('(')
  return parenIndex > -1 ? cacheKey.slice(0, parenIndex) : cacheKey
}

function parseTagId(id: string): string | number {
  const num = Number(id)
  return !isNaN(num) && String(num) === id ? num : id
}
