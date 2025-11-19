'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ItemActions } from '@/components/shared/item-actions'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { IncidentForm } from '@/components/forms/incident-form'
import { useCrudList } from '@/hooks/use-crud-list'
import { useDeleteDialog } from '@/hooks/use-delete-dialog'
import { useIncidents } from '@/hooks/use-incidents'
import type { Incident } from '@/types/diary'

interface IncidentsListProps {
  diaryId: number
  initialIncidents: Incident[]
}

interface IncidentFormData {
  title: string
  description: string
}

export function IncidentsList({ diaryId, initialIncidents }: IncidentsListProps) {
  const {
    incidents,
    addIncident,
    updateIncident,
    removeIncident,
  } = useIncidents(diaryId, initialIncidents)

  const {
    editingId,
    isAdding,
    loading,
    setLoading,
    handleAddClick,
    handleEditClick,
    handleCancel,
  } = useCrudList<Incident>(incidents)

  const { isOpen: deleteDialogOpen, itemToDelete: incidentToDelete, openDialog: handleDeleteClick, closeDialog, setIsOpen: setDeleteDialogOpen } = useDeleteDialog<number>()

  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    description: '',
  })

  const handleAddClickWithReset = () => {
    handleAddClick()
    setFormData({
      title: '',
      description: '',
    })
  }

  const handleEditClickWithData = (incident: Incident) => {
    handleEditClick(incident)
    setFormData({
      title: incident.title,
      description: incident.description,
    })
  }

  const handleCancelWithReset = () => {
    handleCancel()
    setFormData({
      title: '',
      description: '',
    })
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        const { data, error } = await supabaseClient
          .from('incidents')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
          .select()
          .single()

        if (error) throw error

        updateIncident(editingId, data)
        handleCancel()
        toast.success('Incident updated successfully')
      } else if (isAdding) {
        const { data, error } = await supabaseClient
          .from('incidents')
          .insert({
            site_diary_id: diaryId,
            title: formData.title.trim(),
            description: formData.description.trim(),
          })
          .select()
          .single()

        if (error) throw error

        addIncident(data)
        handleCancel()
        toast.success('Incident added successfully')
      }

      setFormData({
        title: '',
        description: '',
      })
    } catch (error) {
      console.error('Error saving incident:', error)
      toast.error('Failed to save incident. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!incidentToDelete) return

    setLoading(true)
    try {
      const { error } = await supabaseClient
        .from('incidents')
        .delete()
        .eq('id', incidentToDelete)

      if (error) throw error

      removeIncident(incidentToDelete)
      toast.success('Incident deleted successfully')
    } catch (error) {
      console.error('Error deleting incident:', error)
      toast.error('Failed to delete incident. Please try again.')
    } finally {
      setLoading(false)
      closeDialog()
    }
  }

  return (
    <>
      <div>
        <h3 className="font-semibold mb-3">Incidents</h3>

        <ul className="space-y-2">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="group flex items-start justify-between p-2 rounded-md hover:bg-accent/50"
            >
              {editingId === incident.id ? (
                <IncidentForm
                  title={formData.title}
                  description={formData.description}
                  onTitleChange={(title) => setFormData({ ...formData, title })}
                  onDescriptionChange={(description) => setFormData({ ...formData, description })}
                  onSave={handleSave}
                  onCancel={handleCancelWithReset}
                  loading={loading}
                />
              ) : (
                // View mode
                <>
                  <div className="flex-1">
                    <div className="font-medium">{incident.title}</div>
                    <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {incident.description}
                    </div>
                  </div>
                  <ItemActions
                    onEdit={() => handleEditClickWithData(incident)}
                    onDelete={() => handleDeleteClick(incident.id)}
                    loading={loading}
                  />
                </>
              )}
            </li>
          ))}

          {isAdding && (
            <li className="p-2 rounded-md">
              <IncidentForm
                title={formData.title}
                description={formData.description}
                onTitleChange={(title) => setFormData({ ...formData, title })}
                onDescriptionChange={(description) => setFormData({ ...formData, description })}
                onSave={handleSave}
                onCancel={handleCancelWithReset}
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Incident"
        description="Are you sure you want to delete this incident? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={loading}
      />
    </>
  )
}

