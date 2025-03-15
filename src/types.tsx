export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
}

export interface KanbanCard {
  id: string
  title: string
  description: string
  checklist?: ChecklistItem[]
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
}

export interface KanbanBoard {
  id: string
  title: string
  columns: KanbanColumn[]
  notes: Note[] // Notes are at the board level
}

export interface MochiProject {
  id: string
  title: string
  description: string
  createdAt: number
  boards: KanbanBoard[] // Each board has its own notes
}

