import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { css } from 'goober'
import { useTheme } from '../theme/theme-provider'
import { StatusBadge } from '../components/StatusBadge'
import { CacheKeyDisplay } from '../components/CacheKeyDisplay'
import { TimeAgo } from '../components/TimeAgo'
import { SearchFilter } from '../components/SearchFilter'
import type { DevtoolsQueryEntry } from '@rtk-devtools/core'

interface SubscriptionsPanelProps {
  queries: Map<string, DevtoolsQueryEntry>
}

export function SubscriptionsPanel({ queries }: SubscriptionsPanelProps) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [showExpiring, setShowExpiring] = useState(false)

  const entries = useMemo(() => {
    let items = Array.from(queries.values())

    if (search) {
      const lower = search.toLowerCase()
      items = items.filter(
        (e) =>
          e.cacheKey.toLowerCase().includes(lower) ||
          e.endpointName.toLowerCase().includes(lower),
      )
    }

    if (showExpiring) {
      items = items.filter((e) => e.subscriberCount === 0 && e.cacheLifetimeRemaining !== null)
    }

    // Sort: active (by subscriber count desc), then expiring
    items.sort((a, b) => {
      if (a.subscriberCount === 0 && b.subscriberCount > 0) return 1
      if (a.subscriberCount > 0 && b.subscriberCount === 0) return -1
      return b.subscriberCount - a.subscriberCount
    })

    return items
  }, [queries, search, showExpiring])

  const totalSubs = useMemo(
    () => Array.from(queries.values()).reduce((sum, q) => sum + q.subscriberCount, 0),
    [queries],
  )
  const expiringCount = useMemo(
    () => Array.from(queries.values()).filter((q) => q.subscriberCount === 0 && q.cacheLifetimeRemaining !== null).length,
    [queries],
  )

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' })}>
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        showStatusFilter={false}
        placeholder="Filter by endpoint..."
      />

      {/* Summary bar */}
      <div className={css({ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderBottom: `1px solid ${theme.border.secondary}`, fontSize: '11px' })}>
        <span className={css({ color: theme.text.tertiary })}>
          {totalSubs} total subscriptions
        </span>
        <span className={css({ color: theme.text.tertiary })}>
          {queries.size} cache entries
        </span>
        {expiringCount > 0 && (
          <button
            onClick={() => setShowExpiring(!showExpiring)}
            className={css({
              padding: '2px 6px',
              border: 'none',
              borderRadius: '3px',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: showExpiring ? `${theme.status.rejected}20` : 'transparent',
              color: theme.status.rejected,
              ':hover': { backgroundColor: `${theme.status.rejected}15` },
            })}
          >
            {expiringCount} expiring
          </button>
        )}
      </div>

      {/* Table */}
      <div className={css({ flex: 1, overflow: 'auto' })}>
        <table className={css({ width: '100%', borderCollapse: 'collapse', fontSize: '12px' })}>
          <thead>
            <tr className={css({ position: 'sticky', top: 0, backgroundColor: theme.bg.secondary, zIndex: 1 })}>
              <Th>Status</Th>
              <Th>Endpoint / Cache Key</Th>
              <Th align="right">Subs</Th>
              <Th align="right">Polling</Th>
              <Th align="right">Cache</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <SubscriptionRow key={entry.cacheKey} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SubscriptionRow({ entry }: { entry: DevtoolsQueryEntry }) {
  const { theme } = useTheme()
  const isExpiring = entry.subscriberCount === 0 && entry.cacheLifetimeRemaining !== null

  return (
    <tr
      className={css({
        borderBottom: `1px solid ${theme.border.secondary}`,
        backgroundColor: isExpiring ? `${theme.status.rejected}08` : 'transparent',
        ':hover': { backgroundColor: theme.bg.hover },
      })}
    >
      <td className={css({ padding: '6px 12px' })}>
        <StatusBadge status={entry.status} />
      </td>
      <td className={css({ padding: '6px 12px' })}>
        <div className={css({ fontWeight: 500 })}>{entry.endpointName}</div>
        <CacheKeyDisplay cacheKey={entry.cacheKey} maxLength={50} />
      </td>
      <td className={css({ padding: '6px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' })}>
        <span
          className={css({
            fontWeight: 600,
            color: entry.subscriberCount === 0 ? theme.status.rejected : theme.text.primary,
          })}
        >
          {entry.subscriberCount}
        </span>
      </td>
      <td className={css({ padding: '6px 12px', textAlign: 'right', color: theme.text.secondary })}>
        {entry.pollingInterval ? `${entry.pollingInterval / 1000}s` : '\u2014'}
      </td>
      <td className={css({ padding: '6px 12px', textAlign: 'right' })}>
        {isExpiring ? (
          <TimeAgo timestamp={0} countdown remaining={entry.cacheLifetimeRemaining!} />
        ) : (
          <span className={css({ color: theme.status.fulfilled, fontSize: '11px' })}>active</span>
        )}
      </td>
    </tr>
  )
}

function Th({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  const { theme } = useTheme()
  return (
    <th
      className={css({
        padding: '6px 12px',
        textAlign: align,
        fontWeight: 600,
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: theme.text.tertiary,
        borderBottom: `1px solid ${theme.border.primary}`,
      })}
    >
      {children}
    </th>
  )
}
