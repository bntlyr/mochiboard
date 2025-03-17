"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { linkifyText } from "@/lib/utils"

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
    <div className="group flex min-w-0 py-1 items-center"> {/* Ensure vertical alignment */}
      <div className="flex-shrink-0 pt-0.5 pr-2">
        <Checkbox
          id={`checklist-item-${id}`}
          checked={checked}
          onCheckedChange={(value) => onUpdate(id, text, value === true)}
          className="h-4 w-4" // Explicit height and width for the checkbox
        />
      </div>

      {isEditing ? (
        <div className="flex-1 min-w-0">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="h-7 text-sm w-full"
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
          className={`flex-1 min-w-0 text-sm ${checked ? "line-through text-slate-500" : ""}`}
          onDoubleClick={() => setIsEditing(true)}
          title={text}
        >
          <div className="break-words overflow-wrap-anywhere pr-6">{linkifyText(text)}</div>
        </label>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 absolute right-2"
        onClick={() => onDelete(id)}
      >
        <X size={14} />
      </Button>
    </div>
  )
}
