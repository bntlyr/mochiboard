"use client"

import { LayoutGrid, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  activeView: "boards" | "notes"
  setView: (view: "boards" | "notes") => void
}

export function DashboardSidebar({ activeView, setView }: DashboardSidebarProps) {
  return (
    <aside className="w-16 md:w-48 bg-white border-r border-slate-200 p-3 flex flex-col">
      <div className="space-y-2">
        <Button
          variant={activeView === "boards" ? "default" : "ghost"}
          className={`w-full justify-start ${activeView === "boards" ? "bg-mochi-100 text-mochi-700 hover:bg-mochi-200" : ""}`}
          onClick={() => setView("boards")}
        >
          <LayoutGrid size={20} className="mr-0 md:mr-2" />
          <span className="hidden md:inline">Boards</span>
        </Button>
        <Button
          variant={activeView === "notes" ? "default" : "ghost"}
          className={`w-full justify-start ${activeView === "notes" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : ""}`}
          onClick={() => setView("notes")}
        >
          <StickyNote size={20} className="mr-0 md:mr-2" />
          <span className="hidden md:inline">Notes</span>
        </Button>
      </div>
    </aside>
  )
}

