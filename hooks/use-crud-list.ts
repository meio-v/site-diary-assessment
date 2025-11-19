import { useState } from 'react'

/**
 * Generic hook for managing CRUD list state (editing, adding, loading)
 * This provides common state management patterns for list components
 * 
 * @template T - The type of items in the list
 * @param initialItems - Initial array of items
 * @returns Object with state and basic handlers
 */
export function useCrudList<T extends { id: number }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddClick = () => {
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEditClick = (item: T) => {
    setEditingId(item.id)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
  }

  const updateItem = (id: number, updatedItem: T) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
  }

  const addItem = (newItem: T) => {
    setItems((prev) => [...prev, newItem])
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return {
    items,
    setItems,
    editingId,
    setEditingId,
    isAdding,
    setIsAdding,
    loading,
    setLoading,
    handleAddClick,
    handleEditClick,
    handleCancel,
    updateItem,
    addItem,
    removeItem,
  }
}

