import React, { useState } from 'react'
import { Box, Typography, Paper, Chip, Alert, AlertTitle } from '@mui/material'

import IconifyIcon from 'src/@core/components/icon'
import { format } from 'date-fns'

const formatDate = dateString => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

const PatientPreview = ({ patient, onEdit, setSelectedPatient, setPatientInputValue }) => {
  const [openAlert, setOpenAlert] = useState(false)

  const handleRemoveClick = () => {
    setOpenAlert(true)
  }

  const handleConfirmRemove = () => {
    setOpenAlert(false)
    setSelectedPatient(null)
    setPatientInputValue('')
    // Add remove logic here
  }

  const handleCancelRemove = () => {
    setOpenAlert(false)
  }

  const getSourceChip = () => {
    if (patient?.source === 'pds') {
      return <Chip label='NHS PDS' color='primary' size='small' />
    } else if (patient?.id) {
      return <Chip label='Database' color='secondary' size='small' />
    } else {
      return <Chip label='Manual' color='default' size='small' />
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: 'warning' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
          {patient.first_name} {patient?.middle_name} {patient.last_name}
        </Typography>
        {getSourceChip()}
      </Box>
      <Typography variant='body2'>{patient.address}</Typography>
      <Typography variant='body2'>{patient.post_code}</Typography>
      <Typography variant='body2'>DOB: {formatDate(patient.dob)}</Typography>
      <Chip label={`NHS: ${patient.nhs_number}`} size='small' sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, alignItems: 'center' }}>
        <Typography
          variant='body2'
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={onEdit}
        >
          <IconifyIcon icon='ri:edit-box-line' style={{ marginRight: 4 }} />
          Edit
        </Typography>
        <Typography
          variant='body2'
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'error.main',
            ml: 2,
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={handleRemoveClick}
        >
          <IconifyIcon icon='ri:delete-bin-6-line' style={{ marginRight: 4 }} />
          Remove
        </Typography>
      </Box>
      {openAlert && (
        <Alert severity='warning'>
          <AlertTitle>Are you sure?</AlertTitle>
          This action cannot be undone.
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography
              variant='body2'
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'error.main',
                mr: 2,
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={handleConfirmRemove}
            >
              <IconifyIcon icon='ri:check-line' style={{ marginRight: 4 }} />
              Confirm
            </Typography>
            <Typography
              variant='body2'
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'inherit',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={handleCancelRemove}
            >
              <IconifyIcon icon='jam:stop-sign' style={{ marginRight: 4 }} />
              Cancel
            </Typography>
          </Box>
        </Alert>
      )}
    </Paper>
  )
}

export default PatientPreview
