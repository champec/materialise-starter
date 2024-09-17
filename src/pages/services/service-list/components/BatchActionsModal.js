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
  StepLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { useDispatch } from 'react-redux'
import {
  submitClaim,
  updateAppointmentStatus,
  cancelAppointment,
  fetchAppointments,
  appendMessageToThread
} from '../../../../store/apps/pharmacy-services/pharmacyServicesThunks'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const BatchActionsModal = ({ open, onClose, selectedAppointmentIds, appointments, action }) => {
  const dispatch = useDispatch()
  const [activeStep, setActiveStep] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [currentAppointmentIndex, setCurrentAppointmentIndex] = useState(0)
  const [sendTextMessage, setSendTextMessage] = useState(true)

  const steps = ['Confirm Action', 'Processing', 'Results']

  const getActionConfig = () => {
    switch (action) {
      case 'submitClaim':
        return {
          title: 'Submit Claims',
          confirmMessage: `You are about to submit claims for ${selectedAppointmentIds.length} selected appointments.`,
          processAction: submitClaim,
          successMessage: 'Claim submitted successfully',
          filter: app => app.overall_status === 'Completed'
        }
      case 'updateStatus':
        return {
          title: 'Update Status',
          confirmMessage: `You are about to update the status of ${selectedAppointmentIds.length} selected appointments.`,
          processAction: updateAppointmentStatus,
          successMessage: 'Status updated successfully',
          filter: () => true
        }
      case 'cancelAppointments':
        return {
          title: 'Cancel Appointments',
          confirmMessage: `You are about to cancel ${selectedAppointmentIds.length} selected appointments.`,
          processAction: cancelAppointment,
          successMessage: 'Appointment cancelled successfully',
          message: 'Your appointment has been cancelled',
          filter: app => app.overall_status !== 'Cancelled'
        }
      default:
        return null
    }
  }

  const actionConfig = getActionConfig()

  const handleConfirm = () => {
    setActiveStep(1)
    setProcessing(true)
    setResults([])
    setCurrentAppointmentIndex(0)
    processBatchAction()
  }

  const processBatchAction = async () => {
    const eligibleAppointments = appointments.filter(
      app => selectedAppointmentIds.includes(app.id) && actionConfig.filter(app)
    )

    for (const appointment of eligibleAppointments) {
      try {
        await dispatch(actionConfig.processAction(appointment.id)).unwrap()
        let textResult = null
        if (sendTextMessage && action === 'cancelAppointments') {
          textResult = await sendTextMessageForAppointment(appointment)
        }
        setResults(prev => [
          ...prev,
          {
            id: appointment.id,
            status: 'success',
            textResult: textResult
          }
        ])
      } catch (error) {
        setResults(prev => [...prev, { id: appointment.id, status: 'error', message: error.message }])
      }

      setCurrentAppointmentIndex(prevIndex => prevIndex + 1)
    }

    await dispatch(fetchAppointments())
    setProcessing(false)
    setActiveStep(2)
  }

  const sendTextMessageForAppointment = async appointment => {
    try {
      const { data } = await supabase.from('sms_threads').select('*').eq('appointment_id', appointment.id).maybeSingle()

      if (appointment.patient_object?.mobile_number && data) {
        await dispatch(appendMessageToThread({ threadId: data.id, message: actionConfig.message }))
        return 'Text sent successfully'
      } else {
        return 'No phone number or messages not set up'
      }
    } catch (error) {
      console.error('Error sending text message:', error)
      return 'Failed to send text message'
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setResults([])
    setCurrentAppointmentIndex(0)
    setSendTextMessage(true)
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
        {activeStep === 0 && (
          <>
            <Typography sx={{ mt: 2 }}>{actionConfig?.confirmMessage}</Typography>
            {action === 'cancelAppointments' && (
              <FormControlLabel
                control={<Checkbox checked={sendTextMessage} onChange={e => setSendTextMessage(e.target.checked)} />}
                label='Send text message to patients'
              />
            )}
          </>
        )}
        {activeStep === 1 && (
          <>
            <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 2 }} />
            <Typography sx={{ mt: 2 }}>
              Processing appointment {currentAppointmentIndex + 1} of {selectedAppointmentIds.length}
            </Typography>
          </>
        )}
        {activeStep === 2 && (
          <List>
            {results.map(result => (
              <ListItem key={result.id}>
                <ListItemText
                  primary={`Appointment ID: ${result.id}`}
                  secondary={
                    <>
                      <Typography component='span' display='block'>
                        {result.status === 'success' ? actionConfig.successMessage : `Error: ${result.message}`}
                      </Typography>
                      {result.textResult && (
                        <Typography component='span' display='block'>
                          Text message: {result.textResult}
                        </Typography>
                      )}
                    </>
                  }
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
