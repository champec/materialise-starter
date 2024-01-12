import React from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  Radio,
  RadioGroup
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

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
  const handleChange = event => {
    setServiceInfo({ ...serviceInfo, booking_stage: event.target.value })
  }

  return (
    <form key={1} onSubmit={handleBookingSubmit(onSubmit)}>
      <Box container spacing={5}>
        <Stack spacing={4}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              DMS Stage
            </Typography>
          </Box>

          <FormControl component='fieldset'>
            <RadioGroup
              aria-label='dms-stage'
              name='dms-stage'
              value={serviceInfo?.booking_stage || ''}
              onChange={handleChange}
            >
              <FormControlLabel value='stage 1' control={<Radio />} label='Stage 1' />
              <FormControlLabel value='stage 2' control={<Radio />} label='Stage 2' />
              <FormControlLabel value='stage 3' control={<Radio />} label='Stage 3' />
            </RadioGroup>
          </FormControl>
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
