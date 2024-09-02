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

const NMSFollowUpDetails = ({ value, onChange, error, sharedData }) => {
  const handleChange = field => event => {
    onChange({
      ...value,
      [field]: event.target.value
    })
  }

  console.log('SHARED DATA', sharedData)

  return (
    <Box>
      <NMSDetailsComponent value={value} onChange={onChange} error={error} medications={sharedData} />
      <FormControl fullWidth margin='normal'>
        <FormLabel>Follow up Consultation Method</FormLabel>
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
        <FormLabel>Consultation Outcome</FormLabel>
        <RadioGroup value={value.consultationOutcome || ''} onChange={handleChange('consultationOutcome')}>
          <FormControlLabel value='NO_ACTION' control={<Radio />} label='No action needed' />
          <FormControlLabel
            value='PHARMACIST_PATIENT_AGREE'
            control={<Radio />}
            label='Pharmacist and patient agree solution'
          />
          <FormControlLabel value='REFFERAL_TO_GP' control={<Radio />} label='Referral to GP practice for review' />
          <FormControlLabel
            value='REFFERAL_TO_OTHER_PRESC_ORG'
            control={<Radio />}
            label='Referral to other prescribing organisation'
          />
        </RadioGroup>
      </FormControl>

      {(value.consultationOutcome === 'REFFERAL_TO_GP' ||
        value.consultationOutcome === 'REFFERAL_TO_OTHER_PRESC_ORG') && (
        <>
          <FormControl fullWidth margin='normal'>
            <FormLabel>Signposted To</FormLabel>
            <Select value={value.signpostedTo || ''} onChange={handleChange('signpostedTo')}>
              <MenuItem value='GP'>GP Practice</MenuItem>
              <MenuItem value='OTHER'>Other</MenuItem>
            </Select>
          </FormControl>

          {value.signpostedTo === 'OTHER' && (
            <FormControl fullWidth margin='normal'>
              <FormLabel>Specify Other</FormLabel>
              <TextField value={value.signpostedToOther || ''} onChange={handleChange('signpostedToOther')} />
            </FormControl>
          )}

          <FormControl fullWidth margin='normal'>
            <FormLabel>Referred Organisation ODS Code</FormLabel>
            <TextField value={value.referredOrgOds || ''} onChange={handleChange('referredOrgOds')} />
          </FormControl>
        </>
      )}

      <FormControl fullWidth margin='normal'>
        <FormLabel>Additional Notes</FormLabel>
        <TextField multiline rows={4} value={value.additionalNotes || ''} onChange={handleChange('additionalNotes')} />
      </FormControl>

      {error && <Box color='error.main'>{error}</Box>}
    </Box>
  )
}

export default NMSFollowUpDetails
