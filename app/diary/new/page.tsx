'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase'
import { DiaryForm, type DiarySubmissionData } from '@/components/diary/diary-form'

export default function NewDiaryPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: DiarySubmissionData) => {
    setError(null)

    const { data: existing } = await supabaseClient
      .from('site_diaries')
      .select('id')
      .eq('date', formData.date)
      .maybeSingle()

    if (existing) {
      setError('A diary entry already exists for this date. Please edit the existing entry instead.')
      throw new Error('Duplicate date')
    }

    const { data, error: insertError } = await supabaseClient
      .from('site_diaries')
      .insert([formData])
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        setError('A diary entry already exists for this date.')
      } else {
        setError('Failed to create diary entry. Please try again.')
      }
      throw insertError
    }

    router.push(`/diary/${data.id}`)
  }

  return (
    <>
      <DiaryForm
        onSubmit={handleSubmit}
        submitButtonText="Create Entry"
        loadingText="Creating..."
        title="Create New Diary Entry"
      />
      {error && (
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </>
  )
}