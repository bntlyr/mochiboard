import { KanbanBoard, MochiProject } from "@/types"

// Notification service to handle deadline reminders
export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  static async scheduleNotification(title: string, options: NotificationOptions, delay: number): Promise<void> {
    const hasPermission = await this.requestPermission()

    if (!hasPermission) {
      console.log("Notification permission denied")
      return
    }

    // For demonstration purposes, we'll use setTimeout
    // In a real app, you might use a service worker or a backend service
    setTimeout(() => {
      new Notification(title, options)
    }, delay)
  }

  static scheduleDeadlineReminder(
    title: string,
    deadline: number,
    type: "project" | "board",
    parentTitle?: string,
  ): void {
    const now = Date.now()
    const deadlineDate = new Date(deadline)

    // If deadline is in the past, don't schedule
    if (deadline <= now) {
      return
    }

    // Schedule reminders at different intervals
    const dayBefore = deadline - 24 * 60 * 60 * 1000 // 1 day before
    const hourBefore = deadline - 60 * 60 * 1000 // 1 hour before

    const itemType = type === "project" ? "Project" : "Board"
    const contextInfo = type === "board" && parentTitle ? ` in project "${parentTitle}"` : ""

    // Schedule day before reminder if it's in the future
    if (dayBefore > now) {
      this.scheduleNotification(
        `Deadline Reminder: ${title}`,
        {
          body: `Your ${itemType.toLowerCase()} "${title}"${contextInfo} is due tomorrow at ${deadlineDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}`,
          icon: "/mochilogo.png",
        },
        dayBefore - now,
      )
    }

    // Schedule hour before reminder if it's in the future
    if (hourBefore > now) {
      this.scheduleNotification(
        `Deadline Approaching: ${title}`,
        {
          body: `Your ${itemType.toLowerCase()} "${title}"${contextInfo} is due in 1 hour at ${deadlineDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}`,
          icon: "/mochilogo.png",
        },
        hourBefore - now,
      )
    }

    // Schedule at deadline
    this.scheduleNotification(
      `Deadline Reached: ${title}`,
      {
        body: `Your ${itemType.toLowerCase()} "${title}"${contextInfo} is due now!`,
        icon: "/mochilogo.png",
      },
      deadline - now,
    )
  }

  static checkAndScheduleReminders(): void {
    // Get all projects from localStorage
    const projects = JSON.parse(localStorage.getItem("mochiboard-projects") || "[]")

    // Schedule reminders for each project with a deadline
    projects.forEach((project: MochiProject) => {
      if (project.deadline) {
        this.scheduleDeadlineReminder(project.title, project.deadline, "project")
      }

      // Schedule reminders for each board with a deadline
      if (project.boards && Array.isArray(project.boards)) {
        project.boards.forEach((board: KanbanBoard) => {
          if (board.deadline) {
            this.scheduleDeadlineReminder(board.title, board.deadline, "board", project.title)
          }
        })
      }
    })
  }
}

