import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from 'src/configs/supabase'
import { appendMessageToThread } from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { List, ListItem, Divider, TextField, Button } from '@mui/material'

function AppointMentChat({ appointment }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()

  const thread_id = appointment.sms_threads[0]?.id

  console.log(thread_id, 'thread_id')

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('thread_id', thread_id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setLoading(true)
      const response = await dispatch(appendMessageToThread({ threadId: thread_id, message: newMessage }))

      const message = response.payload[0]
      setMessages([...messages, message])
      console.log(message)
      setNewMessage('')
      fetchMessages() // Refresh messages list
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (thread_id) {
      fetchMessages()
    }
  }, [thread_id])

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <List style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '20px' }}>
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <ListItem alignItems='flex-start'>
              <div style={{ wordBreak: 'break-word' }}>
                <p style={{ margin: 0 }}>{message.message}</p>
                <small style={{ color: 'gray' }}>{new Date(message.created_at).toLocaleString()}</small>
              </div>
            </ListItem>
            {index < messages.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Type a message'
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          style={{ marginRight: '10px' }}
        />
        <Button variant='contained' color='primary' onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </div>
  )
}

export default AppointMentChat
