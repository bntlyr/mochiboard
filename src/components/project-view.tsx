"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Menu, LayoutGrid, StickyNote, CalendarClock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { KanbanBoard } from "@/components/kanban-board"
import { NotesView } from "@/components/notes-view"
import { BoardSidebar } from "@/components/board-sidebar"
import type { MochiProject, KanbanBoard as KanbanBoardType, Note } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { NotificationService } from "@/lib/notification-service"

// Custom date formatting function to avoid date-fns dependency
function formatDateString(date: Date, includeTime = false): string {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }
    : {
        month: "short",
        day: "numeric",
        year: "numeric",
      }

  return new Date(date).toLocaleString("en-US", options)
}

// Helper function to format time for input value
function formatTimeForInput(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

interface ProjectViewProps {
  projectId: string
  onBack: () => void
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const [project, setProject] = useState<MochiProject | null>(null)
  const [view, setView] = useState<"board" | "notes">("board")
  const [projects, setProjects] = useState<MochiProject[]>([])
  const [activeBoard, setActiveBoard] = useState<KanbanBoardType | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false)
  const [timePickerValue, setTimePickerValue] = useState("12:00")

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Load project data
  useEffect(() => {
    const storedProjects = localStorage.getItem("mochiboard-projects")
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects)
      setProjects(parsedProjects)

      const currentProject = parsedProjects.find((p: MochiProject) => p.id === projectId)
      if (currentProject) {
        setProject(currentProject)

        // Set the first board as active if available
        if (currentProject.boards.length > 0) {
          setActiveBoard(currentProject.boards[0])
        }
      }
    }
  }, [projectId])

  // Set initial time value when deadline is set
  useEffect(() => {
    if (project?.deadline) {
      setTimePickerValue(formatTimeForInput(new Date(project.deadline)))
    } else {
      setTimePickerValue("12:00")
    }
  }, [project?.deadline])

  // Save project changes back to projects array
  const saveProject = (updatedProject: MochiProject) => {
    setProject(updatedProject)

    const updatedProjects = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

    setProjects(updatedProjects)
    localStorage.setItem("mochiboard-projects", JSON.stringify(updatedProjects))

    // Schedule notifications if there's a deadline
    if (updatedProject.deadline) {
      NotificationService.scheduleDeadlineReminder(updatedProject.title, updatedProject.deadline, "project")
    }
  }

  // Handle board selection
  const handleBoardSelect = (boardId: string) => {
    if (!project) return

    // Get a fresh reference to the selected board from the project
    const selectedBoard = project.boards.find((board) => board.id === boardId)
    if (selectedBoard) {
      // Create a deep copy to ensure we're not sharing references
      setActiveBoard({
        ...selectedBoard,
        columns: selectedBoard.columns.map((column) => ({
          ...column,
          cards: [...column.cards],
        })),
        notes: [...selectedBoard.notes],
      })
    }
  }

  // Handle board creation
  const handleBoardCreate = (title: string) => {
    if (!project) return

    const newBoard: KanbanBoardType = {
      id: `board-${Date.now()}`,
      title,
      columns: [
        {
          id: `column-${Date.now()}-1`,
          title: "To Do",
          cards: [],
        },
        {
          id: `column-${Date.now()}-2`,
          title: "In Progress",
          cards: [],
        },
        {
          id: `column-${Date.now()}-3`,
          title: "Done",
          cards: [],
        },
      ],
      notes: [],
    }

    // Create a deep copy of the existing boards to prevent reference issues
    const updatedBoards = project.boards.map((board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: [...column.cards],
      })),
      notes: [...board.notes],
    }))

    const updatedProject = {
      ...project,
      boards: [...updatedBoards, newBoard],
    }

    saveProject(updatedProject)
    setActiveBoard(newBoard)
  }

  // Handle board edit
  const handleBoardEdit = (boardId: string, title: string) => {
    if (!project) return

    const updatedBoards = project.boards.map((board) => (board.id === boardId ? { ...board, title } : board))

    const updatedProject = {
      ...project,
      boards: updatedBoards,
    }

    saveProject(updatedProject)

    // Update active board if it's the one being edited
    if (activeBoard && activeBoard.id === boardId) {
      setActiveBoard({ ...activeBoard, title })
    }
  }

  // Handle board deadline edit
  const handleBoardDeadlineEdit = (boardId: string, deadline?: number) => {
    if (!project) return

    const updatedBoards = project.boards.map((board) => (board.id === boardId ? { ...board, deadline } : board))

    const updatedProject = {
      ...project,
      boards: updatedBoards,
    }

    saveProject(updatedProject)

    // Update active board if it's the one being edited
    if (activeBoard && activeBoard.id === boardId) {
      setActiveBoard({ ...activeBoard, deadline })
    }

    // Schedule notification for the board deadline
    if (deadline) {
      const board = project.boards.find((b) => b.id === boardId)
      if (board) {
        NotificationService.scheduleDeadlineReminder(board.title, deadline, "board", project.title)
      }
    }
  }

  // Handle board delete
  const handleBoardDelete = (boardId: string) => {
    if (!project) return

    const updatedBoards = project.boards.filter((board) => board.id !== boardId)

    const updatedProject = {
      ...project,
      boards: updatedBoards,
    }

    saveProject(updatedProject)

    // If the active board is deleted, set the first available board as active
    if (activeBoard && activeBoard.id === boardId) {
      setActiveBoard(updatedBoards.length > 0 ? updatedBoards[0] : null)
    }
  }

  // Handle board update (columns, cards)
  const handleBoardUpdate = (updatedBoard: KanbanBoardType) => {
    if (!project) return

    const updatedBoards = project.boards.map((board) => (board.id === updatedBoard.id ? updatedBoard : board))

    const updatedProject = {
      ...project,
      boards: updatedBoards,
    }

    saveProject(updatedProject)
    setActiveBoard(updatedBoard)
  }

  // Handle notes update
  const handleNotesUpdate = (notes: Note[]) => {
    if (!project || !activeBoard) return

    const updatedBoard = {
      ...activeBoard,
      notes,
    }

    const updatedBoards = project.boards.map((board) => (board.id === activeBoard.id ? updatedBoard : board))

    const updatedProject = {
      ...project,
      boards: updatedBoards,
    }

    saveProject(updatedProject)
    setActiveBoard(updatedBoard)
  }

  const handleTimeChange = (timeString: string) => {
    if (!project || !project.deadline) return

    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(project.deadline)
    newDate.setHours(hours, minutes)

    const updatedProject = {
      ...project,
      deadline: newDate.getTime(),
    }

    saveProject(updatedProject)
    setTimePickerValue(timeString)
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Project not found</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft size={18} />
          </Button>
          <div>
            {activeBoard ? (
              <h2 className="text-2xl font-bold text-slate-800">{project.title}</h2>
            ) : (
              <h2 className="text-2xl font-bold text-slate-800">{project.title}</h2>
            )}
            <div
              className="text-sm text-slate-600 flex items-center cursor-pointer hover:text-slate-800"
              onClick={() => setIsDeadlinePickerOpen(true)}
            >
              <CalendarClock size={14} className="mr-1" />
              {project.deadline ? `Deadline: ${formatDateString(new Date(project.deadline), true)}` : "Add deadline"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeBoard && (
            <>
              <Button
                variant={view === "board" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("board")}
                className={view === "board" ? "bg-slate-500 hover:bg-slate-600" : ""}
              >
                <LayoutGrid size={16} className="mr-2" />
                Kanban Board
              </Button>
              <Button
                variant={view === "notes" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("notes")}
                className={view === "notes" ? "bg-slate-500 hover:bg-slate-600" : ""}
              >
                <StickyNote size={16} className="mr-2" />
                Board Notes
              </Button>
            </>
          )}

          {isMobile && (
            <Button variant="outline" size="icon" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu size={18} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <BoardSidebar
            boards={project.boards}
            activeBoard={activeBoard}
            onBoardSelect={handleBoardSelect}
            onBoardCreate={handleBoardCreate}
            onBoardEdit={handleBoardEdit}
            onBoardDelete={handleBoardDelete}
            onBoardDeadlineEdit={handleBoardDeadlineEdit}
          />
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[280px]">
              <BoardSidebar
                boards={project.boards}
                activeBoard={activeBoard}
                onBoardSelect={handleBoardSelect}
                onBoardCreate={handleBoardCreate}
                onBoardEdit={handleBoardEdit}
                onBoardDelete={handleBoardDelete}
                onBoardDeadlineEdit={handleBoardDeadlineEdit}
                isMobile={true}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
              />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 overflow-auto p-4">
          {activeBoard ? (
            view === "board" ? (
              <KanbanBoard board={activeBoard} onBoardChange={handleBoardUpdate} />
            ) : (
              <NotesView
                boardNotes={activeBoard.notes}
                onNotesChange={handleNotesUpdate}
                boardTitle={activeBoard.title}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No Boards Yet</h2>
                <p className="text-gray-600">Create your first board to get started</p>
              </div>
              <Button
                onClick={() => handleBoardCreate("My First Board")}
                className="bg-slate-500 hover:bg-slate-600 text-white"
              >
                Create Board
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={isDeadlinePickerOpen} onOpenChange={setIsDeadlinePickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Project Deadline</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mx-auto">
              <input
                type="date"
                className="w-full p-2 border rounded mb-4"
                value={
                  project.deadline
                    ? new Date(project.deadline - new Date(project.deadline).getTimezoneOffset() * 60000)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    const date = new Date(e.target.value)
                    if (project.deadline) {
                      const currentTime = new Date(project.deadline)
                      date.setHours(currentTime.getHours(), currentTime.getMinutes())
                    } else {
                      date.setHours(12, 0)
                      setTimePickerValue("12:00")
                    }

                    const updatedProject = {
                      ...project,
                      deadline: date.getTime(),
                    }
                    saveProject(updatedProject)
                  } else {
                    const updatedProject = {
                      ...project,
                      deadline: undefined,
                    }
                    saveProject(updatedProject)
                  }
                }}
              />
            </div>
            {project.deadline && (
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="mr-2 text-slate-500" />
                  <label htmlFor="projectDeadlineTime" className="text-sm font-medium">
                    Set Time
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="projectDeadlineTime"
                    type="time"
                    className="flex-1 p-2 border rounded"
                    value={timePickerValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                  />
                  <div className="text-sm text-slate-500">
                    {project.deadline && formatDateString(new Date(project.deadline), true).split(" at ")[1]}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Current deadline: {formatDateString(new Date(project.deadline), true)}
                </div>
              </div>
            )}
            <div className="mt-4">
              {project.deadline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedProject = {
                      ...project,
                      deadline: undefined,
                    }
                    saveProject(updatedProject)
                  }}
                  className="w-fit"
                >
                  Clear Deadline
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDeadlinePickerOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

