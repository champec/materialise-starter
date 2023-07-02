import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dialog, TextField, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { addLabel } from 'src/store/apps/kanban' // adjust this to match your actual action imports
import { ChromePicker } from 'react-color' // color picker component
import { useOrgAuth } from 'src/hooks/useOrgAuth'

const NewLabelDialog = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('')
  const dispatch = useDispatch()
  const orgId = useOrgAuth()?.organisation?.id

  const handleClose = () => {
    setTitle('')
    setColor('')
    onClose()
  }

  const handleCreate = () => {
    const newLabel = {
      id: uuidv4(),
      title: title,
      color: color,
      orgId: orgId
    }

    dispatch(addLabel(newLabel))
    handleClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Create new label</DialogTitle>
      <DialogContent>
        <TextField value={title} onChange={e => setTitle(e.target.value)} label='Title' fullWidth margin='normal' />

        <ChromePicker color={color} onChangeComplete={color => setColor(color.hex)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreate}>Create</Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewLabelDialog
