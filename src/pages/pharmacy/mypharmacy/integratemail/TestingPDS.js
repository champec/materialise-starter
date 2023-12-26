import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Typography, Box, Alert } from '@mui/material'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

const PDSApiComponent = () => {
  const [searchParams, setSearchParams] = useState({
    given: '',
    family: '',
    birthdate: '',
    nhsNumber: '',
    gender: 'female'
  })
  const [patientData, setPatientData] = useState(null)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [multipleResults, setMultipleResults] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success')

  const baseURL = 'https://sandbox.api.service.nhs.uk/personal-demographics/FHIR/R4/Patient'

  const searchPatient = async () => {
    const queryParams = new URLSearchParams({
      ...(searchParams.given && { given: searchParams.given }),
      ...(searchParams.family && { family: searchParams.family }),
      ...(searchParams.birthdate && { birthdate: `eq${searchParams.birthdate}` }),
      ...(searchParams.nhsNumber && { id: searchParams.nhsNumber }),
      ...(searchParams.gender && { gender: searchParams.gender }),
      // _history: true,
      '_max-results': 10
    }).toString()

    let url = `${baseURL}?${queryParams}`
    if (searchParams.nhsNumber) {
      url = `${baseURL}/${searchParams.nhsNumber}`
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Request-ID': 'fd72501e-11e2-4857-ab61-7cde4dd5cc6f'
        }
      })

      console.log('RESPONSE', response)

      if (response?.data?.total == 1 || response.data.id) {
        const patientData = searchParams.nhsNumber ? response.data : response?.data?.entry[0]?.resource
        setPatientData(patientData)
        setMultipleResults(false)
        setWarning('')
        setError('')
        setSnackMessage('Patient found.')
        setSnackSeverity('success')
        setOpenSnack(true)
        return
      } else if (response.data.total < 1) {
        setWarning('No patient found. Please refine your search.')
        setSnackMessage('No patient found. Please refine your search.')
        setSnackSeverity('warning')
        setOpenSnack(true)
        setPatientData(null)
        setMultipleResults(false)
        return
      }

      // if (response.data.total > 1) {
      //   setMultipleResults(true)
      //   setPatientData(null)
      // } else {
      //   setPatientData(response.data)
      //   setMultipleResults(false)
      // }
      // setError('')
    } catch (error) {
      console.log('ERROR', error)
      setError('Error searching for patient. Please refine your search.')
      setSnackMessage('You have made a bad request double check the form.', error.message)
      setSnackSeverity('error')
      setOpenSnack(true)
      setPatientData(null)
      setMultipleResults(false)
    }
  }

  const handleInputChange = e => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Box sx={{ maxWidth: 500, m: 'auto', p: 2 }}>
      <Typography variant='h6'>Search for Patient</Typography>
      <TextField
        label='First Name'
        name='given'
        value={searchParams.given}
        onChange={handleInputChange}
        margin='normal'
        fullWidth
      />
      <TextField
        label='Last Name'
        name='family'
        value={searchParams.family}
        onChange={handleInputChange}
        margin='normal'
        fullWidth
      />
      <TextField
        label='Gender'
        name='gender'
        value={searchParams.gender}
        onChange={handleInputChange}
        margin='normal'
        fullWidth
      />
      <TextField
        label='Birthdate'
        name='birthdate'
        value={searchParams.birthdate}
        onChange={handleInputChange}
        margin='normal'
        fullWidth
      />
      <TextField
        label='NHS Number'
        name='nhsNumber'
        value={searchParams.nhsNumber}
        onChange={handleInputChange}
        margin='normal'
        fullWidth
      />
      <Button variant='contained' color='primary' onClick={searchPatient} sx={{ mt: 2 }}>
        Search
      </Button>

      {warning && (
        <Alert severity='warning' sx={{ mt: 2 }}>
          {warning}
        </Alert>
      )}
      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {patientData && (
        <Box mt={2}>
          <Typography variant='body1'>Patient Data:</Typography>
          <pre>{JSON.stringify(patientData, null, 2)}</pre>
        </Box>
      )}
      <CustomSnackbar
        vertical='top'
        horizontal='center'
        open={openSnack}
        setOpen={setOpenSnack}
        message={snackMessage}
        severity={snackSeverity}
      />
    </Box>
  )
}

export default PDSApiComponent
