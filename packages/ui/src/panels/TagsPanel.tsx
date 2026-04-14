import { useState, useMemo } from 'react'
import { css } from 'goober'
import { useTheme } from '../theme/theme-provider'
import { TagChip } from '../components/TagChip'
import { StatusBadge } from '../components/StatusBadge'
import { CacheKeyDisplay } from '../components/CacheKeyDisplay'
import type { TagNode } from '@rtk-devtools/core'

interface TagsPanelProps {
  tagGraph: TagNode[]
  onQuerySelect?: (cacheKey: string) => void
  /** Pre-select a tag type (used when navigating from another panel) */
  selectedTagType?: string
}

export function TagsPanel({ tagGraph, onQuerySelect, selectedTagType }: TagsPanelProps) {
  const { theme } = useTheme()
  const [selectedTag, setSelectedTag] = useState<string | null>(selectedTagType ?? null)

  // Group tags by type
  const tagsByType = useMemo(() => {
    const groups = new Map<string, TagNode[]>()
    for (const node of tagGraph) {
      const existing = groups.get(node.tag.type) ?? []
      existing.push(node)
      groups.set(node.tag.type, existing)
    }
    return groups
  }, [tagGraph])

  // Selected tag nodes
  const selectedNodes = useMemo(() => {
    if (!selectedTag) return []
    return tagGraph.filter((n) => n.tag.type === selectedTag)
  }, [tagGraph, selectedTag])

  // Unique providers and invalidators for selected tag type
  const providers = useMemo(() => {
    const seen = new Set<string>()
    return selectedNodes.flatMap((n) =>
      n.providers.filter((p) => {
        if (seen.has(p.cacheKey)) return false
        seen.add(p.cacheKey)
        return true
      }),
    )
  }, [selectedNodes])

  const invalidators = useMemo(() => {
    const seen = new Set<string>()
    return selectedNodes.flatMap((n) =>
      n.invalidators.filter((inv) => {
        if (seen.has(inv.endpointName)) return false
        seen.add(inv.endpointName)
        return true
      }),
    )
  }, [selectedNodes])

  return (
    <div className={css({ display: 'flex', height: '100%', overflow: 'hidden' })}>
      {/* Column 1: Tag Types */}
      <div
        className={css({
          flex: '0 0 200px',
          borderRight: `1px solid ${theme.border.primary}`,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <div className={css({ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.text.tertiary, borderBottom: `1px solid ${theme.border.secondary}` })}>
          Tag Types ({tagsByType.size})
        </div>
        {tagsByType.size === 0 ? (
          <div className={css({ padding: '16px', fontSize: '12px', color: theme.text.tertiary, textAlign: 'center' })}>
            No tags defined
          </div>
        ) : (
          Array.from(tagsByType.entries()).map(([type, nodes]) => (
            <TagTypeItem
              key={type}
              type={type}
              nodes={nodes}
              isSelected={type === selectedTag}
              onSelect={() => setSelectedTag(type === selectedTag ? null : type)}
            />
          ))
        )}
      </div>

      {/* Column 2: Providers */}
      <div
        className={css({
          flex: 1,
          borderRight: `1px solid ${theme.border.primary}`,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <div className={css({ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.text.tertiary, borderBottom: `1px solid ${theme.border.secondary}`, display: 'flex', alignItems: 'center', gap: '4px' })}>
          <span className={css({ color: theme.status.fulfilled })}>{'<'}\u2014</span>
          Provided by ({providers.length})
        </div>
        {!selectedTag ? (
          <div className={css({ padding: '16px', fontSize: '12px', color: theme.text.tertiary, textAlign: 'center' })}>
            Select a tag type to see providers
          </div>
        ) : providers.length === 0 ? (
          <div className={css({ padding: '16px', fontSize: '12px', color: theme.text.tertiary, textAlign: 'center' })}>
            No queries providing this tag
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.cacheKey}
              onClick={() => onQuerySelect?.(provider.cacheKey)}
              className={css({
                padding: '6px 12px',
                cursor: onQuerySelect ? 'pointer' : 'default',
                borderBottom: `1px solid ${theme.border.secondary}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                ':hover': onQuerySelect ? { backgroundColor: theme.bg.hover } : {},
              })}
            >
              <StatusBadge status={provider.status} />
              <div className={css({ flex: 1, minWidth: 0, overflow: 'hidden' })}>
                <div className={css({ fontWeight: 500, fontSize: '12px' })}>
                  {provider.endpointName}
                </div>
                <CacheKeyDisplay cacheKey={provider.cacheKey} maxLength={30} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Column 3: Invalidators */}
      <div
        className={css({
          flex: '0 0 200px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <div className={css({ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.text.tertiary, borderBottom: `1px solid ${theme.border.secondary}`, display: 'flex', alignItems: 'center', gap: '4px' })}>
          <span className={css({ color: theme.status.rejected })}>{'\u2014>'}</span>
          Invalidated by ({invalidators.length})
        </div>
        {!selectedTag ? (
          <div className={css({ padding: '16px', fontSize: '12px', color: theme.text.tertiary, textAlign: 'center' })}>
            Select a tag type
          </div>
        ) : invalidators.length === 0 ? (
          <div className={css({ padding: '16px', fontSize: '12px', color: theme.text.tertiary, textAlign: 'center' })}>
            No mutations invalidating this tag
          </div>
        ) : (
          invalidators.map((inv) => (
            <div
              key={inv.endpointName}
              className={css({
                padding: '8px 12px',
                borderBottom: `1px solid ${theme.border.secondary}`,
              })}
            >
              <span className={css({ fontWeight: 500, fontSize: '12px', color: theme.status.rejected })}>
                {inv.endpointName}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Invalidation Flow Diagram */}
      {selectedTag && (invalidators.length > 0 || providers.length > 0) && (
        <InvalidationFlowOverlay
          tagType={selectedTag}
          tagNodes={selectedNodes}
          providers={providers}
          invalidators={invalidators}
        />
      )}
    </div>
  )
}

function TagTypeItem({
  type,
  nodes,
  isSelected,
  onSelect,
}: {
  type: string
  nodes: TagNode[]
  isSelected: boolean
  onSelect: () => void
}) {
  const { theme } = useTheme()
  const tagIds = nodes.filter((n) => n.tag.id !== undefined)
  const totalProviders = nodes.reduce((sum, n) => sum + n.providers.length, 0)

  return (
    <div
      onClick={onSelect}
      className={css({
        padding: '6px 12px',
        cursor: 'pointer',
        backgroundColor: isSelected ? theme.bg.active : 'transparent',
        borderBottom: `1px solid ${theme.border.secondary}`,
        ':hover': { backgroundColor: isSelected ? theme.bg.active : theme.bg.hover },
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'center', gap: '6px' })}>
        <TagChip tag={{ type }} />
        <span className={css({ fontSize: '10px', color: theme.text.tertiary, marginLeft: 'auto' })}>
          {totalProviders}
        </span>
      </div>
      {isSelected && tagIds.length > 0 && (
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '6px', paddingLeft: '4px' })}>
          {tagIds.map((node, i) => (
            <TagChip key={i} tag={node.tag} variant="provider" />
          ))}
        </div>
      )}
    </div>
  )
}

function InvalidationFlowOverlay({
  tagType: _tagType,
  tagNodes: _tagNodes,
  providers: _providers,
  invalidators: _invalidators,
}: {
  tagType: string
  tagNodes: TagNode[]
  providers: Array<{ endpointName: string; cacheKey: string }>
  invalidators: Array<{ endpointName: string }>
}) {
  // This is a simplified text-based flow indicator.
  // A full SVG-based visualization can be added in a future version.
  // The three-column layout itself acts as the visual flow.
  return null // The columns themselves serve as the flow visualization
}
