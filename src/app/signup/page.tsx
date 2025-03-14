"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    // Mock signup - in a real app, this would call an API
    if (email.includes("@")) {
      // Store user in localStorage (front-end only auth)
      localStorage.setItem("mochiboard-user", JSON.stringify({ name, email }))
      router.push("/dashboard")
    } else {
      setError("Please enter a valid email")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-mochi-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-slate-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-mochi-300 rounded-lg mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Join MochiBoard</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-slate-200 focus:border-mochi-500 focus:ring-mochi-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-200 focus:border-mochi-500 focus:ring-mochi-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-200 focus:border-mochi-500 focus:ring-mochi-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-slate-200 focus:border-mochi-500 focus:ring-mochi-500"
              />
            </div>
            <Button type="submit" className="w-full bg-mochi-500 hover:bg-mochi-600 text-white py-2 rounded-md">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-mochi-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

