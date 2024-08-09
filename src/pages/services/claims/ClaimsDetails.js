import React, { useState } from 'react'
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { format } from 'date-fns'

const ClaimDetails = ({ claim, onAmend }) => {
  const [isAmendDialogOpen, setIsAmendDialogOpen] = useState(false)
  const [amendedData, setAmendedData] = useState({})

  const handleAmendClick = () => {
    setIsAmendDialogOpen(true)
  }

  const handleAmendSubmit = () => {
    onAmend(claim.id, amendedData)
    setIsAmendDialogOpen(false)
  }

  return (
    <Box>
      <Typography variant='h6'>Claim Details</Typography>
      <Typography>Claim ID: {claim.id}</Typography>
      <Typography>Service: {claim.service_id}</Typography>
      <Typography>Status: {claim.status}</Typography>
      <Typography>Submitted: {format(new Date(claim.created_at), 'PPP')}</Typography>
      <Button variant='contained' color='primary' onClick={handleAmendClick}>
        Amend Claim
      </Button>

      <Dialog open={isAmendDialogOpen} onClose={() => setIsAmendDialogOpen(false)}>
        <DialogTitle>Amend Claim</DialogTitle>
        <DialogContent>{/* Add form fields for amending claim data */}</DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAmendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAmendSubmit} color='primary'>
            Submit Amendment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ClaimDetails
