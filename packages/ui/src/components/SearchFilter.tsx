import { css } from "goober";
import { useTheme } from "../theme/theme-provider";
import type { QueryStatus } from "@rtk-devtools/core";

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter?: QueryStatus | "all";
  onStatusFilterChange?: (status: QueryStatus | "all") => void;
  placeholder?: string;
  showStatusFilter?: boolean;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  placeholder = "Filter...",
  showStatusFilter = true,
}: SearchFilterProps) {
  const { theme } = useTheme();

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderBottom: `1px solid ${theme.border.primary}`,
        flexShrink: 0,
      })}
    >
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className={css({
          flex: 1,
          padding: "4px 8px",
          border: `1px solid ${theme.border.primary}`,
          borderRadius: "4px",
          backgroundColor: theme.bg.primary,
          color: theme.text.primary,
          fontSize: "12px",
          outline: "none",
          ":focus": {
            borderColor: theme.border.focus,
          },
          "::placeholder": {
            color: theme.text.tertiary,
          },
        })}
      />
      {showStatusFilter && onStatusFilterChange && (
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as QueryStatus | "all")
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
            ":focus": {
              borderColor: theme.border.focus,
            },
          })}
        >
          <option value="all">All</option>
          <option value="pending">Loading</option>
          <option value="fulfilled">Success</option>
          <option value="rejected">Error</option>
          <option value="uninitialized">Idle</option>
        </select>
      )}
    </div>
  );
}
