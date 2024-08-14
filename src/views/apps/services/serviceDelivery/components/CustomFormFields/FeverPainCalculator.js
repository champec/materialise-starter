import React, { useState, useEffect } from 'react'
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
    value?.params || {
      fever: false,
      purulence: false,
      attendRapidly: false,
      inflamedTonsils: false,
      noCoughOrCoryza: false
    }
  )

  const [feverPainScore, setFeverPainScore] = useState(value?.feverPainScore || 0)
  const [outcome, setOutcome] = useState(value?.outcome || '')

  useEffect(() => {
    if (value) {
      setParams(value.params || params)
      setFeverPainScore(value.feverPainScore || feverPainScore)
      setOutcome(value.outcome || outcome)
    }
  }, [value])

  const handleChange = param => {
    const updatedParams = { ...params, [param]: !params[param] }
    setParams(updatedParams)
    // updateParent(updatedParams, feverPainScore, outcome)
  }

  const calculateFeverPainScore = () => {
    return Object.values(params).filter(value => value === true).length
  }

  const handleCalculate = () => {
    const score = calculateFeverPainScore()
    const newOutcome = getOutcome(score)
    setFeverPainScore(score)
    setOutcome(newOutcome)
    updateParent(params, score, newOutcome)
  }

  const updateParent = (newParams, score, newOutcome) => {
    console.log('UPDATE PARENT', newParams, score, newOutcome)
    onChange({
      params: newParams,
      feverPainScore: score,
      outcome: newOutcome
    })
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
          {Object.entries(params).map(([key, checked]) => (
            <FormControlLabel
              key={key}
              control={<Checkbox checked={checked} onChange={() => handleChange(key)} />}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            />
          ))}
        </FormGroup>
      </FormControl>
      {error && <FormHelperText error>{error}</FormHelperText>}

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
