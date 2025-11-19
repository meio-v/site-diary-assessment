import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'

/**
 * Generic hook for fetching diary-related items (visitors, incidents, etc.)
 * @param tableName - The Supabase table name
 * @param diaryId - The ID of the diary entry
 * @param initialItems - Optional initial items (from server-side fetch)
 * @returns Items array, loading state, error state, and CRUD helpers
 */
export function useDiaryItems<T extends { id: number }>(
  tableName: string,
  diaryId: number | null,
  initialItems?: T[]
) {
  const [items, setItems] = useState<T[]>(initialItems || [])
  const [loading, setLoading] = useState(!initialItems)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If initial data provided, skip fetching
    if (initialItems) {
      return
    }

    if (!diaryId) {
      setLoading(false)
      return
    }

    async function fetchItems() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('site_diary_id', diaryId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setItems(data || [])
      } catch (err) {
        console.error(`Error fetching ${tableName}:`, err)
        setError(err instanceof Error ? err : new Error(`Failed to fetch ${tableName}`))
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [tableName, diaryId, initialItems])

  const addItem = (item: T) => {
    setItems((prev) => [item, ...prev])
  }

  const updateItem = (id: number, updated: T) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    setItems,
  }
}

