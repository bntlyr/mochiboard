"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, CalendarIcon, Clipboard, Edit, Trash2, CalendarClock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { MochiProject } from "../types"
import { cn } from "@/lib/utils"
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

interface ProjectsViewProps {
  onSelectProject: (projectId: string) => void
}

export function ProjectsView({ onSelectProject }: ProjectsViewProps) {
  const [projects, setProjects] = useState<MochiProject[]>([])
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState<MochiProject | null>(null)
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newProjectDeadline, setNewProjectDeadline] = useState<Date | undefined>(undefined)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false)
  const [timePickerValue, setTimePickerValue] = useState("12:00")
  const [editTimePickerValue, setEditTimePickerValue] = useState("12:00")

  useEffect(() => {
    const storedProjects = localStorage.getItem("mochiboard-projects")
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("mochiboard-projects", JSON.stringify(projects))
    }
  }, [projects])

  // Set initial time value when deadline is set
  useEffect(() => {
    if (newProjectDeadline) {
      setTimePickerValue(formatTimeForInput(newProjectDeadline))
    } else {
      setTimePickerValue("12:00")
    }
  }, [newProjectDeadline])

  // Set initial edit time value when editing project
  useEffect(() => {
    if (isEditingProject?.deadline) {
      setEditTimePickerValue(formatTimeForInput(new Date(isEditingProject.deadline)))
    } else {
      setEditTimePickerValue("12:00")
    }
  }, [isEditingProject])

  const addProject = () => {
    if (!newProjectTitle.trim()) return

    const newProject: MochiProject = {
      id: `project-${Date.now()}`,
      title: newProjectTitle,
      description: newProjectDescription,
      createdAt: Date.now(),
      deadline: newProjectDeadline ? newProjectDeadline.getTime() : undefined,
      boards: [],
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)

    // Schedule notifications if there's a deadline
    if (newProject.deadline) {
      NotificationService.scheduleDeadlineReminder(newProject.title, newProject.deadline, "project")
    }

    // Reset form
    setNewProjectTitle("")
    setNewProjectDescription("")
    setNewProjectDeadline(undefined)
    setIsAddingProject(false)
  }

  const updateProject = () => {
    if (!isEditingProject) return

    const updatedProjects = projects.map((project) => (project.id === isEditingProject.id ? isEditingProject : project))

    setProjects(updatedProjects)

    // Schedule notifications if there's a deadline
    if (isEditingProject.deadline) {
      NotificationService.scheduleDeadlineReminder(isEditingProject.title, isEditingProject.deadline, "project")
    }

    setIsEditingProject(null)
  }

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((project) => project.id !== projectId)
    setProjects(updatedProjects)
  }

  const formatDate = (timestamp: number, includeTime = false) => {
    return formatDateString(new Date(timestamp), includeTime)
  }

  const handleTimeChange = (timeString: string) => {
    if (!newProjectDeadline) return

    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(newProjectDeadline)
    newDate.setHours(hours, minutes)
    setNewProjectDeadline(newDate)
    setTimePickerValue(timeString)
  }

  const handleEditTimeChange = (timeString: string) => {
    if (!isEditingProject || !isEditingProject.deadline) return

    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(isEditingProject.deadline)
    newDate.setHours(hours, minutes)

    setIsEditingProject({
      ...isEditingProject,
      deadline: newDate.getTime(),
    })
    setEditTimePickerValue(timeString)
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Mochi Projects</h2>
        <Button onClick={() => setIsAddingProject(true)} className="bg-slate-500 hover:bg-slate-600 text-white">
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-slate-200 p-6">
          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
            <Clipboard size={24} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Projects Yet</h3>
          <p className="text-gray-500 text-center mb-4">Create your first project to get started!</p>
          <Button onClick={() => setIsAddingProject(true)} className="bg-slate-500 hover:bg-slate-600 text-white">
            <Plus size={16} className="mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <h3 className="font-bold text-lg truncate max-w-[80%]" title={project.title}>
                  {project.title}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditingProject(project)}>
                      <Edit size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteProject(project.id)}>
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p
                  className="text-sm text-slate-600 mb-3 line-clamp-2 overflow-hidden text-ellipsis"
                  title={project.description}
                >
                  {project.description}
                </p>
                <div className="flex items-center text-xs text-slate-500 mb-3">
                  <CalendarIcon size={14} className="mr-1" />
                  Created {formatDate(project.createdAt)}
                </div>
                {project.deadline && (
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <CalendarClock size={14} className="mr-1" />
                    Deadline: {formatDate(project.deadline, true)}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-xs text-slate-500">
                    <div className="w-3 h-3 bg-slate-300 rounded-sm mr-1"></div>
                    {project.boards.length} {project.boards.length === 1 ? "Board" : "Boards"}
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <div className="w-3 h-3 bg-slate-300 rounded-sm mr-1"></div>
                    {project.boards.reduce((total, board) => total + board.notes.length, 0)} Notes
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  className="w-full text-sm border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => onSelectProject(project.id)}
                >
                  Open Project
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Project Dialog */}
      <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="projectTitle" className="text-sm font-medium">
                Project Title
              </label>
              <Input
                id="projectTitle"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="projectDescription" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="projectDescription"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="projectDeadline" className="text-sm font-medium">
                Deadline (optional)
              </label>
              <div className="flex flex-col space-y-2">
                <Button
                  id="projectDeadline"
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newProjectDeadline && "text-muted-foreground",
                  )}
                  onClick={() => setIsDatePickerOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newProjectDeadline ? formatDateString(newProjectDeadline, true) : <span>Pick a deadline</span>}
                </Button>
                {newProjectDeadline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewProjectDeadline(undefined)}
                    className="w-fit"
                  >
                    Clear Deadline
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingProject(false)}>
              Cancel
            </Button>
            <Button onClick={addProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Picker Dialog for New Project */}
      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Deadline</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mx-auto">
              <input
                type="date"
                className="w-full p-2 border rounded mb-4"
                value={
                  newProjectDeadline
                    ? new Date(newProjectDeadline.getTime() - newProjectDeadline.getTimezoneOffset() * 60000)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    const date = new Date(e.target.value)
                    if (newProjectDeadline) {
                      date.setHours(newProjectDeadline.getHours(), newProjectDeadline.getMinutes())
                    } else {
                      date.setHours(12, 0)
                      setTimePickerValue("12:00")
                    }
                    setNewProjectDeadline(date)
                  } else {
                    setNewProjectDeadline(undefined)
                  }
                }}
              />
            </div>
            {newProjectDeadline && (
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <Clock size={16} className="mr-2 text-slate-500" />
                  <label htmlFor="deadlineTime" className="text-sm font-medium">
                    Set Time
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="deadlineTime"
                    type="time"
                    className="flex-1 p-2 border rounded"
                    value={timePickerValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                  />
                  <div className="text-sm text-slate-500">
                    {newProjectDeadline && formatDateString(newProjectDeadline, true).split(" at ")[1]}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Current deadline: {formatDateString(newProjectDeadline, true)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDatePickerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsDatePickerOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!isEditingProject} onOpenChange={(open) => !open && setIsEditingProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {isEditingProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="editProjectTitle" className="text-sm font-medium">
                  Project Title
                </label>
                <Input
                  id="editProjectTitle"
                  value={isEditingProject.title}
                  onChange={(e) => setIsEditingProject({ ...isEditingProject, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="editProjectDescription" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="editProjectDescription"
                  value={isEditingProject.description}
                  onChange={(e) => setIsEditingProject({ ...isEditingProject, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="editProjectDeadline" className="text-sm font-medium">
                  Deadline
                </label>
                <div className="flex flex-col space-y-2">
                  <Button
                    id="editProjectDeadline"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !isEditingProject.deadline && "text-muted-foreground",
                    )}
                    onClick={() => setIsEditDatePickerOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {isEditingProject.deadline ? (
                      formatDateString(new Date(isEditingProject.deadline), true)
                    ) : (
                      <span>Pick a deadline</span>
                    )}
                  </Button>
                  {isEditingProject.deadline && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProject({ ...isEditingProject, deadline: undefined })}
                      className="w-fit"
                    >
                      Clear Deadline
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProject(null)}>
              Cancel
            </Button>
            <Button onClick={updateProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Picker Dialog for Edit Project */}
      {isEditingProject && (
        <Dialog open={isEditDatePickerOpen} onOpenChange={setIsEditDatePickerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Deadline</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mx-auto">
                <input
                  type="date"
                  className="w-full p-2 border rounded mb-4"
                  value={
                    isEditingProject.deadline
                      ? new Date(
                          isEditingProject.deadline - new Date(isEditingProject.deadline).getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value)
                      if (isEditingProject.deadline) {
                        const currentTime = new Date(isEditingProject.deadline)
                        date.setHours(currentTime.getHours(), currentTime.getMinutes())
                      } else {
                        date.setHours(12, 0)
                        setEditTimePickerValue("12:00")
                      }
                      setIsEditingProject({
                        ...isEditingProject,
                        deadline: date.getTime(),
                      })
                    } else {
                      setIsEditingProject({
                        ...isEditingProject,
                        deadline: undefined,
                      })
                    }
                  }}
                />
              </div>
              {isEditingProject.deadline && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Clock size={16} className="mr-2 text-slate-500" />
                    <label htmlFor="editDeadlineTime" className="text-sm font-medium">
                      Set Time
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="editDeadlineTime"
                      type="time"
                      className="flex-1 p-2 border rounded"
                      value={editTimePickerValue}
                      onChange={(e) => handleEditTimeChange(e.target.value)}
                    />
                    <div className="text-sm text-slate-500">
                      {isEditingProject.deadline &&
                        formatDateString(new Date(isEditingProject.deadline), true).split(" at ")[1]}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Current deadline: {formatDateString(new Date(isEditingProject.deadline), true)}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDatePickerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditDatePickerOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

