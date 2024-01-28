import React, { useState, useEffect } from 'react'
import { Box, Button, Stack, TextField, Typography, Dialog, DialogTitle, CircularProgress } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { StaticDatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

function index({
  serviceInfo,
  setServiceInfo,
  bookingControl,
  bookingErrors,
  steps,
  handleBack,
  handleBookingSubmit,
  onSubmit
}) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [takenDatePickerOpen, setTakenDatePickerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  console.log('serviceInfo', serviceInfo)

  const handleDobChange = date => {
    // setServiceInfo({ ...serviceInfo, dob: date })
    const age = dayjs().diff(date, 'year')
    console.log('age', age)
    setServiceInfo({ ...serviceInfo, dob: date, age })
  }

  const handleTakenDateChange = date => {
    setServiceInfo({ ...serviceInfo, taken_date: date })
  }

  useEffect(() => {
    if (!serviceInfo || Object.keys(serviceInfo).length === 0) {
      // Initialize serviceInfo with default values if it's empty
      setServiceInfo({ dob: null, taken_date: dayjs().format('YYYY-MM-DD'), age: 0 })
    }
    setLoading(false)
  }, [serviceInfo, setServiceInfo])

  if (loading) {
    return <CircularProgress />
  }

  return (
    <form key={1} onSubmit={handleBookingSubmit(onSubmit)}>
      <Box container spacing={5}>
        <Stack spacing={4}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Hypertension case finding
            </Typography>
          </Box>

          <Box container spacing={5}>
            {/* Date of Birth Picker */}
            <TextField
              label='Date of Birth'
              value={serviceInfo.dob ? dayjs(serviceInfo.dob).format('YYYY-MM-DD') : ''}
              onClick={() => setDatePickerOpen(true)}
              fullWidth
              style={{ marginBottom: '2rem' }}
            />
            <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
              <StaticDatePicker
                displayStaticWrapperAs='mobile'
                openTo='day'
                value={serviceInfo.dob}
                onChange={handleDobChange}
                onClose={() => setDatePickerOpen(false)}
                renderInput={params => <TextField {...params} />}
              />
            </Dialog>

            {/* Taken Date Picker */}
            <TextField
              label='Taken Date'
              value={
                serviceInfo.taken_date
                  ? dayjs(serviceInfo.taken_date).format('YYYY-MM-DD')
                  : dayjs().format('YYYY-MM-DD')
              }
              onClick={() => setTakenDatePickerOpen(true)}
              fullWidth
              style={{ marginBottom: '2rem' }}
            />
            <Dialog open={takenDatePickerOpen} onClose={() => setTakenDatePickerOpen(false)}>
              <StaticDatePicker
                displayStaticWrapperAs='mobile'
                openTo='day'
                value={serviceInfo.taken_date}
                onChange={handleTakenDateChange}
                onClose={() => setTakenDatePickerOpen(false)}
                renderInput={params => <TextField {...params} />}
              />
            </Dialog>

            {/* Age */}
            <TextField label='Age' value={serviceInfo.age} disabled fullWidth />
          </Box>
        </Stack>

        <Box item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button size='large' variant='outlined' color='secondary' onClick={handleBack}>
            Back
          </Button>
          <Button size='large' type='submit' variant='contained'>
            Next
          </Button>
        </Box>
      </Box>
    </form>
  )
}

export default index
