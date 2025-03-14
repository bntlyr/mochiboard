"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectsView } from "@/components/projects-view"
import { ProjectView } from "@/components/project-view"
import type { MochiProject } from "@/types"

export default function Dashboard() {
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("mochiboard-user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(storedUser))

    // Initialize projects data if not exists
    if (!localStorage.getItem("mochiboard-projects")) {
      // Convert existing boards and notes to the new project structure
      const existingBoards = JSON.parse(localStorage.getItem("mochiboard-boards") || "[]")
      const existingNotes = JSON.parse(localStorage.getItem("mochiboard-notes") || "[]")

      const defaultProject: MochiProject = {
        id: `project-${Date.now()}`,
        title: "My First Project",
        description: "A collection of my boards and notes",
        createdAt: Date.now(),
        boards: existingBoards,
        notes: existingNotes,
      }

      localStorage.setItem("mochiboard-projects", JSON.stringify([defaultProject]))
    }
  }, [router])

  if (!user) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardHeader user={user} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          {activeProjectId ? (
            <ProjectView projectId={activeProjectId} onBack={() => setActiveProjectId(null)} />
          ) : (
            <ProjectsView onSelectProject={setActiveProjectId} />
          )}
        </main>
      </div>
    </div>
  )
}

