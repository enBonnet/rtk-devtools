import type { RTKDevtoolsProps } from "./RTKDevtools";

/**
 * Production no-op component.
 * This module is resolved via the package.json "exports" default condition,
 * so production bundlers get an empty module that tree-shakes to zero bytes.
 */
export function RTKDevtools(_props: RTKDevtoolsProps): null {
  return null;
}

// Re-export core API — these are used in store setup and must be available in production
export {
  createRTKDevtools,
  createDevtoolsMiddleware,
} from "@rtk-devtools/core";
export type {
  RTKDevtoolsConfig,
  RTKDevtoolsInstance,
  DevtoolsMiddlewareConfig,
  DevtoolsSnapshot,
  DevtoolsQueryEntry,
  DevtoolsMutationEntry,
  DevtoolsStats,
  TagDescription,
  TagNode,
  TimelineEvent,
  TimelineEventType,
  TimelineEventFilter,
  ApiEndpointInfo,
  QueryStatus,
  EventRecorderInstance,
  RTKQueryApi,
} from "@rtk-devtools/core";
