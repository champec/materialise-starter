import React from 'react'
import { TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const CustomDatePicker = ({ id, value, onChange, error, question }) => {
  const today = new Date()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={question}
        value={value || today}
        defaultValue={today}
        onChange={newValue => {
          onChange(newValue)
        }}
        renderInput={params => <TextField {...params} fullWidth error={!!error} helperText={error} />}
      />
    </LocalizationProvider>
  )
}

export default CustomDatePicker
