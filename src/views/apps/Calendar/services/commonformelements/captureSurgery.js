import React, { forwardRef, useState } from 'react'
import { Controller } from 'react-hook-form'
import { Box, Button, FormControl, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import CustomAutoCompleteInput from '../pharmacy-first/CustomAutoComplete'
import CustomApiSearch from '../pharmacy-first/CustomApiSearch'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers'

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <TextField inputRef={ref} label='Date' {...props} />
})

function CaptureSurgery({
  steps,
  handleAccountSubmit,
  accountControl,
  accountErrors,
  onSubmit,
  handleSelect,
  setAddNewPatientDialog,
  patientData,
  dispatch,
  selectedGPData,
  handleSelectedGP
}) {
  const [searchValue, setSearchValue] = useState('')
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
            {'GP Details'}
          </Typography>
          <Typography variant='caption' component='p'>
            {"Please select the patient's GP"}
          </Typography>
        </Box>
        <Stack spacing={4}>
          <FormControl fullWidth>
            <Controller
              name='surgery'
              control={accountControl}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => {
                return (
                  <CustomApiSearch
                    onSelect={handleSelectedGP}
                    value={value}
                    setValue={onChange}
                    placeHolder={'Search for a surgery'}
                    tableName={'patients'}
                    displayField={'full_name'}
                    onAdd={() => setAddNewPatientDialog(true)}
                    label='Search for GP'
                    searchVector={'name_search_vector'}
                    dispatch={dispatch}
                  />
                )
              }}
            />
            {accountErrors.surgery && (
              <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-book-fullName'>
                Surgery details are required
              </FormHelperText>
            )}
          </FormControl>
        </Stack>

        <Box sx={{ p: 2, border: '1px solid grey', borderRadius: '4px' }}>
          <Typography variant='h6'>Surgery</Typography>
          {/* Displaying a few key pieces of patient information */}
          <Typography variant='body1'>Name: {selectedGPData?.OrganisationName}</Typography>
          <Typography variant='body1'>Adress: {selectedGPData?.Address1}</Typography>
          <Typography variant='body1'>City: {selectedGPData?.City}</Typography>
          {/* ... include other relevant patient details ... */}

          {/* Edit link to reopen the detailed form */}
          <Typography
            variant='caption'
            sx={{ cursor: 'pointer', fontStyle: 'italic' }}
            // onClick={setAddNewPatientDialog}
            onClick={() => handleSelectedGP(null)}
          >
            Remove
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default CaptureSurgery
