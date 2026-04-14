import type { RTKDevtoolsProps } from './RTKDevtools'

/**
 * Production no-op component.
 * This module is resolved via the package.json "exports" default condition,
 * so production bundlers get an empty module that tree-shakes to zero bytes.
 */
export function RTKDevtools(_props: RTKDevtoolsProps): null {
  return null
}
