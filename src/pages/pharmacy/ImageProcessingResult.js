import React, { useState } from 'react'
import { List, ListItem, ListItemText, IconButton, Button, Typography, Box, Modal, Paper, Divider } from '@mui/material'
// import EditIcon from '@mui/icons-material/Edit'
import ControlledDrugEntryForm from './ControlledDrugEntryForm'

const ImageProcessingResults = ({ processedData, onConfirm, onEdit, registers }) => {
  const [editingEntry, setEditingEntry] = useState(null)

  const handleEditClick = entry => {
    setEditingEntry(entry)
  }

  const handleEditSubmit = updatedEntry => {
    onEdit(updatedEntry)
    setEditingEntry(null)
  }

  const getDrugInfo = drugId => {
    const register = registers.find(r => r.id === drugId)
    return register ? `${register.drug_name} ${register.strength} ${register.form}` : 'Unknown Drug'
  }

  const renderInvoiceEntry = entry => (
    <ListItem>
      <ListItemText
        primary={getDrugInfo(entry.drug_id)}
        secondary={
          <>
            <Typography component='span' display='block'>
              Supplier: {entry.supplier}
            </Typography>
            <Typography component='span' display='block'>
              Pack Size: {entry.packsize || 'N/A'}
            </Typography>
            <Typography component='span' display='block'>
              Quantity: {entry.quantity || 'N/A'}
            </Typography>
            <Typography component='span' display='block'>
              Total: {entry.total || 'N/A'}
            </Typography>
          </>
        }
      />
      <IconButton onClick={() => handleEditClick(entry)}>{/* <EditIcon /> */}</IconButton>
      <Button onClick={() => onConfirm(entry)}>Confirm</Button>
    </ListItem>
  )

  const renderPrescriptionEntry = entry => (
    <ListItem>
      <ListItemText
        primary={getDrugInfo(entry.drug_id)}
        secondary={
          <>
            <Typography component='span' display='block'>
              Patient: {entry.patient}
            </Typography>
            <Typography component='span' display='block'>
              Prescriber: {entry.prescriber}
            </Typography>
            <Typography component='span' display='block'>
              Quantity: {entry.quantity}
            </Typography>
            <Typography component='span' display='block'>
              ID Requested: {entry.id_requested || 'No'}
            </Typography>
            <Typography component='span' display='block'>
              ID Given: {entry.id_given || 'No'}
            </Typography>
            <Typography component='span' display='block'>
              Person Collecting: {entry.person_collecting || 'Patient'}
            </Typography>
          </>
        }
      />
      <IconButton onClick={() => handleEditClick(entry)}>{/* <EditIcon /> */}</IconButton>
      <Button onClick={() => onConfirm(entry)}>Confirm</Button>
    </ListItem>
  )

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Processed Image Results
      </Typography>
      <Typography variant='subtitle1'>{processedData.type === 'invoice' ? 'Invoice' : 'Prescription'}</Typography>
      <List>
        {processedData.type === 'invoice'
          ? Object.entries(processedData).map((entry, index) => renderInvoiceEntry(entry, index))
          : Object.entries(processedData).map((entry, index) => renderPrescriptionEntry(entry, index))}
      </List>
      <Modal open={!!editingEntry} onClose={() => setEditingEntry(null)}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <ControlledDrugEntryForm initialData={editingEntry} onSubmit={handleEditSubmit} registers={registers} />
        </Paper>
      </Modal>
    </Box>
  )
}

export default ImageProcessingResults
