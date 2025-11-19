import { useState } from 'react'

/**
 * Hook for managing delete confirmation dialog state
 * @returns Object with dialog state and handlers
 */
export function useDeleteDialog<T = number>() {
  const [isOpen, setIsOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  const openDialog = (item: T) => {
    setItemToDelete(item)
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setItemToDelete(null)
  }

  const handleConfirm = async (onDelete: (item: T) => Promise<void>) => {
    if (!itemToDelete) return
    await onDelete(itemToDelete)
    closeDialog()
  }

  return {
    isOpen,
    itemToDelete,
    openDialog,
    closeDialog,
    handleConfirm,
    setIsOpen,
  }
}

