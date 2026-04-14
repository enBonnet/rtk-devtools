import type { CSSProperties } from 'react'
import { css } from 'goober'

interface ToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  activeQueryCount: number
  pendingCount: number
  errorCount: number
}

const positionStyles: Record<string, CSSProperties> = {
  'top-left': { top: '12px', left: '12px' },
  'top-right': { top: '12px', right: '12px' },
  'bottom-left': { bottom: '12px', left: '12px' },
  'bottom-right': { bottom: '12px', right: '12px' },
}

export function ToggleButton({
  isOpen,
  onClick,
  position,
  activeQueryCount,
  pendingCount,
  errorCount,
}: ToggleButtonProps) {
  const pos = positionStyles[position]

  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close RTK Devtools' : 'Open RTK Devtools'}
      className={css({
        position: 'fixed',
        ...pos,
        zIndex: 99998,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        border: 'none',
        borderRadius: '20px',
        backgroundColor: isOpen ? '#7e22ce' : '#1f2937',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: isOpen ? '#6b21a8' : '#374151',
          transform: 'scale(1.05)',
        },
      })}
    >
      {/* RTK Logo placeholder */}
      <span className={css({ fontSize: '14px' })}>
        {'\u269B'}
      </span>
      <span>RTK</span>
      {!isOpen && activeQueryCount > 0 && (
        <span
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '9px',
            fontSize: '10px',
            fontWeight: 700,
            backgroundColor: errorCount > 0
              ? '#ef4444'
              : pendingCount > 0
                ? '#3b82f6'
                : '#22c55e',
            color: '#ffffff',
          })}
        >
          {activeQueryCount}
        </span>
      )}
    </button>
  )
}
