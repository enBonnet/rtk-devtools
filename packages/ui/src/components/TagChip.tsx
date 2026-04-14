import { css } from "goober";
import { useTheme } from "../theme/theme-provider";
import type { TagDescription } from "@rtk-devtools/core";

interface TagChipProps {
  tag: TagDescription;
  onClick?: () => void;
  variant?: "default" | "provider" | "invalidator";
}

const variantColors = {
  default: { bg: "#6366f118", border: "#6366f140", text: "#6366f1" },
  provider: { bg: "#22c55e18", border: "#22c55e40", text: "#22c55e" },
  invalidator: { bg: "#ef444418", border: "#ef444440", text: "#ef4444" },
} as const;

export function TagChip({ tag, onClick, variant = "default" }: TagChipProps) {
  const { resolvedMode } = useTheme();
  const colors = variantColors[variant];

  // Slightly adjust colors for light mode
  const textColor =
    resolvedMode === "light"
      ? variant === "default"
        ? "#4f46e5"
        : variant === "provider"
          ? "#16a34a"
          : "#dc2626"
      : colors.text;

  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter") onClick();
            }
          : undefined
      }
      className={css({
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        padding: "1px 6px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: '"SF Mono", "Fira Code", Menlo, monospace',
        fontWeight: 500,
        color: textColor,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s",
        ":hover": onClick ? { opacity: 0.8 } : {},
      })}
    >
      {tag.type}
      {tag.id !== undefined && (
        <span className={css({ opacity: 0.7 })}>:{String(tag.id)}</span>
      )}
    </span>
  );
}
