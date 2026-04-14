import type {
  TagDescription,
  TagNode,
  RTKQueryApi,
  RTKQueryState,
  QueryStatus,
} from './types'

/**
 * Build a tag relationship graph from RTK Query runtime state and
 * endpoint definitions.
 *
 * - `provided` state tells us which queries currently provide which tags
 * - Endpoint definitions tell us which mutations invalidate which tag types
 *   (only static arrays; function-form tags require runtime observation)
 */
export function buildTagGraph(
  apiState: RTKQueryState,
  api: RTKQueryApi,
): TagNode[] {
  const nodeMap = new Map<string, TagNode>()

  // Helper to get or create a TagNode by a composite key
  function getOrCreateNode(tag: TagDescription): TagNode {
    const key = tagKey(tag)
    let node = nodeMap.get(key)
    if (!node) {
      node = { tag, providers: [], invalidators: [] }
      nodeMap.set(key, node)
    }
    return node
  }

  // 1. Process provided tags from runtime state
  //    apiState.provided is: { [tagType]: { [tagId]: cacheKey[] } }
  const { provided, queries } = apiState

  for (const [tagType, tagIdMap] of Object.entries(provided)) {
    for (const [tagId, cacheKeys] of Object.entries(tagIdMap)) {
      const tag: TagDescription =
        tagId === '__internal_without_id'
          ? { type: tagType }
          : { type: tagType, id: parseTagId(tagId) }

      const node = getOrCreateNode(tag)

      for (const cacheKey of cacheKeys) {
        const queryEntry = queries[cacheKey]
        node.providers.push({
          endpointName: queryEntry?.endpointName ?? extractEndpointName(cacheKey),
          cacheKey,
          status: (queryEntry?.status ?? 'uninitialized') as QueryStatus,
        })
      }
    }
  }

  // 2. Process invalidation definitions from mutation endpoints
  for (const [endpointName, endpoint] of Object.entries(api.endpoints)) {
    // Check if this is a mutation endpoint by looking for mutation-specific properties
    // RTK Query mutation endpoints have a specific shape
    const endpointDef = endpoint as Record<string, unknown>

    // Try to find static invalidatesTags on the endpoint definition
    // This is exposed via the api.endpoints[name] object
    if (endpointDef && typeof endpointDef === 'object') {
      // Access internal endpoint definition if available
      const invalidatesTags = findInvalidatesTags(endpointDef)
      if (invalidatesTags && Array.isArray(invalidatesTags)) {
        for (const tagDef of invalidatesTags) {
          const tag: TagDescription =
            typeof tagDef === 'string'
              ? { type: tagDef }
              : { type: tagDef.type, id: tagDef.id }

          const node = getOrCreateNode(tag)

          // Avoid duplicates
          if (!node.invalidators.some((inv) => inv.endpointName === endpointName)) {
            node.invalidators.push({ endpointName })
          }
        }
      }
    }
  }

  return Array.from(nodeMap.values())
}

/**
 * Create a unique key for a tag description.
 */
export function tagKey(tag: TagDescription): string {
  return tag.id !== undefined ? `${tag.type}:${tag.id}` : tag.type
}

/**
 * Parse a tag ID from RTK Query's internal representation.
 * RTK Query stores numeric IDs as strings internally.
 */
function parseTagId(id: string): string | number {
  const num = Number(id)
  return !isNaN(num) && String(num) === id ? num : id
}

/**
 * Extract endpoint name from a cache key.
 * RTK Query cache keys are formatted as: endpointName(serializedArgs)
 */
function extractEndpointName(cacheKey: string): string {
  const parenIndex = cacheKey.indexOf('(')
  return parenIndex > -1 ? cacheKey.slice(0, parenIndex) : cacheKey
}

/**
 * Attempt to find static invalidatesTags from an endpoint definition.
 * This is a best-effort approach since RTK Query's internal structure
 * may vary between versions.
 */
function findInvalidatesTags(
  endpoint: Record<string, unknown>,
): Array<string | TagDescription> | null {
  // Direct property
  if (Array.isArray(endpoint.invalidatesTags)) {
    return endpoint.invalidatesTags as Array<string | TagDescription>
  }

  // Nested in a definition object (some RTK versions)
  const definition = endpoint.definition as Record<string, unknown> | undefined
  if (definition && Array.isArray(definition.invalidatesTags)) {
    return definition.invalidatesTags as Array<string | TagDescription>
  }

  // Function-form tags cannot be statically analyzed
  return null
}
