import { css } from "goober";
import { useTheme } from "../theme/theme-provider";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface PanelTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onClose?: () => void;
}

export function PanelTabs({
  tabs,
  activeTab,
  onTabChange,
  onClose,
}: PanelTabsProps) {
  const { theme } = useTheme();

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${theme.border.primary}`,
        backgroundColor: theme.bg.secondary,
        flexShrink: 0,
      })}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: "2px",
          overflowX: "auto",
          flex: 1,
          minWidth: 0,
        })}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 12px",
                border: "none",
                background: "none",
                color: isActive ? theme.text.link : theme.text.secondary,
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                borderBottom: isActive
                  ? `2px solid ${theme.brand[500]}`
                  : "2px solid transparent",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
                ":hover": {
                  color: theme.text.primary,
                },
              })}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <CountBadge count={tab.count} active={isActive} />
              )}
            </button>
          );
        })}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close devtools"
          className={css({
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            margin: "0 4px",
            border: "none",
            background: "none",
            color: theme.text.secondary,
            fontSize: "14px",
            lineHeight: 1,
            cursor: "pointer",
            borderRadius: "4px",
            flexShrink: 0,
            transition: "color 0.15s, background-color 0.15s",
            ":hover": {
              color: theme.text.primary,
              backgroundColor: theme.bg.tertiary,
            },
          })}
        >
          {"\u2715"}
        </button>
      )}
    </div>
  );
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  const { theme } = useTheme();
  return (
    <span
      className={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "18px",
        height: "18px",
        padding: "0 5px",
        borderRadius: "9px",
        fontSize: "10px",
        fontWeight: 600,
        backgroundColor: active ? `${theme.brand[500]}20` : theme.bg.tertiary,
        color: active ? theme.brand[500] : theme.text.secondary,
      })}
    >
      {count > 999 ? "999+" : count}
    </span>
  );
}
