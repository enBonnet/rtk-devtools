<p align="center">
  <a href="https://lilohq.com">
    <img src="../../lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# @rtk-devtools/react

React adapter for RTK Devtools. This is the main package most users should install. It provides the `<RTKDevtools />` component — a floating, resizable panel that gives you deep visibility into RTK Query's cache, subscriptions, tag-based invalidation, and request lifecycle.

## Install

```bash
npm install @rtk-devtools/react
# or
pnpm add @rtk-devtools/react
# or
yarn add @rtk-devtools/react
```

## Quick Start

```tsx
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

## Props

```tsx
<RTKDevtools
  api={api} // Required — your createApi() instance
  store={store} // Optional — auto-detected from react-redux
  initialOpen={false} // Optional — start with panel open
  buttonPosition="bottom-right" // Optional — toggle button placement
  position="bottom" // Optional — panel dock position: top | bottom | left | right
  panelSize={400} // Optional — panel height/width in px
  theme="dark" // Optional — light | dark | system
  maxTimelineEvents={500} // Optional — timeline buffer size
  disabled={false} // Optional — force disable (auto-disabled in production)
/>
```

## Hooks

Available when inside an `<RTKDevtoolsProvider>` (automatically set up by `<RTKDevtools />`):

```ts
import { useDevtoolsSnapshot, useDevtools } from "@rtk-devtools/react";

const snapshot = useDevtoolsSnapshot(); // Current devtools snapshot
const devtools = useDevtools(); // The RTKDevtoolsInstance
```

## Features

- Queries, Mutations, Tags, Subscriptions, and Timeline panels
- Floating panel — resizable, dockable to any screen edge
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
