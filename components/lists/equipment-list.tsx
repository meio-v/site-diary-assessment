'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import { Plus, Check, X, ChevronsUpDown, Check as CheckIcon } from 'lucide-react'
import { ItemActions } from '@/components/shared/item-actions'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { cn } from '@/lib/utils'
import type { ResourceUtilizationWithResource, Resource } from '@/types/diary'

interface EquipmentListProps {
  diaryId: number
  initialEquipment: ResourceUtilizationWithResource[]
}

export function EquipmentList({ diaryId, initialEquipment }: EquipmentListProps) {
  const [equipment, setEquipment] = useState<ResourceUtilizationWithResource[]>(initialEquipment)
  const [resources, setResources] = useState<Resource[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  
  // Form state for editing/adding
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null)
  const [resourcePopoverOpen, setResourcePopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [value, setValue] = useState('')
  
  const [newResourceName, setNewResourceName] = useState('')
  const [newResourceUnits, setNewResourceUnits] = useState('')
  const [newResourceSerial, setNewResourceSerial] = useState('')

  useEffect(() => {
    supabaseClient
      .from('resources')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) {
          setResources(data)
        }
      })
  }, [])

  const usedResourceIds = useMemo(() => {
    return new Set(
      equipment
        .filter(item => item.id !== editingId) 
        .map(item => item.resource_id)
    )
  }, [equipment, editingId])

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources
    const query = searchQuery.toLowerCase()
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.unit_of_measurement.toLowerCase().includes(query) ||
        (r.serial_number && r.serial_number.toLowerCase().includes(query))
    )
  }, [resources, searchQuery])

  const hasExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return false
    const query = searchQuery.toLowerCase().trim()
    return resources.some((r) => r.name.toLowerCase() === query)
  }, [resources, searchQuery])

  const selectedResource = resources.find((r) => r.id === selectedResourceId)

  const handleAddClick = () => {
    setEditingId(null)
    setIsAdding(true)
    setSelectedResourceId(null)
    setValue('')
    setSearchQuery('')
    setResourcePopoverOpen(true)
  }

  const handleEditClick = (item: ResourceUtilizationWithResource) => {
    setIsAdding(false)
    setEditingId(item.id)
    setSelectedResourceId(item.resource_id)
    setValue(item.value.toString())
    setSearchQuery(item.resource.name)
    setResourcePopoverOpen(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setSelectedResourceId(null)
    setValue('')
    setSearchQuery('')
  }

  const handleResourceSelect = (resourceId: number | 'create') => {
    if (resourceId === 'create') {
      setNewResourceName(searchQuery.trim())
      setNewResourceUnits('')
      setNewResourceSerial('')
      setIsCreateResourceDialogOpen(true)
      setResourcePopoverOpen(false)
    } else {
      setSelectedResourceId(resourceId)
      setResourcePopoverOpen(false)
      const resource = resources.find((r) => r.id === resourceId)
      if (resource) {
        setSearchQuery(resource.name)
      }
    }
  }

  const handleCreateResource = async () => {
    if (!newResourceName.trim() || !newResourceUnits.trim()) return

    setLoading(true)
    try {
      const { data: newResource, error } = await supabaseClient
        .from('resources')
        .insert({
          name: newResourceName.trim(),
          unit_of_measurement: newResourceUnits.trim(),
          serial_number: newResourceSerial.trim() || null,
        })
        .select()
        .single()

      if (error) throw error

      setResources([...resources, newResource])
      setSelectedResourceId(newResource.id)
      setSearchQuery(newResource.name)
      setIsCreateResourceDialogOpen(false)
      setNewResourceName('')
      setNewResourceUnits('')
      setNewResourceSerial('')
      toast.success('Resource created successfully')
    } catch (error) {
      console.error('Error creating resource:', error)
      toast.error('Failed to create resource. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedResourceId || !value) return

    setLoading(true)
    try {
      if (editingId) {
        const { data: updated, error } = await supabaseClient
          .from('resource_utilization')
          .update({
            resource_id: selectedResourceId,
            value: Number(value),
          })
          .eq('id', editingId)
          .select(`
            *,
            resource:resources(*)
          `)
          .single()

        if (error) throw error

        setEquipment(equipment.map(e => e.id === editingId ? updated : e))
        setEditingId(null)
        toast.success('Resource updated successfully')
      } else if (isAdding) {
        // Create new utilization
        const { data: newUtilization, error } = await supabaseClient
          .from('resource_utilization')
          .insert({
            site_diary_id: diaryId,
            resource_id: selectedResourceId,
            value: Number(value),
          })
          .select(`
            *,
            resource:resources(*)
          `)
          .single()

        if (error) throw error

        setEquipment([...equipment, newUtilization])
        setIsAdding(false)
        toast.success('Resource added successfully')
      }

      setSelectedResourceId(null)
      setValue('')
      setSearchQuery('')
    } catch (error) {
      console.error('Error saving resource:', error)
      toast.error('Failed to save resource entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (equipmentId: number) => {
    setItemToDelete(equipmentId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setLoading(true)
    try {
      const { error } = await supabaseClient
        .from('resource_utilization')
        .delete()
        .eq('id', itemToDelete)

      if (error) throw error

      setEquipment(equipment.filter(e => e.id !== itemToDelete))
      toast.success('Resource deleted successfully')
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource entry. Please try again.')
    } finally {
      setLoading(false)
      setItemToDelete(null)
    }
  }

  return (
    <>
      <div>
        <h3 className="font-semibold mb-3">Resources Used</h3>

        <ul className="space-y-2">
          {equipment.map((item) => (
            <li
              key={item.id}
              className="group flex items-center justify-between p-2 rounded-md hover:bg-accent/50"
            >
              {editingId === item.id ? (
                // Edit mode
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Popover open={resourcePopoverOpen} onOpenChange={setResourcePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={resourcePopoverOpen}
                          className="flex-1 justify-between"
                        >
                          {selectedResource
                            ? `${selectedResource.name} (${selectedResource.unit_of_measurement})`
                            : 'Select resource...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={false} filter={() => 1}>
                          <CommandInput
                            placeholder="Search resources..."
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            {filteredResources.length > 0 && (
                              <CommandGroup>
                                {filteredResources.map((resource) => {
                                  const isUsed = usedResourceIds.has(resource.id)
                                  return (
                                    <CommandItem
                                      key={resource.id}
                                      value={`${resource.name} ${resource.unit_of_measurement} ${resource.serial_number || ''}`}
                                      onSelect={() => !isUsed && handleResourceSelect(resource.id)}
                                      disabled={isUsed}
                                      className={cn(isUsed && 'opacity-50 cursor-not-allowed')}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          selectedResourceId === resource.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {resource.name} ({resource.unit_of_measurement})
                                      {resource.serial_number && (
                                        <span className="text-muted-foreground ml-2">
                                          - SN: {resource.serial_number}
                                        </span>
                                      )}
                                      {isUsed && (
                                        <span className="text-xs text-muted-foreground ml-auto">
                                          (already added)
                                        </span>
                                      )}
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            )}
                            {searchQuery.trim() && !hasExactMatch && (
                              <CommandGroup>
                                <CommandItem
                                  value={`create ${searchQuery}`}
                                  onSelect={() => handleResourceSelect('create')}
                                  className="text-primary"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create &quot;{searchQuery}&quot;
                                </CommandItem>
                              </CommandGroup>
                            )}
                            {filteredResources.length === 0 && (!searchQuery.trim() || hasExactMatch) && (
                              <CommandEmpty>
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  No resources found.
                                </div>
                              </CommandEmpty>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount used (e.g. 8.5)"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-32"
                        disabled={loading}
                      />
                      {selectedResource && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {selectedResource.unit_of_measurement}
                        </span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSave}
                      disabled={loading}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.resource.name}
                      {item.resource.serial_number && (
                        <span className="text-sm text-muted-foreground ml-2">
                          (SN: {item.resource.serial_number})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.value} {item.resource.unit_of_measurement}
                    </div>
                  </div>
                  <ItemActions
                    onEdit={() => handleEditClick(item)}
                    onDelete={() => handleDeleteClick(item.id)}
                    loading={loading}
                  />
                </>
              )}
            </li>
          ))}

          {isAdding && (
            <li className="p-2 rounded-md">
              <div className="flex items-center gap-2">
                <Popover open={resourcePopoverOpen} onOpenChange={setResourcePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={resourcePopoverOpen}
                      className="flex-1 justify-between"
                    >
                      {selectedResource
                        ? `${selectedResource.name} (${selectedResource.unit_of_measurement})`
                        : 'Select resource...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false} filter={() => 1}>
                      <CommandInput
                        placeholder="Search resources..."
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        {filteredResources.length > 0 && (
                          <CommandGroup>
                            {filteredResources.map((resource) => {
                              const isUsed = usedResourceIds.has(resource.id)
                              return (
                                <CommandItem
                                  key={resource.id}
                                  value={`${resource.name} ${resource.unit_of_measurement} ${resource.serial_number || ''}`}
                                  onSelect={() => !isUsed && handleResourceSelect(resource.id)}
                                  disabled={isUsed}
                                  className={cn(isUsed && 'opacity-50 cursor-not-allowed')}
                                >
                                  <CheckIcon
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedResourceId === resource.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {resource.name} ({resource.unit_of_measurement})
                                  {resource.serial_number && (
                                    <span className="text-muted-foreground ml-2">
                                      - SN: {resource.serial_number}
                                    </span>
                                  )}
                                  {isUsed && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      (already added)
                                    </span>
                                  )}
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        )}
                        {searchQuery.trim() && !hasExactMatch && (
                          <CommandGroup>
                            <CommandItem
                              value={`create ${searchQuery}`}
                              onSelect={() => handleResourceSelect('create')}
                              className="text-primary"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create &quot;{searchQuery}&quot;
                            </CommandItem>
                          </CommandGroup>
                        )}
                        {filteredResources.length === 0 && (!searchQuery.trim() || hasExactMatch) && (
                          <CommandEmpty>
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No resources found.
                            </div>
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount used (e.g. 8.5)"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-32"
                    disabled={loading}
                  />
                  {selectedResource && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {selectedResource.unit_of_measurement}
                    </span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={loading}
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          )}

          {!isAdding && (
            <li>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddClick}
                disabled={loading}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </li>
          )}
        </ul>
      </div>

      {/* Dialog for creating new resource */}
      <Dialog open={isCreateResourceDialogOpen} onOpenChange={setIsCreateResourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resource</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateResource()
            }}
          >
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new-resource-name">Resource Name *</FieldLabel>
                  <Input
                    id="new-resource-name"
                    required
                    placeholder="e.g. Excavator"
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-resource-units">Units Utilized *</FieldLabel>
                  <Input
                    id="new-resource-units"
                    required
                    placeholder="e.g. hours, days, units"
                    value={newResourceUnits}
                    onChange={(e) => setNewResourceUnits(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-resource-serial">Serial Number (optional)</FieldLabel>
                  <Input
                    id="new-resource-serial"
                    placeholder="Serial number"
                    value={newResourceSerial}
                    onChange={(e) => setNewResourceSerial(e.target.value)}
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
                onClick={() => setIsCreateResourceDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Resource Entry"
        description="Are you sure you want to delete this resource entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={loading}
      />
    </>
  )
}
