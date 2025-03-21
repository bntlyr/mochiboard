"use client"

import { useState } from "react"
import { Plus, LayoutGrid, Edit, Trash2, ChevronRight, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { KanbanBoard } from "@/types"

// Helper function to format date
function formatDate(timestamp: number, includeTime = false): string {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }
    : {
        month: "short",
        day: "numeric",
      }

  return new Date(timestamp).toLocaleString("en-US", options)
}

interface BoardSidebarProps {
  boards: KanbanBoard[]
  activeBoard: KanbanBoard | null
  onBoardSelect: (boardId: string) => void
  onBoardCreate: (title: string) => void
  onBoardEdit: (boardId: string, title: string) => void
  onBoardDelete: (boardId: string) => void
  onBoardDeadlineEdit?: (boardId: string, deadline?: number) => void
  isMobile?: boolean
  onMobileClose?: () => void
}

export function BoardSidebar({
  boards,
  activeBoard,
  onBoardSelect,
  onBoardCreate,
  onBoardEdit,
  onBoardDelete,
  onBoardDeadlineEdit,
  isMobile = false,
  onMobileClose,
}: BoardSidebarProps) {
  const [isAddingBoard, setIsAddingBoard] = useState(false)
  const [isEditingBoard, setIsEditingBoard] = useState<KanbanBoard | null>(null)
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [isInlineEditing, setIsInlineEditing] = useState<string | null>(null)
  const [inlineEditTitle, setInlineEditTitle] = useState("")
  const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("12:00")

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return
    onBoardCreate(newBoardTitle)
    setNewBoardTitle("")
    setIsAddingBoard(false)
  }

  const handleEditBoard = () => {
    if (!isEditingBoard || !newBoardTitle.trim()) return
    onBoardEdit(isEditingBoard.id, newBoardTitle)
    setNewBoardTitle("")
    setIsEditingBoard(null)
  }

  const handleOpenDeadlinePicker = (boardId: string) => {
    const board = boards.find((b) => b.id === boardId)
    if (board) {
      setSelectedBoardId(boardId)

      if (board.deadline) {
        const date = new Date(board.deadline)
        setSelectedDate(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0])
        setSelectedTime(
          `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
        )
      } else {
        setSelectedDate("")
        setSelectedTime("12:00")
      }

      setIsDeadlinePickerOpen(true)
    }
  }

  const handleSaveDeadline = () => {
    if (!selectedBoardId || !onBoardDeadlineEdit) return

    if (selectedDate) {
      const date = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(":").map(Number)
      date.setHours(hours, minutes)
      onBoardDeadlineEdit(selectedBoardId, date.getTime())
    } else {
      onBoardDeadlineEdit(selectedBoardId, undefined)
    }

    setIsDeadlinePickerOpen(false)
  }

  return (
    <div className={`bg-white border-r border-slate-200 flex flex-col ${isMobile ? "w-full" : "w-64"}`}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-medium text-slate-800">Boards</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsAddingBoard(true)} className="h-8 w-8">
          <Plus size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`group flex flex-col rounded-md p-2 cursor-pointer ${
                activeBoard?.id === board.id ? "bg-slate-100 text-slate-700" : "hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center flex-1 w-24 overflow-hidden"
                  onClick={() => {
                    if (!isInlineEditing) {
                      onBoardSelect(board.id)
                      if (isMobile && onMobileClose) onMobileClose()
                    }
                  }}
                >
                  <LayoutGrid size={16} className="mr-2 flex-shrink-0" />
                  {isInlineEditing === board.id ? (
                    <form
                      className="flex-1 min-w-0"
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (inlineEditTitle.trim()) {
                          onBoardEdit(board.id, inlineEditTitle)
                          setIsInlineEditing(null)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={inlineEditTitle}
                        onChange={(e) => setInlineEditTitle(e.target.value)}
                        className="h-7 text-sm font-bold"
                        autoFocus
                        onBlur={() => {
                          if (inlineEditTitle.trim()) {
                            onBoardEdit(board.id, inlineEditTitle)
                          }
                          setIsInlineEditing(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsInlineEditing(null)
                          }
                        }}
                      />
                    </form>
                  ) : (
                    <>
                      <span
                        className="truncate font-bold max-w-[65%] cursor-pointer hover:text-slate-600"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          setIsInlineEditing(board.id)
                          setInlineEditTitle(board.title)
                        }}
                      >
                        {board.title}
                      </span>
                      {board.notes.length > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-slate-200 text-slate-700 rounded-full px-1.5 py-0.5 text-xs">
                          {board.notes.length}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditingBoard(board)
                      setNewBoardTitle(board.title)
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBoardDelete(board.id)
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Deadline section */}
              {onBoardDeadlineEdit && (
                <div
                  className="mt-1 ml-6 text-xs flex items-center text-slate-500 hover:text-slate-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenDeadlinePicker(board.id)
                  }}
                >
                  <CalendarClock size={12} className="mr-1" />
                  {board.deadline ? `Due: ${formatDate(board.deadline, true)}` : "Set deadline"}
                </div>
              )}
            </div>
          ))}

          {boards.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm">No boards yet. Create your first board!</div>
          )}
        </div>
      </ScrollArea>

      {isMobile && (
        <div className="p-3 border-t border-slate-200">
          <Button variant="outline" className="w-full" onClick={onMobileClose}>
            <ChevronRight size={16} className="mr-2" />
            Close Menu
          </Button>
        </div>
      )}

      {/* Add Board Dialog */}
      <Dialog open={isAddingBoard} onOpenChange={setIsAddingBoard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="boardTitle" className="text-sm font-medium">
                Board Title
              </label>
              <Input
                id="boardTitle"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="My Awesome Board"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingBoard(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard}>Create Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Board Dialog */}
      <Dialog open={!!isEditingBoard} onOpenChange={(open) => !open && setIsEditingBoard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editBoardTitle" className="text-sm font-medium">
                Board Title
              </label>
              <Input id="editBoardTitle" value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingBoard(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditBoard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deadline Picker Dialog */}
      {onBoardDeadlineEdit && (
        <Dialog open={isDeadlinePickerOpen} onOpenChange={setIsDeadlinePickerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Board Deadline</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mx-auto">
                <input
                  type="date"
                  className="w-full p-2 border rounded mb-4"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              {selectedDate && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <CalendarClock size={16} className="mr-2 text-slate-500" />
                    <label htmlFor="boardDeadlineTime" className="text-sm font-medium">
                      Set Time
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="boardDeadlineTime"
                      type="time"
                      className="flex-1 p-2 border rounded"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="mt-4">
                {selectedDate && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedDate("")} className="w-fit">
                    Clear Deadline
                  </Button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeadlinePickerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDeadline}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

