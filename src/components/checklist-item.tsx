"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ChecklistItemProps {
  id: string
  text: string
  checked: boolean
  onUpdate: (id: string, text: string, checked: boolean) => void
  onDelete: (id: string) => void
}

export function ChecklistItem({ id, text, checked, onUpdate, onDelete }: ChecklistItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(id, editText, checked)
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 group">
      <Checkbox
        id={`checklist-item-${id}`}
        checked={checked}
        onCheckedChange={(value) => onUpdate(id, text, value === true)}
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="h-7 text-sm flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave()
              } else if (e.key === "Escape") {
                setIsEditing(false)
                setEditText(text)
              }
            }}
            onBlur={handleSave}
          />
        </div>
      ) : (
        <label
          htmlFor={`checklist-item-${id}`}
          className={`flex-1 text-sm ${checked ? "line-through text-slate-500" : ""}`}
          onDoubleClick={() => setIsEditing(true)}
        >
          {text}
        </label>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(id)}
      >
        <X size={14} />
      </Button>
    </div>
  )
}

