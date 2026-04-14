import { css } from 'goober'
import { useTheme } from '../theme/theme-provider'

interface TimingBarProps {
  duration: number | undefined
  maxDuration?: number
}

export function TimingBar({ duration, maxDuration = 5000 }: TimingBarProps) {
  const { theme } = useTheme()

  if (duration === undefined) {
    return (
      <span className={css({ fontSize: '11px', color: theme.text.tertiary })}>
        --
      </span>
    )
  }

  const pct = Math.min(100, (duration / maxDuration) * 100)
  const color =
    duration < 200
      ? theme.status.fulfilled
      : duration < 1000
        ? theme.status.pending
        : theme.status.rejected

  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      })}
    >
      <span
        className={css({
          width: '40px',
          height: '4px',
          backgroundColor: theme.bg.tertiary,
          borderRadius: '2px',
          overflow: 'hidden',
          flexShrink: 0,
        })}
      >
        <span
          className={css({
            display: 'block',
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          })}
        />
      </span>
      <span
        className={css({
          fontSize: '11px',
          color: theme.text.secondary,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        })}
      >
        {formatDuration(duration)}
      </span>
    </span>
  )
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
