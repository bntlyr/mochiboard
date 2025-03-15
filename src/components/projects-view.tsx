"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Calendar, Clipboard, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { MochiProject } from "../types"

interface ProjectsViewProps {
  onSelectProject: (projectId: string) => void
}

export function ProjectsView({ onSelectProject }: ProjectsViewProps) {
  const [projects, setProjects] = useState<MochiProject[]>([])
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState<MochiProject | null>(null)
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

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

  const addProject = () => {
    if (!newProjectTitle.trim()) return

    const newProject: MochiProject = {
      id: `project-${Date.now()}`,
      title: newProjectTitle,
      description: newProjectDescription,
      createdAt: Date.now(),
      boards: [],
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)

    // Reset form
    setNewProjectTitle("")
    setNewProjectDescription("")
    setIsAddingProject(false)
  }

  const updateProject = () => {
    if (!isEditingProject) return

    const updatedProjects = projects.map((project) => (project.id === isEditingProject.id ? isEditingProject : project))

    setProjects(updatedProjects)
    setIsEditingProject(null)
  }

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((project) => project.id !== projectId)
    setProjects(updatedProjects)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
                <h3 className="font-bold text-lg">{project.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                <div className="flex items-center text-xs text-slate-500 mb-3">
                  <Calendar size={14} className="mr-1" />
                  Created {formatDate(project.createdAt)}
                </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingProject(false)}>
              Cancel
            </Button>
            <Button onClick={addProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  )
}

