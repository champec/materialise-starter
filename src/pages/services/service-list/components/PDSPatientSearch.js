import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/de'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import PatientConfirmation from './PDSPatientConfirmation'
import usePatient from '../hooks/usePatient'

function PDSPatientSearch({
  onClose,
  handlePatientConfirm,
  searchType,
  setSearchType,
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  nhsNumber,
  setNhsNumber,
  feedback,
  isLoading,
  patientData,
  handleSearch,
  handleSearchAgain
}) {
  const handleConfirm = () => {
    handlePatientConfirm()
    onClose()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 2 }}>
        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='body1'>
            Warning: This application is currently using the NHS sandbox API for testing purposes. We are awaiting NHS
            approval before we can use real patient data. Please use only the test patient details provided by NHS for
            retrieving information.
          </Typography>
        </Alert>

        <Typography variant='body2' sx={{ mb: 2 }}>
          Sandbox test data:
          <br />
          1. Family name: Smith, Given name: Jane, Gender: female, Date of birth: 2010-10-22, NHS Number: 9000000009
          <br />
          2. NHS Number: 9000000025 (Sensitive patient)
          <br />
          3. NHS Number: 9000000033 (Patient with minimal data)
          <br />
          4.Family name: Smith, Given name: Jane, Gender: female, Date of birth: 2010-10-22Email:
          jane.smith@example.com, Phone: 01632960587
        </Typography>

        {!patientData ? (
          <Box component='form' onSubmit={handleSearch}>
            <FormControl component='fieldset'>
              <FormLabel component='legend'>Search Type</FormLabel>
              <RadioGroup row value={searchType} onChange={e => setSearchType(e.target.value)}>
                <FormControlLabel value='demographics' control={<Radio />} label='Demographics' />
                <FormControlLabel value='nhsNumber' control={<Radio />} label='NHS Number' />
              </RadioGroup>
            </FormControl>

            {searchType === 'demographics' ? (
              <>
                <TextField
                  fullWidth
                  label='First Name'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  margin='normal'
                />
                <TextField
                  fullWidth
                  label='Middle Name (optional)'
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  margin='normal'
                />
                <TextField
                  fullWidth
                  label='Last Name'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  margin='normal'
                />
                <DatePicker
                  label='Date of Birth'
                  value={dateOfBirth}
                  onChange={newValue => setDateOfBirth(newValue)}
                  renderInput={params => <TextField {...params} fullWidth margin='normal' />}
                />
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Gender</InputLabel>
                  <Select value={gender} label='Gender' onChange={e => setGender(e.target.value)}>
                    <MenuItem value='male'>Male</MenuItem>
                    <MenuItem value='female'>Female</MenuItem>
                    <MenuItem value='other'>Other</MenuItem>
                  </Select>
                </FormControl>
              </>
            ) : (
              <TextField
                fullWidth
                label='NHS Number'
                value={nhsNumber}
                onChange={e => setNhsNumber(e.target.value)}
                margin='normal'
              />
            )}

            <Button type='submit' variant='contained' color='primary' sx={{ mt: 2 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Search Patient'}
            </Button>
          </Box>
        ) : (
          <PatientConfirmation patientData={patientData} onConfirm={handleConfirm} onSearchAgain={handleSearchAgain} />
        )}

        {feedback && (
          <Alert severity={feedback.type} sx={{ mt: 2 }}>
            {feedback.message}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default PDSPatientSearch
