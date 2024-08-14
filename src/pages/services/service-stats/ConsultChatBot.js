import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export default function ChatbotInterface({ systemMessage, patientInfo, messages, setMessages }) {
  const [input, setInput] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const messagesContainerRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true)
      const newMessages = [...messages, { role: 'user', content: input }]
      setMessages(newMessages)
      setInput('')

      try {
        const { data, error } = await supabase.functions.invoke('aiconsult', {
          body: {
            systemMessage,
            patientInfo,
            conversationHistory: newMessages.slice(-9),
            clinicianNotes: input,
            useJsonFormat: false
          }
        })

        console.log('DATA', data)
        if (error) throw error

        setMessages(prev => [...prev, { role: 'assistant', content: data.recommendation }].slice(-10))
      } catch (error) {
        console.error('Error in chatbot:', error)
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }].slice(-10))
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Paper elevation={3} sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse' // This helps with scrolling
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={msg.role === 'user' ? 'You' : 'AI'}
                secondary={
                  <Typography
                    component='span'
                    variant='body2'
                    sx={{
                      whiteSpace: 'pre-wrap', // Preserves line breaks
                      wordBreak: 'break-word' // Prevents overflow
                    }}
                  >
                    {msg.content}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          size='small'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder='Type your message here...'
          variant='outlined'
          disabled={isLoading}
          multiline
          maxRows={3}
        />
        <Button onClick={handleSend} variant='contained' sx={{ ml: 1 }} disabled={isLoading}>
          Send
        </Button>
        {isLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
      </Box>
    </Paper>
  )
}
