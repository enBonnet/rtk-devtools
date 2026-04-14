<p align="center">
  <a href="https://lilohq.com">
    <img src="../../lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# @rtk-devtools/ui

Shared React UI components and panels for RTK Devtools. This package provides the themed panel views and reusable components used internally by `@rtk-devtools/react`.

## Install

```bash
npm install @rtk-devtools/ui
# or
pnpm add @rtk-devtools/ui
```

> Most users should install `@rtk-devtools/react` instead, which includes this package automatically.

## Panels

- **QueriesPanel** — Browse cached queries with status, timing, subscriber count, and cache expiration countdowns
- **MutationsPanel** — Track mutation lifecycle with arguments, results, and invalidated tags
- **TagsPanel** — Three-column tag relationship visualization
- **SubscriptionsPanel** — Subscriber counts, polling intervals, and cache expiry countdowns
- **TimelinePanel** — Chronological event log of all RTK Query activity

## Components

- `StatusBadge` — Query/mutation status indicator
- `TagChip` — Tag type display chip
- `CacheKeyDisplay` — Formatted cache key display
- `DataExplorer` — Collapsible JSON data inspector
- `PanelTabs` — Tab navigation for panels
- `SearchFilter` — Search and filter input
- `TimeAgo` — Relative timestamp display
- `TimingBar` — Visual timing indicator

## Theme

Built-in dark and light themes using [goober](https://github.com/cristianbote/goober) for CSS-in-JS:

```tsx
import { DevtoolsThemeProvider, lightTheme, darkTheme } from "@rtk-devtools/ui";
```

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Inspiration

This project is inspired by [TanStack DevTools](https://github.com/tanstack/devtools).

## License

MIT
