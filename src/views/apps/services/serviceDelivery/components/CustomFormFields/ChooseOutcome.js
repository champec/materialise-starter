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

const consultationOutcomes = [
  { value: 'ADVICE_ONLY', label: 'Advice given only' },
  { value: 'OTC_MEDICINE_SALE', label: 'Sale of an Over the Counter (OTC) medicine' },
  { value: 'MAS_REFERRAL', label: 'Referral into a pharmacy local minor ailments service (MAS)' },
  { value: 'LOCAL_COMMISSIONED_REFERRAL', label: 'Referral into an appropriate locally commissioned NHS service' },
  { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines supply / non-supply' },
  { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines non-supply (specify actions taken)' },
  { value: 'ONWARD_REFERRAL', label: 'Onward referral to another CPCS pharmacy' },
  { value: 'NON_URGENT', label: 'Non-urgent signposting to another service' },
  { value: 'URGENT', label: 'Urgent escalation to another service' },
  { value: 'OTHER', label: 'Other (please specify)' }
]

const ChooseOutcome = ({ id, value, onChange, error }) => {
  const [otherOutcome, setOtherOutcome] = useState('')
  const dataRecommendedOutcome = value?.__contextData?.recommendedOutcome
  const dataAdditionalAdvice = value?.__contextData?.additionalAdvice
  const additionalAdvice = value === 'object' && value.additionalAdvice ? value.additionalAdvice : dataAdditionalAdvice
  const recommendedOutcome =
    typeof value === 'object' && value.recommendedOutcome ? value.recommendedOutcome : dataRecommendedOutcome
  const [selectedOutcome, setSelectedOutcome] = useState('')

  useEffect(() => {
    let initialOutcome = ''
    if (typeof value === 'object' && value.selectedValue) {
      initialOutcome = value.selectedValue
    } else if (typeof value === 'string') {
      initialOutcome = value
    } else if (recommendedOutcome) {
      initialOutcome = recommendedOutcome
    }

    if (initialOutcome && initialOutcome !== selectedOutcome) {
      console.log('Setting initial outcome:', initialOutcome)
      setSelectedOutcome(initialOutcome)

      // Only call onChange if the value actually changed
      if (initialOutcome !== (value?.selectedValue || value)) {
        onChange({
          selectedValue: initialOutcome,
          recommendedOutcome: recommendedOutcome,
          additionalAdvice: additionalAdvice
        })
      }
    }
  }, [value, recommendedOutcome, selectedOutcome, onChange])

  console.log('VALID OUTCOME', recommendedOutcome, value)

  const handleOutcomeChange = event => {
    const newOutcome = event.target.value
    console.log('Outcome changed:', newOutcome)
    setSelectedOutcome(newOutcome)
    onChange({
      selectedValue: newOutcome,
      recommendedOutcome: recommendedOutcome,
      additionalAdvice: additionalAdvice
    })
  }

  const handleOtherOutcomeChange = event => {
    const newOtherOutcome = event.target.value
    setOtherOutcome(newOtherOutcome)
    onChange(newOtherOutcome)
  }

  console.log('recommededoutcom', value, value?.__contextData?.recommendedOutcome, recommendedOutcome)
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
