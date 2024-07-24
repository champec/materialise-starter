import React from 'react'
import { Box, Typography, Button, Paper, Grid } from '@mui/material'

const PatientConfirmation = ({ patientData, onConfirm, onSearchAgain }) => {
  // Check if patientData is from NHS number search or demographic search
  const patient = patientData.entry ? patientData.entry[0].resource : patientData

  const getAddress = addresses => {
    if (addresses && addresses.length > 0) {
      const address = addresses[0]
      return address.line.join(', ') + ', ' + address.postalCode
    }
    return 'Address not available'
  }

  const getGPInfo = gps => {
    if (gps && gps.length > 0) {
      const gp = gps[0]
      return `GP ODS Code: ${gp.identifier.value}`
    }
    return 'GP information not available'
  }

  const getEmail = telecoms => {
    if (telecoms && telecoms.length > 0) {
      const email = telecoms.find(t => t.system === 'email')
      return email ? email.value : 'Email not available'
    }
    return 'Email not available'
  }

  const getName = names => {
    if (names && names.length > 0) {
      const name = names[0]
      return `${name.prefix ? name.prefix.join(' ') + ' ' : ''}${name.given.join(' ')} ${name.family}${
        name.suffix ? ' ' + name.suffix.join(' ') : ''
      }`
    }
    return 'Name not available'
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant='h5' gutterBottom>
        Confirm Patient Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>NHS Number: {patient.id}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Name: {getName(patient.name)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Date of Birth: {patient.birthDate}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Gender: {patient.gender}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Address: {getAddress(patient.address)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Email: {getEmail(patient.telecom)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>{getGPInfo(patient.generalPractitioner)}</Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='contained' color='primary' onClick={onConfirm}>
          Confirm Patient
        </Button>
        <Button variant='outlined' color='secondary' onClick={onSearchAgain}>
          Search Again
        </Button>
      </Box>
    </Paper>
  )
}

export default PatientConfirmation
