'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldGroup,
} from '@/components/ui/field'
import type { Resource } from '@/types/diary'

interface CreateResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (resource: { name: string; unit_of_measurement: string; serial_number: string | null }) => Promise<Resource>
  initialName: string
  loading: boolean
}

export function CreateResourceDialog({
  open,
  onOpenChange,
  onSave,
  initialName,
  loading,
}: CreateResourceDialogProps) {
  const [name, setName] = useState(initialName)
  const [units, setUnits] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  useEffect(() => {
    if (open) {
      setName(initialName)
      setUnits('')
      setSerialNumber('')
    }
  }, [open, initialName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !units.trim()) return

    try {
      await onSave({
        name: name.trim(),
        unit_of_measurement: units.trim(),
        serial_number: serialNumber.trim() || null,
      })
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-resource-name">Resource Name *</FieldLabel>
                <Input
                  id="new-resource-name"
                  required
                  placeholder="e.g. Excavator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="new-resource-units">Units Utilized *</FieldLabel>
                <Input
                  id="new-resource-units"
                  required
                  placeholder="e.g. hours, days, units"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="new-resource-serial">Serial Number (optional)</FieldLabel>
                <Input
                  id="new-resource-serial"
                  placeholder="Serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Resource'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

