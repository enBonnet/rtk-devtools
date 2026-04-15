<p align="center">
  <a href="https://lilohq.com">
    <img src="../../lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# @rtk-devtools/core

Framework-agnostic core engine for RTK Devtools. Handles store observation, snapshot generation, event recording, tag graph building, and the optional Redux middleware for timeline tracking.

This package is part of [RTK Devtools](https://github.com/enBonnet/rtk-devtools). For the full devtools experience, install all three packages:

```bash
npm install @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
```

## Install

```bash
npm install @rtk-devtools/core
# or
pnpm add @rtk-devtools/core
```

## API

### `createDevtoolsMiddleware({ api })`

Redux middleware that intercepts RTK Query actions to record timeline events. Purely observational — it never modifies actions or state. Without this middleware, the Queries, Mutations, Tags, and Subscriptions panels still work (they read directly from the Redux store). Only the Timeline panel requires it.

```ts
import { configureStore } from "@reduxjs/toolkit";
import { createDevtoolsMiddleware } from "@rtk-devtools/core";
import { api } from "./api";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(createDevtoolsMiddleware({ api })),
});
```

The returned middleware also exposes a `connectRecorder(recorder)` method to integrate with a devtools instance's event recorder.

### `createRTKDevtools(config)`

Create a devtools instance that observes the Redux store and produces snapshots of RTK Query state. Useful for building custom UIs or integrating with other tools.

**Config options:**

| Option              | Type          | Default    | Description                                   |
| ------------------- | ------------- | ---------- | --------------------------------------------- |
| `api`               | `RTKQueryApi` | _required_ | The RTK Query API instance from `createApi()` |
| `store`             | `Store`       | _required_ | The Redux store                               |
| `maxTimelineEvents` | `number`      | `500`      | Maximum timeline events to retain             |
| `throttleMs`        | `number`      | `100`      | Throttle interval for snapshot updates in ms  |

**Instance methods:**

| Method                                 | Description                                                    |
| -------------------------------------- | -------------------------------------------------------------- |
| `getSnapshot()`                        | Returns the current `DevtoolsSnapshot`                         |
| `subscribe(listener)`                  | Subscribe to snapshot changes. Returns an unsubscribe function |
| `start()`                              | Start observing the store                                      |
| `stop()`                               | Stop observing the store                                       |
| `clearTimeline()`                      | Clear all recorded timeline events                             |
| `getEndpoints()`                       | Get API endpoint definitions (name, type, tag types)           |
| `refetchQuery(endpointName, args)`     | Dispatch a refetch for a query                                 |
| `removeCacheEntry(endpointName, args)` | Remove a query cache entry                                     |

```ts
import { createRTKDevtools } from "@rtk-devtools/core";

const devtools = createRTKDevtools({ api, store });
devtools.start();

devtools.subscribe((snapshot) => {
  console.log(snapshot.stats);
  console.log(snapshot.queries);
  console.log(snapshot.tagGraph);
});
```

### Exported Types

`RTKDevtoolsConfig`, `RTKDevtoolsInstance`, `DevtoolsSnapshot`, `DevtoolsStats`, `DevtoolsQueryEntry`, `DevtoolsMutationEntry`, `TagDescription`, `TagNode`, `TimelineEvent`, `TimelineEventType`, `TimelineEventFilter`, `ApiEndpointInfo`, `QueryStatus`, `EventRecorderInstance`, `RTKQueryApi`, `DevtoolsMiddlewareConfig`

## Peer Dependencies

- `@reduxjs/toolkit` >= 1.9.0
- `redux` >= 4.2.0 (optional)

## Inspiration

This project is inspired by [TanStack DevTools](https://github.com/tanstack/devtools).

## License

MIT
