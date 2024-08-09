import React, { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel
} from '@mui/material'

const calculateNews2Score = params => {
  let score = 0

  // Respiration rate
  if (params.respirationRate <= 8 || params.respirationRate >= 25) {
    score += 3
  } else if (params.respirationRate >= 21 && params.respirationRate <= 24) {
    score += 2
  }

  // Temperature
  if (params.temperature <= 35.0) {
    score += 3
  } else if (params.temperature >= 35.1 && params.temperature <= 36.0) {
    score += 1
  } else if (params.temperature >= 38.1 && params.temperature <= 39.0) {
    score += 1
  } else if (params.temperature >= 39.1) {
    score += 2
  }

  // Systolic blood pressure
  if (params.systolicBloodPressure <= 90 || params.systolicBloodPressure >= 220) {
    score += 3
  } else if (params.systolicBloodPressure >= 91 && params.systolicBloodPressure <= 100) {
    score += 2
  } else if (params.systolicBloodPressure >= 101 && params.systolicBloodPressure <= 110) {
    score += 1
  }

  // Pulse rate
  if (params.pulseRate <= 40) {
    score += 3
  } else if (params.pulseRate >= 41 && params.pulseRate <= 50) {
    score += 1
  } else if (params.pulseRate >= 91 && params.pulseRate <= 110) {
    score += 1
  }

  // Oxygen saturation
  if (params.oxygenSaturation < 92) {
    score += 3
  } else if (params.oxygenSaturation >= 92 && params.oxygenSaturation <= 93) {
    score += 2
  } else if (params.oxygenSaturation >= 94 && params.oxygenSaturation <= 95) {
    score += 1
  }

  // Level of consciousness (ACVPU)
  if (params.levelOfConsciousness !== 'Alert') {
    score += 3
  }

  // Add 2 points if patient is receiving oxygen therapy
  if (params.receivingOxygenTherapy) {
    score += 2
  }

  return score
}

const News2Calculator = ({ id, value, onChange, error }) => {
  const [params, setParams] = useState(
    value || {
      respirationRate: '',
      temperature: '',
      systolicBloodPressure: '',
      pulseRate: '',
      oxygenSaturation: '',
      levelOfConsciousness: 'Alert',
      receivingOxygenTherapy: false
    }
  )

  const handleChange = (param, newValue) => {
    const updatedParams = { ...params, [param]: newValue }
    setParams(updatedParams)
    onChange(updatedParams)
  }

  const handleCalculate = () => {
    const score = calculateNews2Score(params)
    handleChange('news2Score', score)
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        National Early Warning Score (NEWS2)
      </Typography>
      <TextField
        label='Respiration Rate'
        value={params.respirationRate}
        onChange={e => handleChange('respirationRate', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Temperature (°C)'
        value={params.temperature}
        onChange={e => handleChange('temperature', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Systolic Blood Pressure'
        value={params.systolicBloodPressure}
        onChange={e => handleChange('systolicBloodPressure', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Pulse Rate'
        value={params.pulseRate}
        onChange={e => handleChange('pulseRate', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Oxygen Saturation'
        value={params.oxygenSaturation}
        onChange={e => handleChange('oxygenSaturation', e.target.value)}
        fullWidth
        margin='normal'
      />
      <FormControl fullWidth margin='normal'>
        <InputLabel>Level of Consciousness (ACVPU)</InputLabel>
        <Select
          value={params.levelOfConsciousness}
          onChange={e => handleChange('levelOfConsciousness', e.target.value)}
        >
          <MenuItem value='Alert'>Alert</MenuItem>
          <MenuItem value='Confusion'>Confusion</MenuItem>
          <MenuItem value='Verbal'>Verbal</MenuItem>
          <MenuItem value='Pain'>Pain</MenuItem>
          <MenuItem value='Unresponsive'>Unresponsive</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={params.receivingOxygenTherapy}
            onChange={e => handleChange('receivingOxygenTherapy', e.target.checked)}
          />
        }
        label='Receiving Oxygen Therapy'
      />
      <Button variant='contained' onClick={handleCalculate} sx={{ mt: 2 }}>
        Calculate NEWS2 Score
      </Button>
      {error && <FormHelperText error>{error}</FormHelperText>}
      {params.news2Score !== undefined && (
        <Typography variant='h6' sx={{ mt: 2 }}>
          NEWS2 Score: {params.news2Score}
        </Typography>
      )}
    </Box>
  )
}

export default News2Calculator
