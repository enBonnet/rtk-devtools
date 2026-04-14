import type {
  TimelineEvent,
  TimelineEventFilter,
  EventRecorderInstance,
} from "./types";

let nextEventId = 0;
export function generateEventId(): string {
  return `evt_${++nextEventId}_${Date.now()}`;
}

export function createEventRecorder(
  maxEvents: number = 500,
): EventRecorderInstance {
  const events: TimelineEvent[] = [];
  const listeners = new Set<(event: TimelineEvent) => void>();

  function record(event: TimelineEvent): void {
    events.push(event);
    // Ring buffer: trim from front when exceeding max
    if (events.length > maxEvents) {
      events.splice(0, events.length - maxEvents);
    }
    listeners.forEach((listener) => listener(event));
  }

  function getEvents(filter?: TimelineEventFilter): TimelineEvent[] {
    if (!filter) return events.slice();

    return events.filter((event) => {
      if (filter.types && !filter.types.includes(event.type)) return false;
      if (filter.endpointName && event.endpointName !== filter.endpointName)
        return false;
      if (filter.since && event.timestamp < filter.since) return false;
      return true;
    });
  }

  function clear(): void {
    events.length = 0;
  }

  function subscribe(listener: (event: TimelineEvent) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { record, getEvents, clear, subscribe };
}
