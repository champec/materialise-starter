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
import { supabaseOrg as supabase } from 'src/configs/supabase'
import ShinglesPGD from '../../../views/apps/Calendar/services/pgds/ShinglesPGD'
import systemPrompt from '../../../views/apps/Calendar/services/pgds/SystemMessage'
import ChatbotInterface from './ConsultChatBot'

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

export default function ClinicalNotesComponent({ patientInfo }) {
  const [notes, setNotes] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isChatbotMode, setIsChatbotMode] = useState(false)
  const [chatBotMessages, setChatBotMessages] = useState([])
  const fetchTimeoutRef = useRef(null)

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
    event => {
      const newValue = event.target.value
      setNotes(newValue)
      if (event.nativeEvent.inputType === 'insertLineBreak') {
        debouncedFetchRecommendation(newValue, conversationHistory)
      }
    },
    [conversationHistory, debouncedFetchRecommendation]
  )

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
            rows={20}
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
            No recommendations available. Start typing clinical notes and press Enter for AI assistance.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
