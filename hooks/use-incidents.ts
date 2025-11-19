import { useDiaryItems } from './use-diary-items'
import type { Incident } from '@/types/diary'

/**
 * Hook for fetching incidents for a specific diary entry
 * @param diaryId - The ID of the diary entry
 * @param initialIncidents - Optional initial incidents (from server-side fetch)
 * @returns Incidents array, loading state, and error state
 */
export function useIncidents(diaryId: number | null, initialIncidents?: Incident[]) {
  const {
    items: incidents,
    loading,
    error,
    addItem: addIncident,
    updateItem: updateIncident,
    removeItem: removeIncident,
    setItems: setIncidents,
  } = useDiaryItems<Incident>('incidents', diaryId, initialIncidents)

  return {
    incidents,
    loading,
    error,
    addIncident,
    updateIncident,
    removeIncident,
    setIncidents,
  }
}

