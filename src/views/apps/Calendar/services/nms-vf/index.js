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
  InputLabel
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import PrescriptionWrite from 'src/pages/services/pharmacy-first/call-screen/[call_id]/PrescriptionWrite'

const conditions = [
  'asthma',
  'chronic obstructive pulmonary disease (COPD)',
  'type 2 diabetes',
  'high blood pressure',
  'high cholesterol',
  'osteoporosis',
  'gout',
  'glaucoma',
  'epilepsy',
  "Parkinson's disease",
  'urinary incontinence or retention',
  'heart failure',
  'coronary heart disease',
  'atrial fibrillation',
  'unstable angina or heart attack',
  'stroke or transient ischaemic attack (TIA)',
  'long-term risk of blood clots or blocked blood vessels, including DVT (deep vein thrombosis)'
]

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
          <PrescriptionWrite
            prescription={serviceInfo?.eligible_medications || []}
            setPrescription={e => setServiceInfo({ ...serviceInfo, eligible_medications: e })}
          />
          <FormControl fullWidth>
            <Controller
              name='additionalNotes'
              control={bookingControl}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={serviceInfo?.booking_notes || ''}
                  label='Additional Notes'
                  multiline
                  rows={4}
                  onChange={e => {
                    onChange(e)
                    setServiceInfo({ ...serviceInfo, booking_notes: e.target.value })
                  }}
                  autoComplete='off'
                  error={Boolean(bookingErrors.additionalNotes)}
                  placeholder='What is wrong with the patient'
                  aria-describedby='stepper-linear-booking-additionalNotes'
                />
              )}
            />
            {bookingErrors.additionalNotes && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-additionalNotes'>
                This field is required
              </FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id='demo-multiple-checkbox-label'>NMS Conditions</InputLabel>
            <Controller
              name='nmsConditions'
              control={bookingControl}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  multiple
                  value={serviceInfo?.eligible_conditions || []}
                  onChange={e => {
                    setServiceInfo({ ...serviceInfo, eligible_conditions: e.target.value })
                  }}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224
                      }
                    }
                  }}
                >
                  {conditions.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {bookingErrors.nmsConditions && (
              <FormHelperText sx={{ color: 'error.main' }}>At least one condition must be selected</FormHelperText>
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
