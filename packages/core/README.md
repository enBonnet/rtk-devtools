<p align="center">
  <a href="https://lilohq.com">
    <img src="../../lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# @rtk-devtools/core

Framework-agnostic core engine for RTK Devtools. Provides store observation, event recording, tag graph building, and the optional Redux middleware for timeline tracking.

## Install

```bash
npm install @rtk-devtools/core
# or
pnpm add @rtk-devtools/core
```

## Usage

### Devtools Middleware (Timeline)

Add the middleware to record RTK Query actions into a timeline:

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

### Devtools Instance (Lower-level API)

Create a devtools instance manually for custom UIs or integrations:

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

## Exports

- `createRTKDevtools(config)` — Create a devtools instance
- `createDevtoolsMiddleware(config)` — Create the Redux middleware for timeline event recording
- All TypeScript types (`RTKDevtoolsConfig`, `DevtoolsSnapshot`, `TimelineEvent`, etc.)

## Peer Dependencies

- `@reduxjs/toolkit` >= 1.9.0
- `redux` >= 4.2.0 (optional)

## Inspiration

This project is inspired by [TanStack DevTools](https://github.com/tanstack/devtools).

## License

MIT
