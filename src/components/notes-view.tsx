"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Note } from "../types"
import { StickyNote } from "@/components/icons"

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

  // Add a useEffect to sync the notes state with the boardNotes prop
  // Add this after the state declarations
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
  }

  const colorOptions = [
    { value: "bg-slate-100", label: "Gray" },
    { value: "bg-blue-100", label: "Blue" },
    { value: "bg-emerald-100", label: "Green" },
    { value: "bg-amber-100", label: "Amber" },
    { value: "bg-orange-100", label: "Orange" },
    { value: "bg-rose-100", label: "Rose" },
  ]

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

        <Dialog open={isAddingNote} onOpenChange={(open) => setIsAddingNote(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="noteTitle" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="noteTitle"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="noteContent" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="noteContent"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="noteColor" className="text-sm font-medium">
                  Color
                </label>
                <Select value={newNoteColor} onValueChange={setNewNoteColor}>
                  <SelectTrigger id="noteColor">
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button onClick={addNote}>Add Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
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
          <Card key={note.id} className={`${note.color} border-0 shadow-sm hover:shadow transition-shadow`}>
            <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
              <h3 className="font-bold">{note.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingNote(note)}>
                    <Edit size={16} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteNote(note.id)}>
                    <X size={16} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="whitespace-pre-wrap">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddingNote} onOpenChange={(open) => setIsAddingNote(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="noteTitle" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="noteTitle"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="noteContent" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="noteContent"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="noteColor" className="text-sm font-medium">
                Color
              </label>
              <Select value={newNoteColor} onValueChange={setNewNoteColor}>
                <SelectTrigger id="noteColor">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNote(false)}>
              Cancel
            </Button>
            <Button onClick={addNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
  )
}

