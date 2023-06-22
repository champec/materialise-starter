import React, { useState, useRef, useEffect } from 'react'
import StickyNote from 'src/@core/components/teams/stickyNotes/StickyNote'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { v4 as uuidv4 } from 'uuid'
import { Text } from 'recharts'

const StyledBoard = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'auto'
  // background: 'blue'
}))

const StickyNoteBoard = ({ notes, onNoteSubmit, setNotes, onNoteDelete }) => {
  const boardRef = useRef(null)
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 })
  const [isEditingBoard, setIsEditingBoard] = useState(false)

  const handleDeleteNote = async note => {
    setIsEditingBoard(false)
    setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id))
    const noteToDelete = notes.find(n => n.id === note.id)
    if (noteToDelete) {
      await onNoteDelete(note)
    }
  }

  const handleEditNote = async (id, text) => {
    setNotes(prevNotes => prevNotes.map(note => (note.id === id ? { ...note, message: text, editing: false } : note)))
    const updatedNote = notes.find(note => note.id === id)
    if (updatedNote && text.trim() !== '') {
      await onNoteSubmit({ ...updatedNote, message: text })
    }
  }

  const handleColorChangeNote = async (id, newColor) => {
    console.log({ newColor })
    setNotes(prevNotes => prevNotes.map(note => (note.id === id ? { ...note, color: newColor } : note)))
    const updatedNote = notes.find(note => note.id === id)
    if (updatedNote && updatedNote.message.trim() !== '') {
      await onNoteSubmit({ ...updatedNote, color: newColor })
    }
  }

  const handleUpdatePosition = async (id, newPosition) => {
    // setNotes(prevNotes => prevNotes.map(note => (note.id === id ? { ...note, position: newPosition } : note)));
    const updatedNote = notes.find(note => note.id === id)
    if (updatedNote && updatedNote.message.trim() !== '') {
      await onNoteSubmit({ ...updatedNote, position: newPosition })
    }
  }

  //! add a resize event listener to the window object when you resize the vertical nav bar so it doesnt off set the clicks
  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const { width, height } = boardRef.current.getBoundingClientRect()
        setBoardSize({ width, height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const handleBoardClick = e => {
    // Prevent creating a new note if editing is still in progress
    setIsEditingBoard(true)
    if (isEditingBoard) return

    const rect = e.currentTarget.getBoundingClientRect()
    const xPercentage = ((e.clientX - rect.left) / rect.width) * 100
    const yPercentage = ((e.clientY - rect.top) / rect.height) * 100

    // Create a new note
    const newNote = {
      id: uuidv4(),
      message: '',
      date: new Date().toLocaleString(),
      user: 'User',
      priority: 'Normal',
      position: { x: xPercentage, y: yPercentage },
      editing: true,
      color: 'default'
    }

    // Get a copy of the current notes, and filter out any that are empty
    const currentNotes = [...notes].filter(note => note.message.trim() !== '')

    // Add the new note
    currentNotes.push(newNote)

    // Update the notes state
    setNotes(currentNotes)
  }

  console.log({ notes })
  return (
    <StyledBoard onClick={handleBoardClick} ref={boardRef}>
      {notes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          message={note.message}
          date={note.date}
          user={note.user}
          priority={note.priority}
          position={note.position}
          boardSize={boardSize}
          onDelete={handleDeleteNote}
          onEdit={handleEditNote}
          editing={note.editing}
          isEditingBoard={isEditingBoard}
          setIsEditingBoard={setIsEditingBoard}
          onColorChange={handleColorChangeNote}
          onBlurNote={onNoteSubmit}
          note={note}
          updatePosition={handleUpdatePosition}
        />
      ))}
    </StyledBoard>
  )
}

export default StickyNoteBoard
