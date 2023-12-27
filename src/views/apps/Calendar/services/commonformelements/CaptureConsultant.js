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
                name='fullName'
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
              {accountErrors.fullName && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-book-fullName'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='nhsNumber'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='NHS Number'
                    onChange={onChange}
                    autoComplete='off'
                    error={Boolean(accountErrors.nhsNumber)}
                    aria-describedby='stepper-linear-account-nhsNumber'
                  />
                )}
              />
              {accountErrors.nhsNumber && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='email'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    type='email'
                    value={value}
                    label='Email'
                    onChange={onChange}
                    autoComplete='off'
                    error={Boolean(accountErrors.email)}
                    placeholder='carterleonard@pharmex.com'
                    aria-describedby='stepper-linear-account-email'
                  />
                )}
              />
              {accountErrors.email && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-email'>
                  {accountErrors.email.message}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='mobileNumber'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Mobile Number'
                    onChange={onChange}
                    type='number'
                    placeholder=''
                    autoComplete='off'
                    error={Boolean(accountErrors.nhsNumber)}
                    aria-describedby='stepper-linear-account-nhsNumber'
                  />
                )}
              />
              {accountErrors.nhsNumber && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='houseNumber'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='House Number'
                    onChange={onChange}
                    placeholder='A1'
                    autoComplete='off'
                    error={Boolean(accountErrors.nhsNumber)}
                    aria-describedby='stepper-linear-account-nhsNumber'
                  />
                )}
              />
              {accountErrors.nhsNumber && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='address'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='address'
                    onChange={onChange}
                    placeholder='carterLeonard'
                    autoComplete='off'
                    error={Boolean(accountErrors.nhsNumber)}
                    aria-describedby='stepper-linear-account-nhsNumber'
                  />
                )}
              />
              {accountErrors.nhsNumber && (
                <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                  This field is required
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='postCode'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Post Code'
                    onChange={onChange}
                    placeholder='ABC 123'
                    autoComplete='off'
                    error={Boolean(accountErrors.nhsNumber)}
                    aria-describedby='stepper-linear-account-nhsNumber'
                  />
                )}
              />
            </FormControl>
            {accountErrors.nhsNumber && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                Post code is required
              </FormHelperText>
            )}

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='dateOfBirth'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => {
                  const parsedDate = value ? dayjs(value) : null
                  return (
                    <DatePicker
                      value={parsedDate}
                      onChange={onChange}
                      label='Date of Birth'
                      renderInput={<CustomInput />}
                      error={Boolean(accountErrors.dateOfBirth)}
                      aria-describedby='stepper-linear-account-dateOfBirth'
                    />
                  )
                }}
              />
            </FormControl>
            {accountErrors.dateOfBirth && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                Date of Birth is required
              </FormHelperText>
            )}

            <FormControl fullWidth sx={{ display: 'none' }}>
              <Controller
                name='telephoneNumber'
                control={accountControl}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    value={value}
                    label='Telephone Number'
                    onChange={onChange}
                    placeholder=''
                    autoComplete='off'
                    error={Boolean(accountErrors.nhsNumber)}
                    aria-describedby='stepper-linear-account-nhsNumber'
                  />
                )}
              />
            </FormControl>
            {accountErrors.nhsNumber && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-account-nhsNumber'>
                NHS Number is required
              </FormHelperText>
            )}
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
