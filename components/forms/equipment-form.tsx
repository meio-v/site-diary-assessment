'use client'

import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { ResourceCombobox } from '@/components/shared/resource-combobox'
import { UtilizationInput } from '@/components/shared/utilization-input'
import type { Resource } from '@/types/diary'

interface ResourceSelectionState {
  selectedResourceId: number | null
  searchQuery: string
  popoverOpen: boolean
  selectedResource?: Resource
}

interface ResourceSelectionHandlers {
  onSearchChange: (query: string) => void
  onSelect: (resourceId: number | 'create') => void
  onPopoverChange: (open: boolean) => void
}

interface EquipmentFormProps {
  resources: Resource[]
  usedResourceIds: Set<number>
  resourceSelection: ResourceSelectionState
  resourceHandlers: ResourceSelectionHandlers
  value: string
  onValueChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
}

export function EquipmentForm({
  resources,
  usedResourceIds,
  resourceSelection,
  resourceHandlers,
  value,
  onValueChange,
  onSave,
  onCancel,
  loading,
}: EquipmentFormProps) {
  return (
    <div className="flex items-center gap-2">
      <ResourceCombobox
        resources={resources}
        selectedResourceId={resourceSelection.selectedResourceId}
        searchQuery={resourceSelection.searchQuery}
        onSearchChange={resourceHandlers.onSearchChange}
        onSelect={resourceHandlers.onSelect}
        usedResourceIds={usedResourceIds}
        open={resourceSelection.popoverOpen}
        onOpenChange={resourceHandlers.onPopoverChange}
        disabled={loading}
      />
      <UtilizationInput
        value={value}
        onChange={onValueChange}
        unit={resourceSelection.selectedResource?.unit_of_measurement}
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
  )
}

