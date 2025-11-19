'use client'

import { weatherOptions, type WeatherCondition } from '@/lib/weather'
import { FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WeatherSelectProps {
  value: WeatherCondition | string
  onChange: (value: WeatherCondition) => void
  label?: string
}

export function WeatherSelect({ value, onChange, label = 'Weather *' }: WeatherSelectProps) {
  const isRequired = label.includes('*')
  return (
    <>
      <FieldLabel htmlFor="weather-select" className={isRequired ? 'text-primary' : ''}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="weather-select">
          <SelectValue placeholder="Select weather condition" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(weatherOptions).map(([key, { label }]) => {
            const Icon = weatherOptions[key as WeatherCondition].icon
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </>
  )
}