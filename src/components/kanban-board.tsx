"use client"

import type React from "react"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus, MoreHorizontal, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checklist } from "@/components/checklist"
import type { KanbanBoard as KanbanBoardType, KanbanCard, KanbanColumn } from "@/types"

interface KanbanBoardProps {
  board: KanbanBoardType
  onBoardChange: (board: KanbanBoardType) => void
}

export function KanbanBoard({ board, onBoardChange }: KanbanBoardProps) {
  const [isAddingCard, setIsAddingCard] = useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [newCardDescription, setNewCardDescription] = useState("")
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isEditingCard, setIsEditingCard] = useState<KanbanCard | null>(null)
  const [editColumnId, setEditColumnId] = useState<string | null>(null)
  const [showChecklistPreview, setShowChecklistPreview] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // Dropped outside the list
    if (!destination) return

    // Create a copy of the current board
    const updatedBoard = { ...board }

    if (source.droppableId === destination.droppableId) {
      // Moving within the same column
      const columnIndex = updatedBoard.columns.findIndex((col) => col.id === source.droppableId)
      if (columnIndex === -1) return

      const column = { ...updatedBoard.columns[columnIndex] }
      const [removed] = column.cards.splice(source.index, 1)
      column.cards.splice(destination.index, 0, removed)

      updatedBoard.columns[columnIndex] = column
    } else {
      // Moving to another column
      const sourceColumnIndex = updatedBoard.columns.findIndex((col) => col.id === source.droppableId)
      const destColumnIndex = updatedBoard.columns.findIndex((col) => col.id === destination.droppableId)

      if (sourceColumnIndex === -1 || destColumnIndex === -1) return

      const sourceColumn = { ...updatedBoard.columns[sourceColumnIndex] }
      const destColumn = { ...updatedBoard.columns[destColumnIndex] }

      const [removed] = sourceColumn.cards.splice(source.index, 1)
      destColumn.cards.splice(destination.index, 0, removed)

      updatedBoard.columns[sourceColumnIndex] = sourceColumn
      updatedBoard.columns[destColumnIndex] = destColumn
    }

    // Update the board
    onBoardChange(updatedBoard)
  }

  // Handle slash commands
  const handleCardInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNewCardDescription(value)

    // Check for /checklist command
    if (value.includes("/checklist") && !showChecklistPreview) {
      setShowChecklistPreview(true)
    } else if (!value.includes("/checklist") && showChecklistPreview) {
      setShowChecklistPreview(false)
    }
  }

  const addCard = (columnId: string) => {
    if (!newCardTitle.trim()) return

    // Process description for /checklist command
    let description = newCardDescription
    let checklist = undefined

    if (description.includes("/checklist")) {
      // Remove the /checklist command from the description
      description = description.replace("/checklist", "").trim()

      // Create an empty checklist
      checklist = []
    }

    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: newCardTitle,
      description,
      checklist,
    }

    const updatedBoard = { ...board }
    const columnIndex = updatedBoard.columns.findIndex((col) => col.id === columnId)

    if (columnIndex !== -1) {
      updatedBoard.columns[columnIndex].cards.push(newCard)
      onBoardChange(updatedBoard)
    }

    // Reset form
    setNewCardTitle("")
    setNewCardDescription("")
    setShowChecklistPreview(false)
    setIsAddingCard(null)
  }

  const addColumn = () => {
    if (!newColumnTitle.trim()) return

    const newColumn: KanbanColumn = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      cards: [],
    }

    const updatedBoard = { ...board }
    updatedBoard.columns.push(newColumn)
    onBoardChange(updatedBoard)

    // Reset form
    setNewColumnTitle("")
    setIsAddingColumn(false)
  }

  const updateCard = () => {
    if (!isEditingCard) return

    const updatedBoard = { ...board }

    // Find the column containing the card
    for (let i = 0; i < updatedBoard.columns.length; i++) {
      const cardIndex = updatedBoard.columns[i].cards.findIndex((card) => card.id === isEditingCard.id)

      if (cardIndex !== -1) {
        updatedBoard.columns[i].cards[cardIndex] = { ...isEditingCard }
        break
      }
    }

    onBoardChange(updatedBoard)
    setIsEditingCard(null)
  }

  const deleteCard = (columnId: string, cardId: string) => {
    const updatedBoard = { ...board }
    const columnIndex = updatedBoard.columns.findIndex((col) => col.id === columnId)

    if (columnIndex !== -1) {
      updatedBoard.columns[columnIndex].cards = updatedBoard.columns[columnIndex].cards.filter(
        (card) => card.id !== cardId,
      )

      onBoardChange(updatedBoard)
    }
  }

  const deleteColumn = (columnId: string) => {
    const updatedBoard = { ...board }
    updatedBoard.columns = updatedBoard.columns.filter((col) => col.id !== columnId)

    onBoardChange(updatedBoard)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-slate-800">{board.title}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAddingColumn(true)}>
          <Plus size={16} className="mr-2" />
          Add Column
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full pb-4">
            {board.columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-72">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
                  <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                    {editColumnId === column.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const updatedBoard = { ...board }
                          const columnIndex = updatedBoard.columns.findIndex((col) => col.id === column.id)
                          if (columnIndex !== -1 && newColumnTitle.trim()) {
                            updatedBoard.columns[columnIndex].title = newColumnTitle
                            onBoardChange(updatedBoard)
                          }
                          setEditColumnId(null)
                          setNewColumnTitle("")
                        }}
                        className="flex-1"
                      >
                        <Input
                          value={newColumnTitle}
                          onChange={(e) => setNewColumnTitle(e.target.value)}
                          placeholder={column.title}
                          autoFocus
                          className="h-7 text-sm"
                        />
                      </form>
                    ) : (
                      <h3 className="font-medium text-gray-700">{column.title}</h3>
                    )}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditColumnId(column.id)
                          setNewColumnTitle(column.title)
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteColumn(column.id)}>
                        <X size={14} />
                      </Button>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto p-2">
                        {column.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <Card className="bg-white shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                                  <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between">
                                    <h4 className="font-medium text-sm">{card.title}</h4>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <MoreHorizontal size={14} />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditingCard(card)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => deleteCard(column.id, card.id)}>
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-1">
                                    <p className="text-xs text-gray-600">{card.description}</p>

                                    {card.checklist && card.checklist.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-slate-100">
                                        <Checklist
                                          items={card.checklist}
                                          onUpdate={(items) => {
                                            // Find the column containing the card
                                            const updatedBoard = { ...board }
                                            for (let i = 0; i < updatedBoard.columns.length; i++) {
                                              const cardIndex = updatedBoard.columns[i].cards.findIndex(
                                                (c) => c.id === card.id,
                                              )

                                              if (cardIndex !== -1) {
                                                updatedBoard.columns[i].cards[cardIndex] = {
                                                  ...updatedBoard.columns[i].cards[cardIndex],
                                                  checklist: items,
                                                }

                                                onBoardChange(updatedBoard)
                                                break
                                              }
                                            }
                                          }}
                                        />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <CardFooter className="p-2">
                    {isAddingCard === column.id ? (
                      <form
                        className="w-full space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          addCard(column.id)
                        }}
                      >
                        <Input
                          placeholder="Card title"
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          className="text-sm"
                        />
                        <Textarea
                          placeholder="Description (optional) - Type /checklist to add a checklist"
                          value={newCardDescription}
                          onChange={handleCardInputChange}
                          className="text-sm min-h-[60px]"
                        />

                        {showChecklistPreview && (
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-4 h-4 bg-mochi-300 rounded-sm flex items-center justify-center">
                                <span className="text-xs">✓</span>
                              </div>
                              <span className="text-sm font-medium">Checklist</span>
                            </div>
                            <p className="text-xs text-slate-500">A checklist will be added to this card</p>
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsAddingCard(null)
                              setNewCardTitle("")
                              setNewCardDescription("")
                              setShowChecklistPreview(false)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm">
                            Add
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-500"
                        onClick={() => setIsAddingCard(column.id)}
                      >
                        <Plus size={14} className="mr-1" />
                        Add Card
                      </Button>
                    )}
                  </CardFooter>
                </div>
              </div>
            ))}

            {isAddingColumn ? (
              <div className="flex-shrink-0 w-72">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      addColumn()
                    }}
                  >
                    <Input
                      placeholder="Column title"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingColumn(false)
                          setNewColumnTitle("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Add
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DragDropContext>

      <Dialog open={!!isEditingCard} onOpenChange={(open) => !open && setIsEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {isEditingCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="cardTitle" className="text-sm font-medium">
                  Card Title
                </label>
                <Input
                  id="cardTitle"
                  value={isEditingCard.title}
                  onChange={(e) => setIsEditingCard({ ...isEditingCard, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cardDescription" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="cardDescription"
                  value={isEditingCard.description}
                  onChange={(e) => setIsEditingCard({ ...isEditingCard, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Checklist</label>
                  {!isEditingCard.checklist && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCard({ ...isEditingCard, checklist: [] })}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Checklist
                    </Button>
                  )}
                </div>

                {isEditingCard.checklist && (
                  <Checklist
                    items={isEditingCard.checklist}
                    onUpdate={(items) => setIsEditingCard({ ...isEditingCard, checklist: items })}
                  />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingCard(null)}>
              Cancel
            </Button>
            <Button onClick={updateCard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

