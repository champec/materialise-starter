import React from 'react'
import Capturepatient from './capturepatient'
import { Box, Button } from '@mui/material'
import CaptureSurgery from './captureSurgery'
import CaptureConsultant from './CaptureConsultant'

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
  handleSelectedGP
}) {
  return (
    <form key={0} onSubmit={handleAccountSubmit(onSubmit)}>
      <Capturepatient
        steps={steps}
        handleAccountSubmit={handleAccountSubmit}
        accountControl={accountControl}
        accountErrors={accountErrors}
        onSubmit={onSubmit}
        handleSelect={handleSelect}
        setAddNewPatientDialog={setAddNewPatientDialog}
        patientData={patientData}
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
        setAddNewPatientDialog={setAddNewPatientDialog}
        patientData={patientData}
        handleSelectedPharmacist={handleSelectedPharmacist}
        pharmacistData={pharmacistData}
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
