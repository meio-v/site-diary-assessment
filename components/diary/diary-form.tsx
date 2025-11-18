'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { WeatherSelect } from '@/components/shared/weather-select'
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldGroup,
} from '@/components/ui/field'
import type { WeatherCondition } from '@/lib/weather'

export interface DiarySubmissionData {
  date: string
  description: string
  weather: WeatherCondition
  temperature: number | null
}

export interface DiaryFormInitialData {
  date: string
  description: string
  weather: WeatherCondition | ''
  temperature: number | ''
}

type DiaryFormState = DiaryFormInitialData

interface DiaryFormProps {
  initialData?: DiaryFormInitialData
  onSubmit: (data: DiarySubmissionData) => Promise<void>
  submitButtonText: string
  loadingText?: string
  title: string
  isLoading?: boolean
}

export function DiaryForm({
  initialData,
  onSubmit,
  submitButtonText,
  loadingText = 'Saving...',
  title,
  isLoading: externalLoading,
}: DiaryFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<DiaryFormState>({
    date: initialData?.date || '',
    description: initialData?.description || '',
    weather: (initialData?.weather as WeatherCondition) || '' ,
    temperature: initialData?.temperature ?? '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        description: initialData.description,
        weather: initialData.weather,
        temperature: initialData.temperature ?? '',
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.weather) {
      setError('Please select a weather condition.')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        temperature: formData.temperature === '' ? null : Number(formData.temperature),
        weather: formData.weather as WeatherCondition,
      })
    } catch (err) {
      console.error('Form submission error:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Something went wrong. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isSubmitting = loading || externalLoading

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">Date *</FieldLabel>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Field>

            <Field>
              <WeatherSelect
                value={formData.weather}
                onChange={(value) => setFormData({ ...formData, weather: value })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="temperature">Temperature (°C)</FieldLabel>
              <Input
                id="temperature"
                type="number"
                placeholder="e.g. 23"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Notes *</FieldLabel>
              <Textarea
                id="description"
                required
                rows={6}
                placeholder="Enter notes about work completed, activities, and notable events..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? loadingText : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  )
}