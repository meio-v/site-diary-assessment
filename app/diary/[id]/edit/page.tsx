'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { DiaryForm, type DiarySubmissionData, type DiaryFormInitialData } from '@/components/diary/diary-form'
import { Button } from '@/components/ui/button'

export default function EditDiaryPage() {
  const router = useRouter()
  const params = useParams()
  const diaryId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<DiaryFormInitialData | undefined>()

  useEffect(() => {
    if (Number.isNaN(diaryId)) {
      router.push('/')
      return
    }

    async function fetchDiary() {
      try {
        const { data, error } = await supabaseClient
          .from('site_diaries')
          .select('*')
          .eq('id', diaryId)
          .single()

        if (error || !data) {
          router.push('/')
          return
        }

        setInitialData({
          date: data.date.split('T')[0],
          description: data.description,
          weather: data.weather,
          temperature: data.temperature ?? '',
        })
      } catch (err) {
        console.error('Error fetching diary:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchDiary()
  }, [diaryId, router])

  const handleSubmit = async (formData: DiarySubmissionData) => {
    setError(null)

    const { error } = await supabaseClient
      .from('site_diaries')
      .update({
        date: formData.date,
        description: formData.description,
        weather: formData.weather,
        temperature: formData.temperature,
        updated_at: new Date().toISOString(),
      })
      .eq('id', diaryId)

    if (error) {
      const errorMessage = error.message || 'Failed to save changes. Please try again.'
      setError(errorMessage)
      throw new Error(errorMessage)
    }

    router.push(`/diary/${diaryId}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DiaryForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitButtonText="Save Changes"
        loadingText="Saving..."
        title="Edit Diary Entry"
        isLoading={loading}
      />
      {error && (
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      <div className="max-w-2xl mx-auto mt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </>
  )
}