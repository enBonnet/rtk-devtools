import { useState, useMemo, type PropsWithChildren } from "react";
import { css } from "goober";
import { useTheme } from "../theme/theme-provider";
import { StatusBadge } from "../components/StatusBadge";
import { CacheKeyDisplay } from "../components/CacheKeyDisplay";
import { DataExplorer } from "../components/DataExplorer";
import { TagChip } from "../components/TagChip";
import { TimingBar } from "../components/TimingBar";
import { TimeAgo } from "../components/TimeAgo";
import { SearchFilter } from "../components/SearchFilter";
import type { DevtoolsQueryEntry, QueryStatus } from "@rtk-devtools/core";

interface QueriesPanelProps {
  queries: Map<string, DevtoolsQueryEntry>;
  onRefetch?: (endpointName: string, args: unknown) => void;
  onTagClick?: (tagType: string) => void;
}

export function QueriesPanel({
  queries,
  onRefetch,
  onTagClick,
}: QueriesPanelProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueryStatus | "all">("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "status" | "time">("name");

  const filteredQueries = useMemo(() => {
    let entries = Array.from(queries.values());

    if (search) {
      const lower = search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.cacheKey.toLowerCase().includes(lower) ||
          e.endpointName.toLowerCase().includes(lower),
      );
    }

    if (statusFilter !== "all") {
      entries = entries.filter((e) => e.status === statusFilter);
    }

    entries.sort((a, b) => {
      if (sortBy === "name")
        return a.endpointName.localeCompare(b.endpointName);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return (b.fulfilledTimeStamp ?? 0) - (a.fulfilledTimeStamp ?? 0);
    });

    return entries;
  }, [queries, search, statusFilter, sortBy]);

  const selectedEntry = selectedKey ? queries.get(selectedKey) : null;

  return (
    <div
      className={css({ display: "flex", height: "100%", overflow: "hidden" })}
    >
      {/* List */}
      <div
        className={css({
          flex: selectedEntry ? "0 0 50%" : "1",
          display: "flex",
          flexDirection: "column",
          borderRight: selectedEntry
            ? `1px solid ${theme.border.primary}`
            : "none",
          overflow: "hidden",
        })}
      >
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          placeholder="Filter by endpoint or cache key..."
        />

        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 12px",
            borderBottom: `1px solid ${theme.border.secondary}`,
          })}
        >
          <span
            className={css({ fontSize: "11px", color: theme.text.tertiary })}
          >
            Sort:
          </span>
          {(["name", "status", "time"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={css({
                padding: "2px 6px",
                border: "none",
                borderRadius: "3px",
                fontSize: "11px",
                cursor: "pointer",
                backgroundColor: sortBy === s ? theme.bg.active : "transparent",
                color: sortBy === s ? theme.text.link : theme.text.secondary,
                ":hover": { backgroundColor: theme.bg.hover },
              })}
            >
              {s}
            </button>
          ))}
          <span
            className={css({
              marginLeft: "auto",
              fontSize: "11px",
              color: theme.text.tertiary,
            })}
          >
            {filteredQueries.length} queries
          </span>
        </div>

        <div className={css({ flex: 1, overflow: "auto" })}>
          {filteredQueries.length === 0 ? (
            <div
              className={css({
                padding: "24px",
                textAlign: "center",
                color: theme.text.tertiary,
                fontSize: "12px",
              })}
            >
              No queries found
            </div>
          ) : (
            filteredQueries.map((entry) => (
              <QueryListItem
                key={entry.cacheKey}
                entry={entry}
                isSelected={entry.cacheKey === selectedKey}
                onSelect={() =>
                  setSelectedKey(
                    entry.cacheKey === selectedKey ? null : entry.cacheKey,
                  )
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      {selectedEntry && (
        <div
          className={css({
            flex: "0 0 50%",
            overflow: "auto",
            padding: "12px",
          })}
        >
          <QueryDetail
            entry={selectedEntry}
            onRefetch={onRefetch}
            onTagClick={onTagClick}
          />
        </div>
      )}
    </div>
  );
}

function QueryListItem({
  entry,
  isSelected,
  onSelect,
}: {
  entry: DevtoolsQueryEntry;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div
      onClick={onSelect}
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        backgroundColor: isSelected ? theme.bg.active : "transparent",
        borderBottom: `1px solid ${theme.border.secondary}`,
        ":hover": {
          backgroundColor: isSelected ? theme.bg.active : theme.bg.hover,
        },
        transition: "background-color 0.1s",
      })}
    >
      <StatusBadge status={entry.status} />
      <div className={css({ flex: 1, minWidth: 0, overflow: "hidden" })}>
        <CacheKeyDisplay cacheKey={entry.cacheKey} maxLength={40} />
      </div>
      <TimingBar duration={entry.duration} />
      {entry.subscriberCount > 0 && (
        <span
          className={css({
            fontSize: "10px",
            color: theme.text.tertiary,
            whiteSpace: "nowrap",
          })}
        >
          {entry.subscriberCount} sub{entry.subscriberCount !== 1 ? "s" : ""}
        </span>
      )}
      {entry.cacheLifetimeRemaining !== null && (
        <TimeAgo
          timestamp={0}
          countdown
          remaining={entry.cacheLifetimeRemaining}
        />
      )}
    </div>
  );
}

function QueryDetail({
  entry,
  onRefetch,
  onTagClick,
}: {
  entry: DevtoolsQueryEntry;
  onRefetch?: (endpointName: string, args: unknown) => void;
  onTagClick?: (tagType: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={css({ display: "flex", flexDirection: "column", gap: "12px" })}
    >
      {/* Header */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <div
          className={css({ display: "flex", alignItems: "center", gap: "8px" })}
        >
          <StatusBadge status={entry.status} size="md" />
          <span className={css({ fontWeight: 600, fontSize: "14px" })}>
            {entry.endpointName}
          </span>
        </div>
        {onRefetch && (
          <button
            onClick={() => onRefetch(entry.endpointName, entry.originalArgs)}
            className={css({
              padding: "4px 10px",
              border: `1px solid ${theme.border.primary}`,
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: theme.text.primary,
              fontSize: "11px",
              cursor: "pointer",
              ":hover": { backgroundColor: theme.bg.hover },
            })}
          >
            Refetch
          </button>
        )}
      </div>

      {/* Cache Key */}
      <Section title="Cache Key">
        <code
          className={css({
            fontSize: "11px",
            color: theme.text.secondary,
            wordBreak: "break-all",
          })}
        >
          {entry.cacheKey}
        </code>
      </Section>

      {/* Timing */}
      <Section title="Timing">
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "4px 12px",
            fontSize: "12px",
          })}
        >
          {entry.startedTimeStamp && (
            <>
              <span className={css({ color: theme.text.tertiary })}>
                Started
              </span>
              <TimeAgo timestamp={entry.startedTimeStamp} />
            </>
          )}
          {entry.fulfilledTimeStamp && (
            <>
              <span className={css({ color: theme.text.tertiary })}>
                Fulfilled
              </span>
              <TimeAgo timestamp={entry.fulfilledTimeStamp} />
            </>
          )}
          {entry.duration !== undefined && (
            <>
              <span className={css({ color: theme.text.tertiary })}>
                Duration
              </span>
              <TimingBar duration={entry.duration} />
            </>
          )}
        </div>
      </Section>

      {/* Subscriptions */}
      <Section title={`Subscribers (${entry.subscriberCount})`}>
        <SubscriberInfo entry={entry} />
      </Section>

      {/* Tags */}
      {entry.providedTags.length > 0 && (
        <Section title="Provided Tags">
          <div
            className={css({ display: "flex", flexWrap: "wrap", gap: "4px" })}
          >
            {entry.providedTags.map((tag, i) => (
              <TagChip
                key={i}
                tag={tag}
                variant="provider"
                onClick={onTagClick ? () => onTagClick(tag.type) : undefined}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Arguments */}
      <Section title="Arguments" defaultCollapsed>
        <DataExplorer data={entry.originalArgs} defaultExpanded />
      </Section>

      {/* Data */}
      <Section title="Data" defaultCollapsed={false}>
        <DataExplorer data={entry.data} defaultExpanded />
      </Section>

      {/* Error */}
      {entry.error != null && (
        <Section title="Error">
          <DataExplorer data={entry.error} defaultExpanded />
        </Section>
      )}
    </div>
  );
}

function SubscriberInfo({ entry }: { entry: DevtoolsQueryEntry }) {
  const { theme } = useTheme();
  if (entry.subscriberCount === 0 && entry.cacheLifetimeRemaining !== null) {
    return (
      <span className={css({ fontSize: "12px", color: theme.status.rejected })}>
        No subscribers — expires in {Math.ceil(entry.cacheLifetimeRemaining)}s
      </span>
    );
  }
  const polling = entry.pollingInterval
    ? ` (polling every ${entry.pollingInterval / 1000}s)`
    : "";
  return (
    <span className={css({ fontSize: "12px", color: theme.text.secondary })}>
      {entry.subscriberCount} active subscriber
      {entry.subscriberCount !== 1 ? "s" : ""}
      {polling}
    </span>
  );
}

function Section({
  title,
  children,
  defaultCollapsed = false,
}: PropsWithChildren<{
  title: string;
  defaultCollapsed?: boolean;
}>) {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div>
      <div
        onClick={() => setCollapsed(!collapsed)}
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "4px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: theme.text.secondary,
          padding: "4px 0",
          userSelect: "none",
        })}
      >
        <span className={css({ fontSize: "9px" })}>
          {collapsed ? "\u25B6" : "\u25BC"}
        </span>
        {title}
      </div>
      {!collapsed && (
        <div className={css({ paddingLeft: "4px" })}>{children}</div>
      )}
    </div>
  );
}
