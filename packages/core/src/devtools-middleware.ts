import type { Middleware } from 'redux'
import type {
  DevtoolsMiddlewareConfig,
  EventRecorderInstance,
  TimelineEvent,
  TagDescription,
} from './types'
import { generateEventId } from './event-recorder'

/**
 * Creates an optional Redux middleware that intercepts RTK Query actions
 * and records timeline events.
 *
 * This middleware is purely observational — it passes all actions through
 * unchanged and never modifies state.
 */
export function createDevtoolsMiddleware(
  config: DevtoolsMiddlewareConfig,
  recorder: EventRecorderInstance,
): Middleware {
  const { api } = config
  const { reducerPath } = api

  // Action type patterns for RTK Query
  const queryPending = `${reducerPath}/executeQuery/pending`
  const queryFulfilled = `${reducerPath}/executeQuery/fulfilled`
  const queryRejected = `${reducerPath}/executeQuery/rejected`
  const mutationPending = `${reducerPath}/executeMutation/pending`
  const mutationFulfilled = `${reducerPath}/executeMutation/fulfilled`
  const mutationRejected = `${reducerPath}/executeMutation/rejected`
  const invalidateTags = `${reducerPath}/invalidateTags`

  // Subscription action patterns
  const subscriptionsPrefix = `${reducerPath}/internalSubscriptions`
  const unsubscribePrefix = `${reducerPath}/unsubscribeQueryResult`

  return () => (next) => (action: unknown) => {
    // Pass through immediately — we are read-only
    const result = next(action)

    // Type guard for Redux actions
    if (!isAction(action)) return result

    const { type } = action
    const now = Date.now()

    // Query lifecycle
    if (type === queryPending) {
      const meta = extractMeta(action)
      recorder.record(createEvent('query-started', now, meta))
    } else if (type === queryFulfilled) {
      const meta = extractMeta(action)
      recorder.record(createEvent('query-fulfilled', now, meta))
    } else if (type === queryRejected) {
      const meta = extractMeta(action)
      recorder.record(createEvent('query-rejected', now, meta))
    }
    // Mutation lifecycle
    else if (type === mutationPending) {
      const meta = extractMeta(action)
      recorder.record(createEvent('mutation-started', now, meta))
    } else if (type === mutationFulfilled) {
      const meta = extractMeta(action)
      recorder.record(createEvent('mutation-fulfilled', now, meta))
    } else if (type === mutationRejected) {
      const meta = extractMeta(action)
      recorder.record(createEvent('mutation-rejected', now, meta))
    }
    // Tag invalidation
    else if (type === invalidateTags) {
      const tags = extractInvalidatedTags(action)
      const event: TimelineEvent = {
        id: generateEventId(),
        timestamp: now,
        type: 'invalidation',
        endpointName: '',
        tags,
      }
      recorder.record(event)
    }
    // Subscriptions
    else if (type.startsWith(subscriptionsPrefix) || type.includes('/subscriptions/')) {
      handleSubscriptionAction(type, action, now, recorder)
    } else if (type === unsubscribePrefix || type.includes('unsubscribeQueryResult')) {
      const meta = extractMeta(action)
      recorder.record(createEvent('subscription-removed', now, meta))
    }

    return result
  }
}

function createEvent(
  type: TimelineEvent['type'],
  timestamp: number,
  meta: ActionMeta,
): TimelineEvent {
  return {
    id: generateEventId(),
    timestamp,
    type,
    endpointName: meta.endpointName,
    cacheKey: meta.queryCacheKey,
    meta: meta.extra,
  }
}

interface ActionMeta {
  endpointName: string
  queryCacheKey?: string
  extra?: Record<string, unknown>
}

function extractMeta(action: Record<string, unknown>): ActionMeta {
  const meta = action.meta as Record<string, unknown> | undefined
  const arg = meta?.arg as Record<string, unknown> | undefined

  return {
    endpointName:
      (arg?.endpointName as string) ??
      (meta?.endpointName as string) ??
      '',
    queryCacheKey:
      (arg?.queryCacheKey as string) ??
      (meta?.queryCacheKey as string) ??
      undefined,
    extra: meta
      ? {
          requestId: meta.requestId as string | undefined,
          requestStatus: meta.requestStatus as string | undefined,
        }
      : undefined,
  }
}

function extractInvalidatedTags(action: Record<string, unknown>): TagDescription[] {
  const payload = action.payload as unknown[] | undefined
  if (!Array.isArray(payload)) return []

  return payload.map((tag) => {
    if (typeof tag === 'string') return { type: tag }
    const t = tag as Record<string, unknown>
    return {
      type: t.type as string,
      ...(t.id !== undefined ? { id: t.id as string | number } : {}),
    }
  })
}

function handleSubscriptionAction(
  type: string,
  _action: Record<string, unknown>,
  timestamp: number,
  recorder: EventRecorderInstance,
): void {
  // RTK Query subscription actions vary by version
  // We detect add vs remove from the action type suffix
  const isAdd = type.includes('add') || type.includes('subscribe')
  const meta = extractMeta(_action)

  recorder.record({
    id: generateEventId(),
    timestamp,
    type: isAdd ? 'subscription-added' : 'subscription-removed',
    endpointName: meta.endpointName,
    cacheKey: meta.queryCacheKey,
  })
}

function isAction(action: unknown): action is Record<string, unknown> & { type: string } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof (action as Record<string, unknown>).type === 'string'
  )
}
