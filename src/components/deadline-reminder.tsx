"use client"

import { useEffect } from "react"
import { NotificationService } from "@/lib/notification-service"

export function DeadlineReminder() {
  useEffect(() => {
    // Request notification permission when component mounts
    const requestPermission = async () => {
      await NotificationService.requestPermission()
      NotificationService.checkAndScheduleReminders()
    }

    requestPermission()

    // Set up an interval to check for new deadlines every hour
    const intervalId = setInterval(
      () => {
        NotificationService.checkAndScheduleReminders()
      },
      60 * 60 * 1000,
    ) // Every hour

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // This component doesn't render anything visible
  return null
}

