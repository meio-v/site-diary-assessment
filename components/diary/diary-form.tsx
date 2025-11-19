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

  // Get today's date in YYYY-MM-DD format for max date restriction
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-5xl font-logo font-bold text-foreground tracking-tight mb-10">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldGroup>
            <Field className="md:w-1/2">
              <FieldLabel htmlFor="date" className="text-primary">Date *</FieldLabel>
              <Input
                id="date"
                type="date"
                required
                max={today}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Field>

            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
              <Field className="md:w-1/2 md:shrink-0">
                <WeatherSelect
                  value={formData.weather}
                  onChange={(value) => setFormData({ ...formData, weather: value })}
                  label="Weather *"
                />
              </Field>

              <Field className="md:w-[150px] md:shrink-0">
                <FieldLabel htmlFor="temperature">Temperature (°C)</FieldLabel>
                <Input
                  id="temperature"
                  type="number"
                  placeholder="e.g. 23"
                  className="w-full"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description" className="text-primary">Summary of Work Done *</FieldLabel>
              <Textarea
                id="description"
                required
                rows={8}
                placeholder="Describe work completed, progress made, and any major events..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="resize-y"
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}

        <div className="flex gap-5 mt-10 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            className="bg-white hover:bg-muted/50 transition-colors border-border"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            size="lg"
            className="shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),0_1px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.1)] transition-shadow"
          >
            {isSubmitting ? loadingText : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  )
}