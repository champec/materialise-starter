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

  const handleExpiryChange = date => {
    setServiceInfo({ ...serviceInfo, expiry_date: date })
  }

  useEffect(() => {
    if (!serviceInfo || Object.keys(serviceInfo).length === 0) {
      setServiceInfo({ expiry_date: null, flu_jab: '', batch_number: '' })
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
              Flu Jab
            </Typography>
          </Box>

          <Box container spacing={5}>
            <TextField
              label='Flu Jab (Brand)'
              value={serviceInfo.flu_jab}
              onChange={e => setServiceInfo({ ...serviceInfo, flu_jab: e.target.value })}
              fullWidth
              style={{ marginBottom: '2rem' }}
            />
            {/* Date of Birth Picker */}
            <TextField
              label='Expiry Date'
              value={serviceInfo.expiry_date ? dayjs(serviceInfo.expiry_date).format('YYYY-MM-DD') : ''}
              onClick={() => setDatePickerOpen(true)}
              fullWidth
              style={{ marginBottom: '2rem' }}
            />
            <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
              <StaticDatePicker
                displayStaticWrapperAs='mobile'
                openTo='day'
                value={serviceInfo.expiry_date}
                onChange={handleExpiryChange}
                onClose={() => setDatePickerOpen(false)}
                renderInput={params => <TextField {...params} />}
              />
            </Dialog>

            {/* Taken Date Picker */}
            <TextField
              label='Batch Number'
              value={serviceInfo.batch_number}
              onChange={e => setServiceInfo({ ...serviceInfo, batch_number: e.target.value })}
              fullWidth
              style={{ marginBottom: '2rem' }}
            />
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
