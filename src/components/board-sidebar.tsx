"use client"

import { useState } from "react"
import { Plus, LayoutGrid, Edit, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { KanbanBoard } from "@/types"

interface BoardSidebarProps {
  boards: KanbanBoard[]
  activeBoard: KanbanBoard | null
  onBoardSelect: (boardId: string) => void
  onBoardCreate: (title: string) => void
  onBoardEdit: (boardId: string, title: string) => void
  onBoardDelete: (boardId: string) => void
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
  isMobile = false,
  onMobileClose,
}: BoardSidebarProps) {
  const [isAddingBoard, setIsAddingBoard] = useState(false)
  const [isEditingBoard, setIsEditingBoard] = useState<KanbanBoard | null>(null)
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [isInlineEditing, setIsInlineEditing] = useState<string | null>(null)
  const [inlineEditTitle, setInlineEditTitle] = useState("")

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
              className={`group flex items-center justify-between rounded-md p-2 cursor-pointer ${
                activeBoard?.id === board.id ? "bg-slate-100 text-slate-700" : "hover:bg-slate-100"
              }`}
            >
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

      {/* <Dialog open={isAddingBoard} onOpenChange={setIsAddingBoard}>
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
      </Dialog> */}
    </div>
  )
}

