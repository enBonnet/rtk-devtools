import { useState, useMemo } from "react";
import { css } from "goober";
import { useTheme } from "../theme/theme-provider";
import { TagChip } from "../components/TagChip";
import { TimeAgo } from "../components/TimeAgo";
import type { TimelineEvent, TimelineEventType } from "@rtk-devtools/core";
import type { Theme } from "../theme/tokens";

interface TimelinePanelProps {
  events: TimelineEvent[];
  onClear?: () => void;
}

const eventConfig: Record<
  TimelineEventType,
  { label: string; icon: string; getColor: (t: Theme) => string }
> = {
  "query-started": {
    label: "Query Started",
    icon: "\u25B6",
    getColor: (t) => t.status.pending,
  },
  "query-fulfilled": {
    label: "Query Fulfilled",
    icon: "\u2713",
    getColor: (t) => t.status.fulfilled,
  },
  "query-rejected": {
    label: "Query Rejected",
    icon: "\u2717",
    getColor: (t) => t.status.rejected,
  },
  "mutation-started": {
    label: "Mutation Started",
    icon: "\u25B6",
    getColor: (t) => t.status.pending,
  },
  "mutation-fulfilled": {
    label: "Mutation Fulfilled",
    icon: "\u2713",
    getColor: (t) => t.status.fulfilled,
  },
  "mutation-rejected": {
    label: "Mutation Rejected",
    icon: "\u2717",
    getColor: (t) => t.status.rejected,
  },
  invalidation: {
    label: "Invalidation",
    icon: "\u21BB",
    getColor: (t) => t.brand[500],
  },
  "cache-entry-removed": {
    label: "Cache Removed",
    icon: "\u2715",
    getColor: (t) => t.text.tertiary,
  },
  "subscription-added": {
    label: "Subscribed",
    icon: "+",
    getColor: (t) => t.status.fulfilled,
  },
  "subscription-removed": {
    label: "Unsubscribed",
    icon: "\u2212",
    getColor: (t) => t.status.rejected,
  },
};

export function TimelinePanel({ events, onClear }: TimelinePanelProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TimelineEventType | "all">(
    "all",
  );

  const filteredEvents = useMemo(() => {
    let items = [...events].reverse(); // newest first

    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (e) =>
          e.endpointName.toLowerCase().includes(lower) ||
          (e.cacheKey?.toLowerCase().includes(lower) ?? false),
      );
    }

    if (typeFilter !== "all") {
      items = items.filter((e) => e.type === typeFilter);
    }

    return items;
  }, [events, search, typeFilter]);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      })}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderBottom: `1px solid ${theme.border.primary}`,
        })}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by endpoint..."
          className={css({
            flex: 1,
            padding: "4px 8px",
            border: `1px solid ${theme.border.primary}`,
            borderRadius: "4px",
            backgroundColor: theme.bg.primary,
            color: theme.text.primary,
            fontSize: "12px",
            outline: "none",
            ":focus": { borderColor: theme.border.focus },
            "::placeholder": { color: theme.text.tertiary },
          })}
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as TimelineEventType | "all")
          }
          className={css({
            padding: "4px 6px",
            border: `1px solid ${theme.border.primary}`,
            borderRadius: "4px",
            backgroundColor: theme.bg.primary,
            color: theme.text.primary,
            fontSize: "12px",
            outline: "none",
            cursor: "pointer",
          })}
        >
          <option value="all">All Events</option>
          <option value="query-started">Query Started</option>
          <option value="query-fulfilled">Query Fulfilled</option>
          <option value="query-rejected">Query Rejected</option>
          <option value="mutation-started">Mutation Started</option>
          <option value="mutation-fulfilled">Mutation Fulfilled</option>
          <option value="mutation-rejected">Mutation Rejected</option>
          <option value="invalidation">Invalidation</option>
          <option value="subscription-added">Subscribed</option>
          <option value="subscription-removed">Unsubscribed</option>
        </select>
        {onClear && (
          <button
            onClick={onClear}
            className={css({
              padding: "4px 8px",
              border: `1px solid ${theme.border.primary}`,
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: theme.text.secondary,
              fontSize: "11px",
              cursor: "pointer",
              ":hover": { backgroundColor: theme.bg.hover },
            })}
          >
            Clear
          </button>
        )}
      </div>

      <div className={css({ flex: 1, overflow: "auto" })}>
        {filteredEvents.length === 0 ? (
          <div
            className={css({
              padding: "24px",
              textAlign: "center",
              color: theme.text.tertiary,
              fontSize: "12px",
            })}
          >
            {events.length === 0
              ? "No events recorded. Add the devtools middleware for timeline tracking."
              : "No matching events"}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <TimelineEventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const { theme } = useTheme();
  const config = eventConfig[event.type];
  const color = config.getColor(theme);

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "6px 12px",
        borderBottom: `1px solid ${theme.border.secondary}`,
        ":hover": { backgroundColor: theme.bg.hover },
      })}
    >
      {/* Timeline dot */}
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "2px",
        })}
      >
        <span
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: `${color}18`,
            color,
            fontSize: "10px",
            fontWeight: 700,
            flexShrink: 0,
          })}
        >
          {config.icon}
        </span>
      </div>

      {/* Content */}
      <div className={css({ flex: 1, minWidth: 0 })}>
        <div
          className={css({ display: "flex", alignItems: "center", gap: "6px" })}
        >
          <span className={css({ fontSize: "11px", fontWeight: 600, color })}>
            {config.label}
          </span>
          {event.endpointName && (
            <span className={css({ fontSize: "12px", fontWeight: 500 })}>
              {event.endpointName}
            </span>
          )}
        </div>
        {event.cacheKey && (
          <div
            className={css({
              fontSize: "11px",
              fontFamily: '"SF Mono", Menlo, monospace',
              color: theme.text.secondary,
              marginTop: "1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
          >
            {event.cacheKey}
          </div>
        )}
        {event.tags && event.tags.length > 0 && (
          <div
            className={css({
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              marginTop: "3px",
            })}
          >
            {event.tags.map((tag, i) => (
              <TagChip key={i} tag={tag} variant="invalidator" />
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <TimeAgo timestamp={event.timestamp} />
    </div>
  );
}
