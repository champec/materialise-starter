import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert
} from '@mui/material'

const ChooseOutcome = ({ id, value, onChange, error, consultationOutcomes }) => {
  const [selectedOutcome, setSelectedOutcome] = useState('')
  const [otherOutcome, setOtherOutcome] = useState('')
  const [recommendedOutcome, setRecommendedOutcome] = useState('')
  const [additionalAdvice, setAdditionalAdvice] = useState('')

  useEffect(() => {
    let outcome = ''
    let other = ''
    let recommended = ''
    let advice = ''

    if (typeof value === 'object') {
      outcome = value.selectedValue || value.__contextData?.recommendedOutcome || ''
      other = value.otherOutcome || ''
      recommended = value.recommendedOutcome || value.__contextData?.recommendedOutcome || ''
      advice = value.additionalAdvice || value.__contextData?.additionalAdvice || ''
    } else if (typeof value === 'string') {
      outcome = value
    }

    setSelectedOutcome(outcome)
    setOtherOutcome(other)
    setRecommendedOutcome(recommended)
    setAdditionalAdvice(advice)

    // Trigger updateParent to notify form engine of the initial state
    updateParent(outcome, other, recommended, advice)
  }, [])

  console.log('VALUE IN CHOOSe', value)

  const handleOutcomeChange = event => {
    const newOutcome = event.target.value
    setSelectedOutcome(newOutcome)
    updateParent(newOutcome, otherOutcome, recommendedOutcome, additionalAdvice)
  }

  const handleOtherOutcomeChange = event => {
    const newOtherOutcome = event.target.value
    setOtherOutcome(newOtherOutcome)
    updateParent(selectedOutcome, newOtherOutcome, recommendedOutcome, additionalAdvice)
  }

  const updateParent = (outcome, other, recommended, advice) => {
    console.log('ON CHANGE UPDATE PARENT CHOOSe', outcome, other, recommended, advice)
    onChange({
      selectedValue: outcome,
      otherOutcome: other,
      recommendedOutcome: recommended,
      additionalAdvice: advice
    })
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Choose Consultation Outcome
      </Typography>
      {recommendedOutcome && (
        <Alert severity='info' sx={{ mb: 2 }}>
          Recommended outcome based on previous answers:{' '}
          {consultationOutcomes.find(o => o.value === recommendedOutcome)?.label}
        </Alert>
      )}
      {additionalAdvice && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          Additional Advice: {additionalAdvice}
        </Alert>
      )}
      <FormControl fullWidth margin='normal'>
        <InputLabel>Consultation Outcome</InputLabel>
        <Select value={selectedOutcome} onChange={handleOutcomeChange}>
          {consultationOutcomes.map(outcome => (
            <MenuItem key={outcome.value} value={outcome.value}>
              {outcome.label}
              {outcome.value === recommendedOutcome && ' (Recommended)'}
            </MenuItem>
          ))}
        </Select>
        {selectedOutcome === 'OTHER' && (
          <TextField
            label='Please specify'
            value={otherOutcome}
            onChange={handleOtherOutcomeChange}
            fullWidth
            margin='normal'
          />
        )}
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    </Box>
  )
}

export default ChooseOutcome
