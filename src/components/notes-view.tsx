"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, MoreHorizontal, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Note } from "../types"
import { StickyNote } from "@/components/icons"
import { linkifyText } from "@/lib/utils"

interface NotesViewProps {
  boardNotes: Note[]
  onNotesChange: (notes: Note[]) => void
  boardTitle: string
}

export function NotesView({ boardNotes, onNotesChange, boardTitle }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>(boardNotes)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteColor, setNewNoteColor] = useState("bg-slate-100")
  const [isEditingNote, setIsEditingNote] = useState<Note | null>(null)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [editedActiveNoteTitle, setEditedActiveNoteTitle] = useState("")
  const [editedActiveNoteContent, setEditedActiveNoteContent] = useState("")
  const [isEditingActiveNote, setIsEditingActiveNote] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Add a useEffect to sync the notes state with the boardNotes prop
  useEffect(() => {
    setNotes(boardNotes)
  }, [boardNotes])

  // Save notes back to parent component
  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    onNotesChange(updatedNotes)
  }

  const addNote = () => {
    if (!newNoteTitle.trim()) return

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      color: newNoteColor,
    }

    const updatedNotes = [...notes, newNote]
    saveNotes(updatedNotes)

    // Reset form
    setNewNoteTitle("")
    setNewNoteContent("")
    setNewNoteColor("bg-slate-100")
    setIsAddingNote(false)
  }

  const updateNote = () => {
    if (!isEditingNote) return

    const updatedNotes = notes.map((note) => (note.id === isEditingNote.id ? isEditingNote : note))
    saveNotes(updatedNotes)
    setIsEditingNote(null)
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    saveNotes(updatedNotes)

    // Close the sticky note if it's the one being deleted
    if (activeNote && activeNote.id === noteId) {
      setActiveNote(null)
    }
  }

  const handleNoteClick = (note: Note) => {
    setActiveNote(note)
    setEditedActiveNoteTitle(note.title)
    setEditedActiveNoteContent(note.content)
    setIsEditingActiveNote(true) // Always set to editing mode when opening
  }

  const handleSaveActiveNote = () => {
    if (!activeNote) return

    if (editedActiveNoteTitle.trim()) {
      const updatedNote = {
        ...activeNote,
        title: editedActiveNoteTitle,
        content: editedActiveNoteContent,
      }

      const updatedNotes = notes.map((note) => (note.id === activeNote.id ? updatedNote : note))

      saveNotes(updatedNotes)
      setActiveNote(updatedNote)
    }
  }

  const handleChangeNoteColor = (noteId: string, color: string) => {
    const updatedNotes = notes.map((note) => (note.id === noteId ? { ...note, color } : note))

    saveNotes(updatedNotes)

    // Update active note if it's the one being changed
    if (activeNote && activeNote.id === noteId) {
      setActiveNote({ ...activeNote, color })
    }
  }

  const colorOptions = [
    { value: "bg-slate-100", label: "Gray" },
    { value: "bg-blue-100", label: "Blue" },
    { value: "bg-emerald-100", label: "Green" },
    { value: "bg-amber-100", label: "Amber" },
    { value: "bg-orange-100", label: "Orange" },
    { value: "bg-rose-100", label: "Rose" },
  ]

  // Focus on title input when editing starts
  useEffect(() => {
    if (isEditingActiveNote && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditingActiveNote])

  // Update the "No Notes Yet" section
  if (notes.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Notes for {boardTitle}</h2>
          <Button onClick={() => setIsAddingNote(true)} className="bg-slate-500 hover:bg-slate-600 text-white">
            <Plus size={16} className="mr-2" />
            Add Note
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-slate-200 p-6">
          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
            <StickyNote size={24} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Notes Yet</h3>
          <p className="text-gray-500 text-center mb-4">Create your first note for this board!</p>
          <Button onClick={() => setIsAddingNote(true)} className="bg-slate-500 hover:bg-slate-600 text-white">
            <Plus size={16} className="mr-2" />
            Add Note
          </Button>
        </div>

        {/* Dialog for adding a note */}
        {isAddingNote && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsAddingNote(false)}
          >
            <div
              className={`${newNoteColor} rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
              style={{ minHeight: "300px" }}
            >
              <div className="p-4 flex justify-between items-start border-b border-slate-200">
                <Input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="font-bold text-lg bg-transparent border-slate-300"
                  placeholder="Note Title"
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild disabled>
                        <div className="font-medium px-2 py-1 text-xs text-slate-500">Change Color</div>
                      </DropdownMenuItem>
                      {colorOptions.map((color) => (
                        <DropdownMenuItem
                          key={color.value}
                          onClick={() => setNewNoteColor(color.value)}
                          className="flex items-center gap-2"
                        >
                          <div className={`w-4 h-4 rounded-full ${color.value}`} />
                          <span>{color.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingNote(false)} className="h-8 w-8 p-0">
                    <X size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <Textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="min-h-[200px] bg-transparent border-slate-300 resize-none"
                  placeholder="Write your note here..."
                />
              </div>
              <div className="p-4 border-t border-slate-200 flex justify-end">
                <Button onClick={() => setIsAddingNote(false)} variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button onClick={addNote} disabled={!newNoteTitle.trim()}>
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Notes for {boardTitle}</h2>
          <Button onClick={() => setIsAddingNote(true)} className="bg-slate-500 hover:bg-slate-600 text-white">
            <Plus size={16} className="mr-2" />
            Add Note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={`${note.color} border-0 shadow-sm hover:shadow transition-shadow cursor-pointer`}
              onClick={() => handleNoteClick(note)}
            >
              <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                <h3 className="font-bold truncate max-w-[80%]" title={note.title}>
                  {note.title}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="overflow-hidden text-ellipsis line-clamp-4 whitespace-pre-line">
                  {linkifyText(note.content)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sticky Note Modal */}
        {activeNote && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => {
              // Save any changes before closing
              if (isEditingActiveNote) {
                handleSaveActiveNote()
              }
              setActiveNote(null)
            }}
          >
            <div
              className={`${activeNote.color} rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
              style={{ minHeight: "300px" }}
            >
              <div className="p-4 flex justify-between items-start border-b border-slate-200">
                <Input
                  ref={titleInputRef}
                  value={editedActiveNoteTitle}
                  onChange={(e) => setEditedActiveNoteTitle(e.target.value)}
                  className="font-bold text-lg bg-transparent border-slate-300"
                  placeholder="Note Title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      contentTextareaRef.current?.focus()
                    }
                  }}
                />
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteNote(activeNote.id)}>
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild disabled>
                        <div className="font-medium px-2 py-1 text-xs text-slate-500">Change Color</div>
                      </DropdownMenuItem>
                      {colorOptions.map((color) => (
                        <DropdownMenuItem
                          key={color.value}
                          onClick={() => handleChangeNoteColor(activeNote.id, color.value)}
                          className="flex items-center gap-2"
                        >
                          <div className={`w-4 h-4 rounded-full ${color.value}`} />
                          <span>{color.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleSaveActiveNote()
                      setActiveNote(null)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <Textarea
                  ref={contentTextareaRef}
                  value={editedActiveNoteContent}
                  onChange={(e) => setEditedActiveNoteContent(e.target.value)}
                  className="min-h-[200px] bg-transparent border-slate-300 resize-none"
                  placeholder="Write your note here..."
                />
              </div>
              <div className="p-4 border-t border-slate-200 flex justify-end">
                <Button
                  onClick={() => {
                    handleSaveActiveNote()
                    setActiveNote(null)
                  }}
                  className="bg-slate-500 hover:bg-slate-600 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog for adding a note */}
        {isAddingNote && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsAddingNote(false)}
          >
            <div
              className={`${newNoteColor} rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
              style={{ minHeight: "300px" }}
            >
              <div className="p-4 flex justify-between items-start border-b border-slate-200">
                <Input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="font-bold text-lg bg-transparent border-slate-300"
                  placeholder="Note Title"
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild disabled>
                        <div className="font-medium px-2 py-1 text-xs text-slate-500">Change Color</div>
                      </DropdownMenuItem>
                      {colorOptions.map((color) => (
                        <DropdownMenuItem
                          key={color.value}
                          onClick={() => setNewNoteColor(color.value)}
                          className="flex items-center gap-2"
                        >
                          <div className={`w-4 h-4 rounded-full ${color.value}`} />
                          <span>{color.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingNote(false)} className="h-8 w-8 p-0">
                    <X size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <Textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="min-h-[200px] bg-transparent border-slate-300 resize-none"
                  placeholder="Write your note here..."
                />
              </div>
              <div className="p-4 border-t border-slate-200 flex justify-end">
                <Button onClick={() => setIsAddingNote(false)} variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button onClick={addNote} disabled={!newNoteTitle.trim()}>
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog for editing a note (keeping this as a fallback) */}
        <Dialog open={!!isEditingNote} onOpenChange={(open) => !open && setIsEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            {isEditingNote && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="editNoteTitle" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="editNoteTitle"
                    value={isEditingNote.title}
                    onChange={(e) => setIsEditingNote({ ...isEditingNote, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="editNoteContent" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="editNoteContent"
                    value={isEditingNote.content}
                    onChange={(e) => setIsEditingNote({ ...isEditingNote, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="editNoteColor" className="text-sm font-medium">
                    Color
                  </label>
                  <Select
                    value={isEditingNote.color}
                    onValueChange={(value) => setIsEditingNote({ ...isEditingNote, color: value })}
                  >
                    <SelectTrigger id="editNoteColor">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full ${color.value} mr-2`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={updateNote}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

