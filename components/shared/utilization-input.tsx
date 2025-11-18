'use client'

import { Input } from '@/components/ui/input'

interface UtilizationInputProps {
  value: string
  onChange: (value: string) => void
  unit?: string
  disabled?: boolean
  placeholder?: string
}

export function UtilizationInput({
  value,
  onChange,
  unit,
  disabled = false,
  placeholder = 'Amount used (e.g. 8.5)',
}: UtilizationInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32"
        disabled={disabled}
      />
      {unit && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {unit}
        </span>
      )}
    </div>
  )
}

