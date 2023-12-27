import React, { forwardRef } from 'react'
import { Controller } from 'react-hook-form'
import { Box, Button, FormControl, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import CustomAutoCompleteInput from '../pharmacy-first/CustomAutoComplete'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers'

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <TextField inputRef={ref} label='Date' {...props} />
})

function CaptureConsultant({
  steps,
  handleAccountSubmit,
  accountControl,
  accountErrors,
  onSubmit,
  handleSelect,
  setAddNewPatientDialog,
  patientData,
  handleSelectedPharmacist,
  pharmacistData
}) {
  return (
    <Box>
      <form key={0} onSubmit={handleAccountSubmit(onSubmit)}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {steps[0].title}
            </Typography>
            <Typography variant='caption' component='p'>
              {steps[0].subtitle}
            </Typography>
          </Box>
          <Stack spacing={4}>
            <FormControl fullWidth>
              <Controller
                name='pharmacist'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomAutoCompleteInput
                    onSelect={handleSelectedPharmacist}
                    value={value}
                    setValue={onChange}
                    placeHolder={'Search for a pharmacist'}
                    tableName={'pharmacists'}
                    displayField={'full_name'}
                    onAdd={() => console.log('add new pharmacist')}
                    label='Search Pharmacist'
                  />
                )}
              />
              {accountErrors.pharmacist && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-book-fullName'>
                  A consultant is required
                </FormHelperText>
              )}
            </FormControl>

          </Stack>

          <Box sx={{ p: 2, border: '1px solid grey', borderRadius: '4px' }}>
            <Typography variant='h6'>Pharmacist</Typography>
            {/* Displaying a few key pieces of patient information */}
            <Typography variant='body1'>Name: {pharmacistData?.full_name}</Typography>
            <Typography variant='body1'>NHS Number: {pharmacistData?.gphc_number}</Typography>
            <Typography variant='body1'>Email: {pharmacistData?.email}</Typography>
            {/* ... include other relevant patient details ... */}

            {/* Edit link to reopen the detailed form */}
            <Typography
              variant='caption'
              sx={{ cursor: 'pointer', fontStyle: 'italic' }}
              onClick={setAddNewPatientDialog}
            >
              Edit
            </Typography>
          </Box>
        </Box>
      </form>
    </Box>
  )
}

export default CaptureConsultant
