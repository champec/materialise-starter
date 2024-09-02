import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem
} from '@mui/material'

const BloodPressureInput = ({ id, value, onChange, error, question }) => {
  const [readings, setReadings] = useState(value?.readings || [{ systolic: '', diastolic: '', pulse: '' }])
  const [average, setAverage] = useState(value?.average || { systolic: '', diastolic: '' })
  const [bpRating, setBPRating] = useState(value?.bpRating || '')
  const [irregularPulse, setIrregularPulse] = useState(value?.irregularPulse || 'No')
  const [abpmOffered, setABPMOffered] = useState(value?.abpmOffered || 'No')

  useEffect(() => {
    calculateAverageAndRating()
  }, [readings])

  const handleInputChange = (index, field, inputValue) => {
    const newReadings = [...readings]
    newReadings[index][field] = inputValue
    setReadings(newReadings)
  }

  const addReading = () => {
    setReadings([...readings, { systolic: '', diastolic: '', pulse: '' }])
  }

  const removeReading = index => {
    const newReadings = readings.filter((_, i) => i !== index)
    setReadings(newReadings)
  }

  const calculateAverageAndRating = () => {
    const validReadings = readings.filter(r => r.systolic && r.diastolic)
    if (validReadings.length === 0) {
      setAverage({ systolic: '', diastolic: '' })
      setBPRating('')
      setABPMOffered('No')
      return
    }

    const avgSystolic = Math.round(validReadings.reduce((sum, r) => sum + Number(r.systolic), 0) / validReadings.length)
    const avgDiastolic = Math.round(
      validReadings.reduce((sum, r) => sum + Number(r.diastolic), 0) / validReadings.length
    )

    setAverage({ systolic: avgSystolic, diastolic: avgDiastolic })

    // Calculate BP Rating
    let rating
    if (avgSystolic < 90 || avgDiastolic < 60) {
      rating = 'LOW'
    } else if (avgSystolic < 120 && avgDiastolic < 80) {
      rating = 'NORMAL'
    } else if ((avgSystolic >= 120 && avgSystolic < 140) || (avgDiastolic >= 80 && avgDiastolic < 90)) {
      rating = 'ELEVATED'
    } else if (avgSystolic >= 140 || avgDiastolic >= 90) {
      rating = 'HIGH'
    } else {
      rating = 'UNCLASSIFIED'
    }
    setBPRating(rating)

    // Offer ABPM if BP is elevated or high
    setABPMOffered(rating === 'ELEVATED' || rating === 'HIGH' ? 'Yes' : 'No')

    onChange({
      readings,
      average: { systolic: avgSystolic, diastolic: avgDiastolic },
      bpRating: rating,
      irregularPulse,
      abpmOffered: rating === 'ELEVATED' || rating === 'HIGH' ? 'Yes' : 'No'
    })
  }

  const handleIrregularPulseChange = event => {
    setIrregularPulse(event.target.value)
    onChange({
      ...value,
      irregularPulse: event.target.value
    })
  }

  const handleABPMOfferedChange = event => {
    setABPMOffered(event.target.value)
    onChange({
      ...value,
      abpmOffered: event.target.value
    })
  }

  const handleBPRatingChange = event => {
    setBPRating(event.target.value)
    onChange({
      ...value,
      bpRating: event.target.value
    })
  }

  const showAverageAndRating = readings.some(r => r.systolic && r.diastolic)

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        {question}
      </Typography>
      {readings.map((reading, index) => (
        <Grid container spacing={2} key={index} alignItems='center' mb={2}>
          <Grid item xs={3}>
            <TextField
              label='Systolic'
              type='number'
              value={reading.systolic}
              onChange={e => handleInputChange(index, 'systolic', e.target.value)}
              error={!!error}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label='Diastolic'
              type='number'
              value={reading.diastolic}
              onChange={e => handleInputChange(index, 'diastolic', e.target.value)}
              error={!!error}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label='Pulse'
              type='number'
              value={reading.pulse}
              onChange={e => handleInputChange(index, 'pulse', e.target.value)}
              error={!!error}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            {index > 0 && (
              <Button onClick={() => removeReading(index)} variant='outlined' color='secondary'>
                Remove
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
      <Button onClick={addReading} variant='outlined' sx={{ mt: 2, mb: 2 }}>
        Add Reading
      </Button>
      {showAverageAndRating && (
        <>
          <Typography variant='h6' gutterBottom>
            Average Reading
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label='Average Systolic'
                type='number'
                value={average.systolic}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Average Diastolic'
                type='number'
                value={average.diastolic}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
            Blood Pressure Rating
          </Typography>
          <Select value={bpRating} onChange={handleBPRatingChange} fullWidth>
            <MenuItem value='LOW'>Low</MenuItem>
            <MenuItem value='NORMAL'>Normal</MenuItem>
            <MenuItem value='ELEVATED'>Elevated</MenuItem>
            <MenuItem value='HIGH'>High</MenuItem>
            <MenuItem value='UNCLASSIFIED'>Unclassified</MenuItem>
          </Select>
          <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
            ABPM Offered
          </Typography>
          <RadioGroup row value={abpmOffered} onChange={handleABPMOfferedChange}>
            <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
            <FormControlLabel value='No' control={<Radio />} label='No' />
          </RadioGroup>
        </>
      )}
      <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
        Irregular Pulse
      </Typography>
      <RadioGroup row value={irregularPulse} onChange={handleIrregularPulseChange}>
        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
        <FormControlLabel value='No' control={<Radio />} label='No' />
      </RadioGroup>
      {error && <Typography color='error'>{error}</Typography>}
    </Box>
  )
}

export default BloodPressureInput
