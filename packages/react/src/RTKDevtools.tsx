import {
  createElement,
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { setup } from "goober";
import type { RTKQueryApi } from "@rtk-devtools/core";
import {
  DevtoolsThemeProvider,
  PanelTabs,
  QueriesPanel,
  MutationsPanel,
  TagsPanel,
  SubscriptionsPanel,
  TimelinePanel,
} from "@rtk-devtools/ui";
import type { ThemeMode, TabItem } from "@rtk-devtools/ui";
import {
  RTKDevtoolsProvider,
  useDevtoolsSnapshot,
  useDevtools,
} from "./RTKDevtoolsProvider";
import { FloatingPanel } from "./FloatingPanel";
import type { PanelPosition } from "./FloatingPanel";
import { ToggleButton } from "./ToggleButton";
import type { Store } from "redux";

// Initialize goober
setup(createElement);

const emptySubscribe = () => () => {};

/**
 * SSR-safe hook that returns false on the server and during hydration,
 * then true after the first client render. This ensures the devtools
 * never render during SSR, avoiding hydration mismatches with frameworks
 * like Next.js, Remix, or Gatsby.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export interface RTKDevtoolsProps {
  /** The RTK Query API instance created by createApi() */
  api: RTKQueryApi;
  /** The Redux store (auto-detected from react-redux context if omitted) */
  store?: Store;
  /** Initial panel visibility (default: false) */
  initialOpen?: boolean;
  /** Toggle button position (default: 'bottom-right') */
  buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Panel position when floating (default: 'bottom') */
  position?: PanelPosition;
  /** Panel height/width in pixels (default: 400) */
  panelSize?: number;
  /** Light/dark/system theme (default: 'dark') */
  theme?: ThemeMode;
  /** Maximum timeline events to retain (default: 500) */
  maxTimelineEvents?: number;
  /** Disable the devtools (default: false in development, true in production) */
  disabled?: boolean;
}

const STORAGE_KEY_OPEN = "rtk-devtools-open";

export function RTKDevtools({
  api,
  store: storeProp,
  initialOpen = false,
  buttonPosition = "bottom-right",
  position = "bottom",
  panelSize = 400,
  theme = "dark",
  maxTimelineEvents = 500,
  disabled,
}: RTKDevtoolsProps) {
  // Hooks must be called unconditionally before any early returns
  const isClient = useIsClient();
  const reduxStore = useReduxStore();

  // Production bailout
  const isDisabled =
    disabled ??
    (typeof process !== "undefined" && process.env?.NODE_ENV === "production");
  if (!isClient || isDisabled) return null;

  // Try to get store from react-redux context if not passed
  const store = storeProp ?? reduxStore;
  if (!store) {
    if (typeof console !== "undefined") {
      console.warn(
        "[RTK Devtools] No store provided and no react-redux Provider found. " +
          "Pass the store prop or wrap your app with <Provider store={store}>.",
      );
    }
    return null;
  }

  return (
    <RTKDevtoolsProvider
      api={api}
      store={store}
      maxTimelineEvents={maxTimelineEvents}
    >
      <DevtoolsThemeProvider mode={theme}>
        <DevtoolsUI
          initialOpen={initialOpen}
          buttonPosition={buttonPosition}
          position={position}
          panelSize={panelSize}
        />
      </DevtoolsThemeProvider>
    </RTKDevtoolsProvider>
  );
}

function DevtoolsUI({
  initialOpen,
  buttonPosition,
  position,
  panelSize,
}: {
  initialOpen: boolean;
  buttonPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  position: PanelPosition;
  panelSize: number;
}) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OPEN);
      return stored ? stored === "true" : initialOpen;
    } catch {
      return initialOpen;
    }
  });
  const [activeTab, setActiveTab] = useState("queries");
  const [selectedTagType, setSelectedTagType] = useState<string | undefined>();

  const snapshot = useDevtoolsSnapshot();
  const devtools = useDevtools();

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_OPEN, String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  // Keyboard shortcut: Ctrl+Shift+R to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleOpen]);

  const handleTagClick = useCallback((tagType: string) => {
    setSelectedTagType(tagType);
    setActiveTab("tags");
  }, []);

  const tabs: TabItem[] = [
    { id: "queries", label: "Queries", count: snapshot.stats.totalQueries },
    {
      id: "mutations",
      label: "Mutations",
      count: snapshot.stats.totalMutations,
    },
    { id: "tags", label: "Tags", count: snapshot.tagGraph.length },
    {
      id: "subscriptions",
      label: "Subs",
      count: snapshot.stats.totalSubscriptions,
    },
    { id: "timeline", label: "Timeline", count: snapshot.timeline.length },
  ];

  return (
    <>
      <ToggleButton
        isOpen={isOpen}
        onClick={toggleOpen}
        position={buttonPosition}
        activeQueryCount={snapshot.stats.activeQueries}
        pendingCount={snapshot.stats.pendingQueries}
        errorCount={snapshot.stats.errorQueries}
      />
      <FloatingPanel
        isOpen={isOpen}
        position={position}
        initialSize={panelSize}
      >
        <PanelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div style={{ flex: 1, overflow: "hidden" }}>
          {activeTab === "queries" && (
            <QueriesPanel
              queries={snapshot.queries}
              onRefetch={(name, args) => devtools.refetchQuery(name, args)}
              onTagClick={handleTagClick}
            />
          )}
          {activeTab === "mutations" && (
            <MutationsPanel mutations={snapshot.mutations} />
          )}
          {activeTab === "tags" && (
            <TagsPanel
              tagGraph={snapshot.tagGraph}
              selectedTagType={selectedTagType}
            />
          )}
          {activeTab === "subscriptions" && (
            <SubscriptionsPanel queries={snapshot.queries} />
          )}
          {activeTab === "timeline" && (
            <TimelinePanel
              events={snapshot.timeline}
              onClear={() => devtools.clearTimeline()}
            />
          )}
        </div>
      </FloatingPanel>
    </>
  );
}

/**
 * Try to get the Redux store from react-redux context.
 * Returns undefined if react-redux is not available or no Provider exists.
 */
function useReduxStore(): Store | undefined {
  try {
    // Dynamic import to avoid hard dependency on react-redux
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useStore } = require("react-redux");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStore();
  } catch {
    return undefined;
  }
}
