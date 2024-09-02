import React from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem
} from '@mui/material'
import NMSDetailsComponent from './NMSDetailsComponent'

const NMSInterventionDetails = ({ value, onChange, error, sharedData }) => {
  const handleChange = field => event => {
    onChange({
      ...value,
      [field]: event.target.value
    })
  }

  return (
    <Box>
      <NMSDetailsComponent value={value} onChange={onChange} error={error} medications={sharedData} />
      <FormControl fullWidth margin='normal'>
        <FormLabel>Consultation Method</FormLabel>
        <RadioGroup value={value.consultationMethod || ''} onChange={handleChange('consultationMethod')}>
          <FormControlLabel value='FTF_PHARMACY' control={<Radio />} label='Face to face in pharmacy' />
          <FormControlLabel value='FTF_PATIENT_HOME' control={<Radio />} label="Face to face at patient's home" />
          <FormControlLabel value='TELEPHONE' control={<Radio />} label='Telephone' />
          <FormControlLabel value='TELEMEDICINE' control={<Radio />} label='Telemedicine' />
        </RadioGroup>
      </FormControl>

      <FormControl fullWidth margin='normal'>
        <FormLabel>Is the patient using the medicine as prescribed?</FormLabel>
        <RadioGroup value={value.medicineUsage || ''} onChange={handleChange('medicineUsage')}>
          <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
          <FormControlLabel value='No' control={<Radio />} label='No' />
        </RadioGroup>
      </FormControl>

      {value.medicineUsage === 'No' && (
        <FormControl fullWidth margin='normal'>
          <FormLabel>Reason for not using medicine as prescribed</FormLabel>
          <Select value={value.notUsingMedicineReason || ''} onChange={handleChange('notUsingMedicineReason')}>
            <MenuItem value='PATIENT_NOT_STARTED_MEDICINE'>Patient has not started using the medicine</MenuItem>
            <MenuItem value='PRESCRIBER_STOP_NEW_MEDICINE'>Prescriber has stopped new medicine</MenuItem>
            <MenuItem value='PATIENT_MEDICINE_NOT_IN_LINE'>
              Patient is not using the medicine in line with the directions of the prescriber
            </MenuItem>
          </Select>
        </FormControl>
      )}

      <FormControl fullWidth margin='normal'>
        <FormLabel>Additional Notes</FormLabel>
        <TextField multiline rows={4} value={value.additionalNotes || ''} onChange={handleChange('additionalNotes')} />
      </FormControl>

      {error && <Box color='error.main'>{error}</Box>}
    </Box>
  )
}

export default NMSInterventionDetails
