import { useState, useCallback } from "react";
import { css } from "goober";
import { useTheme } from "../theme/theme-provider";

interface DataExplorerProps {
  data: unknown;
  label?: string;
  defaultExpanded?: boolean;
  maxDepth?: number;
}

export function DataExplorer({
  data,
  label,
  defaultExpanded = false,
  maxDepth = 10,
}: DataExplorerProps) {
  return (
    <div
      className={css({
        fontFamily: '"SF Mono", "Fira Code", Menlo, monospace',
        fontSize: "11px",
        lineHeight: "1.6",
      })}
    >
      <DataNode
        value={data}
        label={label}
        depth={0}
        maxDepth={maxDepth}
        defaultExpanded={defaultExpanded}
      />
    </div>
  );
}

interface DataNodeProps {
  value: unknown;
  label?: string;
  depth: number;
  maxDepth: number;
  defaultExpanded: boolean;
}

function DataNode({
  value,
  label,
  depth,
  maxDepth,
  defaultExpanded,
}: DataNodeProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);
  const toggle = useCallback(() => setExpanded((e) => !e), []);

  if (value === null)
    return <ValueLine label={label} value="null" color={theme.text.tertiary} />;
  if (value === undefined)
    return (
      <ValueLine label={label} value="undefined" color={theme.text.tertiary} />
    );

  const type = typeof value;

  if (type === "string") {
    return (
      <ValueLine label={label} value={`"${value as string}"`} color="#22c55e" />
    );
  }
  if (type === "number") {
    return <ValueLine label={label} value={String(value)} color="#3b82f6" />;
  }
  if (type === "boolean") {
    return <ValueLine label={label} value={String(value)} color="#f59e0b" />;
  }

  if (Array.isArray(value)) {
    if (depth >= maxDepth) {
      return (
        <ValueLine
          label={label}
          value={`Array(${value.length})`}
          color={theme.text.secondary}
        />
      );
    }

    return (
      <div>
        <ExpandToggle
          label={label}
          preview={`Array(${value.length})`}
          expanded={expanded}
          onToggle={toggle}
        />
        {expanded && (
          <div className={css({ paddingLeft: "16px" })}>
            {value.map((item, i) => (
              <DataNode
                key={i}
                value={item}
                label={String(i)}
                depth={depth + 1}
                maxDepth={maxDepth}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (depth >= maxDepth) {
      return (
        <ValueLine
          label={label}
          value={`{...} (${entries.length} keys)`}
          color={theme.text.secondary}
        />
      );
    }

    return (
      <div>
        <ExpandToggle
          label={label}
          preview={`{${entries.length} keys}`}
          expanded={expanded}
          onToggle={toggle}
        />
        {expanded && (
          <div className={css({ paddingLeft: "16px" })}>
            {entries.map(([key, val]) => (
              <DataNode
                key={key}
                value={val}
                label={key}
                depth={depth + 1}
                maxDepth={maxDepth}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <ValueLine
      label={label}
      value={String(value)}
      color={theme.text.secondary}
    />
  );
}

function ValueLine({
  label,
  value,
  color,
}: {
  label?: string;
  value: string;
  color: string;
}) {
  const { theme } = useTheme();
  return (
    <div className={css({ padding: "1px 0" })}>
      {label && (
        <span className={css({ color: theme.text.secondary })}>{label}: </span>
      )}
      <span className={css({ color })}>{value}</span>
    </div>
  );
}

function ExpandToggle({
  label,
  preview,
  expanded,
  onToggle,
}: {
  label?: string;
  preview: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onToggle();
      }}
      className={css({
        cursor: "pointer",
        padding: "1px 0",
        ":hover": { backgroundColor: theme.bg.hover },
        userSelect: "none",
      })}
    >
      <span
        className={css({
          display: "inline-block",
          width: "12px",
          color: theme.text.tertiary,
          fontSize: "10px",
        })}
      >
        {expanded ? "\u25BC" : "\u25B6"}
      </span>
      {label && (
        <span className={css({ color: theme.text.secondary })}>{label}: </span>
      )}
      <span className={css({ color: theme.text.tertiary })}>{preview}</span>
    </div>
  );
}
