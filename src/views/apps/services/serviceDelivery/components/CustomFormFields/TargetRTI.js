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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  RadioGroup,
  Radio
} from '@mui/material'

const infections = [
  {
    value: 'middle_ear_infection',
    label: 'Middle Ear Infection',
    info: 'Without antibiotics, most are better by 8 days.'
  },
  { value: 'sore_throat', label: 'Sore Throat', info: 'Without antibiotics, most are better by 7-8 days.' },
  { value: 'sinusitis', label: 'Sinusitis', info: 'Without antibiotics, most are better by 12-21 days.' },
  { value: 'common_cold', label: 'Common Cold', info: 'Without antibiotics, most are better by 14 days.' },
  {
    value: 'cough_or_bronchitis',
    label: 'Cough or Bronchitis',
    info: 'Without antibiotics, most are better by 21 days (a cough caused by COVID-19 may differ).'
  },
  { value: 'other_infections', label: 'Other Infections', info: 'Without antibiotics, most are better by ?' }
]

const selfCareAdviceOptions = [
  'Have plenty of rest.',
  'Drink enough fluids to avoid feeling thirsty.',
  'Ask your local pharmacist to recommend medicines to help your symptoms or pain (or both).',
  'Fever is a sign the body is fighting the infection and usually gets better by itself in most cases. You can use paracetamol if you or your child are uncomfortable as a result of a fever.',
  'Use a tissue and wash your hands with soap to help prevent the spread of your infection to your family, friends, and others you meet.'
]

const seriousSymptoms = [
  'If your skin is very cold or has a strange colour, or you develop an unusual rash.',
  'If you have new feelings of confusion, or drowsiness, or have slurred speech.',
  'If you have difficulty breathing (breathing quickly, turning blue around the lips, or skin between or above the ribs getting sucked in with every breath).',
  'If you develop a severe headache and are sick.',
  'If you develop chest pain.',
  'If you have difficulty swallowing or are drooling.',
  'If you cough up blood.',
  'If you are passing little or no urine.',
  'If you are feeling a lot worse.'
]

const lessSeriousSymptoms = [
  'If you are not starting to improve a little by the time given in "Most are better by".',
  'Children with middle-ear infection: if fluid is coming out of their ears or they have new deafness.',
  'Mild side effects such as diarrhoea: seek medical attention if you are concerned.'
]

const outcomeOptions = [
  { value: 'mild_symptoms', label: 'Mild Symptoms - Self Care' },
  { value: 'severe_symptoms', label: 'Severe Symptoms - Immediate Antibiotic' },
  { value: 'red_flag', label: 'Red Flag - Referral' }
]

const TargetRTI = ({ id, value, onChange, error }) => {
  const [selectedInfection, setSelectedInfection] = useState('')
  const [days, setDays] = useState('')
  const [adviceGiven, setAdviceGiven] = useState({})
  const [seriousSymptomsChecked, setSeriousSymptomsChecked] = useState({})
  const [lessSeriousSymptomsChecked, setLessSeriousSymptomsChecked] = useState({})
  const [outcome, setOutcome] = useState('')

  useEffect(() => {
    if (value) {
      setSelectedInfection(value.selectedInfection || '')
      setDays(value.days || '')
      setAdviceGiven(value.adviceGiven || {})
      setSeriousSymptomsChecked(value.seriousSymptomsChecked || {})
      setLessSeriousSymptomsChecked(value.lessSeriousSymptomsChecked || {})
      setOutcome(value.outcome || '')
    }
  }, [value])

  const handleInfectionChange = event => {
    const newInfection = event.target.value
    setSelectedInfection(newInfection)
    updateParent({
      selectedInfection: newInfection,
      days,
      adviceGiven,
      seriousSymptomsChecked,
      lessSeriousSymptomsChecked,
      outcome
    })
  }

  const handleDaysChange = event => {
    const newDays = event.target.value
    setDays(newDays)
    updateParent({
      selectedInfection,
      days: newDays,
      adviceGiven,
      seriousSymptomsChecked,
      lessSeriousSymptomsChecked,
      outcome
    })
  }

  const handleAdviceChange = option => {
    const newAdviceGiven = { ...adviceGiven, [option]: !adviceGiven[option] }
    setAdviceGiven(newAdviceGiven)
    updateParent({
      selectedInfection,
      days,
      adviceGiven: newAdviceGiven,
      seriousSymptomsChecked,
      lessSeriousSymptomsChecked,
      outcome
    })
  }

  const handleSeriousSymptomsChange = option => {
    const newSeriousSymptomsChecked = { ...seriousSymptomsChecked, [option]: !seriousSymptomsChecked[option] }
    setSeriousSymptomsChecked(newSeriousSymptomsChecked)
    updateParent({
      selectedInfection,
      days,
      adviceGiven,
      seriousSymptomsChecked: newSeriousSymptomsChecked,
      lessSeriousSymptomsChecked,
      outcome
    })
  }

  const handleLessSeriousSymptomsChange = option => {
    const newLessSeriousSymptomsChecked = {
      ...lessSeriousSymptomsChecked,
      [option]: !lessSeriousSymptomsChecked[option]
    }
    setLessSeriousSymptomsChecked(newLessSeriousSymptomsChecked)
    updateParent({
      selectedInfection,
      days,
      adviceGiven,
      seriousSymptomsChecked,
      lessSeriousSymptomsChecked: newLessSeriousSymptomsChecked,
      outcome
    })
  }

  const handleOutcomeChange = event => {
    const newOutcome = event.target.value
    setOutcome(newOutcome)
    updateParent({
      selectedInfection,
      days,
      adviceGiven,
      seriousSymptomsChecked,
      lessSeriousSymptomsChecked,
      outcome: newOutcome
    })
  }

  const updateParent = updatedState => {
    onChange(updatedState)
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Your Infection
      </Typography>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Choose Infection</InputLabel>
        <Select value={selectedInfection} onChange={handleInfectionChange}>
          {infections.map(infection => (
            <MenuItem key={infection.value} value={infection.value}>
              {infection.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label='Number of Days'
        type='number'
        value={days}
        onChange={handleDaysChange}
        fullWidth
        margin='normal'
      />

      {selectedInfection && (
        <FormHelperText>{infections.find(inf => inf.value === selectedInfection)?.info}</FormHelperText>
      )}

      <Typography variant='h6' gutterBottom>
        How to Look After Yourself and Your Family
      </Typography>
      <FormGroup>
        {selfCareAdviceOptions.map(option => (
          <FormControlLabel
            key={option}
            control={<Checkbox checked={!!adviceGiven[option]} onChange={() => handleAdviceChange(option)} />}
            label={option}
          />
        ))}
      </FormGroup>

      <Typography variant='h6' gutterBottom>
        When to Get Help
      </Typography>
      <FormGroup>
        {seriousSymptoms.map(option => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={!!seriousSymptomsChecked[option]}
                onChange={() => handleSeriousSymptomsChange(option)}
              />
            }
            label={option}
          />
        ))}
      </FormGroup>

      <Typography variant='h6' gutterBottom>
        Less Serious Signs
      </Typography>
      <FormGroup>
        {lessSeriousSymptoms.map(option => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={!!lessSeriousSymptomsChecked[option]}
                onChange={() => handleLessSeriousSymptomsChange(option)}
              />
            }
            label={option}
          />
        ))}
      </FormGroup>

      <Typography variant='h6' gutterBottom>
        Outcome
      </Typography>
      <RadioGroup value={outcome} onChange={handleOutcomeChange}>
        {outcomeOptions.map(option => (
          <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
        ))}
      </RadioGroup>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

export default TargetRTI
