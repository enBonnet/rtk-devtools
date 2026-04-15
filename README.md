<p align="center">
  <a href="https://lilohq.com">
    <img src="./lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# RTK Devtools

Devtools for [Redux Toolkit Query](https://redux-toolkit.js.org/rtk-query/overview). An embeddable panel that gives you deep visibility into RTK Query's cache, subscriptions, tag-based invalidation, and request lifecycle — things the generic Redux DevTools Extension doesn't surface.

## Features

- **Queries Panel** — Browse all cached queries with status, timing, subscriber count, and cache expiration countdowns. Master-detail view with full data inspection, filtering, and sorting.
- **Mutations Panel** — Track mutation lifecycle with arguments, results, errors, and which tags each mutation invalidated.
- **Tags Panel** — Three-column visualization of tag relationships: tag types, which queries provide them, and which mutations invalidate them. Debug invalidation logic at a glance.
- **Subscriptions Panel** — Table view of subscriber counts per cache entry, polling intervals, and expiring cache entries with countdown timers.
- **Timeline Panel** — Chronological event log of all RTK Query activity: query/mutation starts, completions, failures, invalidations, and subscription changes.
- **Floating Panel** — Resizable, dockable to any screen edge, with persistent state across page reloads.
- **Production-safe** — Tree-shakes to zero bytes in production builds.
- **Dark/Light/System theme** — Adapts to your preference.

## Quick Start

### Install

RTK Devtools is split into three packages. Install all three:

```bash
npm install @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
# or
pnpm add @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
# or
yarn add @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
```

### Setup

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

That's it. Click the **RTK** button in the bottom-right corner to open the panel.

> If your app already has a `<Provider store={store}>`, you can omit the `store` prop — it will be auto-detected from the React-Redux context.

## Packages

RTK Devtools is organized into three packages, each with a specific responsibility:

### `@rtk-devtools/core`

Framework-agnostic core engine. Handles store observation, snapshot generation, event recording, tag graph building, and the optional Redux middleware for timeline tracking.

**Main exports:**

- `createRTKDevtools(config)` — Create a devtools instance that observes the Redux store and produces snapshots of RTK Query state (queries, mutations, tags, subscriptions, timeline).
- `createDevtoolsMiddleware({ api })` — Redux middleware that intercepts RTK Query actions to record timeline events. Purely observational — never modifies actions or state.
- TypeScript types: `RTKDevtoolsConfig`, `RTKDevtoolsInstance`, `DevtoolsSnapshot`, `DevtoolsQueryEntry`, `DevtoolsMutationEntry`, `TagNode`, `TimelineEvent`, and more.

### `@rtk-devtools/ui`

React UI components and panels. Provides the themed panel views and reusable components used by `@rtk-devtools/react`.

**Panels:** `QueriesPanel`, `MutationsPanel`, `TagsPanel`, `SubscriptionsPanel`, `TimelinePanel`

**Components:** `StatusBadge`, `TagChip`, `CacheKeyDisplay`, `DataExplorer`, `PanelTabs`, `SearchFilter`, `TimeAgo`, `TimingBar`

**Theme:** `DevtoolsThemeProvider`, `lightTheme`, `darkTheme`, `useTheme`

### `@rtk-devtools/react`

React adapter — **this is the main package most users interact with**. Provides the `<RTKDevtools />` component (floating panel, toggle button, keyboard shortcut) and React hooks for accessing devtools state.

**Main exports:**

- `<RTKDevtools />` — The main component. Renders a toggle button and a floating, resizable devtools panel.
- `<RTKDevtoolsProvider>` — Context provider (automatically set up by `<RTKDevtools />`). Use directly if building a custom UI.
- `useDevtoolsSnapshot()` — Returns the current `DevtoolsSnapshot` (queries, mutations, tags, timeline, stats).
- `useDevtools()` — Returns the `RTKDevtoolsInstance` for actions like `refetchQuery` and `clearTimeline`.
- `useDevtoolsContext()` — Returns both the instance and snapshot.

## Keyboard Shortcut

Press **Ctrl+Shift+R** to toggle the devtools panel.

## How It Works

RTK Devtools reads RTK Query's internal state from the Redux store (`store.getState()[api.reducerPath]`). It extracts:

- **`queries`** — All cached query entries with status, data, timing
- **`mutations`** — All tracked mutations
- **`provided`** — The tag map showing which queries provide which tags
- **`subscriptions`** — Reference counts per cache key
- **`config`** — RTK Query configuration (keepUnusedDataFor, etc.)

The store observer uses shallow comparison of state slices and 100ms throttling to minimize performance impact. The optional middleware adds timeline event recording by pattern-matching RTK Query action types.

## Requirements

- React 18+
- Redux Toolkit 1.9+ (RTK Query)
- react-redux 8+

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the example app
pnpm --filter rtk-devtools-example dev

# Run tests
pnpm test:run
```

## Project Structure

```
packages/
  core/          # Framework-agnostic: store observer, event recorder, middleware, tag graph
  ui/            # React UI: panels, shared components, theme system (goober)
  react/         # React adapter: <RTKDevtools />, floating panel, toggle button, provider
examples/
  basic/         # Vite + React demo app using JSONPlaceholder API
```

## Publishing workflow

- 1. When you make changes, create a changeset
`pnpm changeset`

- 2. When ready to release, bump versions
`pnpm version-packages`

- 3. Commit the version bumps, then publish
`pnpm release`

## Inspiration

This project is inspired by [TanStack DevTools](https://github.com/tanstack/devtools).

## License

MIT
