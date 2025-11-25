'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { DiaryForm, type DiarySubmissionData } from '@/components/diary/diary-form'
import { useDiary } from '@/hooks/use-diary'
import { updateDiaryEntry } from '@/app/actions/updateDiaryEntry'
import { revalidateHomePage } from '@/app/actions/revalidate'

export default function EditDiaryPage() {
  const router = useRouter()
  const params = useParams()
  const diaryId = Number(params.id)

  const { initialData, loading } = useDiary(diaryId)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: DiarySubmissionData) => {
    setError(null)

    try {
      await updateDiaryEntry(diaryId, formData)
      
      // Revalidate the homepage cache to show updated entry
      await revalidateHomePage()
      toast.success('Diary entry updated successfully')
      router.push(`/diary/${diaryId}`)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save changes. Please try again.'
      setError(errorMessage)
      throw err
    }
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