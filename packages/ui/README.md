<p align="center">
  <a href="https://lilohq.com">
    <img src="../../lilo-logo.svg" alt="Lilo" width="200" />
  </a>
  <br />
  This project couldn't be possible without <a href="https://lilohq.com">lilohq.com</a>.
</p>

---

# @rtk-devtools/ui

Shared React UI components and panels for RTK Devtools. This package provides the themed panel views and reusable components used by `@rtk-devtools/react`.

This package is part of [RTK Devtools](https://github.com/enBonnet/rtk-devtools). For the full devtools experience, install all three packages:

```bash
npm install @rtk-devtools/core @rtk-devtools/ui @rtk-devtools/react
```

## Install

```bash
npm install @rtk-devtools/ui
# or
pnpm add @rtk-devtools/ui
```

## API

### Panels

| Panel                | Description                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `QueriesPanel`       | Browse cached queries with status, timing, subscriber count, and cache expiration countdowns. Master-detail view with data inspection, filtering, and sorting |
| `MutationsPanel`     | Track mutation lifecycle with arguments, results, errors, and which tags each mutation invalidated                                                            |
| `TagsPanel`          | Three-column visualization of tag relationships: tag types, provider queries, and invalidator mutations                                                       |
| `SubscriptionsPanel` | Table view of subscriber counts per cache entry, polling intervals, and expiring cache entries with countdown timers                                          |
| `TimelinePanel`      | Chronological event log of all RTK Query activity: starts, completions, failures, invalidations, and subscription changes                                     |

### Components

| Component         | Description                                                                             |
| ----------------- | --------------------------------------------------------------------------------------- |
| `StatusBadge`     | Query/mutation status indicator (pending, fulfilled, rejected)                          |
| `TagChip`         | Tag type display chip                                                                   |
| `CacheKeyDisplay` | Formatted cache key display                                                             |
| `DataExplorer`    | Collapsible JSON data inspector                                                         |
| `PanelTabs`       | Tab navigation for panels. Accepts `TabItem[]` with `id`, `label`, and optional `count` |
| `SearchFilter`    | Search and filter input                                                                 |
| `TimeAgo`         | Relative timestamp display                                                              |
| `TimingBar`       | Visual timing indicator                                                                 |

### Theme

Built-in dark and light themes using [goober](https://github.com/cristianbote/goober) for CSS-in-JS.

| Export                  | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| `DevtoolsThemeProvider` | Theme context provider. Accepts a `mode` prop: `"light"`, `"dark"`, or `"system"` |
| `useTheme()`            | Hook to access the current `Theme` object inside the provider                     |
| `lightTheme`            | Light theme token set                                                             |
| `darkTheme`             | Dark theme token set                                                              |

```tsx
import {
  DevtoolsThemeProvider,
  lightTheme,
  darkTheme,
  useTheme,
} from "@rtk-devtools/ui";
```

### Exported Types

`ThemeMode`, `Theme`, `TabItem`

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Inspiration

This project is inspired by [TanStack DevTools](https://github.com/tanstack/devtools).

## License

MIT
