import React from 'react'
import { TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material'

const BiometricMeasurements = ({ id, value, onChange, error }) => {
  const handleChange = (field, newValue) => {
    onChange({ ...value, [field]: newValue })
  }

  return (
    <div>
      <TextField
        id={`${id}-systolic`}
        label='Systolic Blood Pressure (mmHg)'
        type='number'
        value={value.systolic || ''}
        onChange={e => handleChange('systolic', e.target.value)}
        error={Boolean(error)}
        helperText={error}
        required
      />
      <TextField
        id={`${id}-diastolic`}
        label='Diastolic Blood Pressure (mmHg)'
        type='number'
        value={value.diastolic || ''}
        onChange={e => handleChange('diastolic', e.target.value)}
        error={Boolean(error)}
        helperText={error}
        required
      />
      <TextField
        id={`${id}-height`}
        label='Height (cm)'
        type='number'
        value={value.height || ''}
        onChange={e => handleChange('height', e.target.value)}
        error={Boolean(error)}
        helperText={error}
        required
      />
      <TextField
        id={`${id}-weight`}
        label='Weight (kg)'
        type='number'
        value={value.weight || ''}
        onChange={e => handleChange('weight', e.target.value)}
        error={Boolean(error)}
        helperText={error}
        required
      />
      <FormControl component='fieldset' required>
        <FormLabel component='legend'>Were the measurements taken at the pharmacy?</FormLabel>
        <RadioGroup
          aria-label='measurements-location'
          name='measurements-location'
          value={value.measurementsLocation || ''}
          onChange={e => handleChange('measurementsLocation', e.target.value)}
        >
          <FormControlLabel value='pharmacy' control={<Radio />} label='Yes, at the pharmacy' />
          <FormControlLabel value='patient-reported' control={<Radio />} label='No, patient-reported' />
        </RadioGroup>
      </FormControl>
    </div>
  )
}

export default BiometricMeasurements
