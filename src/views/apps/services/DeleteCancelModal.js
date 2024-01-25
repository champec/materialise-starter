import React, { useState } from 'react'
import { useDispatch } from 'react-redux' // Assuming you are using redux
import { Modal, Button, Typography, TextField, Box, Card, CardContent, Divider } from '@mui/material'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { deleteBooking } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import { appendMessageToThread } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'

const DeleteCancelModal = ({ open, onClose, consultations }) => {
  const dispatch = useDispatch()
  const organisation = useSelector(state => state.organisation?.organisation)
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState(
    `Dear {patient_name}, your appointment on {appointment_date} has been cancelled. Please do not attend until notified otherwise. If any questions, please contact the pharmacy. 
    
    ${organisation?.organisation_name}, ${organisation?.profiles?.phone_number}
    `
  )

  console.log('consultations', consultations[0]?.sms_threads[0])

  const formatMessage = consultation => {
    let formattedMessage = message
    const patientName = consultation.patient_object?.full_name
    const appointmentDate = dayjs(consultation.calendar_events?.start).format('DD/MM/YYYY HH:mm')
    formattedMessage = formattedMessage.replace('{patient_name}', patientName)
    formattedMessage = formattedMessage.replace('{appointment_date}', appointmentDate)
    return formattedMessage
  }

  const handleCancel = () => {
    onClose() // Close the modal
    setStep(1) // Reset to initial step
  }

  const handleDeleteConfirm = () => {
    if (step === 1) {
      // Move to next step (send message or not)
      setStep(2)
    } else {
      // Perform delete action
      consultations.forEach(consultation => {
        dispatch(deleteBooking(consultation?.sms_threads[0]?.id))
        if (step === 3) {
          const customMessage = formatMessage(consultation)
          dispatch(appendMessageToThread({ threadId: consultation.patientId, message: customMessage }))
        }
      })
      onClose()
      setStep(1)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            <Typography>
              Are you sure you want to cancel this appointment{consultations.length > 1 && 's'}? You will not be able to
              undo this action.
            </Typography>
            <Typography sx={{ marginTop: 1, fontWeight: 'bold' }}>
              {`You are cancelling ${consultations.length} appointment${consultations.length > 1 ? 's' : ''} `}
            </Typography>
            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
            {/* create a scrollable list with limited height showing the appointments scheduled for cancelation, show the numbers next tot the appoint and subtext of appointment time  */}
            <Box sx={{ maxHeight: 200, overflowY: 'scroll', marginTop: 1, padding: 2, marginBottom: 2 }}>
              {consultations.map((consultation, index) => {
                const formattedDate = dayjs(consultation?.calendar_events?.start).format('DD/MM/YYYY HH:mm')
                return (
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignContent: 'center'
                    }}
                    key={consultation.id}
                  >
                    <Typography>{index + 1 + '.'}</Typography>
                    <Typography>{consultation?.patient_object?.full_name}</Typography>
                    <Typography variant='caption'>{formattedDate}</Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )
      case 2:
        return (
          <div>
            <Typography>Do you want to send a text to the patient(s) about the cancellation?</Typography>
            <Button onClick={() => setStep(3)}>Yes</Button>
            <Button onClick={handleDeleteConfirm}>No</Button>
          </div>
        )
      case 3:
        return <TextField multiline rows={7} value={message} onChange={e => setMessage(e.target.value)} fullWidth />
      case 4:
        return <Typography>Appointment{consultations.length > 1 && 's'} cancelled successfully.</Typography>

      default:
        return null
    }
  }

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <Card
          sx={{
            width: '50%',
            height: '50%',
            margin: 'auto',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <CardContent>
            <Typography variant='h6' sx={{ marginBottom: 2 }}>
              Cancel Appointment
            </Typography>
            {renderStepContent()}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 2,
                marginBottom: 2
              }}
            >
              <Button sx={{ marginRight: 1 }} onClick={handleCancel} variant='outlined'>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} color='primary' variant='contained'>
                {step === 3 ? 'Confirm' : 'Yes'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  )
}

export default DeleteCancelModal
