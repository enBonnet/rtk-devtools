import { css } from 'goober'
import { useTheme } from '../theme/theme-provider'

interface CacheKeyDisplayProps {
  cacheKey: string
  maxLength?: number
}

export function CacheKeyDisplay({ cacheKey, maxLength = 50 }: CacheKeyDisplayProps) {
  const { theme } = useTheme()
  const truncated = maxLength > 0 && cacheKey.length > maxLength
    ? cacheKey.slice(0, maxLength) + '...'
    : cacheKey

  // Split into endpoint name and args
  const parenIndex = cacheKey.indexOf('(')
  const endpointName = parenIndex > -1 ? cacheKey.slice(0, parenIndex) : cacheKey
  const args = parenIndex > -1 ? cacheKey.slice(parenIndex) : ''
  const truncatedArgs = maxLength > 0 && args.length > maxLength - endpointName.length
    ? args.slice(0, Math.max(10, maxLength - endpointName.length)) + '...)'
    : args

  return (
    <span
      title={cacheKey}
      className={css({
        fontFamily: '"SF Mono", "Fira Code", Menlo, monospace',
        fontSize: '11px',
        display: 'inline',
      })}
    >
      <span className={css({ color: theme.text.link, fontWeight: 600 })}>
        {endpointName}
      </span>
      {truncatedArgs && (
        <span className={css({ color: theme.text.secondary })}>
          {truncated ? truncatedArgs : args}
        </span>
      )}
    </span>
  )
}
