'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Plus, ChevronsUpDown, Check as CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Resource } from '@/types/diary'

interface ResourceComboboxProps {
  resources: Resource[]
  selectedResourceId: number | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelect: (resourceId: number | 'create') => void
  usedResourceIds: Set<number>
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

export function ResourceCombobox({
  resources,
  selectedResourceId,
  searchQuery,
  onSearchChange,
  onSelect,
  usedResourceIds,
  open,
  onOpenChange,
  disabled = false,
}: ResourceComboboxProps) {
  const selectedResource = resources.find((r) => r.id === selectedResourceId)
  
  const filteredResources = resources.filter((r) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      r.name.toLowerCase().includes(query) ||
      r.unit_of_measurement.toLowerCase().includes(query) ||
      (r.serial_number && r.serial_number.toLowerCase().includes(query))
    )
  })

  const hasExactMatch = searchQuery.trim()
    ? resources.some((r) => r.name.toLowerCase() === searchQuery.toLowerCase().trim())
    : false

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between"
          disabled={disabled}
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
            onValueChange={onSearchChange}
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
                      onSelect={() => !isUsed && onSelect(resource.id)}
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
                  onSelect={() => onSelect('create')}
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
  )
}

