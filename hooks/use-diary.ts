import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import type { SiteDiary } from '@/types/diary'
import type { DiaryFormInitialData } from '@/components/diary/diary-form'

/**
 * Hook for fetching a single diary entry by ID
 * @param diaryId - The ID of the diary entry to fetch
 * @returns Diary data, loading state, and error state
 */
export function useDiary(diaryId: number | null) {
  const router = useRouter()
  const [diary, setDiary] = useState<SiteDiary | null>(null)
  const [initialData, setInitialData] = useState<DiaryFormInitialData | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!diaryId || Number.isNaN(diaryId)) {
      router.push('/')
      return
    }

    async function fetchDiary() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabaseClient
          .from('site_diaries')
          .select('*')
          .eq('id', diaryId)
          .single()

        if (fetchError || !data) {
          router.push('/')
          return
        }

        setDiary(data)
        setInitialData({
          date: data.date.split('T')[0],
          description: data.description,
          weather: data.weather as DiaryFormInitialData['weather'],
          temperature: data.temperature ?? '',
        })
      } catch (err) {
        console.error('Error fetching diary:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch diary')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchDiary()
  }, [diaryId, router])

  return {
    diary,
    initialData,
    loading,
    error,
  }
}

