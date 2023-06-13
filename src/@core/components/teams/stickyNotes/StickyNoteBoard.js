import React, { useState, useRef, useEffect } from 'react'
import StickyNote from 'src/@core/components/teams/stickyNotes/StickyNote'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledBoard = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'auto'
  // background: 'blue'
}))

const StickyNoteBoard = () => {
  const [notes, setNotes] = useState([])
  const boardRef = useRef(null)
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 })

  const handleDeleteNote = id => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
  }

  const handleEditNote = (id, text) => {
    setNotes(prevNotes => prevNotes.map(note => (note.id === id ? { ...note, message: text } : note)))
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
    const rect = e.currentTarget.getBoundingClientRect()
    const xPercentage = ((e.clientX - rect.left) / rect.width) * 100
    const yPercentage = ((e.clientY - rect.top) / rect.height) * 100
    console.log(rect)
    console.log(`New note position: x=${xPercentage}, y=${yPercentage}`)
    const newNote = {
      id: Date.now(),
      message: 'New Note',
      date: new Date().toLocaleString(),
      user: 'User',
      priority: 'Normal',
      position: { x: xPercentage, y: yPercentage },
      editing: true
    }
    setNotes(prevNotes => [...prevNotes, newNote])
  }

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
        />
      ))}
    </StyledBoard>
  )
}

export default StickyNoteBoard
