import { useState, useEffect } from "react";
import { css } from "goober";
import { useTheme } from "../theme/theme-provider";

interface TimeAgoProps {
  timestamp: number;
  /** Show as countdown (e.g., "expires in 45s") instead of elapsed */
  countdown?: boolean;
  /** Seconds remaining (for countdown mode) */
  remaining?: number;
}

export function TimeAgo({ timestamp, countdown, remaining }: TimeAgoProps) {
  const { theme } = useTheme();
  const [now, setNow] = useState(() => Date.now());

  // Re-render every second to update relative time
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  let text: string;
  let isUrgent = false;

  if (countdown && remaining !== undefined) {
    if (remaining <= 0) {
      text = "expiring...";
      isUrgent = true;
    } else if (remaining < 10) {
      text = `${Math.ceil(remaining)}s`;
      isUrgent = true;
    } else {
      text = `${Math.ceil(remaining)}s`;
    }
  } else {
    const elapsed = (now - timestamp) / 1000;
    if (elapsed < 1) text = "just now";
    else if (elapsed < 60) text = `${Math.floor(elapsed)}s ago`;
    else if (elapsed < 3600) text = `${Math.floor(elapsed / 60)}m ago`;
    else text = `${Math.floor(elapsed / 3600)}h ago`;
  }

  return (
    <span
      className={css({
        fontSize: "11px",
        color: isUrgent ? theme.status.rejected : theme.text.tertiary,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      })}
    >
      {text}
    </span>
  );
}
