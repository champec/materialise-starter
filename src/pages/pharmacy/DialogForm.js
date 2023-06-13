// DialogForm.js
import React from 'react'
import { TextField, Dialog, DialogContent, DialogActions, Button } from '@mui/material'

const DialogForm = ({ table, dialogValue, setDialogValue, handleNewItem, open, handleClose }) => {
  const handleFieldChange = (field, value) => {
    setDialogValue(prevState => ({ ...prevState, [field]: value }))
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          value={dialogValue.name || ''}
          onChange={event => handleFieldChange('name', event.target.value)}
          label={table === 'cdr_patients' ? 'patient_name' : 'name'}
          type='text'
        />

        {table === 'cdr_collectors' && (
          <TextField
            margin='dense'
            id='relationship'
            value={dialogValue?.relationship || ''}
            onChange={event => handleFieldChange('relationship', event.target.value)}
            label='relationship'
            type='text'
          />
        )}

        {table === 'cdr_prescribers' && (
          <TextField
            margin='dense'
            id='registration'
            value={dialogValue.registration || ''}
            onChange={event => handleFieldChange('registration', event.target.value)}
            label='registration'
            type='text'
          />
        )}

        {(table === 'cdr_prescribers' || table === 'cdr_suppliers') && (
          <TextField
            margin='dense'
            id='address'
            value={dialogValue.address || ''}
            onChange={event => handleFieldChange('address', event.target.value)}
            label='address'
            type='text'
          />
        )}

        {table === 'cdr_patients' && (
          <TextField
            margin='dense'
            id='address'
            value={dialogValue.address || ''}
            onChange={event => handleFieldChange('address', event.target.value)}
            label='address'
            type='text'
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleNewItem}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogForm
