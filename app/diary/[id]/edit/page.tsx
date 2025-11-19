'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { DiaryForm, type DiarySubmissionData } from '@/components/diary/diary-form'
import { useDiary } from '@/hooks/use-diary'
import { revalidateHomePage } from '@/app/actions/revalidate'

export default function EditDiaryPage() {
  const router = useRouter()
  const params = useParams()
  const diaryId = Number(params.id)

  const { initialData, loading } = useDiary(diaryId)
  const [error, setError] = useState<string | null>(null)

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

    // Revalidate the homepage cache to show updated entry
    await revalidateHomePage()
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
    </>
  )
}