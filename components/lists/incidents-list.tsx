'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Check, X } from 'lucide-react'
import { ItemActions } from '@/components/shared/item-actions'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
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
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [incidentToDelete, setIncidentToDelete] = useState<number | null>(null)

  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    description: '',
  })

  const handleAddClick = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
    })
  }

  const handleEditClick = (incident: Incident) => {
    setEditingId(incident.id)
    setIsAdding(false)
    setFormData({
      title: incident.title,
      description: incident.description,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
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

        setIncidents(incidents.map(i => i.id === editingId ? data : i))
        setEditingId(null)
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

        setIncidents([...incidents, data])
        setIsAdding(false)
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

  const handleDeleteClick = (incidentId: number) => {
    setIncidentToDelete(incidentId)
    setDeleteDialogOpen(true)
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

      setIncidents(incidents.filter(i => i.id !== incidentToDelete))
      toast.success('Incident deleted successfully')
    } catch (error) {
      console.error('Error deleting incident:', error)
      toast.error('Failed to delete incident. Please try again.')
    } finally {
      setLoading(false)
      setIncidentToDelete(null)
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
                // Edit mode
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Incident title *"
                      className="flex-1"
                      required
                      disabled={loading}
                    />
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
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description *"
                    rows={3}
                    required
                    disabled={loading}
                  />
                </div>
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
                    onEdit={() => handleEditClick(incident)}
                    onDelete={() => handleDeleteClick(incident.id)}
                    loading={loading}
                  />
                </>
              )}
            </li>
          ))}

          {isAdding && (
            <li className="p-2 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Incident title *"
                  className="flex-1"
                  required
                  disabled={loading}
                />
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
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description *"
                rows={3}
                required
                disabled={loading}
              />
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

