"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  // Check if user is logged in (front-end only auth)
  useEffect(() => {
    const user = localStorage.getItem("mochiboard-user")
    if (user) {
      window.location.href = "/dashboard"
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-slate-300 rounded-lg flex items-center justify-center shadow-lg">
              <Image
                src="/mochilogo.png"
                alt="Mochi Logo"
                width={40}
                height={40}
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-slate-800">MochiBoard</h1>
          <p className="text-xl mb-8 text-slate-600 max-w-md">Organize your tasks, notes, and projects in one place</p>
          <div className="flex gap-4">
            <Button asChild className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-6 rounded-md text-lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-6 rounded-md text-lg">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

