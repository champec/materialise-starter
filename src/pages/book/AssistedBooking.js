import React, { useState, useEffect } from 'react'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

const steps = ['Choose Service Stage', 'Answer Triage Questions', 'Find a Pharmacy', 'Choose Booking Slot']

const systemMessages = {
  initial: `You are an AI assistant helping patients book medical appointments. 
    Your task is to guide the patient through the booking process, which includes:
    1. Identifying the appropriate service based on their symptoms
    2. Asking relevant triage questions
    3. Helping them find a pharmacy
    4. Assisting with slot selection and final booking details.
    
    Respond in JSON format with the following structure:
    {
      "message": "Your response to the patient",
      "booking_details": {
        "current_stage": "choose_service_stage" | "answer_triage_questions" | "find_a_pharmacy" | "choose_booking_slot" | "complete_booking",
        "choose_service_stage": {
          "stage_id": null | string,
          "identified_patient_need": null | string
        },
        "answer_triage_questions": {},
        "find_a_pharmacy": {
          "method": null | "location" | "postcode" | "ods",
          "postcode": null | string,
          "pharmacy_code": null | string
        },
        "choose_booking_slot": null,
        "complete_booking": {
          "first_name": null | string,
          "last_name": null | string,
          "gp_surgery": null | string
        }
      }
    }
    
    Start by asking about their symptoms or the service they're looking for.`,
  serviceSelection: `Based on the patient's description, identify the appropriate service from the following list:
    - UTI (ID: aa0bb38d-a436-4076-88e8-2b9caa704e47)
    - Otitis Media (ID: f0d678b9-e776-4e69-908f-a9db1634a9f5)
    - Acute Sinusitis (ID: eccd2387-75b9-4acb-802a-133e4d6c161b)
    - Acute Sore Throat (ID: 8c4420cd-2ffb-4ade-8281-7b4c730b0909)
    - Shingles (ID: 6b1611ef-134c-421f-a736-b7b8c0841515)
    - Impetigo (ID: 5957b831-163e-428e-9386-34b093bf0e2b)
    - Infected Insect Bites (ID: 89421045-4162-4b8d-937d-daddae7256c6)
    - Flu Vaccination (ID: 38d450b9-24c3-46fa-a64f-a0a57526a16f)
    - Blood Pressure Check (ID: 705e97e4-8f2d-420d-b990-cb7bf01a400f)
    
    Update the booking_details.choose_service_stage object with the appropriate stage_id and identified_patient_need.`,
  triageQuestions: `Ask the triage questions for the selected service one at a time. Update the booking_details.answer_triage_questions object with the answers. Here are the questions for each service:
    [Include the questions for each service as provided in your previous message]`
}

const AssistedBooking = ({
  onBookingComplete,
  serviceStages,
  pharmacies,
  triageQuestions,
  setTriageQuestions,
  triageAnswers,
  setTriageAnswers,
  setSelectedServiceStage,
  getTriageQuestions
}) => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState([])
  const [bookingDetails, setBookingDetails] = useState({
    current_stage: 'choose_service_stage',
    choose_service_stage: {
      stage_id: null,
      identified_patient_need: null
    },
    answer_triage_questions: {},
    find_a_pharmacy: {
      method: null,
      postcode: null,
      pharmacy_code: null
    },
    choose_booking_slot: null,
    complete_booking: {
      first_name: null,
      last_name: null,
      gp_surgery: null
    }
  })
  const [activeStep, setActiveStep] = useState(0)

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setLoading(true)
    const userMessage = { role: 'user', content: message }
    setConversation(prev => [...prev, userMessage])

    try {
      const response = await supabase.functions.invoke('aiconsult', {
        body: {
          systemMessage: getSystemMessage(),
          conversationHistory: conversation,
          clinicianNotes: message,
          useJsonFormat: true
        }
      })

      if (!response.data) throw new Error('Network response was not ok')

      const aiResponse = response?.data?.recommendation

      setConversation(prev => [...prev, { role: 'assistant', content: aiResponse.message }])

      if (aiResponse.booking_details) {
        setBookingDetails(prev => ({ ...prev, ...aiResponse.booking_details }))
        updateBookingProgress(aiResponse.booking_details)
      }
    } catch (error) {
      console.error('Error in AI consultation:', error)
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
      ])
    } finally {
      setLoading(false)
      setMessage('')
    }
  }

  useEffect(() => {
    if (conversation.length === 0) {
      setConversation([
        {
          role: 'assistant',
          content:
            "Hello! How can I assist you with booking an appointment today? Please describe your symptoms or the service you're looking for."
        }
      ])
    }
  }, [])

  const getSystemMessage = () => {
    let message = systemMessages.initial
    if (bookingDetails.current_stage === 'choose_service_stage') {
      message += systemMessages.serviceSelection
    } else if (bookingDetails.current_stage === 'answer_triage_questions') {
      const questionsString = triageQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
      message += systemMessages.triageQuestions.replace('[TRIAGE_QUESTIONS_PLACEHOLDER]', questionsString)
    }
    return message
  }

  console.log('triageQuestions', triageQuestions)
  const updateBookingProgress = details => {
    if (details.current_stage === 'choose_service_stage' && details.choose_service_stage.stage_id) {
      setSelectedServiceStage(details.choose_service_stage.stage_id)
      const newTriageQuestions = getTriageQuestions(details.choose_service_stage.stage_id)
      setTriageQuestions(newTriageQuestions)
      setBookingDetails(prev => ({
        ...prev,
        current_stage: 'answer_triage_questions',
        answer_triage_questions: {}
      }))
      setActiveStep(1)
    } else if (details.current_stage === 'answer_triage_questions') {
      setTriageAnswers(prev => ({ ...prev, ...details.answer_triage_questions }))
      if (Object.keys(details.answer_triage_questions).length === triageQuestions.length) {
        setBookingDetails(prev => ({
          ...prev,
          current_stage: 'find_a_pharmacy'
        }))
        setActiveStep(2)
      }
    }
    // Add more conditions for other stages as needed
  }

  const updateActiveStep = details => {
    if (details.current_stage === 'choose_service_stage' && details.choose_service_stage.stage_id) {
      setActiveStep(1)
    } else if (
      details.current_stage === 'answer_triage_questions' &&
      Object.keys(details.answer_triage_questions).length > 0
    ) {
      setActiveStep(2)
    }
    // Add more conditions for other stages as needed
  }

  const renderStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Typography>
            Service:{' '}
            {serviceStages.find(s => s.id === bookingDetails.choose_service_stage.stage_id)?.name || 'Not selected yet'}
          </Typography>
        )
      case 1:
        return (
          <Typography>
            Triage Questions: {Object.keys(bookingDetails.answer_triage_questions).length} answered
          </Typography>
        )
      // Add more cases for other steps
      default:
        return null
    }
  }

  return (
    <Box sx={{ display: 'flex', maxWidth: 1200, margin: 'auto', padding: 2 }}>
      <Stepper activeStep={activeStep} orientation='vertical' sx={{ width: 300, marginRight: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Paper elevation={0} sx={{ padding: 2 }}>
                {renderStepContent(index)}
              </Paper>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h5' gutterBottom>
          AI-Assisted Booking
        </Typography>
        <List sx={{ height: 400, overflowY: 'auto', marginBottom: 2, border: '1px solid #ccc', padding: 2 }}>
          {conversation.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={msg.role === 'user' ? 'You' : 'AI'}
                secondary={msg.content}
                sx={{ color: msg.role === 'user' ? 'blue' : 'green' }}
              />
            </ListItem>
          ))}
        </List>
        <TextField
          fullWidth
          variant='outlined'
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder='Type your message here...'
          disabled={loading}
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant='contained'
          onClick={handleSendMessage}
          disabled={loading || !message.trim()}
          sx={{ marginBottom: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Box>
  )
}

export default AssistedBooking
