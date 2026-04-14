import type {
  RTKDevtoolsConfig,
  RTKDevtoolsInstance,
  ApiEndpointInfo,
  DevtoolsMiddlewareConfig,
} from "./types";
import { createStoreObserver } from "./store-observer";
import { createEventRecorder } from "./event-recorder";
import { createDevtoolsMiddleware as createMiddleware } from "./devtools-middleware";
import type { Middleware } from "redux";

export function createRTKDevtools(
  config: RTKDevtoolsConfig,
): RTKDevtoolsInstance {
  const { api, store, maxTimelineEvents = 500, throttleMs = 100 } = config;
  const recorder = createEventRecorder(maxTimelineEvents);

  const observer = createStoreObserver({
    api,
    store,
    recorder,
    throttleMs,
  });

  function getEndpoints(): ApiEndpointInfo[] {
    const endpoints: ApiEndpointInfo[] = [];

    for (const [name, endpoint] of Object.entries(api.endpoints)) {
      const ep = endpoint as unknown as Record<string, unknown>;
      // Query endpoints have a `select` method; mutations do not
      const isQuery = typeof ep.select === "function";

      endpoints.push({
        name,
        type: isQuery ? "query" : "mutation",
        tagTypes: extractEndpointTagTypes(ep, isQuery),
      });
    }

    return endpoints;
  }

  function refetchQuery(endpointName: string, args: unknown): void {
    const endpoint = api.endpoints[endpointName];
    if (endpoint?.initiate) {
      store.dispatch(endpoint.initiate(args, { forceRefetch: true }) as never);
    }
  }

  function removeCacheEntry(_endpointName: string, _args: unknown): void {
    // Reset entire API state — granular cache removal requires
    // internal RTK Query utilities that aren't part of the public API
    store.dispatch(api.util.resetApiState());
  }

  return {
    getSnapshot: () => observer.getSnapshot(),
    subscribe: (listener) => observer.subscribe(listener),
    start: () => observer.start(),
    stop: () => observer.stop(),
    clearTimeline: () => recorder.clear(),
    getEndpoints,
    refetchQuery,
    removeCacheEntry,
    recorder,
  };
}

/**
 * Create the devtools middleware for timeline event recording.
 * This is a standalone factory so users can add it to their store config
 * independently of creating the devtools instance.
 *
 * Usage:
 * ```ts
 * const devtoolsMiddleware = createDevtoolsMiddleware({ api })
 * // Later, connect to the devtools instance:
 * devtoolsMiddleware.connectRecorder(devtools.recorder)
 * ```
 */
export function createDevtoolsMiddleware(
  config: DevtoolsMiddlewareConfig,
): Middleware & {
  connectRecorder(recorder: RTKDevtoolsInstance["recorder"]): void;
} {
  const recorder = createEventRecorder();
  let connectedRecorder = recorder;

  const middleware = createMiddleware(config, {
    record: (event) => connectedRecorder.record(event),
    getEvents: (filter) => connectedRecorder.getEvents(filter),
    clear: () => connectedRecorder.clear(),
    subscribe: (listener) => connectedRecorder.subscribe(listener),
  });

  // Allow connecting to the devtools's recorder later
  const enhanced = middleware as Middleware & {
    connectRecorder(r: RTKDevtoolsInstance["recorder"]): void;
  };
  enhanced.connectRecorder = (r) => {
    // Transfer existing events to the new recorder
    for (const event of connectedRecorder.getEvents()) {
      r.record(event);
    }
    connectedRecorder = r;
  };

  return enhanced;
}

function extractEndpointTagTypes(
  endpoint: Record<string, unknown>,
  isQuery: boolean,
): string[] {
  const tagsProp = isQuery ? "providesTags" : "invalidatesTags";
  const tags = endpoint[tagsProp];

  if (Array.isArray(tags)) {
    return tags.map((t) =>
      typeof t === "string" ? t : (t as { type: string }).type,
    );
  }

  // Check nested definition
  const definition = endpoint.definition as Record<string, unknown> | undefined;
  if (definition && Array.isArray(definition[tagsProp])) {
    return (definition[tagsProp] as unknown[]).map((t) =>
      typeof t === "string" ? t : (t as { type: string }).type,
    );
  }

  return [];
}

// Re-export types
export type {
  RTKDevtoolsConfig,
  RTKDevtoolsInstance,
  DevtoolsMiddlewareConfig,
  DevtoolsSnapshot,
  DevtoolsQueryEntry,
  DevtoolsMutationEntry,
  DevtoolsStats,
  TagDescription,
  TagNode,
  TimelineEvent,
  TimelineEventType,
  TimelineEventFilter,
  ApiEndpointInfo,
  QueryStatus,
  EventRecorderInstance,
  RTKQueryApi,
} from "./types";
