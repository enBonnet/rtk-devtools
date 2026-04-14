export interface CacheTimer {
  cacheKey: string;
  endpointName: string;
  keepUnusedDataFor: number;
  /** Timestamp when subscriber count dropped to 0 */
  startedAt: number;
  /** Seconds remaining before cache removal */
  remaining: number;
}

/**
 * Tracks keepUnusedDataFor countdowns for queries with zero subscribers.
 * When a query loses all subscribers, RTK Query starts a timer to remove
 * it from cache. This tracker computes the remaining time for display.
 */
export function createCacheTimerTracker(defaultKeepUnusedDataFor: number = 60) {
  const timers = new Map<
    string,
    { startedAt: number; keepFor: number; endpointName: string }
  >();

  /**
   * Update tracked timers based on current subscriber counts.
   * @param subscriberCounts Map of cacheKey -> subscriber count
   * @param endpointNames Map of cacheKey -> endpoint name
   * @param endpointKeepFor Map of endpointName -> keepUnusedDataFor (optional per-endpoint override)
   */
  function update(
    subscriberCounts: Map<string, number>,
    endpointNames: Map<string, string>,
    endpointKeepFor?: Map<string, number>,
  ): void {
    const now = Date.now();

    // Remove timers for keys that no longer exist in state
    for (const key of timers.keys()) {
      if (!subscriberCounts.has(key)) {
        timers.delete(key);
      }
    }

    for (const [cacheKey, count] of subscriberCounts) {
      if (count === 0) {
        // Start tracking if not already
        if (!timers.has(cacheKey)) {
          const endpointName = endpointNames.get(cacheKey) ?? "";
          const keepFor =
            endpointKeepFor?.get(endpointName) ?? defaultKeepUnusedDataFor;
          timers.set(cacheKey, { startedAt: now, keepFor, endpointName });
        }
      } else {
        // Has subscribers, remove timer
        timers.delete(cacheKey);
      }
    }
  }

  /**
   * Get remaining seconds for all active cache timers.
   */
  function getTimers(): CacheTimer[] {
    const now = Date.now();
    const result: CacheTimer[] = [];

    for (const [cacheKey, timer] of timers) {
      const elapsed = (now - timer.startedAt) / 1000;
      const remaining = Math.max(0, timer.keepFor - elapsed);
      result.push({
        cacheKey,
        endpointName: timer.endpointName,
        keepUnusedDataFor: timer.keepFor,
        startedAt: timer.startedAt,
        remaining,
      });
    }

    return result;
  }

  /**
   * Get remaining seconds for a specific cache key (or null if not expiring).
   */
  function getRemaining(cacheKey: string): number | null {
    const timer = timers.get(cacheKey);
    if (!timer) return null;
    const elapsed = (Date.now() - timer.startedAt) / 1000;
    return Math.max(0, timer.keepFor - elapsed);
  }

  function clear(): void {
    timers.clear();
  }

  return { update, getTimers, getRemaining, clear };
}
