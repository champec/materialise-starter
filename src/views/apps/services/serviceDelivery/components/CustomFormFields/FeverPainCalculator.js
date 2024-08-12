import React, { useState } from 'react'
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Button,
  FormHelperText,
  FormGroup
} from '@mui/material'

const FeverPainCalculator = ({ id, value, onChange, error }) => {
  const [params, setParams] = useState(
    value || {
      fever: false,
      purulence: false,
      attendRapidly: false,
      inflamedTonsils: false,
      noCoughOrCoryza: false
    }
  )

  const [feverPainScore, setFeverPainScore] = useState(value?.feverPainScore || 0)
  const [outcome, setOutcome] = useState(value?.outcome || '')

  const handleChange = param => {
    const updatedParams = { ...params, [param]: !params[param] }
    setParams(updatedParams)
    onChange({
      ...updatedParams,
      feverPainScore,
      outcome
    })
  }

  const calculateFeverPainScore = () => {
    // Count only the parameters that are true
    return Object.values(params).filter(value => value === true).length
  }

  const handleCalculate = () => {
    const score = calculateFeverPainScore()
    const outcome = getOutcome(score)
    setFeverPainScore(score)
    setOutcome(outcome)

    const result = {
      ...params,
      feverPainScore: score,
      outcome: outcome
    }
    onChange(result)
  }

  const getOutcome = score => {
    if (score <= 1) return 'lowRisk'
    if (score <= 3) return 'mediumRisk'
    return 'highRisk'
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        FeverPAIN Clinical Score Calculator
      </Typography>
      <FormControl component='fieldset'>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={params.fever} onChange={() => handleChange('fever')} />}
            label='Fever in last 24 hours'
          />
          <FormControlLabel
            control={<Checkbox checked={params.purulence} onChange={() => handleChange('purulence')} />}
            label='Purulence'
          />
          <FormControlLabel
            control={<Checkbox checked={params.attendRapidly} onChange={() => handleChange('attendRapidly')} />}
            label='Attend rapidly under 3 days'
          />
          <FormControlLabel
            control={<Checkbox checked={params.inflamedTonsils} onChange={() => handleChange('inflamedTonsils')} />}
            label='Inflamed tonsils'
          />
          <FormControlLabel
            control={<Checkbox checked={params.noCoughOrCoryza} onChange={() => handleChange('noCoughOrCoryza')} />}
            label='No cough or coryza'
          />
        </FormGroup>
      </FormControl>
      {error && <FormHelperText error>{error}</FormHelperText>}

      {/* Place the button directly underneath the checklist */}
      <Box sx={{ mt: 2 }}>
        <Button variant='contained' onClick={handleCalculate}>
          Calculate FeverPAIN Score
        </Button>
      </Box>

      {feverPainScore !== undefined && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>FeverPAIN Score: {feverPainScore}</Typography>
          <Typography variant='body1'>
            Outcome:{' '}
            {outcome === 'lowRisk'
              ? 'Low risk (0-1)'
              : outcome === 'mediumRisk'
              ? 'Medium risk (2-3)'
              : 'High risk (4-5)'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default FeverPainCalculator
