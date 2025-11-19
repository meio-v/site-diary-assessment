'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ItemActions } from '@/components/shared/item-actions'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { EquipmentForm } from '@/components/forms/equipment-form'
import { CreateResourceDialog } from '@/components/dialogs/create-resource-dialog'
import { useCrudList } from '@/hooks/use-crud-list'
import { useDeleteDialog } from '@/hooks/use-delete-dialog'
import { useResources } from '@/hooks/use-resources'
import type { ResourceUtilizationWithResource, Resource } from '@/types/diary'

interface EquipmentListProps {
  diaryId: number
  initialEquipment: ResourceUtilizationWithResource[]
}

export function EquipmentList({ diaryId, initialEquipment }: EquipmentListProps) {
  const {
    items: equipment,
    setItems: setEquipment,
    editingId,
    isAdding,
    loading,
    setLoading,
    handleAddClick,
    handleEditClick,
    handleCancel,
    removeItem,
  } = useCrudList<ResourceUtilizationWithResource>(initialEquipment)

  const { resources, addResource } = useResources()
  const { isOpen: deleteDialogOpen, itemToDelete, openDialog: handleDeleteClick, closeDialog, setIsOpen: setDeleteDialogOpen } = useDeleteDialog<number>()
  
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] = useState(false)
  
  // Form state for editing/adding
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null)
  const [resourcePopoverOpen, setResourcePopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [value, setValue] = useState('')
  const [pendingResourceName, setPendingResourceName] = useState('')

  const usedResourceIds = useMemo(() => {
    return new Set(
      equipment
        .filter(item => item.id !== editingId) 
        .map(item => item.resource_id)
    )
  }, [equipment, editingId])

  const selectedResource = resources.find((r) => r.id === selectedResourceId)

  const handleAddClickWithReset = () => {
    handleAddClick()
    setSelectedResourceId(null)
    setValue('')
    setSearchQuery('')
    setResourcePopoverOpen(true)
  }

  const handleEditClickWithData = (item: ResourceUtilizationWithResource) => {
    handleEditClick(item)
    setSelectedResourceId(item.resource_id)
    setValue(item.value.toString())
    setSearchQuery(item.resource.name)
    setResourcePopoverOpen(false)
  }

  const handleCancelWithReset = () => {
    handleCancel()
    setSelectedResourceId(null)
    setValue('')
    setSearchQuery('')
  }

  const handleResourceSelect = (resourceId: number | 'create') => {
    if (resourceId === 'create') {
      setPendingResourceName(searchQuery.trim())
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

  const handleCreateResource = async (resourceData: {
    name: string
    unit_of_measurement: string
    serial_number: string | null
  }): Promise<Resource> => {
    setLoading(true)
    try {
      const { data: newResource, error } = await supabaseClient
        .from('resources')
        .insert({
          name: resourceData.name,
          unit_of_measurement: resourceData.unit_of_measurement,
          serial_number: resourceData.serial_number,
        })
        .select()
        .single()

      if (error) throw error

      addResource(newResource)
      setSelectedResourceId(newResource.id)
      setSearchQuery(newResource.name)
      toast.success('Resource created successfully')
      return newResource
    } catch (error) {
      console.error('Error creating resource:', error)
      toast.error('Failed to create resource. Please try again.')
      throw error
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
        handleCancel()
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
        handleCancel()
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

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setLoading(true)
    try {
      const { error } = await supabaseClient
        .from('resource_utilization')
        .delete()
        .eq('id', itemToDelete)

      if (error) throw error

      removeItem(itemToDelete)
      toast.success('Resource deleted successfully')
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource entry. Please try again.')
    } finally {
      setLoading(false)
      closeDialog()
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
                  <EquipmentForm
                    resources={resources}
                    usedResourceIds={usedResourceIds}
                    resourceSelection={{
                      selectedResourceId,
                      searchQuery,
                      popoverOpen: resourcePopoverOpen,
                      selectedResource,
                    }}
                    resourceHandlers={{
                      onSearchChange: setSearchQuery,
                      onSelect: handleResourceSelect,
                      onPopoverChange: setResourcePopoverOpen,
                    }}
                    value={value}
                    onValueChange={setValue}
                    onSave={handleSave}
                    onCancel={handleCancelWithReset}
                    loading={loading}
                  />
                </div>
              ) : (
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
                    onEdit={() => handleEditClickWithData(item)}
                    onDelete={() => handleDeleteClick(item.id)}
                    loading={loading}
                  />
                </>
              )}
            </li>
          ))}

          {isAdding && (
            <li className="p-2 rounded-md">
              <EquipmentForm
                resources={resources}
                usedResourceIds={usedResourceIds}
                resourceSelection={{
                  selectedResourceId,
                  searchQuery,
                  popoverOpen: resourcePopoverOpen,
                  selectedResource,
                }}
                resourceHandlers={{
                  onSearchChange: setSearchQuery,
                  onSelect: handleResourceSelect,
                  onPopoverChange: setResourcePopoverOpen,
                }}
                value={value}
                onValueChange={setValue}
                onSave={handleSave}
                onCancel={handleCancel}
                loading={loading}
              />
            </li>
          )}

          {!isAdding && (
            <li>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddClickWithReset}
                disabled={loading}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </li>
          )}
        </ul>
      </div>

      <CreateResourceDialog
        open={isCreateResourceDialogOpen}
        onOpenChange={setIsCreateResourceDialogOpen}
        onSave={handleCreateResource}
        initialName={pendingResourceName}
        loading={loading}
      />

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
