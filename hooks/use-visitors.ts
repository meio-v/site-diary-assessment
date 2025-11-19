import { useDiaryItems } from './use-diary-items'
import type { Visitor } from '@/types/diary'

/**
 * Hook for fetching visitors for a specific diary entry
 * @param diaryId - The ID of the diary entry
 * @param initialVisitors - Optional initial visitors (from server-side fetch)
 * @returns Visitors array, loading state, and error state
 */
export function useVisitors(diaryId: number | null, initialVisitors?: Visitor[]) {
  const {
    items: visitors,
    loading,
    error,
    addItem: addVisitor,
    updateItem: updateVisitor,
    removeItem: removeVisitor,
    setItems: setVisitors,
  } = useDiaryItems<Visitor>('visitors', diaryId, initialVisitors)

  return {
    visitors,
    loading,
    error,
    addVisitor,
    updateVisitor,
    removeVisitor,
    setVisitors,
  }
}

