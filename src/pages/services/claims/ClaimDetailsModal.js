import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Divider } from '@mui/material'
import { format } from 'date-fns'

const ClaimDetailsModal = ({ open, onClose, claim }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{claim.submitted ? 'Claim Details' : 'Service Delivery Details'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>ID:</Typography>
            <Typography variant='body1'>{claim.id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>Service:</Typography>
            <Typography variant='body1'>{claim.service_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>Completion Date:</Typography>
            <Typography variant='body1'>{format(new Date(claim.completed_at), 'PPP')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>Status:</Typography>
            <Typography variant='body1'>{claim.submitted ? 'Submitted' : 'Pending'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='h6'>Patient Information</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>Name:</Typography>
            <Typography variant='body1'>{claim.patient_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1'>NHS Number:</Typography>
            <Typography variant='body1'>{claim.patient_nhs_number}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='h6'>Service Details</Typography>
          </Grid>
          {/* Add more service-specific details here */}
          {claim.submitted && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h6'>Claim Submission Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle1'>Submission Date:</Typography>
                <Typography variant='body1'>{format(new Date(claim.submitted_at), 'PPP')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle1'>Claim Status:</Typography>
                <Typography variant='body1'>{claim.claim_status}</Typography>
              </Grid>
              {/* Add more claim-specific details here */}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
        {claim.submitted && (
          <Button
            color='primary'
            onClick={() => {
              /* Handle amend action */
            }}
          >
            Amend Claim
          </Button>
        )}
        {!claim.submitted && (
          <Button
            color='primary'
            onClick={() => {
              /* Handle submit action */
            }}
          >
            Submit Claim
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ClaimDetailsModal
