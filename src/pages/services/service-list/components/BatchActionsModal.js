import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import { useDispatch } from 'react-redux'
import { submitClaim, updateAppointmentStatus } from 'src/store/apps/pharmacy-services/pharmacyServicesThunks'

const BatchActionsModal = ({ open, onClose, selectedAppointments, appointments, action }) => {
  const dispatch = useDispatch()
  const [activeStep, setActiveStep] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])

  const steps = ['Confirm Action', 'Processing', 'Results']

  console.log('selected appointments', selectedAppointments)

  const getActionConfig = () => {
    switch (action) {
      case 'submitClaim':
        return {
          title: 'Submit Claims',
          confirmMessage: `You are about to submit claims for ${selectedAppointments.length} selected appointments.`,
          processAction: submitClaim,
          successMessage: 'Claim submitted successfully',
          filter: app => app.overall_status === 'Completed'
        }
      case 'updateStatus':
        return {
          title: 'Update Status',
          confirmMessage: `You are about to update the status of ${selectedAppointments.length} selected appointments.`,
          processAction: updateAppointmentStatus,
          successMessage: 'Status updated successfully',
          filter: () => true // No filter, all selected appointments are eligible
        }
      // Add more cases for other batch actions here
      default:
        return null
    }
  }

  const actionConfig = getActionConfig()

  const handleConfirm = () => {
    setActiveStep(1)
    processBatchAction()
  }

  const processBatchAction = async () => {
    setProcessing(true)
    setResults([])

    const eligibleAppointments = appointments.filter(
      app => selectedAppointments.includes(app.id) && actionConfig.filter(app)
    )

    for (const appointment of eligibleAppointments) {
      try {
        await dispatch(actionConfig.processAction(appointment.id)).unwrap()
        setResults(prev => [...prev, { id: appointment.id, status: 'success' }])
      } catch (error) {
        setResults(prev => [...prev, { id: appointment.id, status: 'error', message: error.message }])
      }
    }

    setProcessing(false)
    setActiveStep(2)
  }

  const handleClose = () => {
    setActiveStep(0)
    setResults([])
    onClose()
  }

  if (!actionConfig) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{actionConfig.title}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && <Typography sx={{ mt: 2 }}>{actionConfig.confirmMessage}</Typography>}
        {activeStep === 1 && <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 2 }} />}
        {activeStep === 2 && (
          <List>
            {results.map(result => (
              <ListItem key={result.id}>
                <ListItemText
                  primary={`Appointment ID: ${result.id}`}
                  secondary={result.status === 'success' ? actionConfig.successMessage : `Error: ${result.message}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose} color='primary'>
              Cancel
            </Button>
            <Button onClick={handleConfirm} color='primary' variant='contained'>
              Confirm
            </Button>
          </>
        )}
        {activeStep === 2 && (
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BatchActionsModal
