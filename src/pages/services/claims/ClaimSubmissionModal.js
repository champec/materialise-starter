import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  CircularProgress
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { sendClaim } from '../../../store/apps/claims/claimsSlice'

const ClaimSubmissionModal = ({ open, onClose, claims }) => {
  const dispatch = useDispatch()
  const [selectedClaims, setSelectedClaims] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const submissionError = useSelector(state => state.claims.submissionError)

  const handleToggleClaim = claimId => {
    setSelectedClaims(prevSelected =>
      prevSelected.includes(claimId) ? prevSelected.filter(id => id !== claimId) : [...prevSelected, claimId]
    )
  }

  const handleSubmitClaims = async () => {
    setSubmitting(true)
    try {
      for (const claimId of selectedClaims) {
        await dispatch(sendClaim(claimId)).unwrap()
      }
      onClose()
    } catch (error) {
      console.error('Error submitting claims:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Submit Claims</DialogTitle>
      <DialogContent>
        {claims.length === 0 ? (
          <Typography>No pending claims to submit.</Typography>
        ) : (
          <>
            <Typography gutterBottom>Select the claims you want to submit:</Typography>
            <List>
              {claims.map(claim => (
                <ListItem key={claim.id} dense button onClick={() => handleToggleClaim(claim.id)}>
                  <Checkbox edge='start' checked={selectedClaims.includes(claim.id)} tabIndex={-1} disableRipple />
                  <ListItemText
                    primary={`Claim ID: ${claim.id}`}
                    secondary={`Service: ${claim.service_id} | Date: ${new Date(
                      claim.completed_at
                    ).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        {submissionError && (
          <Typography color='error' gutterBottom>
            Error: {submissionError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleSubmitClaims} color='primary' disabled={selectedClaims.length === 0 || submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Submit Selected Claims'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ClaimSubmissionModal
