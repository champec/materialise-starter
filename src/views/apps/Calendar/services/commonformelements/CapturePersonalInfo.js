import React from 'react'
import Capturepatient from './capturepatient'
import { Box, Button } from '@mui/material'
import CaptureSurgery from './captureSurgery'
import CaptureConsultant from './CaptureConsultant'
import CaptureAppointmentInfo from './CaptureAppointmentInfo'

function CapturePersonalInfo({
  steps,
  handleAccountSubmit,
  accountControl,
  accountErrors,
  onSubmit,
  handleSelect,
  setAddNewPatientDialog,
  patientData,
  handleSelectedPharmacist,
  pharmacistData,
  dispatch,
  selectedGPData,
  handleSelectedGP,
  selectedPatient,
  setAddNewPharmacistDialog,
  bookingErrors,
  bookingControl,
  setDatePickerOpen,
  datePickerOpen
}) {

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <form key={0} onSubmit={handleAccountSubmit(onSubmit)} onKeyDown={handleKeyDown}>
      <Capturepatient
        steps={steps}
        handleAccountSubmit={handleAccountSubmit}
        accountControl={accountControl}
        accountErrors={accountErrors}
        onSubmit={onSubmit}
        handleSelect={handleSelect}
        setAddNewPatientDialog={setAddNewPatientDialog}
        patientData={patientData}
        selectedPatient={selectedPatient}
      />
      <CaptureSurgery
        steps={steps}
        handleAccountSubmit={handleAccountSubmit}
        accountControl={accountControl}
        accountErrors={accountErrors}
        onSubmit={onSubmit}
        handleSelect={handleSelect}
        setAddNewPatientDialog={setAddNewPatientDialog}
        patientData={patientData}
        dispatch={dispatch}
        selectedGPData={selectedGPData}
        handleSelectedGP={handleSelectedGP}
      />
      <CaptureConsultant
        steps={steps}
        handleAccountSubmit={handleAccountSubmit}
        accountControl={accountControl}
        accountErrors={accountErrors}
        onSubmit={onSubmit}
        handleSelect={handleSelect}
        setAddNewPharmacistDialog={setAddNewPharmacistDialog}
        patientData={patientData}
        handleSelectedPharmacist={handleSelectedPharmacist}
        pharmacistData={pharmacistData}
      />
      <CaptureAppointmentInfo
        steps={steps}
        handleAccountSubmit={handleAccountSubmit}
        accountControl={accountControl}
        accountErrors={accountErrors}
        onSubmit={onSubmit}
        handleSelect={handleSelect}
        setAddNewPatientDialog={setAddNewPatientDialog}
        patientData={patientData}
        bookingErrors={bookingErrors}
        bookingControl={bookingControl}
        setDatePickerOpen={setDatePickerOpen}
        datePickerOpen={datePickerOpen}
      />
      <Box item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button size='large' variant='outlined' color='secondary' disabled>
          Back
        </Button>
        <Button size='large' type='submit' variant='contained'>
          Next
        </Button>
      </Box>
    </form>
  )
}

export default CapturePersonalInfo
