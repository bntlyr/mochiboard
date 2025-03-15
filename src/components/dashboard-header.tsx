"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings } from "lucide-react"

interface DashboardHeaderProps {
  user: { name?: string; email: string }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("mochiboard-user")
    router.push("/login")
  }

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-slate-300 rounded-md flex items-center justify-center mr-3">
          <span className="text-xl">📋</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">MochiBoard</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-slate-700" />
            </div>
            <span className="hidden md:inline">{user.name || user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Settings size={16} className="mr-2" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

