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
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material'
import NMSDetailsComponent from './NMSDetailsComponent'

const NMSEngagementDetails = ({ value, onChange, error }) => {
  const handleChange = field => event => {
    onChange({
      ...value,
      [field]: event.target.value
    })
  }
  const medications = value?.__contextData?.medications
  console.log('GETTING THE PASSED DOWN DATA', medications, value)

  const handleMultipleSelect = field => event => {
    onChange({
      ...value,
      [field]: event.target.value
    })
  }

  const conditions = [
    'Asthma',
    'Chronic Obstructive Pulmonary Disease',
    'Type 2 Diabetes',
    'Hypertension',
    'Hypercholesterolaemia',
    'Osteoporosis',
    'Gout',
    'Glaucoma',
    'Epilepsy',
    "Parkinson's disease",
    'Urinary incontinence/retention',
    'Heart failure',
    'Acute coronary syndromes',
    'Atrial fibrillation',
    'Long term risks of venous thromboembolism/embolism',
    'Stroke / transient ischemic attack',
    'Coronary heart disease',
    'Depression'
  ]

  return (
    <Box>
      <NMSDetailsComponent medications={medications} />
      <FormControl fullWidth margin='normal'>
        <FormLabel>Condition(s) for NMS</FormLabel>
        <Select
          multiple
          value={value.conditions || []}
          onChange={handleMultipleSelect('conditions')}
          renderValue={selected => selected.join(', ')}
        >
          {conditions.map(condition => (
            <MenuItem key={condition} value={condition}>
              <Checkbox checked={(value.conditions || []).indexOf(condition) > -1} />
              <ListItemText primary={condition} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin='normal'>
        <FormLabel>Prescription Date</FormLabel>
        <TextField
          type='date'
          value={value.prescriptionDate || ''}
          onChange={handleChange('prescriptionDate')}
          InputLabelProps={{
            shrink: true
          }}
        />
      </FormControl>

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
        <FormLabel>Was the service provided?</FormLabel>
        <RadioGroup value={value.serviceProvided || ''} onChange={handleChange('serviceProvided')}>
          <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
          <FormControlLabel value='No' control={<Radio />} label='No' />
        </RadioGroup>
      </FormControl>

      {value.serviceProvided === 'No' && (
        <FormControl fullWidth margin='normal'>
          <FormLabel>Reason for non-provision of service</FormLabel>
          <Select value={value.nonProvisionReason || ''} onChange={handleChange('nonProvisionReason')}>
            <MenuItem value='DECLINED'>Patient declined the service</MenuItem>
            <MenuItem value='DID_NOT_ATTEND'>Patient did not attend</MenuItem>
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

export default NMSEngagementDetails
