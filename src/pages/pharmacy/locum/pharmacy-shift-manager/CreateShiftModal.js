import React from 'react'
import { Box, Typography, TextField, Button, Modal } from '@mui/material'
import { Icon } from '@iconify/react'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4
}

function CreateShiftModal({ open, onClose, newShift, onInputChange, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant='h6' component='h2' gutterBottom>
          Create New Shift
        </Typography>
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            label='Date'
            type='date'
            name='date'
            value={newShift.date}
            onChange={onInputChange}
            InputLabelProps={{
              shrink: true
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Start Time'
            type='time'
            name='start_time'
            value={newShift.start_time}
            onChange={onInputChange}
            InputLabelProps={{
              shrink: true
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='End Time'
            type='time'
            name='end_time'
            value={newShift.end_time}
            onChange={onInputChange}
            InputLabelProps={{
              shrink: true
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Hourly Rate'
            type='number'
            name='rate'
            value={newShift.rate}
            onChange={onInputChange}
            sx={{ mb: 2 }}
          />
          <Button type='submit' variant='contained' fullWidth startIcon={<Icon icon='mdi:plus' />}>
            Create Shift
          </Button>
        </form>
      </Box>
    </Modal>
  )
}

export default CreateShiftModal
