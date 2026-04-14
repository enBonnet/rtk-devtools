import { useState, useMemo } from "react";
import { css } from "goober";
import { useTheme } from "../theme/theme-provider";
import { StatusBadge } from "../components/StatusBadge";
import { DataExplorer } from "../components/DataExplorer";
import { TagChip } from "../components/TagChip";
import { TimingBar } from "../components/TimingBar";
import { TimeAgo } from "../components/TimeAgo";
import { SearchFilter } from "../components/SearchFilter";
import type { DevtoolsMutationEntry, QueryStatus } from "@rtk-devtools/core";

interface MutationsPanelProps {
  mutations: Map<string, DevtoolsMutationEntry>;
}

export function MutationsPanel({ mutations }: MutationsPanelProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueryStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredMutations = useMemo(() => {
    let entries = Array.from(mutations.values());

    if (search) {
      const lower = search.toLowerCase();
      entries = entries.filter((e) =>
        e.endpointName.toLowerCase().includes(lower),
      );
    }

    if (statusFilter !== "all") {
      entries = entries.filter((e) => e.status === statusFilter);
    }

    // Sort by most recent first
    entries.sort(
      (a, b) => (b.startedTimeStamp ?? 0) - (a.startedTimeStamp ?? 0),
    );

    return entries;
  }, [mutations, search, statusFilter]);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      })}
    >
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        placeholder="Filter by endpoint..."
      />

      <div className={css({ flex: 1, overflow: "auto" })}>
        {filteredMutations.length === 0 ? (
          <div
            className={css({
              padding: "24px",
              textAlign: "center",
              color: theme.text.tertiary,
              fontSize: "12px",
            })}
          >
            No mutations found
          </div>
        ) : (
          filteredMutations.map((entry) => (
            <MutationItem
              key={entry.id}
              entry={entry}
              isExpanded={entry.id === expandedId}
              onToggle={() =>
                setExpandedId(entry.id === expandedId ? null : entry.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function MutationItem({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: DevtoolsMutationEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={css({ borderBottom: `1px solid ${theme.border.secondary}` })}
    >
      {/* Summary row */}
      <div
        onClick={onToggle}
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          cursor: "pointer",
          backgroundColor: isExpanded ? theme.bg.active : "transparent",
          ":hover": {
            backgroundColor: isExpanded ? theme.bg.active : theme.bg.hover,
          },
          transition: "background-color 0.1s",
        })}
      >
        <span className={css({ fontSize: "10px", color: theme.text.tertiary })}>
          {isExpanded ? "\u25BC" : "\u25B6"}
        </span>
        <StatusBadge status={entry.status} />
        <span className={css({ fontWeight: 500, fontSize: "12px", flex: 1 })}>
          {entry.endpointName}
        </span>
        <TimingBar duration={entry.duration} />
        {entry.startedTimeStamp && (
          <TimeAgo timestamp={entry.startedTimeStamp} />
        )}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div
          className={css({
            padding: "8px 12px 12px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          })}
        >
          {/* ID */}
          <div className={css({ fontSize: "11px" })}>
            <span className={css({ color: theme.text.tertiary })}>ID: </span>
            <code className={css({ color: theme.text.secondary })}>
              {entry.id}
            </code>
          </div>

          {/* Invalidated Tags */}
          {entry.invalidatedTags.length > 0 && (
            <div>
              <div
                className={css({
                  fontSize: "11px",
                  color: theme.text.tertiary,
                  marginBottom: "4px",
                })}
              >
                Invalidated Tags:
              </div>
              <div
                className={css({
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                })}
              >
                {entry.invalidatedTags.map((tag, i) => (
                  <TagChip key={i} tag={tag} variant="invalidator" />
                ))}
              </div>
            </div>
          )}

          {/* Arguments */}
          <div>
            <div
              className={css({
                fontSize: "11px",
                color: theme.text.tertiary,
                marginBottom: "4px",
              })}
            >
              Arguments:
            </div>
            <DataExplorer data={entry.originalArgs} defaultExpanded />
          </div>

          {/* Result */}
          {entry.data !== undefined && (
            <div>
              <div
                className={css({
                  fontSize: "11px",
                  color: theme.text.tertiary,
                  marginBottom: "4px",
                })}
              >
                Result:
              </div>
              <DataExplorer data={entry.data} defaultExpanded />
            </div>
          )}

          {/* Error */}
          {entry.error != null && (
            <div>
              <div
                className={css({
                  fontSize: "11px",
                  color: theme.status.rejected,
                  marginBottom: "4px",
                })}
              >
                Error:
              </div>
              <DataExplorer data={entry.error} defaultExpanded />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
