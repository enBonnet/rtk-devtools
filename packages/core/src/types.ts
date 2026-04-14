import type { Store, Middleware, UnknownAction } from 'redux'

// ── Tag System ──────────────────────────────────────────────────────────────

export interface TagDescription {
  type: string
  id?: string | number
}

export interface TagNode {
  tag: TagDescription
  /** Queries currently providing this tag */
  providers: Array<{
    endpointName: string
    cacheKey: string
    status: QueryStatus
  }>
  /** Mutation endpoints whose invalidatesTags includes this tag type */
  invalidators: Array<{
    endpointName: string
  }>
}

// ── Query Entry ─────────────────────────────────────────────────────────────

export type QueryStatus = 'uninitialized' | 'pending' | 'fulfilled' | 'rejected'

export interface DevtoolsQueryEntry {
  cacheKey: string
  endpointName: string
  originalArgs: unknown
  status: QueryStatus
  data: unknown
  error: unknown
  requestId: string | undefined
  startedTimeStamp: number | undefined
  fulfilledTimeStamp: number | undefined
  /** Milliseconds from started to fulfilled */
  duration: number | undefined
  /** Number of active subscribers for this cache key */
  subscriberCount: number
  /** Tags currently provided by this query */
  providedTags: TagDescription[]
  /** Whether the cache entry has a pending invalidation */
  isStale: boolean
  /** Seconds remaining before cache removal (null if has subscribers) */
  cacheLifetimeRemaining: number | null
  /** Lowest active polling interval in ms (undefined if not polling) */
  pollingInterval: number | undefined
}

// ── Mutation Entry ──────────────────────────────────────────────────────────

export interface DevtoolsMutationEntry {
  /** requestId or fixedCacheKey */
  id: string
  endpointName: string
  status: QueryStatus
  originalArgs: unknown
  data: unknown
  error: unknown
  startedTimeStamp: number | undefined
  fulfilledTimeStamp: number | undefined
  duration: number | undefined
  /** Tags invalidated by this mutation (resolved at runtime) */
  invalidatedTags: TagDescription[]
}

// ── Timeline Events ─────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'query-started'
  | 'query-fulfilled'
  | 'query-rejected'
  | 'mutation-started'
  | 'mutation-fulfilled'
  | 'mutation-rejected'
  | 'invalidation'
  | 'cache-entry-removed'
  | 'subscription-added'
  | 'subscription-removed'

export interface TimelineEvent {
  id: string
  timestamp: number
  type: TimelineEventType
  endpointName: string
  cacheKey?: string
  tags?: TagDescription[]
  duration?: number
  meta?: Record<string, unknown>
}

// ── Snapshot ─────────────────────────────────────────────────────────────────

export interface DevtoolsStats {
  totalQueries: number
  activeQueries: number
  pendingQueries: number
  errorQueries: number
  totalMutations: number
  pendingMutations: number
  totalSubscriptions: number
}

export interface DevtoolsSnapshot {
  queries: Map<string, DevtoolsQueryEntry>
  mutations: Map<string, DevtoolsMutationEntry>
  tagGraph: TagNode[]
  timeline: TimelineEvent[]
  stats: DevtoolsStats
  timestamp: number
}

// ── API Endpoint Info ───────────────────────────────────────────────────────

export interface ApiEndpointInfo {
  name: string
  type: 'query' | 'mutation'
  /** Tag types statically defined on this endpoint */
  tagTypes: string[]
}

// ── Configuration ───────────────────────────────────────────────────────────

export interface RTKDevtoolsConfig {
  /** The RTK Query API instance returned by createApi() */
  api: RTKQueryApi
  /** The Redux store */
  store: Store
  /** Maximum timeline events to keep (default: 500) */
  maxTimelineEvents?: number
  /** Throttle interval for snapshot updates in ms (default: 100) */
  throttleMs?: number
}

export interface DevtoolsMiddlewareConfig {
  /** The RTK Query API instance */
  api: RTKQueryApi
}

// ── RTK Devtools Instance ──────────────────────────────────────────────────

export interface RTKDevtoolsInstance {
  /** Get the current snapshot */
  getSnapshot(): DevtoolsSnapshot
  /** Subscribe to snapshot changes */
  subscribe(listener: (snapshot: DevtoolsSnapshot) => void): () => void
  /** Start observing the store */
  start(): void
  /** Stop observing the store */
  stop(): void
  /** Clear timeline events */
  clearTimeline(): void
  /** Get API endpoint definitions */
  getEndpoints(): ApiEndpointInfo[]
  /** Dispatch a refetch for a query */
  refetchQuery(endpointName: string, args: unknown): void
  /** Remove a query cache entry */
  removeCacheEntry(endpointName: string, args: unknown): void
  /** The event recorder (for middleware integration) */
  recorder: EventRecorderInstance
}

export interface EventRecorderInstance {
  record(event: TimelineEvent): void
  getEvents(filter?: TimelineEventFilter): TimelineEvent[]
  clear(): void
  subscribe(listener: (event: TimelineEvent) => void): () => void
}

export interface TimelineEventFilter {
  types?: TimelineEventType[]
  endpointName?: string
  since?: number
}

// ── RTK Query Internal Types (minimal subset we depend on) ──────────────────

/**
 * Minimal interface for the RTK Query API object.
 * We only depend on the public surface of createApi() return.
 */
export interface RTKQueryApi {
  reducerPath: string
  endpoints: Record<string, RTKQueryEndpoint>
  middleware: Middleware
  util: {
    resetApiState: () => UnknownAction
    invalidateTags: (tags: TagDescription[]) => UnknownAction
  }
  internalActions?: Record<string, unknown>
}

export interface RTKQueryEndpoint {
  name: string
  initiate: (arg: unknown, options?: { forceRefetch?: boolean }) => unknown
  matchPending?: (action: unknown) => boolean
  matchFulfilled?: (action: unknown) => boolean
  matchRejected?: (action: unknown) => boolean
  // Present on query endpoints:
  select?: (arg: unknown) => (state: unknown) => unknown
}

/**
 * Shape of RTK Query's internal state under store.getState()[reducerPath].
 * This matches RTK Query's CombinedState type.
 */
export interface RTKQueryState {
  queries: Record<string, RTKQueryCacheEntry | undefined>
  mutations: Record<string, RTKMutationCacheEntry | undefined>
  provided: Record<string, Record<string, string[]>>
  subscriptions: Record<string, Record<string, RTKSubscriptionEntry> | undefined>
  config: {
    online: boolean
    focused: boolean
    middlewareRegistered: boolean | string
    refetchOnMountOrArgChange: boolean | number
    refetchOnReconnect: boolean
    refetchOnFocus: boolean
    keepUnusedDataFor: number
    reducerPath: string
    invalidationBehavior: string
  }
}

export interface RTKQueryCacheEntry {
  status: QueryStatus
  data?: unknown
  error?: unknown
  requestId?: string
  originalArgs?: unknown
  startedTimeStamp?: number
  fulfilledTimeStamp?: number
  endpointName?: string
  isUninitialized?: boolean
}

export interface RTKMutationCacheEntry {
  status: QueryStatus
  data?: unknown
  error?: unknown
  requestId?: string
  originalArgs?: unknown
  startedTimeStamp?: number
  fulfilledTimeStamp?: number
  endpointName?: string
  fixedCacheKey?: string
}

export interface RTKSubscriptionEntry {
  pollingInterval?: number
  refetchOnReconnect?: boolean
  refetchOnFocus?: boolean
}
