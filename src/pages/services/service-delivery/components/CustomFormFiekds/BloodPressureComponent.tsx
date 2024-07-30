import React from 'react'
import { TextField, Box, Typography, FormHelperText } from '@mui/material'

interface BloodPressureComponentProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

const BloodPressureComponent: React.FC<BloodPressureComponentProps> = ({ value, onChange, error }) => {
  const [systolic, diastolic] = value.split('/').map(Number)

  const handleSystolicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSystolic = event.target.value
    onChange(`${newSystolic}/${diastolic || ''}`)
  }

  const handleDiastolicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDiastolic = event.target.value
    onChange(`${systolic || ''}/${newDiastolic}`)
  }

  return (
    <Box>
      <Typography variant='subtitle1' gutterBottom>
        Blood Pressure (mmHg)
      </Typography>
      <Box display='flex' alignItems='center'>
        <TextField
          label='Systolic'
          type='number'
          value={systolic || ''}
          onChange={handleSystolicChange}
          inputProps={{ min: 0, max: 300 }}
          error={!!error}
        />
        <Typography variant='h5' sx={{ mx: 2 }}>
          /
        </Typography>
        <TextField
          label='Diastolic'
          type='number'
          value={diastolic || ''}
          onChange={handleDiastolicChange}
          inputProps={{ min: 0, max: 200 }}
          error={!!error}
        />
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

export default BloodPressureComponent
