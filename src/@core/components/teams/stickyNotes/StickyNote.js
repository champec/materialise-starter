import React, { useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import TextField from '@mui/material/TextField'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import ColorPicker from './ColourPicker'
// import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
// import DeleteIcon from '@mui/icons-material/Delete'

const colorMap = {
  'not important': '#fefdca',
  average: '#fefdca',
  important: '#ff0000',
  'very important': '#ffff00'
}

const StyledNote = styled(Box)(({ theme, color }) => ({
  color: '#000',
  width: '200px',
  minHeight: '200px',
  padding: '15px',
  boxSizing: 'border-box',
  position: 'absolute',
  background: colorMap[color] || '#fefdca', // defualt is '#fefdca'
  backgroundImage: 'linear-gradient(#fefdca, #f6f6b1)',
  boxShadow: '-6px 11px 5px 0px rgba(0, 0, 0, 0.14)',
  borderRadius: '7px',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 25px 25px 0',
    borderColor: 'transparent transparent transparent transparent',
    boxShadow: '-1px 1px 2px 0 rgba(0, 0, 0, 0.2)'
  }
}))

const Footer = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  width: '100%',
  textAlign: 'right',
  fontSize: '12px',
  color: '#000'
}))

const StyledIconButtonWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '0px',
  right: '5px'
}))

const StickyNote = ({
  id,
  message,
  date,
  user,
  priority,
  position,
  boardSize,
  onDelete,
  onEdit,
  editing,
  isEditingBoard,
  setIsEditingBoard,
  onColorChange,
  onBlurNote,
  note,
  updatePosition
}) => {
  console.log({ message })
  const [Isediting, setEditing] = useState(editing)
  const [text, setText] = useState(message)
  const [anchorEl, setAnchorEl] = useState(null)
  const [color, setColor] = useState(note.color || '#fefdca')

  useEffect(() => {
    setIsEditingBoard(editing)
  }, [])

  const handleColorClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleColorClose = () => {
    setAnchorEl(null)
  }

  const handleDeleteClick = note => e => {
    console.log(isEditingBoard)
    e.stopPropagation()
    onDelete(note)
  }

  const handleEditClick = e => {
    e.stopPropagation()
    setEditing(true)
    setIsEditingBoard(true)
  }

  const handleColorChange = newColor => {
    console.log(newColor)
    setColor(newColor)
    onColorChange(id, newColor)
  }

  const handleTextChange = e => {
    setText(e.target.value)
  }

  const handleBlur = () => {
    setTimeout(() => {
      console.log('BLURR')
      setEditing(false)
      setIsEditingBoard(false)
      onEdit(id, text)
    }, 300) // delay of 100ms
  }

  const handleDoubleClick = () => {
    setEditing(false)
    onEdit(id, text)
  }

  const Content = styled('div')(({ theme }) => ({
    color: 'black',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    wordBreak: 'break-word'
  }))

  let dateObject = new Date(date)
  let formattedDate = `${dateObject.toLocaleDateString()} ${dateObject.toLocaleTimeString()}`

  const handleDragStop = (e, data) => {
    console.log('DRAGGING STOPPED')
    const newPosition = {
      x: (data.x / boardSize.width) * 100,
      y: (data.y / boardSize.height) * 100
    }
    updatePosition(id, newPosition)
  }

  return (
    <Draggable
      defaultPosition={{
        x: (position.x / 100) * boardSize.width,
        y: (position.y / 100) * boardSize.height
      }}
      disabled={editing}
      onStop={handleDragStop}
    >
      <StyledNote
        color={color}
        onClick={e => e.stopPropagation()}
        sx={{
          background:
            color === 'not important'
              ? '#8BD982'
              : color === 'average'
              ? '#fefdca'
              : color === 'important'
              ? '#ffff00'
              : color === 'very important'
              ? '#ff0000'
              : '#fefdca' // defualt is '#fefdca'
        }}
      >
        <StyledIconButtonWrapper>
          <IconButton onClick={handleColorClick}>
            <Icon icon='iconoir:color-wheel' color='#000' />
          </IconButton>
          <IconButton onClick={handleDeleteClick(note)}>
            <Icon icon='ic:twotone-delete' color='#000' />
          </IconButton>
          <IconButton onClick={handleEditClick}>
            <Icon icon='bx:edit' color='#000' />
          </IconButton>
          <ColorPicker
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleColorClose}
            onColorChange={handleColorChange}
          />
        </StyledIconButtonWrapper>
        {Isediting ? (
          <TextareaAutosize
            minRows={3}
            value={text}
            onChange={handleTextChange}
            autoFocus={note.editing}
            onDoubleClick={handleDoubleClick}
            onBlur={e => {
              e.stopPropagation()
              handleBlur()
            }}
            inputProps={{ maxLength: 300, style: { color: 'black' } }}
            style={{
              width: '90%',
              color: 'black',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              marginTop: '20px'
            }}
          />
        ) : (
          <Typography
            style={{
              color: 'black',
              fontFamily: '"Comic Sans MS", cursive, sans-serif',
              marginTop: '15px',
              marginBottom: '10px'
            }}
          >
            {message}
          </Typography>
        )}

        <Footer>
          <small>{user?.username}</small>
          <br />
          <small>{formattedDate}</small>
        </Footer>
      </StyledNote>
    </Draggable>
  )
}

export default StickyNote
