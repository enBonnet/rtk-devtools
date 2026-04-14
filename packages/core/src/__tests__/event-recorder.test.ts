import { describe, it, expect, vi } from "vitest";
import { createEventRecorder, generateEventId } from "../event-recorder";
import type { TimelineEvent } from "../types";

function makeEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    id: generateEventId(),
    timestamp: Date.now(),
    type: "query-started",
    endpointName: "getPosts",
    ...overrides,
  };
}

describe("createEventRecorder", () => {
  it("records and retrieves events", () => {
    const recorder = createEventRecorder();
    const event = makeEvent();

    recorder.record(event);

    expect(recorder.getEvents()).toEqual([event]);
  });

  it("returns a copy from getEvents so mutations are safe", () => {
    const recorder = createEventRecorder();
    recorder.record(makeEvent());

    const events = recorder.getEvents();
    events.pop();

    expect(recorder.getEvents()).toHaveLength(1);
  });

  it("respects maxEvents by trimming oldest entries", () => {
    const recorder = createEventRecorder(3);

    const e1 = makeEvent({ endpointName: "a" });
    const e2 = makeEvent({ endpointName: "b" });
    const e3 = makeEvent({ endpointName: "c" });
    const e4 = makeEvent({ endpointName: "d" });

    recorder.record(e1);
    recorder.record(e2);
    recorder.record(e3);
    recorder.record(e4);

    const events = recorder.getEvents();
    expect(events).toHaveLength(3);
    expect(events[0].endpointName).toBe("b");
    expect(events[2].endpointName).toBe("d");
  });

  it("clears all events", () => {
    const recorder = createEventRecorder();
    recorder.record(makeEvent());
    recorder.record(makeEvent());

    recorder.clear();

    expect(recorder.getEvents()).toEqual([]);
  });

  it("filters events by type", () => {
    const recorder = createEventRecorder();
    recorder.record(makeEvent({ type: "query-started" }));
    recorder.record(makeEvent({ type: "query-fulfilled" }));
    recorder.record(makeEvent({ type: "mutation-started" }));

    const filtered = recorder.getEvents({ types: ["query-fulfilled"] });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe("query-fulfilled");
  });

  it("filters events by endpointName", () => {
    const recorder = createEventRecorder();
    recorder.record(makeEvent({ endpointName: "getPosts" }));
    recorder.record(makeEvent({ endpointName: "getUser" }));

    const filtered = recorder.getEvents({ endpointName: "getUser" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].endpointName).toBe("getUser");
  });

  it("filters events by since timestamp", () => {
    const recorder = createEventRecorder();
    recorder.record(makeEvent({ timestamp: 1000 }));
    recorder.record(makeEvent({ timestamp: 2000 }));
    recorder.record(makeEvent({ timestamp: 3000 }));

    const filtered = recorder.getEvents({ since: 2000 });

    expect(filtered).toHaveLength(2);
  });

  it("notifies subscribers when an event is recorded", () => {
    const recorder = createEventRecorder();
    const listener = vi.fn();

    recorder.subscribe(listener);
    const event = makeEvent();
    recorder.record(event);

    expect(listener).toHaveBeenCalledWith(event);
  });

  it("unsubscribes correctly", () => {
    const recorder = createEventRecorder();
    const listener = vi.fn();

    const unsub = recorder.subscribe(listener);
    unsub();
    recorder.record(makeEvent());

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("generateEventId", () => {
  it("returns unique ids", () => {
    const ids = new Set([
      generateEventId(),
      generateEventId(),
      generateEventId(),
    ]);
    expect(ids.size).toBe(3);
  });
});
