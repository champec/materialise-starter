import React, { useState } from 'react'
import { Box, Typography, Paper, Chip, Alert, AlertTitle } from '@mui/material'
import IconifyIcon from 'src/@core/components/icon'

const GPPreview = ({ gp, onEdit, setSelectedGP, setGPInputValue }) => {
  const [openAlert, setOpenAlert] = useState(false)

  const handleRemoveClick = () => {
    setOpenAlert(true)
  }

  const handleConfirmRemove = () => {
    setOpenAlert(false)
    setSelectedGP(null)
    setGPInputValue('')
    // Add remove logic here
  }

  const handleCancelRemove = () => {
    setOpenAlert(false)
  }

  const getSourceChip = () => {
    if (gp?.source === 'PdsLink') {
      return <Chip label='NHS PDS' color='primary' size='small' />
    } else {
      return <Chip label='Search' color='secondary' size='small' />
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
          {gp.OrganisationName}
        </Typography>
        {getSourceChip()}
      </Box>
      <Typography variant='body2'>{gp.Address1}</Typography>
      <Typography variant='body2'>
        {gp.City}, {gp.Postcode}
      </Typography>
      <Chip label={`ODS: ${gp.ODSCode}`} size='small' sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, alignItems: 'center' }}>
        <Typography
          variant='body2'
          sx={{
            display: gp.source === 'PdsLink' ? 'none' : 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
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
            cursor: gp.source === 'PdsLink' ? 'not-allowed' : 'pointer',
            color: gp.source === 'PdsLink' ? 'text.disabled' : 'error.main',
            ml: 2,
            '&:hover': { textDecoration: gp.source === 'PdsLink' ? 'none' : 'underline' }
          }}
          onClick={gp.source !== 'PdsLink' ? handleRemoveClick : undefined}
        >
          <IconifyIcon icon='ri:delete-bin-6-line' style={{ marginRight: 4 }} />
          {gp.source === 'PdsLink' ? 'Linked' : 'Remove'}
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

export default GPPreview
