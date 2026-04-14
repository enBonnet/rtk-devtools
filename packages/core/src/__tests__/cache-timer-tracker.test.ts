import { describe, it, expect, vi, afterEach } from "vitest";
import { createCacheTimerTracker } from "../cache-timer-tracker";

describe("createCacheTimerTracker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts tracking when a cache key has zero subscribers", () => {
    const tracker = createCacheTimerTracker(60);
    const subscriberCounts = new Map([["getPost(1)", 0]]);
    const endpointNames = new Map([["getPost(1)", "getPost"]]);

    tracker.update(subscriberCounts, endpointNames);

    const timers = tracker.getTimers();
    expect(timers).toHaveLength(1);
    expect(timers[0].cacheKey).toBe("getPost(1)");
    expect(timers[0].endpointName).toBe("getPost");
    expect(timers[0].remaining).toBeGreaterThan(0);
    expect(timers[0].remaining).toBeLessThanOrEqual(60);
  });

  it("does not track keys with active subscribers", () => {
    const tracker = createCacheTimerTracker(60);
    const subscriberCounts = new Map([["getPost(1)", 2]]);
    const endpointNames = new Map([["getPost(1)", "getPost"]]);

    tracker.update(subscriberCounts, endpointNames);

    expect(tracker.getTimers()).toHaveLength(0);
  });

  it("removes timer when subscriber count goes back above zero", () => {
    const tracker = createCacheTimerTracker(60);
    const endpointNames = new Map([["getPost(1)", "getPost"]]);

    // Zero subscribers — starts timer
    tracker.update(new Map([["getPost(1)", 0]]), endpointNames);
    expect(tracker.getTimers()).toHaveLength(1);

    // Gets a subscriber — timer removed
    tracker.update(new Map([["getPost(1)", 1]]), endpointNames);
    expect(tracker.getTimers()).toHaveLength(0);
  });

  it("removes timer when the cache key disappears from state", () => {
    const tracker = createCacheTimerTracker(60);

    tracker.update(
      new Map([["getPost(1)", 0]]),
      new Map([["getPost(1)", "getPost"]]),
    );
    expect(tracker.getTimers()).toHaveLength(1);

    // Key no longer in state
    tracker.update(new Map(), new Map());
    expect(tracker.getTimers()).toHaveLength(0);
  });

  it("getRemaining returns null for untracked keys", () => {
    const tracker = createCacheTimerTracker(60);
    expect(tracker.getRemaining("unknown")).toBeNull();
  });

  it("getRemaining returns remaining seconds for tracked keys", () => {
    const tracker = createCacheTimerTracker(60);
    tracker.update(
      new Map([["getPost(1)", 0]]),
      new Map([["getPost(1)", "getPost"]]),
    );

    const remaining = tracker.getRemaining("getPost(1)");
    expect(remaining).not.toBeNull();
    expect(remaining!).toBeGreaterThan(0);
    expect(remaining!).toBeLessThanOrEqual(60);
  });

  it("remaining decreases over time", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const tracker = createCacheTimerTracker(60);
    tracker.update(
      new Map([["getPost(1)", 0]]),
      new Map([["getPost(1)", "getPost"]]),
    );

    vi.setSystemTime(now + 10_000); // 10 seconds later
    const remaining = tracker.getRemaining("getPost(1)");
    expect(remaining).toBeCloseTo(50, 0);

    vi.useRealTimers();
  });

  it("remaining floors at zero", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const tracker = createCacheTimerTracker(5);
    tracker.update(
      new Map([["getPost(1)", 0]]),
      new Map([["getPost(1)", "getPost"]]),
    );

    vi.setSystemTime(now + 60_000); // Way past expiry
    expect(tracker.getRemaining("getPost(1)")).toBe(0);

    vi.useRealTimers();
  });

  it("uses per-endpoint keepUnusedDataFor when provided", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const tracker = createCacheTimerTracker(60);
    const endpointKeepFor = new Map([["getPost", 30]]);

    tracker.update(
      new Map([["getPost(1)", 0]]),
      new Map([["getPost(1)", "getPost"]]),
      endpointKeepFor,
    );

    const timer = tracker.getTimers()[0];
    expect(timer.keepUnusedDataFor).toBe(30);

    vi.useRealTimers();
  });

  it("clear removes all timers", () => {
    const tracker = createCacheTimerTracker(60);
    tracker.update(
      new Map([
        ["getPost(1)", 0],
        ["getUser(2)", 0],
      ]),
      new Map([
        ["getPost(1)", "getPost"],
        ["getUser(2)", "getUser"],
      ]),
    );
    expect(tracker.getTimers()).toHaveLength(2);

    tracker.clear();
    expect(tracker.getTimers()).toHaveLength(0);
  });
});
