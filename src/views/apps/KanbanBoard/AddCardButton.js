import React from 'react'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { addTask } from 'src/store/apps/kanban'

function AddCardButton({ laneId, onSelect }) {
  return (
    <Button variant='outlined' color='primary' onClick={() => onSelect(laneId)} style={{ marginTop: 20 }}>
      Add Card
    </Button>
  )
}

export default AddCardButton
