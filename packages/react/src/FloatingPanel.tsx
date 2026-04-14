import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import { css } from "goober";

export type PanelPosition = "top" | "bottom" | "left" | "right";

interface FloatingPanelProps {
  isOpen: boolean;
  position: PanelPosition;
  initialSize: number;
  children: ReactNode;
}

const STORAGE_KEY = "rtk-devtools-panel";
const MIN_SIZE = 200;
const MAX_SIZE_RATIO = 0.8;

function loadPersistedSize(position: PanelPosition, fallback: number): number {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-size-${position}`);
    if (stored) return Math.max(MIN_SIZE, parseInt(stored, 10));
  } catch {
    /* noop */
  }
  return fallback;
}

function persistSize(position: PanelPosition, size: number): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-size-${position}`, String(size));
  } catch {
    /* noop */
  }
}

export function FloatingPanel({
  isOpen,
  position,
  initialSize,
  children,
}: FloatingPanelProps) {
  const [size, setSize] = useState(() =>
    loadPersistedSize(position, initialSize),
  );
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  useEffect(() => {
    persistSize(position, size);
  }, [position, size]);

  const isHorizontal = position === "top" || position === "bottom";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startPos.current = isHorizontal ? e.clientY : e.clientX;
      startSize.current = size;

      const handleMouseMove = (ev: globalThis.MouseEvent) => {
        if (!isDragging.current) return;
        const current = isHorizontal ? ev.clientY : ev.clientX;
        const diff =
          position === "bottom" || position === "right"
            ? startPos.current - current
            : current - startPos.current;
        const maxSize =
          (isHorizontal ? window.innerHeight : window.innerWidth) *
          MAX_SIZE_RATIO;
        const newSize = Math.min(
          maxSize,
          Math.max(MIN_SIZE, startSize.current + diff),
        );
        setSize(newSize);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [isHorizontal, position, size],
  );

  if (!isOpen) return null;

  const panelStyle: CSSProperties = {
    position: "fixed",
    zIndex: 99999,
    backgroundColor: "#0a0f1a",
    borderColor: "#374151",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
    ...(position === "bottom" && {
      bottom: 0,
      left: 0,
      right: 0,
      height: `${size}px`,
      borderTop: "1px solid #374151",
    }),
    ...(position === "top" && {
      top: 0,
      left: 0,
      right: 0,
      height: `${size}px`,
      borderBottom: "1px solid #374151",
    }),
    ...(position === "left" && {
      top: 0,
      left: 0,
      bottom: 0,
      width: `${size}px`,
      borderRight: "1px solid #374151",
    }),
    ...(position === "right" && {
      top: 0,
      right: 0,
      bottom: 0,
      width: `${size}px`,
      borderLeft: "1px solid #374151",
    }),
  };

  const handleCss = isHorizontal
    ? css({
        position: "absolute",
        top: position === "bottom" ? "0" : undefined,
        bottom: position === "top" ? "0" : undefined,
        left: "0",
        right: "0",
        height: "4px",
        cursor: "row-resize",
        zIndex: 1,
        ":hover": { backgroundColor: "#7e22ce" },
        transition: "background-color 0.15s",
      })
    : css({
        position: "absolute",
        left: position === "right" ? "0" : undefined,
        right: position === "left" ? "0" : undefined,
        top: "0",
        bottom: "0",
        width: "4px",
        cursor: "col-resize",
        zIndex: 1,
        ":hover": { backgroundColor: "#7e22ce" },
        transition: "background-color 0.15s",
      });

  return (
    <div style={panelStyle}>
      {/* Resize handle */}
      <div onMouseDown={handleMouseDown} className={handleCss} />
      {/* Content */}
      <div
        className={css({
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        })}
      >
        {children}
      </div>
    </div>
  );
}
