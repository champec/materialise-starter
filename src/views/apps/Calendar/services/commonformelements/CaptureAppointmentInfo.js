import React from 'react'
import { Box, Button } from '@mui/material'
import { Controller } from 'react-hook-form'
import { StaticDateTimePicker } from '@mui/x-date-pickers'
import { Dialog, FormControl, FormHelperText, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import CustomAutoCompleteInput from '../pharmacy-first/CustomAutoComplete'
import dayjs from 'dayjs'

function AppointInfo({
  steps,
  handleBookingSubmit,
  bookingControl,
  bookingErrors,
  onSubmit,
  handleSelectedPharmacist,
  setDatePickerOpen,
  datePickerOpen,
  handleBack
}) {
  return (
    <div>
      <Box container spacing={5}>
        <Box sx={{ mb: 4 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
            {'Booking Information'}
          </Typography>
          <Typography variant='caption' component='p'>
            {'Please enter the booking information below'}
          </Typography>
        </Box>

        <Stack spacing={4}>
          <FormControl fullWidth>
            <Controller
              name='startDate'
              control={bookingControl}
              rules={{ required: true }}
              defaultValue={dayjs(new Date()).format('DD/MMM/YYYY h:mm A')}
              render={({ field: { value, onChange } }) => (
                <>
                  <TextField
                    label='Appointment Date'
                    value={value ? dayjs(value).format('DD/MMM/YYYY h:mm A') : ''}
                    name='startDate'
                    onChange={onChange}
                    onClick={() => setDatePickerOpen(true)}
                    autoComplete='off'
                    aria-readonly
                  />
                  <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
                    <StaticDateTimePicker
                      showTimeSelect
                      timeFormat='HH:mm'
                      timeIntervals={15}
                      selected={value}
                      id='date-time-picker'
                      defaultValue={value}
                      onChange={onChange}
                      onClose={() => setDatePickerOpen(false)}
                    />
                  </Dialog>
                </>
              )}
            />
            {bookingErrors.startDate && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-startDate'>
                This field is required
              </FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <Controller
              name='duration'
              control={bookingControl}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  error={Boolean(bookingErrors.duration)}
                  aria-describedby='stepper-linear-booking-duration'
                  defaultValue={15}
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={20}>20 minutes</MenuItem>
                  <MenuItem value={25}>25 minutes</MenuItem>
                </Select>
              )}
            />
            {bookingErrors.duration && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-duration'>
                This field is required
              </FormHelperText>
            )}
          </FormControl>
        </Stack>
      </Box>
    </div>
  )
}

export default AppointInfo
