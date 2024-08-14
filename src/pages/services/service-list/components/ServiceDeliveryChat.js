import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import {
  appendMessageToThread,
  createThreadAndSendSMS
} from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { List, ListItem, Divider, TextField, Button, Typography, Box, CircularProgress } from '@mui/material'
import Swal from 'sweetalert2'

function ServiceDeliveryChat({ appointment }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()

  const [thread_id, setThreadId] = useState(null)

  const fetchThreadId = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('sms_threads').select('id').eq('appointment_id', appointment.id)

      if (error) throw error
      if (data) {
        console.log('data', data)
        setThreadId(data[0]?.id)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching thread ID:', error)
      setError(error)
      setLoading(false)
    }
  }, [appointment.id])

  const fetchMessages = useCallback(async () => {
    if (!thread_id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('thread_id', thread_id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [thread_id])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setSendingMessage(true)
      let response

      if (!thread_id) {
        response = await dispatch(
          createThreadAndSendSMS({
            patientId: appointment.patient_id,
            patientName: appointment.patient_object.full_name,
            message: newMessage,
            phoneNumber: appointment.patient_object.mobile_number,
            appointmentId: appointment.id,
            time: appointment.scheduled_time
          })
        )
        setThreadId(response.payload.id)
      } else {
        response = await dispatch(appendMessageToThread({ threadId: thread_id, message: newMessage }))
      }

      if (response.error) throw new Error(response.error.message)

      setNewMessage('')
      await fetchMessages() // Refresh messages list
      Swal.fire({
        icon: 'success',
        title: 'Message sent successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } catch (error) {
      console.error('Error sending message:', error)
      Swal.fire({
        icon: 'error',
        title: 'Failed to send message',
        text: error.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      })
    } finally {
      setSendingMessage(false)
    }
  }

  useEffect(() => {
    fetchThreadId()
  }, [fetchThreadId])

  useEffect(() => {
    if (thread_id) {
      fetchMessages()
    }
  }, [thread_id, fetchMessages])

  return (
    <Box sx={{ width: '100%', maxWidth: '600px', margin: 'auto' }}>
      {loading && <CircularProgress />}
      {error && <Typography color='error'>Error: {error.message}</Typography>}
      <List sx={{ height: '300px', overflow: 'auto', mb: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems='flex-start'>
                <Box sx={{ wordBreak: 'break-word', width: '100%' }}>
                  <Typography variant='body1' sx={{ m: 0 }}>
                    {message.message}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Sent: {new Date(message.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <Typography color='text.secondary'>No messages sent yet. Start the conversation!</Typography>
          </ListItem>
        )}
      </List>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Type a message to send to the patient'
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
          disabled={sendingMessage}
          sx={{ mr: 1 }}
        />
        <Button variant='contained' color='primary' onClick={handleSendMessage} disabled={sendingMessage}>
          {sendingMessage ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Box>
  )
}

export default ServiceDeliveryChat
