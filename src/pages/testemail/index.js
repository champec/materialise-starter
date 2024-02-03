import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { sendEmailThunk } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { TextField, Button, Snackbar, Alert } from '@mui/material'


const EmailForm = () => {
  const dispatch = useDispatch()
  const [toAddress, setToAddress] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const response = await dispatch(sendEmailThunk({ toAddress, subject, content })).unwrap()
      setSnackbarMessage(response || 'Email sent successfully!')
      setSnackbarSeverity('success')
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to send email.')
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}
      >
        <TextField
          label='To'
          variant='outlined'
          value={toAddress}
          onChange={e => setToAddress(e.target.value)}
          required
        />
        <TextField
          label='Subject'
          variant='outlined'
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
        <TextField
          label='Content'
          variant='outlined'
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          multiline
          rows={4}
        />
        <Button type='submit' variant='contained' color='primary'>
          Send Email
        </Button>
      </form>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default EmailForm
