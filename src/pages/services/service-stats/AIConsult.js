import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle,
  Fade,
  Switch
} from '@mui/material'
import { debounce } from 'lodash'
import { supabaseOrg as supabase, supabaseKey } from '../../../configs/supabase'
import ShinglesPGD from '../../../views/apps/Calendar/services/pgds/ShinglesPGD'
import systemPrompt from '../../../views/apps/Calendar/services/pgds/SystemMessage'
import ChatbotInterface from './ConsultChatBot'
// import { createSimulationThread, addMessageToThread, runSimulationAssistantStream } from '../../../configs/openai'

const systemMessage = `
${systemPrompt}
Here is the PGD to use for this consultations ${ShinglesPGD}
`

const chatbotSystemMessage = `
you are to answer the clinicians quesitons based on NHS guideline provide reference and wheever possible please reference this PGD
${ShinglesPGD}
`

const sectionColors = {
  'Diagnostic Questions': 'info',
  Recommendation: 'success',
  'Red Flags': 'error',
  'Treatment Suggestions': 'warning'
}

function RecommendationSection({ title, data }) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null

  return (
    <Alert severity={sectionColors[title]} sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {Array.isArray(data) ? (
        <List dense>
          {data.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText
                primary={item.question || item.flag || item.suggestion}
                secondary={
                  <>
                    <Typography component='span' variant='body2' color='text.primary'>
                      Rationale: {item.rationale}
                    </Typography>
                    {item.reference && (
                      <Typography component='span' variant='body2' display='block'>
                        Reference: {item.reference}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant='body1'>{data.action}</Typography>
          <Typography variant='body2'>Rationale: {data.rationale}</Typography>
          {data.reference && <Typography variant='body2'>Reference: {data.reference}</Typography>}
        </Box>
      )}
    </Alert>
  )
}

const assistant_id = 'asst_02ZLMhafb3fq0El8oEFXHFsA'

export default function ClinicalNotesComponent({
  patientInfo,
  notes,
  setNotes,
  recommendation,
  setRecommendation,
  conversationHistory,
  setConversationHistory,
  chatBotMessages,
  setChatBotMessages,
  currentThread,
  setCurrentThread
}) {
  // const [notes, setNotes] = useState('')
  // const [recommendation, setRecommendation] = useState(null)
  // const [conversationHistory, setConversationHistory] = useState([])
  // const [chatBotMessages, setChatBotMessages] = useState([])

  const [isLoading, setIsLoading] = useState(false)
  const [isChatbotMode, setIsChatbotMode] = useState(false)
  const [partialResponse, setPartialResponse] = useState('')
  const [streamingResponse, setStreamingResponse] = useState([])
  const fetchTimeoutRef = useRef(null)

  const createAndSetThread = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('assistants', {
        body: { action: 'createSimulationThread', params: {} }
      })
      if (error) throw error
      setCurrentThread(data.result)
      console.log('ai consult thread creation', data.result)
    } catch (error) {
      console.error('Error creating thread:', error)
    }
    setIsLoading(false)
  }
  console.log('CURENT THREA', currentThread?.id)
  useEffect(() => {
    if (!currentThread) {
      createAndSetThread()
    }
  }, [currentThread])

  const fetchRecommendation = async (notes, history) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('aiconsult', {
        body: {
          systemMessage,
          conversationHistory: history,
          clinicianNotes: notes,
          patientInfo,
          useJsonFormat: true
        }
      })

      if (error) throw error

      setRecommendation(data.recommendation)
      setConversationHistory(data.updatedHistory.slice(-10))
    } catch (error) {
      console.error('Error fetching recommendation:', error)
      setRecommendation(null)
    }
    setIsLoading(false)
  }

  const debouncedFetchRecommendation = useCallback((notes, history) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchRecommendation(notes, history)
    }, 300)
  }, [])

  const handleNotesChange = useCallback(
    async event => {
      const newValue = event.target.value
      setNotes(newValue)
      if (event.nativeEvent.inputType === 'insertLineBreak') {
        console.log('[Client] Enter key pressed, currentThread:', currentThread)

        try {
          console.log('[Client] Adding message to thread')
          await supabase.functions.invoke('assistants', {
            body: {
              action: 'addMessageToThread',
              params: { threadId: currentThread.id, message: notes }
            }
          })
          console.log('[Client] Message added to thread')

          setStreamingResponse([]) // Reset streaming response
          console.log('[Client] Invoking runSimulationAssistantStream')

          const response = await fetch('https://xsqwpmqfbirqdncoephf.supabase.co/functions/v1/assistants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              action: 'runSimulationAssistantStream',
              params: { threadId: currentThread.id, assistantId: assistant_id }
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          try {
            console.log('[Client] Starting to read stream')
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                console.log('[Client] Stream reading complete')
                break
              }

              const chunk = decoder.decode(value)
              console.log('[Client] Decoded chunk:', chunk)
              const lines = chunk.split('\n\n')
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.slice(5))
                    console.log('[Client] Parsed data:', eventData)
                    if (eventData.content) {
                      console.log('[Client] Updating streaming response with:', eventData.content)
                      setStreamingResponse(prev => [...prev, eventData.content])
                    } else if (eventData.event === 'completed' || eventData.event === 'done') {
                      console.log('[Client] Stream event:', eventData.event)
                      // Handle completion if needed
                    }
                  } catch (e) {
                    console.error('[Client] Error parsing JSON:', e)
                  }
                }
              }
            }
          } catch (error) {
            console.error('[Client] Error reading stream:', error)
          } finally {
            console.log('[Client] Releasing reader lock')
            reader.releaseLock()
          }
        } catch (error) {
          console.error('[Client] Uncaught error:', error)
        }
      }
    },
    [currentThread, notes]
  )
  console.log('CHATBOT MESSAGES', chatBotMessages)

  return (
    <Box sx={{ display: 'flex', height: '100vh', p: 2 }}>
      <Paper elevation={3} sx={{ flex: 1, mr: 1, p: 2, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>{isChatbotMode ? 'Chatbot' : 'Clinical Notes'}</Typography>
          <Switch
            checked={isChatbotMode}
            onChange={() => setIsChatbotMode(!isChatbotMode)}
            inputProps={{ 'aria-label': 'toggle chatbot mode' }}
          />
        </Box>
        {isChatbotMode ? (
          <ChatbotInterface
            systemMessage={chatbotSystemMessage}
            patientInfo={patientInfo}
            messages={chatBotMessages}
            setMessages={setChatBotMessages}
          />
        ) : (
          <TextField
            fullWidth
            multiline
            sx={{
              height: '90%',
              '& .MuiInputBase-root': {
                height: '100%'
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflowY: 'auto'
              }
            }}
            variant='outlined'
            value={notes}
            onChange={handleNotesChange}
            placeholder='Enter your clinical notes here... Press Enter for new recommendations.'
          />
        )}
      </Paper>
      <Paper elevation={3} sx={{ flex: 1, ml: 1, p: 2, overflowY: 'auto', position: 'relative' }}>
        <Typography variant='h6' gutterBottom>
          AI Recommendations
        </Typography>
        {isLoading && (
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {recommendation ? (
          <Fade in={true} timeout={500} key={JSON.stringify(recommendation)}>
            <Box>
              <RecommendationSection title='Diagnostic Questions' data={recommendation.diagnostic_questions} />
              <RecommendationSection title='Recommendation' data={recommendation.recommendation} />
              <RecommendationSection title='Red Flags' data={recommendation.red_flags} />
              <RecommendationSection title='Treatment Suggestions' data={recommendation.treatment_suggestions} />
            </Box>
          </Fade>
        ) : (
          <Typography>
            {/* No recommendations available. Start typing clinical notes and press Enter for AI assistance. */}
            {streamingResponse.join('')}
          </Typography>
        )}
        {partialResponse ? <Typography>partialResponse</Typography> : null}
      </Paper>
    </Box>
  )
}
