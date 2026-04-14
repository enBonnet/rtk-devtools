import {
  createContext,
  useContext,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type {
  RTKDevtoolsInstance,
  DevtoolsSnapshot,
  RTKQueryApi,
} from "@rtk-devtools/core";
import { createRTKDevtools } from "@rtk-devtools/core";
import type { Store } from "redux";

interface RTKDevtoolsContextValue {
  devtools: RTKDevtoolsInstance;
  snapshot: DevtoolsSnapshot;
}

const RTKDevtoolsContext = createContext<RTKDevtoolsContextValue | null>(null);

export function useDevtoolsContext(): RTKDevtoolsContextValue {
  const ctx = useContext(RTKDevtoolsContext);
  if (!ctx) {
    throw new Error(
      "useDevtoolsContext must be used within RTKDevtoolsProvider",
    );
  }
  return ctx;
}

export function useDevtoolsSnapshot(): DevtoolsSnapshot {
  return useDevtoolsContext().snapshot;
}

export function useDevtools(): RTKDevtoolsInstance {
  return useDevtoolsContext().devtools;
}

interface RTKDevtoolsProviderProps {
  api: RTKQueryApi;
  store: Store;
  maxTimelineEvents?: number;
  throttleMs?: number;
  children: ReactNode;
}

export function RTKDevtoolsProvider({
  api,
  store,
  maxTimelineEvents,
  throttleMs,
  children,
}: RTKDevtoolsProviderProps) {
  const [devtools] = useState(() => {
    const instance = createRTKDevtools({
      api,
      store,
      maxTimelineEvents,
      throttleMs,
    });
    instance.start();
    return instance;
  });

  const snapshot = useSyncExternalStore(
    devtools.subscribe,
    devtools.getSnapshot,
    devtools.getSnapshot,
  );

  const value = useMemo(() => ({ devtools, snapshot }), [devtools, snapshot]);

  return (
    <RTKDevtoolsContext.Provider value={value}>
      {children}
    </RTKDevtoolsContext.Provider>
  );
}
