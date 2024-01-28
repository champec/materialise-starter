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
  MenuItem
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

function index({
  handleNext,
  handleBack,
  bookingControl,
  bookingErrors,
  steps,
  onSubmit,
  handleBookingSubmit,
  serviceInfo,
  setServiceInfo,
  service
}) {
  return (
    <form key={1} onSubmit={handleBookingSubmit(onSubmit)}>
      <Box container spacing={5}>
        <Box sx={{ mb: 4 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
            {steps[1].title}
          </Typography>
          <Typography variant='caption' component='p'>
            {steps[1].subtitle}
          </Typography>
        </Box>

        <Stack spacing={4}>
          <FormControl fullWidth>
            <Controller
              name='presentingComplaint'
              control={bookingControl}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={serviceInfo?.presenting_complaint || ''}
                  label='Presenting Complaint'
                  multiline
                  rows={4}
                  onChange={e => {
                    onChange(e)
                    setServiceInfo({ ...serviceInfo, presenting_complaint: e.target.value })
                  }}
                  autoComplete='off'
                  error={Boolean(bookingErrors.presenting_complaint)}
                  placeholder='What is wrong with the patient'
                  aria-describedby='stepper-linear-booking-presentingComplain'
                />
              )}
            />
            {bookingErrors.presentingComplaint && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-presentingComplaint'>
                This field is required
              </FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <Controller
              name='clinicalPathway'
              control={bookingControl}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  value={serviceInfo?.clinical_pathway || ''}
                  onChange={e => {
                    onChange(e)
                    setServiceInfo({ ...serviceInfo, clinical_pathway: e.target.value })
                  }}
                  error={Boolean(bookingErrors.clinical_pathway)}
                  aria-describedby='stepper-linear-booking-clinicalPathway'
                  defaultValue=''
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value='Sinusitis'>Sinusitis</MenuItem>
                  <MenuItem value='Sore_Throat'>Sore Throat</MenuItem>
                  <MenuItem value='Earache'>Earache (none DSP)</MenuItem>
                  <MenuItem value='Infected_Insect_Bites'>Infected Insect Bites</MenuItem>
                  <MenuItem value='Impetigo'>Impetigo</MenuItem>
                  <MenuItem value='Shingles'>Shingles</MenuItem>
                  <MenuItem value='UTI'>Simple UTI in women</MenuItem>
                </Select>
              )}
            />
            {bookingErrors.clinicalPathway && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-clinicalPathway'>
                This field is required
              </FormHelperText>
            )}
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
