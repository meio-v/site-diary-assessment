import { useState } from 'react'

/**
 * Hook for managing expandable/collapsible state for multiple items
 * @returns Object with expanded state and toggle function
 */
export function useExpandable() {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const isExpanded = (id: number) => expandedIds.has(id)

  const collapse = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  return {
    expandedIds,
    toggleExpand,
    isExpanded,
    collapse,
    collapseAll,
  }
}

