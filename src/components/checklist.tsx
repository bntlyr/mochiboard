"use client"

import { useState } from "react"
import { ChecklistItem } from "./checklist-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import type { ChecklistItem as ChecklistItemType } from "@/types"

export interface ChecklistProps {
  items: ChecklistItemType[]
  onUpdate: (items: ChecklistItemType[]) => void
}

export function Checklist({ items, onUpdate }: ChecklistProps) {
  const [newItemText, setNewItemText] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: `checklist-item-${Date.now()}`,
        text: newItemText,
        checked: false,
      }
      onUpdate([...items, newItem])
      setNewItemText("")
      setIsAddingItem(false)
    }
  }

  const handleUpdateItem = (id: string, text: string, checked: boolean) => {
    const updatedItems = items.map((item) => (item.id === id ? { ...item, text, checked } : item))
    onUpdate(updatedItems)
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    onUpdate(updatedItems)
  }

  const completedCount = items.filter((item) => item.checked).length
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs text-slate-500">
            {completedCount}/{items.length}
          </div>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            id={item.id}
            text={item.text}
            checked={item.checked}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {isAddingItem ? (
        <div className="flex items-center gap-2 mt-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add an item"
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddItem()
              } else if (e.key === "Escape") {
                setIsAddingItem(false)
                setNewItemText("")
              }
            }}
          />
          <Button size="sm" onClick={handleAddItem}>
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAddingItem(false)
              setNewItemText("")
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-slate-500 hover:text-slate-700"
          onClick={() => setIsAddingItem(true)}
        >
          <Plus size={14} className="mr-1" />
          Add item
        </Button>
      )}
    </div>
  )
}

