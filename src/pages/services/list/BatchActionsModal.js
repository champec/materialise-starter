import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Alert,
  CircularProgress,
  TextField,
  LinearProgress,
  Typography
} from '@mui/material'
import { supabase } from 'src/configs/supabase'
import { useDispatch } from 'react-redux'
import { appendMessageToThread } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { updateEvent } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import { updateBooking } from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'

function BatchActionsModal({ open, onClose, selectedRows, currentAction, setCurrentAction }) {
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [batchErrors, setBatchErrors] = useState([])
  const [completedActions, setCompletedActions] = useState(0)
  const [progress, setProgress] = useState({ value: 0, text: '' })
  const dispatch = useDispatch()

  // Update feedback message based on completed actions and errors
  useEffect(() => {
    if (loading) return
    if (batchErrors.length > 0) {
      setFeedbackMessage(`Completed ${completedActions} actions with ${batchErrors.length} errors.`)
    } else {
      setFeedbackMessage(`Action '${currentAction}' executed successfully for ${completedActions} patients.`)
    }
  }, [loading, completedActions, batchErrors, currentAction])

  const executeBatchAction = async actionFunction => {
    setLoading(true)
    setCompletedActions(0)
    setBatchErrors([])
    setProgress({ value: 0, text: 'Starting...' })

    const results = await Promise.allSettled(
      selectedRows.map(async (row, index) => {
        console.log('Running PRomise action for row', row)
        const result = await actionFunction(row)
        const newText = `Completed ${index + 1} of ${selectedRows.length}`
        setProgress({ value: ((index + 1) / selectedRows.length) * 100, text: newText })
        return result
      })
    )

    const errors = results.filter(result => result.status === 'rejected').map(result => result.reason.message)
    setBatchErrors(errors)
    setCompletedActions(results.length - errors.length)
    setLoading(false)
  }

  const sendBatchSms = async row => {
    const thread_id = row.sms_threads[0]?.id
    console.log('running sendBatchSms for row', row.id, 'thread_id', thread_id)
    if (!thread_id) throw new Error(`No thread id for ${row.id}`)
    const response = await dispatch(appendMessageToThread({ threadId: thread_id, message: newMessage }))
    return response.payload[0] // Assuming this is the success response
  }

  const batchCancelAppointment = async row => {
    const bookingId = row.id
    const booking = { status: 2 }
    return await dispatch(updateBooking({ booking: booking, id: bookingId }))
  }

  const handleSendMessage = () => {
    executeBatchAction(sendBatchSms)
  }

  const confirmAction = () => {
    if (currentAction === 'Cancel') {
      executeBatchAction(batchCancelAppointment)
    } else if (currentAction === 'Message') {
      console.log('Sending message from confirmActions function')
      executeBatchAction(sendBatchSms)
    }
    // Add other action cases here
  }

  const closeDialog = () => {
    onClose()
    setCurrentAction('')
  }

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          {currentAction} for {selectedRows.length} patients
        </DialogTitle>
        <DialogActions>
          {currentAction === 'Message' && (
            <>
              <TextField
                multiline
                rows={4}
                variant='outlined'
                fullWidth
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder='Type your message here'
              />
              <Button onClick={handleSendMessage} color='primary'>
                Send
              </Button>
            </>
          )}
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={confirmAction} color='primary' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : currentAction === 'Message' ? 'Send Message' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {true && (
        <>
          <LinearProgress variant='determinate' value={progress.value} />
          <Typography variant='body2' style={{ marginTop: 10 }}>
            {progress.text}
          </Typography>
        </>
      )}

      {/* Feedback Alert */}
      {feedbackMessage && <Alert severity={batchErrors.length > 0 ? 'error' : 'success'}>{feedbackMessage}</Alert>}
    </div>
  )
}

export default BatchActionsModal
