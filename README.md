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

```bash
npm install @rtk-devtools/react
# or
pnpm add @rtk-devtools/react
# or
yarn add @rtk-devtools/react
```

This single package includes `@rtk-devtools/core` and `@rtk-devtools/ui` as dependencies — no need to install them separately.

### Setup

**1. Add the devtools middleware** (optional — enables the Timeline panel):

```ts
// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { createDevtoolsMiddleware } from "@rtk-devtools/react";
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

## Exports

`@rtk-devtools/react` re-exports the full public API from all packages, so you only need a single import source:

**React components and hooks:**

- `<RTKDevtools />` — The main component. Renders a toggle button and a floating, resizable devtools panel.
- `<RTKDevtoolsProvider>` — Context provider (automatically set up by `<RTKDevtools />`). Use directly if building a custom UI.
- `useDevtoolsSnapshot()` — Returns the current `DevtoolsSnapshot` (queries, mutations, tags, timeline, stats).
- `useDevtools()` — Returns the `RTKDevtoolsInstance` for actions like `refetchQuery` and `clearTimeline`.
- `useDevtoolsContext()` — Returns both the instance and snapshot.

**Core engine (re-exported from `@rtk-devtools/core`):**

- `createRTKDevtools(config)` — Create a devtools instance that observes the Redux store and produces snapshots of RTK Query state.
- `createDevtoolsMiddleware({ api })` — Redux middleware that intercepts RTK Query actions to record timeline events. Purely observational — never modifies actions or state.
- TypeScript types: `RTKDevtoolsConfig`, `RTKDevtoolsInstance`, `DevtoolsSnapshot`, `DevtoolsQueryEntry`, `DevtoolsMutationEntry`, `TagNode`, `TimelineEvent`, and more.

## Packages

Under the hood, RTK Devtools is organized into three packages. You can import from them directly if you only need a subset:

| Package | Description |
|---|---|
| `@rtk-devtools/core` | Framework-agnostic core engine: store observation, snapshot generation, event recording, tag graph, middleware |
| `@rtk-devtools/ui` | React UI panels and shared components with theme system |
| `@rtk-devtools/react` | React adapter — the main entry point. Includes core + ui as dependencies |

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
