import React, { useState } from 'react'
import { Box, Typography, Select, MenuItem, TextField, FormControl, InputLabel, FormHelperText } from '@mui/material'

const consultationOutcomes = [
  { value: 'ADVICE_ONLY', label: 'Advice given only' },
  { value: 'OTC_MEDICINE_SALE', label: 'Sale of an Over the Counter (OTC) medicine' },
  { value: 'MAS_REFERRAL', label: 'Referral into a pharmacy local minor ailments service (MAS)' },
  { value: 'LOCAL_COMMISSIONED_REFERRAL', label: 'Referral into an appropriate locally commissioned NHS service' },
  { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines supply / non-supply' },
  { value: 'SUPPLY_NO_SUPPLY', label: 'Medicines non-supply (specify actions taken)' },
  { value: 'ONWARD_REFERRAL', label: 'Onward referral to another CPCS pharmacy' },
  { value: 'NON_URGENT', label: 'Non-urgent signposting to another service' },
  { value: 'URGENT', label: 'Urgent escalation to another service' },
  { value: 'OTHER', label: 'Other (please specify)' }
]

const ChooseOutcome = ({ id, value, onChange, error }) => {
  const [selectedOutcome, setSelectedOutcome] = useState(value || '')
  const [otherOutcome, setOtherOutcome] = useState('')

  const handleOutcomeChange = event => {
    const newOutcome = event.target.value
    setSelectedOutcome(newOutcome)
    if (newOutcome !== 'OTHER') {
      onChange(newOutcome)
    }
  }

  const handleOtherOutcomeChange = event => {
    const newOtherOutcome = event.target.value
    setOtherOutcome(newOtherOutcome)
    onChange(newOtherOutcome)
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Choose Consultation Outcome
      </Typography>
      <FormControl fullWidth margin='normal'>
        <InputLabel>Consultation Outcome</InputLabel>
        <Select value={selectedOutcome} onChange={handleOutcomeChange}>
          {consultationOutcomes.map(outcome => (
            <MenuItem key={outcome.value} value={outcome.value}>
              {outcome.label}
            </MenuItem>
          ))}
        </Select>
        {selectedOutcome === 'OTHER' && (
          <TextField
            label='Please specify'
            value={otherOutcome}
            onChange={handleOtherOutcomeChange}
            fullWidth
            margin='normal'
          />
        )}
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    </Box>
  )
}

export default ChooseOutcome
