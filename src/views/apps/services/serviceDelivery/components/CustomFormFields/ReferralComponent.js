import React, { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button
} from '@mui/material'
import { dispositionCodeOptions } from '../form-definitions/pharmacy-first/universalCpcsform'

const referralTypes = [
  { value: 'GP', label: 'GP Practice' },
  { value: 'OOH_GP', label: 'Out of hours GP' },
  { value: 'OCP', label: 'Other Community Pharmacy' },
  { value: 'UTC', label: 'Urgent Treatment Centre' },
  { value: '999', label: '999' },
  { value: 'A_AND_E', label: 'A&E' },
  { value: 'OTHER', label: 'Other (please state)' }
]

const urgencyOptions = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'URGENT', label: 'Urgent' }
]

const consultationMethods = [
  { value: 'FTF', label: 'Face to face communication' },
  { value: 'TELEPHONE', label: 'Telephone' },
  { value: 'TELEMEDICINE', label: 'Telemedicine' }
]

const referrerOrgTypes = [
  { value: 'GPP', label: 'GP Practice' },
  { value: 'SHS', label: 'Sexual Health Service' },
  { value: 'CP', label: 'Community Pharmacy' },
  { value: 'GPCPS', label: 'GP Practice CPCS' },
  { value: '111', label: '111' }
]

const professionalRoles = [
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'PHARMACY_TECHNICIAN', label: 'Pharmacy technician' }
]

const ReferralComponent = ({ id, value, onChange, error }) => {
  const [referralDetails, setReferralDetails] = useState(
    value || {
      consultationOutcome: 'ONWARD_REFERRAL',
      referredTo: '',
      onwardReferralReason: '',
      referredOrganizationODSCode: '',
      onwardReferralDate: '',
      urgencyOfReferral: '',
      consultationMethod: '',
      referrerOrganizationType: '',
      dispositionCode: '',
      professionalRole: '',
      prescriptionIntercepted: 'No'
    }
  )

  const handleChange = (param, newValue) => {
    const updatedDetails = { ...referralDetails, [param]: newValue }
    setReferralDetails(updatedDetails)
    onChange(updatedDetails)
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Referral Details
      </Typography>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Consultation Outcome</InputLabel>
        <Select
          value={referralDetails.consultationOutcome}
          onChange={e => handleChange('consultationOutcome', e.target.value)}
          disabled
        >
          <MenuItem value='ONWARD_REFERRAL'>ONWARD_REFERRAL</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Referred To</InputLabel>
        <Select value={referralDetails.referredTo} onChange={e => handleChange('referredTo', e.target.value)}>
          {referralTypes.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {referralDetails.referredTo === 'OTHER' && (
          <TextField
            label='Please specify'
            value={referralDetails.onwardReferralReason}
            onChange={e => handleChange('onwardReferralReason', e.target.value)}
            fullWidth
            margin='normal'
          />
        )}
      </FormControl>
      <TextField
        label='Onward Referral Reason'
        value={referralDetails.onwardReferralReason}
        onChange={e => handleChange('onwardReferralReason', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Referred Organization ODS Code'
        value={referralDetails.referredOrganizationODSCode}
        onChange={e => handleChange('referredOrganizationODSCode', e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='Onward Referral Date'
        type='date'
        value={referralDetails.onwardReferralDate}
        onChange={e => handleChange('onwardReferralDate', e.target.value)}
        fullWidth
        margin='normal'
        InputLabelProps={{ shrink: true }}
      />
      <FormControl fullWidth margin='normal'>
        <InputLabel>Urgency of Referral</InputLabel>
        <Select
          value={referralDetails.urgencyOfReferral}
          onChange={e => handleChange('urgencyOfReferral', e.target.value)}
        >
          {urgencyOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Consultation Method</InputLabel>
        <Select
          value={referralDetails.consultationMethod}
          onChange={e => handleChange('consultationMethod', e.target.value)}
        >
          {consultationMethods.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Referrer Organization Type</InputLabel>
        <Select
          value={referralDetails.referrerOrganizationType}
          onChange={e => handleChange('referrerOrganizationType', e.target.value)}
        >
          {referrerOrgTypes.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* <FormControl fullWidth margin='normal'>
        <InputLabel>Disposition Code</InputLabel>
        <Select
          label='Disposition Code (if applicable)'
          value={referralDetails.dispositionCode}
          onChange={e => handleChange('dispositionCode', e.target.value)}
          fullWidth
          margin='normal'
        >
          {dispositionCodeOptions.map(option => (
            <MenuItem key={option.code} value={option.code}>
              {option.display}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Professional Role</InputLabel>
        <Select
          value={referralDetails.professionalRole}
          onChange={e => handleChange('professionalRole', e.target.value)}
        >
          {professionalRoles.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Prescription Intercepted</InputLabel>
        <Select
          value={referralDetails.prescriptionIntercepted}
          onChange={e => handleChange('prescriptionIntercepted', e.target.value)}
        >
          <MenuItem value='Yes'>Yes</MenuItem>
          <MenuItem value='No'>No</MenuItem>
        </Select>
      </FormControl> */}
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

export default ReferralComponent
