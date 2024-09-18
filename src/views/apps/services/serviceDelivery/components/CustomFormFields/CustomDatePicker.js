import React, { useEffect } from 'react'
import { TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/de'

const CustomDatePicker = ({ id, value, onChange, error, question }) => {
  const today = dayjs()
  const dateValue = value ? dayjs(value) : today

  // Ensure the form sets the default date to today if no value is provided
  useEffect(() => {
    if (!value) {
      onChange(today.toDate())
    }
  }, [value, onChange, today])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={question}
        value={dateValue}
        onChange={newValue => {
          onChange(newValue ? newValue.toDate() : null)
        }}
        renderInput={params => <TextField {...params} fullWidth error={!!error} helperText={error} />}
      />
    </LocalizationProvider>
  )
}

export default CustomDatePicker
