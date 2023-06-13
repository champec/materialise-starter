import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import TextField from '@mui/material/TextField'
import TextareaAutosize from '@mui/material/TextareaAutosize'
// import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
// import DeleteIcon from '@mui/icons-material/Delete'

const StyledNote = styled(Box)(({ theme }) => ({
  color: '#000',
  width: '200px',
  minHeight: '200px',
  padding: '15px',
  boxSizing: 'border-box',
  position: 'absolute',
  background: '#fefdca',
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

const StickyNote = ({ id, message, date, user, priority, position, boardSize, onDelete, onEdit, editing }) => {
  console.log(editing)
  const [Isediting, setEditing] = useState(true)
  const [text, setText] = useState('')

  const handleDeleteClick = e => {
    e.stopPropagation()
    onDelete(id)
  }

  const handleEditClick = e => {
    e.stopPropagation()
    setEditing(true)
  }

  const handleTextChange = e => {
    setText(e.target.value)
  }

  const handleBlur = () => {
    setEditing(false)
    onEdit(id, text)
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

  return (
    <Draggable
      defaultPosition={{
        x: (position.x / 100) * boardSize.width,
        y: (position.y / 100) * boardSize.height
      }}
      disabled={Isediting}
    >
      <StyledNote onClick={e => e.stopPropagation()}>
        <StyledIconButtonWrapper>
          <IconButton onClick={handleDeleteClick}>
            <Icon icon='ic:twotone-delete' color='#000' />
          </IconButton>
          <IconButton onClick={handleEditClick}>
            <Icon icon='bx:edit' color='#000' />
          </IconButton>
        </StyledIconButtonWrapper>
        {Isediting ? (
          <TextareaAutosize
            minRows={3}
            value={text}
            onChange={handleTextChange}
            autoFocus
            onDoubleClick={handleDoubleClick}
            onBlur={handleBlur}
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
          <small>{user}</small>
          <br />
          <small>{date}</small>
        </Footer>
      </StyledNote>
    </Draggable>
  )
}

export default StickyNote
