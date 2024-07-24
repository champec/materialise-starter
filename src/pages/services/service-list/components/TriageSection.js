import React from 'react'
import { Box, Typography, FormControlLabel, Radio, RadioGroup, Button, Paper, styled } from '@mui/material'
import { alpha } from '@mui/material'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.dark
}))

const serviceNames = [
  {
    id: '5957b831-163e-428e-9386-34b093bf0e2b',
    name: 'Impetigo'
  },
  {
    id: '6b1611ef-134c-421f-a736-b7b8c0841515',
    name: 'Shingles'
  },
  {
    id: '87eae915-8a5f-411b-a700-b4d06806e81c',
    name: 'Urgent Medicines Supply'
  },
  {
    id: '89421045-4162-4b8d-937d-daddae7256c6',
    name: 'Infected Insect Bites'
  },
  {
    id: '8c4420cd-2ffb-4ade-8281-7b4c730b0909',
    name: 'Sore Throat'
  },
  {
    id: 'aa0bb38d-a436-4076-88e8-2b9caa704e47',
    name: 'Uncomplicated Urinary Tract Infections'
  },
  {
    id: 'cd7a58fc-5cd1-4ef3-867f-08930d2524ed',
    name: 'Minor Illness'
  },
  {
    id: 'eccd2387-75b9-4acb-802a-133e4d6c161b',
    name: 'Sinusitis'
  },
  {
    id: 'f0d678b9-e776-4e69-908f-a9db1634a9f5',
    name: 'Acute Otitis Media'
  }
]

const TriageSection = ({ stageId, formData, onFieldChange }) => {
  console.log('TRIAGE', stageId)
  const questions = {
    'aa0bb38d-a436-4076-88e8-2b9caa704e47': [
      // UTI
      'Is the patient female?',
      'Is the patient aged between 16 and 64 years?',
      'Is the patient not pregnant?',
      'Is this not a recurrent UTI (less than 2 episodes in last 6 months or less than 3 in the last 12)?'
    ],
    'f0d678b9-e776-4e69-908f-a9db1634a9f5': [
      // Otitis Media
      'Is the patient aged 1 year or over and under 18 years?',
      'Is this not a recurrent case (less than 3 episodes in last 6 months)?',
      'Is the patient not pregnant?'
    ],
    'eccd2387-75b9-4acb-802a-133e4d6c161b': [
      // Acute Sinusitis
      'Is the patient 12 years or older?',
      'If the patient is under 16, are they not pregnant?',
      'Has the condition lasted less than 12 weeks?'
    ],
    '8c4420cd-2ffb-4ade-8281-7b4c730b0909': [
      // Acute Sore Throat
      'Is the patient 5 years or older?',
      'If the patient is under 16, are they not pregnant?'
    ],
    '6b1611ef-134c-421f-a736-b7b8c0841515': [
      // Shingles
      'Is the patient not pregnant?',
      'Is the patient 18 years or older?',
      'Has the onset been less than 7 days ago?'
    ],
    '5957b831-163e-428e-9386-34b093bf0e2b': [
      // Impetigo
      'Is this non-bullous impetigo?',
      'Is this not a recurrent case (less than 2 episodes in the same year)?',
      'If the patient is under 16, are they not pregnant?'
    ],
    '89421045-4162-4b8d-937d-daddae7256c6': [
      // Infected Insect Bites
      'Is the patient 1 year or older?',
      'If the patient is under 16, are they not pregnant?'
    ]
  }

  // Check if triage is required for this stage
  if (!questions[stageId]) {
    return null // No triage required for this stage
  }

  const handleAnswerAll = value => {
    const newTriage = { ...formData.details.triage }
    questions[stageId].forEach(question => {
      newTriage[question] = value
    })
    onFieldChange({
      target: {
        name: 'details.triage',
        value: newTriage
      }
    })
  }

  const handleQuestionChange = (event, question) => {
    const { value } = event.target
    onFieldChange({
      target: {
        name: 'details.triage',
        value: {
          ...formData.details.triage,
          [question]: value
        }
      }
    })
  }

  const hasAnsweredNo = () => {
    return questions[stageId].some(question => formData.details.triage[question] === 'no')
  }

  const allQuestionsAnswered = () => {
    return questions[stageId].every(question => formData.details.triage[question] !== undefined)
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant='h6' gutterBottom>
        Triage Questions
      </Typography>
      {questions[stageId].map(question => (
        <Box key={question} mb={2}>
          <Typography>{question}</Typography>
          <RadioGroup
            row
            value={formData.details.triage[question] || ''}
            onChange={event => handleQuestionChange(event, question)}
          >
            <FormControlLabel value='yes' control={<Radio />} label='Yes' />
            <FormControlLabel value='no' control={<Radio />} label='No' />
          </RadioGroup>
        </Box>
      ))}
      <Box display='flex' justifyContent='space-between' mt={2}>
        <Button variant='contained' onClick={() => handleAnswerAll('yes')}>
          Yes to All
        </Button>
        <Button variant='contained' onClick={() => handleAnswerAll('no')}>
          No to All
        </Button>
      </Box>
      {allQuestionsAnswered() && hasAnsweredNo() && (
        <Box sx={{ backgroundColor: 'Highlight', paddingInline: '5px' }}>
          <Typography color='white' mt={2}>
            The patient doesn't meet the gateway requirements for this service.
          </Typography>
        </Box>
      )}
    </StyledPaper>
  )
}

export default TriageSection
