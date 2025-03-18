"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
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
    <div className="group flex min-w-0 py-1 items-center">
      {" "}
      {/* Ensure vertical alignment */}
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
          <div className="bg-white/80 rounded border border-slate-200 mb-1 flex items-center p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => document.execCommand("bold")}
              title="Bold (Ctrl+B)"
            >
              <span className="font-bold text-xs">B</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => document.execCommand("italic")}
              title="Italic (Ctrl+I)"
            >
              <span className="italic text-xs">I</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => document.execCommand("underline")}
              title="Underline (Ctrl+U)"
            >
              <span className="underline text-xs">U</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => document.execCommand("strikeThrough")}
              title="Strikethrough (Ctrl+Shift+S)"
            >
              <span className="line-through text-xs">S</span>
            </Button>
          </div>
          <div
            contentEditable
            className="h-7 text-sm w-full border border-input bg-background px-3 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
            onInput={(e) => setEditText(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: editText }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSave()
              } else if (e.key === "Escape") {
                setIsEditing(false)
                setEditText(text)
              } else if (e.ctrlKey) {
                switch (e.key) {
                  case "b":
                    e.preventDefault()
                    document.execCommand("bold")
                    break
                  case "i":
                    e.preventDefault()
                    document.execCommand("italic")
                    break
                  case "u":
                    e.preventDefault()
                    document.execCommand("underline")
                    break
                  case "S":
                    if (e.shiftKey) {
                      e.preventDefault()
                      document.execCommand("strikeThrough")
                    }
                    break
                }
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
          <div className="break-words overflow-wrap-anywhere pr-6" dangerouslySetInnerHTML={{ __html: text }} />
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

