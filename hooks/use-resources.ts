import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase'
import type { Resource } from '@/types/diary'

/**
 * Hook for fetching and managing resources list
 * @returns Resources array and loading state
 */
export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabaseClient
          .from('resources')
          .select('*')
          .order('name')

        if (fetchError) throw fetchError

        setResources(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching resources:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch resources'))
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  const addResource = (resource: Resource) => {
    setResources((prev) => [...prev, resource])
  }

  return {
    resources,
    loading,
    error,
    addResource,
  }
}

