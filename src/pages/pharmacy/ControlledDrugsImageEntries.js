import React from 'react'
import { List, ListItem, ListItemText, TextField, Button, Typography, Alert, AlertTitle, Box } from '@mui/material'

const Entries = ({ processedData, handleEdit, handleConfirm, getDrugInfo }) => {
  if (!processedData) return null

  const { type, entries } = processedData

  const renderEntryFields = (entry, index) => {
    switch (type) {
      case 'invoice':
        return (
          <>
            <TextField
              label='Supplier'
              value={entry.supplier}
              onChange={e => handleEdit('supplier', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Pack Size'
              value={entry.packsize}
              onChange={e => handleEdit('packsize', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Quantity'
              value={entry.quantity}
              onChange={e => handleEdit('quantity', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Total'
              value={entry.total}
              onChange={e => handleEdit('total', e.target.value)}
              fullWidth
              margin='dense'
            />
          </>
        )
      case 'prescription':
        return (
          <>
            <TextField
              label='Patient'
              value={entry.patient}
              onChange={e => handleEdit('patient', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Prescriber'
              value={entry.prescriber}
              onChange={e => handleEdit('prescriber', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Quantity'
              value={entry.quantity}
              onChange={e => handleEdit('quantity', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='ID Requested'
              value={entry.id_requested}
              onChange={e => handleEdit('id_requested', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='ID Given'
              value={entry.id_given}
              onChange={e => handleEdit('id_given', e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Person Collecting'
              value={entry.person_collecting}
              onChange={e => handleEdit('person_collecting', e.target.value)}
              fullWidth
              margin='dense'
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <List sx={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      {entries.length &&
        entries.map((entry, index) => (
          <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
            {type === 'skipped' || type === 'error' ? (
              <Alert severity={type === 'skipped' ? 'warning' : 'error'}>
                <AlertTitle>{type === 'skipped' ? 'Skipped Entry' : 'Error'}</AlertTitle>
                <Typography variant='body2'>Reason: {entry.reason}</Typography>
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <>
                    <Typography variant='body2'>Details:</Typography>
                    <Box component='pre' sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(entry.details, null, 2)}
                    </Box>
                  </>
                )}
              </Alert>
            ) : (
              <>
                <ListItemText primary={getDrugInfo(entry.drug_id)} sx={{ marginBottom: 2 }} />
                {renderEntryFields(entry, index)}
                <Button onClick={() => handleConfirm(index)} sx={{ marginTop: 2 }}>
                  Confirm
                </Button>
              </>
            )}
          </ListItem>
        ))}
    </List>
  )
}

export default Entries
