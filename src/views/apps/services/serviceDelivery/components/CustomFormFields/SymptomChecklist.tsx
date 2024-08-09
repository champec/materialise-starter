import React, { useState, useEffect } from 'react'
import { Box, FormGroup, FormControlLabel, Radio, RadioGroup, Button, Typography, FormHelperText } from '@mui/material'

interface SymptomChecklistProps {
  id: string
  value: Record<string, boolean>
  onChange: (value: Record<string, boolean>) => void
  error?: string
  options: string[]
  question: string
  progressionCriteria: {
    type: 'allYes' | 'allNo' | 'someYes'
    count?: number
  }
}

const SymptomChecklist: React.FC<SymptomChecklistProps> = ({
  id,
  value,
  onChange,
  error,
  options,
  question,
  progressionCriteria
}) => {
  const [symptoms, setSymptoms] = useState<Record<string, boolean | null>>({})

  useEffect(() => {
    const initialSymptoms = options.reduce((acc, symptom) => {
      acc[symptom] = value[symptom] ?? null
      return acc
    }, {} as Record<string, boolean | null>)
    setSymptoms(initialSymptoms)
  }, [options, value])

  const handleChange = (symptom: string, isPresent: boolean | null) => {
    const newSymptoms = { ...symptoms, [symptom]: isPresent }
    setSymptoms(newSymptoms)
    const newValue = Object.fromEntries(Object.entries(newSymptoms).filter(([_, v]) => v !== null))
    onChange(newValue)
  }

  const handleAllYes = () => {
    const allYes = options.reduce((acc, symptom) => {
      acc[symptom] = true
      return acc
    }, {} as Record<string, boolean>)
    setSymptoms(allYes)
    onChange(allYes)
  }

  const handleAllNo = () => {
    const allNo = options.reduce((acc, symptom) => {
      acc[symptom] = false
      return acc
    }, {} as Record<string, boolean>)
    setSymptoms(allNo)
    onChange(allNo)
  }

  const isComplete = Object.values(symptoms).every(v => v !== null)

  return (
    <Box>
      <Typography variant='h6' gutterBottom></Typography>
      <FormGroup>
        {options.map(symptom => (
          <Box key={symptom} mb={1}>
            <Typography variant='body1'>{symptom}</Typography>
            <RadioGroup
              row
              value={symptoms[symptom]?.toString() || ''}
              onChange={e =>
                handleChange(symptom, e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)
              }
            >
              <FormControlLabel value='true' control={<Radio />} label='Yes' />
              <FormControlLabel value='false' control={<Radio />} label='No' />
            </RadioGroup>
          </Box>
        ))}
      </FormGroup>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleAllYes} variant='outlined'>
          Yes to All
        </Button>
        <Button onClick={handleAllNo} variant='outlined'>
          No to All
        </Button>
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!isComplete && <FormHelperText>Please answer all symptoms before proceeding.</FormHelperText>}
    </Box>
  )
}

export default SymptomChecklist
