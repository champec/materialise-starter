import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Box, TextField, Button } from '@mui/material'
import { sendEmailThunk } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { useDispatch } from 'react-redux'

function TestEmailSend() {
  const [toAddress, setToAddress] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [emailStatus, setEmailStatus] = useState('')
  const dispatch = useDispatch()

  const handleSendEmail = () => {
    dispatch(
      sendEmailThunk({
        toAddress,
        subject,
        content
      })
    )
      .unwrap()
      .then(result => {
        console.log('Email send result:', result)
      })
      .catch(error => {
        console.error('Error sending email:', error)
      })
  }

  return (
    <Box>
      <TextField
        label='To Address'
        value={toAddress}
        onChange={e => setToAddress(e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField label='Subject' value={subject} onChange={e => setSubject(e.target.value)} fullWidth margin='normal' />
      <TextField
        label='Content'
        value={content}
        onChange={e => setContent(e.target.value)}
        fullWidth
        margin='normal'
        multiline
        rows={4}
      />
      <Button variant='contained' color='primary' onClick={handleSendEmail}>
        Send Email
      </Button>
      {emailStatus && <p>{emailStatus}</p>}
    </Box>
  )
}

export default TestEmailSend
