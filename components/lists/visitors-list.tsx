'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { supabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus, Building2, Mail, Phone, FileText } from 'lucide-react'
import { ItemActions } from '@/components/shared/item-actions'
import { VisitorForm } from '@/components/forms/visitor-form'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useCrudList } from '@/hooks/use-crud-list'
import { useDeleteDialog } from '@/hooks/use-delete-dialog'
import { useExpandable } from '@/hooks/use-expandable'
import { useVisitors } from '@/hooks/use-visitors'
import type { Visitor } from '@/types/diary'

interface VisitorsListProps {
  diaryId: number
  initialVisitors: Visitor[]
}

interface VisitorFormData {
  name: string
  company_name: string
  purpose_of_visit: string
  email: string
  contact_details: string
}

export function VisitorsList({ diaryId, initialVisitors }: VisitorsListProps) {
  const {
    visitors,
    addVisitor,
    updateVisitor,
    removeVisitor,
  } = useVisitors(diaryId, initialVisitors)

  const {
    editingId,
    isAdding,
    loading,
    setLoading,
    handleAddClick,
    handleEditClick,
    handleCancel,
  } = useCrudList<Visitor>(visitors)

  const { expandedIds, toggleExpand, collapse } = useExpandable()
  const { isOpen: deleteDialogOpen, itemToDelete: visitorToDelete, openDialog: handleDeleteClick, closeDialog, setIsOpen: setDeleteDialogOpen } = useDeleteDialog<number>()
  
  // Form state for editing/adding
  const [formData, setFormData] = useState<VisitorFormData>({
    name: '',
    company_name: '',
    purpose_of_visit: '',
    email: '',
    contact_details: '',
  })

  const handleAddClickWithReset = () => {
    handleAddClick()
    setFormData({
      name: '',
      company_name: '',
      purpose_of_visit: '',
      email: '',
      contact_details: '',
    })
  }

  const handleEditClickWithData = (visitor: Visitor) => {
    handleEditClick(visitor)
    setFormData({
      name: visitor.name,
      company_name: visitor.company_name || '',
      purpose_of_visit: visitor.purpose_of_visit || '',
      email: visitor.email || '',
      contact_details: visitor.contact_details || '',
    })
  }

  const handleCancelWithReset = () => {
    handleCancel()
    setFormData({
      name: '',
      company_name: '',
      purpose_of_visit: '',
      email: '',
      contact_details: '',
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Visitor name is required')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        // Update existing visitor
        const { data, error } = await supabaseClient
          .from('visitors')
          .update({
            name: formData.name.trim(),
            company_name: formData.company_name.trim() || null,
            purpose_of_visit: formData.purpose_of_visit.trim() || null,
            email: formData.email.trim() || null,
            contact_details: formData.contact_details.trim() || null,
          })
          .eq('id', editingId)
          .select()
          .single()

        if (error) throw error

        updateVisitor(editingId, data)
        handleCancel()
        toast.success('Visitor updated successfully')
      } else if (isAdding) {
        // Create new visitor
        const { data, error } = await supabaseClient
          .from('visitors')
          .insert({
            site_diary_id: diaryId,
            name: formData.name.trim(),
            company_name: formData.company_name.trim() || null,
            purpose_of_visit: formData.purpose_of_visit.trim() || null,
            email: formData.email.trim() || null,
            contact_details: formData.contact_details.trim() || null,
          })
          .select()
          .single()

        if (error) throw error

        addVisitor(data)
        handleCancel()
        toast.success('Visitor added successfully')
      }

      setFormData({
        name: '',
        company_name: '',
        purpose_of_visit: '',
        email: '',
        contact_details: '',
      })
    } catch (error) {
      console.error('Error saving visitor:', error)
      const supabaseError = error as { code?: string; message?: string }
      if (supabaseError?.code === '23505') {
        toast.error('A visitor with this name already exists for this diary entry.')
      } else {
        toast.error('Failed to save visitor. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!visitorToDelete) return

    setLoading(true)
    try {
      const { error } = await supabaseClient
        .from('visitors')
        .delete()
        .eq('id', visitorToDelete)

      if (error) throw error

      removeVisitor(visitorToDelete)
      collapse(visitorToDelete)
      toast.success('Visitor deleted successfully')
    } catch (error) {
      console.error('Error deleting visitor:', error)
      toast.error('Failed to delete visitor. Please try again.')
    } finally {
      setLoading(false)
      closeDialog()
    }
  }

  const hasDetails = (visitor: Visitor) => {
    return !!(visitor.company_name || visitor.email || visitor.contact_details || visitor.purpose_of_visit)
  }

  return (
    <>
      <div>
        <h3 className="text-xl font-logo font-bold tracking-tight mb-3">Visitors</h3>

        <ul className="space-y-2">
        {visitors.map((visitor) => (
          <li
            key={visitor.id}
            className="group flex items-center justify-between p-2 hover:bg-muted"
          >
            {editingId === visitor.id ? (
              // Edit mode
              <VisitorForm
                data={formData}
                onChange={setFormData}
                onSave={handleSave}
                onCancel={handleCancelWithReset}
                loading={loading}
                showActions={true}
              />
            ) : (
              // View mode
              <>
                <div className="flex-1">
                  {hasDetails(visitor) ? (
                    <button
                      onClick={() => toggleExpand(visitor.id)}
                      disabled={loading}
                      className="w-full text-left font-medium cursor-pointer hover:opacity-80 transition-opacity motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 -mx-1"
                    >
                      {visitor.name}
                    </button>
                  ) : (
                    <div className="font-medium">{visitor.name}</div>
                  )}
                  {expandedIds.has(visitor.id) && (
                    <div className="mt-2 space-y-1">
                      {visitor.company_name && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{visitor.company_name}</span>
                        </div>
                      )}
                      {visitor.email && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{visitor.email}</span>
                        </div>
                      )}
                      {visitor.contact_details && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{visitor.contact_details}</span>
                        </div>
                      )}
                      {visitor.purpose_of_visit && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{visitor.purpose_of_visit}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <ItemActions
                  onEdit={() => handleEditClickWithData(visitor)}
                  onDelete={() => handleDeleteClick(visitor.id)}
                  loading={loading}
                />
              </>
            )}
          </li>
        ))}

        {isAdding && (
          <li className="p-2 space-y-2">
            <VisitorForm
              data={formData}
              onChange={setFormData}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
              showActions={true}
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
              className="w-full hover:bg-primary hover:text-white group"
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
        title="Delete Visitor"
        description="Are you sure you want to delete this visitor? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={loading}
      />
    </>
  )
}
