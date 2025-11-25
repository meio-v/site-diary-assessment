'use server'

import { supabase } from '@/lib/supabase'
import type { DiarySubmissionData } from '@/components/diary/diary-form'

export async function updateDiaryEntry(
  id: number,
  formData: DiarySubmissionData
): Promise<void> {
  const { error } = await supabase
    .from('site_diaries')
    .update({
      date: formData.date,
      description: formData.description,
      weather: formData.weather,
      temperature: formData.temperature,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    const errorMessage = error.message || 'Failed to save changes. Please try again.'
    throw new Error(errorMessage)
  }
}

