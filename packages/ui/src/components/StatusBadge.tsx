import { css } from "goober";
import { useTheme } from "../theme/theme-provider";
import type { QueryStatus } from "@rtk-devtools/core";

interface StatusBadgeProps {
  status: QueryStatus;
  size?: "sm" | "md";
}

const statusLabels: Record<QueryStatus, string> = {
  uninitialized: "idle",
  pending: "loading",
  fulfilled: "success",
  rejected: "error",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { theme } = useTheme();
  const color = theme.status[status];

  return (
    <span
      className={css({
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: size === "sm" ? "1px 6px" : "2px 8px",
        borderRadius: "9999px",
        fontSize: size === "sm" ? "10px" : "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      })}
    >
      <span
        className={css({
          width: size === "sm" ? "6px" : "7px",
          height: size === "sm" ? "6px" : "7px",
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
          ...(status === "pending"
            ? { animation: "rtki-pulse 1.5s ease-in-out infinite" }
            : {}),
        })}
      />
      {statusLabels[status]}
    </span>
  );
}
