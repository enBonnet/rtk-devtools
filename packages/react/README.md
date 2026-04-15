<p align="center">
  <a href="https://lilohq.com">
    <img src="../../lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# @rtk-devtools/react

React adapter for RTK Devtools. This is the main package most users interact with. It provides the `<RTKDevtools />` component — a floating, resizable panel that gives you deep visibility into RTK Query's cache, subscriptions, tag-based invalidation, and request lifecycle.

This package is part of [RTK Devtools](https://github.com/enBonnet/rtk-devtools). For the full devtools experience, install all three packages:

```bash
npm install @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
# or
pnpm add @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
# or
yarn add @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
```

## Quick Start

**1. Add the devtools middleware** (optional — enables the Timeline panel):

```ts
// store.ts
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

**2. Render the devtools component:**

```tsx
// App.tsx
import { RTKDevtools } from "@rtk-devtools/react";
import { api } from "./api";
import { store } from "./store";

function App() {
  return (
    <>
      <YourApp />
      <RTKDevtools api={api} store={store} />
    </>
  );
}
```

Click the **RTK** button in the bottom-right corner to open the panel.

> If your app already has a `<Provider store={store}>`, you can omit the `store` prop — it will be auto-detected from the React-Redux context.

## `<RTKDevtools />` Props

| Prop                | Type                                                           | Default                        | Description                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api`               | `RTKQueryApi`                                                  | _required_                     | The RTK Query API instance created by `createApi()`                                                                                                                             |
| `store`             | `Store`                                                        | auto-detected                  | The Redux store. If omitted, it is auto-detected from the `react-redux` `<Provider>` context                                                                                    |
| `initialOpen`       | `boolean`                                                      | `false`                        | Whether the panel starts open. The open/closed state is persisted to `localStorage` after the first toggle                                                                      |
| `buttonPosition`    | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"bottom-right"`               | Position of the floating toggle button                                                                                                                                          |
| `position`          | `"top" \| "bottom" \| "left" \| "right"`                       | `"bottom"`                     | Which screen edge the panel docks to                                                                                                                                            |
| `panelSize`         | `number`                                                       | `400`                          | Initial panel height (for top/bottom) or width (for left/right) in pixels. Minimum: 200px, maximum: 80% of the viewport. The size is persisted to `localStorage` after resizing |
| `theme`             | `"light" \| "dark" \| "system"`                                | `"dark"`                       | Color theme for the devtools panel                                                                                                                                              |
| `maxTimelineEvents` | `number`                                                       | `500`                          | Maximum number of timeline events to retain in the buffer                                                                                                                       |
| `disabled`          | `boolean`                                                      | `false` in dev, `true` in prod | Force-enable or force-disable the devtools. When not set, the component auto-disables in production (`process.env.NODE_ENV === "production"`)                                   |

### Production behavior

The devtools are production-safe through two layers:

1. **Conditional exports** — The package.json `exports` field maps `"default"` to a no-op module (`production.js`) that returns `null` and tree-shakes to zero bytes in production bundles.
2. **Runtime check** — Even if the full module is bundled, the component checks `process.env.NODE_ENV` and returns `null` in production.

You can override this with `disabled={false}` to force the devtools on in any environment.

## Hooks

Available when inside an `<RTKDevtoolsProvider>` (automatically set up by `<RTKDevtools />`):

| Hook                    | Returns                  | Description                                                                                                     |
| ----------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `useDevtoolsSnapshot()` | `DevtoolsSnapshot`       | The current snapshot of RTK Query state: queries, mutations, tag graph, timeline events, and aggregate stats    |
| `useDevtools()`         | `RTKDevtoolsInstance`    | The devtools instance for performing actions like `refetchQuery()`, `removeCacheEntry()`, and `clearTimeline()` |
| `useDevtoolsContext()`  | `{ devtools, snapshot }` | Both the instance and snapshot in a single call                                                                 |

```ts
import { useDevtoolsSnapshot, useDevtools } from "@rtk-devtools/react";

const snapshot = useDevtoolsSnapshot();
const devtools = useDevtools();
```

## `<RTKDevtoolsProvider>`

Context provider that creates and manages the devtools instance. `<RTKDevtools />` sets this up automatically, but you can use it directly if building a custom UI.

| Prop                | Type          | Default    | Description                                  |
| ------------------- | ------------- | ---------- | -------------------------------------------- |
| `api`               | `RTKQueryApi` | _required_ | The RTK Query API instance                   |
| `store`             | `Store`       | _required_ | The Redux store                              |
| `maxTimelineEvents` | `number`      | `500`      | Maximum timeline events to retain            |
| `throttleMs`        | `number`      | `100`      | Throttle interval for snapshot updates in ms |

```tsx
import { RTKDevtoolsProvider, useDevtoolsSnapshot } from "@rtk-devtools/react";

function CustomDevtools() {
  return (
    <RTKDevtoolsProvider api={api} store={store}>
      <MyCustomPanel />
    </RTKDevtoolsProvider>
  );
}
```

## Features

- Queries, Mutations, Tags, Subscriptions, and Timeline panels
- Floating panel — resizable, dockable to any screen edge, with persistent state across page reloads
- Production-safe — tree-shakes to zero bytes in production builds
- Dark/Light/System theme support
- Keyboard shortcut: **Ctrl+Shift+R** to toggle

## Peer Dependencies

- `@reduxjs/toolkit` >= 1.9.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `react-redux` >= 8.0.0

## Inspiration

This project is inspired by [TanStack DevTools](https://github.com/tanstack/devtools).

## License

MIT
