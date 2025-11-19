'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, X } from 'lucide-react'

interface IncidentFormProps {
  title: string
  description: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
}

export function IncidentForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onCancel,
  loading,
}: IncidentFormProps) {
  return (
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Incident title *"
          className="flex-1"
          required
          disabled={loading}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={onSave}
          disabled={loading}
          className="h-8 w-8"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Description *"
        rows={3}
        required
        disabled={loading}
      />
    </div>
  )
}

