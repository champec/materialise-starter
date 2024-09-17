import React from 'react'
import { TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/de'

const CustomDatePicker = ({ id, value, onChange, error, question }) => {
  const today = new Date()

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
