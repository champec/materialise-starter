import React, { useState, useEffect } from 'react'
import { TextField, Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

const ABPMInput = ({ id, value, onChange, error, question }) => {
  const [abpmData, setABPMData] = useState(() => {
    const defaultData = {
      daytime: { systolic: '', diastolic: '' },
      nighttime: { systolic: '', diastolic: '' },
      overall: { systolic: '', diastolic: '' },
      abpmRating: ''
    }
    return value ? { ...defaultData, ...value } : defaultData
  })

  useEffect(() => {
    onChange(abpmData)
  }, [abpmData])

  const handleInputChange = (period, field, inputValue) => {
    setABPMData(prevData => ({
      ...prevData,
      [period]: {
        ...prevData[period],
        [field]: inputValue
      }
    }))
  }

  const handleRatingChange = event => {
    setABPMData(prevData => ({
      ...prevData,
      abpmRating: event.target.value
    }))
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        {question}
      </Typography>

      <Typography variant='subtitle1' gutterBottom>
        Daytime Average
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <TextField
            label='Systolic'
            type='number'
            value={abpmData.daytime.systolic}
            onChange={e => handleInputChange('daytime', 'systolic', e.target.value)}
            error={!!error}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label='Diastolic'
            type='number'
            value={abpmData.daytime.diastolic}
            onChange={e => handleInputChange('daytime', 'diastolic', e.target.value)}
            error={!!error}
            fullWidth
          />
        </Grid>
      </Grid>

      <Typography variant='subtitle1' gutterBottom>
        Nighttime Average
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <TextField
            label='Systolic'
            type='number'
            value={abpmData.nighttime.systolic}
            onChange={e => handleInputChange('nighttime', 'systolic', e.target.value)}
            error={!!error}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label='Diastolic'
            type='number'
            value={abpmData.nighttime.diastolic}
            onChange={e => handleInputChange('nighttime', 'diastolic', e.target.value)}
            error={!!error}
            fullWidth
          />
        </Grid>
      </Grid>

      <Typography variant='subtitle1' gutterBottom>
        Overall Average
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <TextField
            label='Systolic'
            type='number'
            value={abpmData.overall.systolic}
            onChange={e => handleInputChange('overall', 'systolic', e.target.value)}
            error={!!error}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label='Diastolic'
            type='number'
            value={abpmData.overall.diastolic}
            onChange={e => handleInputChange('overall', 'diastolic', e.target.value)}
            error={!!error}
            fullWidth
          />
        </Grid>
      </Grid>

      <FormControl fullWidth error={!!error}>
        <InputLabel id='abpm-rating-label'>ABPM Rating</InputLabel>
        <Select
          labelId='abpm-rating-label'
          value={abpmData.abpmRating}
          label='ABPM Rating'
          onChange={handleRatingChange}
        >
          <MenuItem value='NORMAL'>Normal</MenuItem>
          <MenuItem value='ELEVATED'>Elevated</MenuItem>
          <MenuItem value='STAGE_1_HYPERTENSION'>Stage 1 Hypertension</MenuItem>
          <MenuItem value='STAGE_2_HYPERTENSION'>Stage 2 Hypertension</MenuItem>
        </Select>
      </FormControl>

      {error && <Typography color='error'>{error}</Typography>}
    </Box>
  )
}

export default ABPMInput
