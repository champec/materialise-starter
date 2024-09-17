import React, { useState, useEffect, forwardRef, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  styled
} from '@mui/material'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { createAppointment, updateAppointment } from 'src/store/apps/pharmacy-services/pharmacyServicesThunks'
import {
  selectServices,
  selectServiceStages,
  setSelectedAppointmentStartDate
} from 'src/store/apps/pharmacy-services/pharmacyServicesSlice'

import AddEditPatientForm from './components/AddEditPatientForm'
import { Stack, Fade } from '@mui/material'
import PDSPatientSearch from './components/PDSPatientSearch'
import AppointmentForm from './components/AppointmentForm'
import useGPSearch from './hooks/useGPSearch'
import GPSearchDialog from './components/GPSearchDialog'
import usePatient from './hooks/usePatient'
import parseISO from 'date-fns/parseISO'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'

import PerfectScrollbar from 'react-perfect-scrollbar'

import useAppointmentSubmission from './hooks/useAppointmentSubmission'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent white
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  zIndex: 5000 // Ensure it's above other content
}))

const BookingComponent = ({ appointment: appointmentObject, onClose, source }) => {
  const dispatch = useDispatch()
  const services = useSelector(selectServices)
  const organisationId = useSelector(state => state.organisation.organisation.id)
  const [selectedService, setSelectedService] = useState(null)
  const serviceStages = useSelector(selectServiceStages(selectedService))
  const [nhsPatientDialog, setNhsPatientDialog] = useState(false)
  const [gpDialogOpen, setGpDialogOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackSeverity, setSnackbarSeverity] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [objectToSubmit, setObjectToSubmit] = useState(null)
  const [editingAppointment, setEditingAppointment] = useState(false)
  const { submitAppointment, updateExistingAppointment, loading } = useAppointmentSubmission()
  const appointment = useSelector(state => state.services.appointments.find(a => a.id === appointmentObject?.id))
  const selectedStartDate = useSelector(state => state.services.selectedAppointmentStartDate)

  const showMessage = (severity, message) => {
    setSnackbarSeverity(severity)
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const {
    selectedPatient,
    patientInputValue,
    setSelectedPatient,
    setPatientInputValue,
    handleEditPatient,
    addNewPatientDialog,
    setAddNewPatientDialog,
    handlePatientSelect,
    handlePatientInputChange,
    handleConfirm: handlePatientConfirm,
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
    isLoading: ptIsLoading,
    patientData,
    handleSearch,
    handleSearchAgain
  } = usePatient()

  const {
    selectedGP,
    gpSearchTerm,
    gpSearchResults,
    isLoading,
    error,
    setSelectedGP,
    setGpSearchTerm,
    handleGPSearch,
    handleGPSelect,
    handleRemoveGP
  } = useGPSearch(patientData)

  const handleNhsPatientFetch = () => {
    setNhsPatientDialog(true)
  }

  console.log('SELECTED GP', selectedGP)

  const [formData, setFormData] = useState({
    pharmacy_id: organisationId,
    patient_id: null,
    service_id: '',
    appointment_type: '',
    overall_status: 'Scheduled',
    current_stage_id: '',
    scheduled_time: null,
    details: {},
    ...source
  })
  const [generateLink, setGenerateLink] = useState(true)

  useEffect(() => {
    if (appointment) {
      const {
        pharmacy_id,
        patient_id,
        service_id,
        appointment_type,
        overall_status,
        current_stage_id,
        scheduled_time,
        details,
        patient_object,
        gp_object
      } = appointment

      console.log('DETAILS SENDING TO FORM DATA', { appointment })

      setFormData({
        pharmacy_id,
        patient_id,
        service_id,
        appointment_type,
        overall_status,
        current_stage_id,
        scheduled_time: scheduled_time ? parseISO(scheduled_time) : null,
        // details,
        details: {
          ...details,
          triage: details?.triage ? { ...details.triage } : {},
          additional_details: details?.additional_details ? additional_details : ''
        },
        // patient_object,
        // gp_object
        ...source
      })

      setEditingAppointment(true)
      setSelectedPatient(patient_object)
      setSelectedGP(gp_object)
      setSelectedService(service_id)
    } else if (selectedStartDate) {
      console.log('SELECTED START DATE', selectedStartDate)
      setFormData(prevData => ({
        ...prevData,
        scheduled_time: selectedStartDate
      }))
    }
  }, [appointment])

  console.log('selectedStartDate', selectedStartDate)

  useEffect(() => {
    if (appointment) {
      // ... (setting formData as shown above)

      console.log('Form data after initialization:', { appointment, formData })
    }
    return () => {
      dispatch(setSelectedAppointmentStartDate(null))
    }
  }, [appointment])

  const handleDateChange = date => {
    setFormData(prevData => ({
      ...prevData,
      scheduled_time: date
    }))
  }

  const handleServiceChange = event => {
    const { name, value } = event.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
    setSelectedService(value)
    setFormData(prevData => ({
      ...prevData,
      current_stage_id: '',
      details: {
        ...prevData.details,
        triage: {}
      }
    }))
  }

  const handleFieldChange = event => {
    // Extract the name and value from the event target (usually an input field)
    const { name, value } = event.target

    // Split the name into an array of keys
    // For example, 'details.triage.question1' becomes ['details', 'triage', 'question1']
    const keys = name.split('.')

    setFormData(prevData => {
      // If there's only one key, it's a top-level update
      if (keys.length === 1) {
        // Return a new object with all previous data, updating only the specified field
        return { ...prevData, [name]: value }
      }

      // Handle nested updates
      // Separate the first key (outerKey) from the rest (innerKeys)
      // For 'details.triage.question1':
      // outerKey would be 'details'
      // innerKeys would be ['triage', 'question1']
      const [outerKey, ...innerKeys] = keys

      // Join the inner keys back into a string
      // ['triage', 'question1'] becomes 'triage.question1'
      const innerPath = innerKeys.join('.')

      // Return a new state object
      return {
        ...prevData, // Spread all previous data
        [outerKey]: {
          // Update the outer key (e.g., 'details')
          ...prevData[outerKey], // Spread the previous data for this key
          [innerPath]: value // Update the nested value
          // This creates a new object for 'details', with a new nested structure
          // It effectively does: details: { ...prevDetails, triage: { ...prevTriage, question1: value } }
        }
      }
    })
  }

  const handleCheckboxChange = event => {
    const { name, checked } = event.target
    handleFieldChange({
      target: {
        name,
        value: checked
      }
    })
  }

  const handleSubmit = event => {
    event.preventDefault()

    console.log('SUBMIT BUTON PRESSE')
    const newObjectToSubmit = { ...formData, gp_object: { ...selectedGP }, patient_object: { ...selectedPatient } }

    // Validation checks
    if (!newObjectToSubmit.patient_object || Object.keys(newObjectToSubmit.patient_object).length === 0) {
      showMessage('error', 'Please select a patient.')
      return
    }

    if (!newObjectToSubmit.gp_object || Object.keys(newObjectToSubmit.gp_object).length === 0) {
      showMessage('error', 'Please select a GP.')
      return
    }

    if (!newObjectToSubmit.details.acceptTerms) {
      showMessage('error', 'Please accept the terms and conditions.')
      return
    }

    if (!newObjectToSubmit.scheduled_time) {
      showMessage('error', 'Please choose a time for the appointment.')
      return
    }

    // // Check if text message is not being sent
    if (!newObjectToSubmit.details.sendTextUpdate) {
      setObjectToSubmit(newObjectToSubmit)
      setOpenConfirmDialog(true)
    } else {
      submitForm(newObjectToSubmit)
    }
  }

  const submitForm = async dataToSubmit => {
    console.log('Submitting data:', dataToSubmit)
    try {
      if (appointment) {
        const updatedAppointment = await updateExistingAppointment(
          { id: appointment.id, ...dataToSubmit },
          generateLink
        )
        console.log('Appointment updated:', updatedAppointment)
      } else {
        const newAppointment = await submitAppointment(dataToSubmit)
        console.log('New appointment created:', newAppointment)
      }
      onClose()
    } catch (error) {
      console.error('Error submitting appointment:', error)
      showMessage('error', 'Failed to submit appointment. Please try again.')
    }
  }

  const handleConfirmNoText = () => {
    setOpenConfirmDialog(false)
    submitForm(objectToSubmit)
  }

  const handleCancelNoText = () => {
    setOpenConfirmDialog(false)
  }

  const loadingComponent = () => {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' width='400px'>
        <CircularProgress />
      </Box>
    )
  }

  console.log('FORM DATA BEFORE GOING TO APPOINTMENT FORM', formData)
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <PerfectScrollbar>
        <Box position='relative'>
          {loading && (
            <LoadingOverlay>
              <CircularProgress />
            </LoadingOverlay>
          )}
          <AppointmentForm
            appointment={appointment}
            formData={formData}
            services={services}
            serviceStages={serviceStages}
            selectedPatient={selectedPatient}
            patientInputValue={patientInputValue}
            onPatientSelect={handlePatientSelect}
            onPatientInputChange={handlePatientInputChange}
            onEditPatient={handleEditPatient}
            onServiceChange={handleServiceChange}
            onFieldChange={handleFieldChange}
            onDateChange={handleDateChange}
            onSubmit={handleSubmit}
            onNhsPatientFetch={handleNhsPatientFetch}
            onNewPatientDialogOpen={() => setAddNewPatientDialog(true)}
            setSelectedPatient={setSelectedPatient}
            setPatientInputValue={setPatientInputValue}
            selectedGP={selectedGP}
            setSelectedGP={setSelectedGP}
            gpSearchTerm={gpSearchTerm}
            gpSearchResults={gpSearchResults}
            isLoading={isLoading}
            error={error}
            setGpSearchTerm={setGpSearchTerm}
            handleGPSearch={handleGPSearch}
            handleGPSelect={handleGPSelect}
            handleRemoveGP={handleRemoveGP}
            setGpDialogOpen={setGpDialogOpen}
            gpDialogOpen={gpDialogOpen}
            handleCheckboxChange={handleCheckboxChange}
            editingAppointment={editingAppointment}
            generateLink={generateLink}
            setGenerateLink={setGenerateLink}
          />
        </Box>

        <Dialog
          fullWidth
          maxWidth='md'
          scroll='body'
          TransitionComponent={Transition}
          open={addNewPatientDialog}
          onClose={() => setAddNewPatientDialog(false)}
        >
          <DialogContent>
            <AddEditPatientForm
              patient={{ full_name: patientInputValue }}
              onClose={() => {
                console.log('ADd new patient form close')
                // setSelectedPatient(null)
                setAddNewPatientDialog(false)
                setPatientInputValue('')
              }}
              onSelect={handlePatientSelect}
              selectedPatient={selectedPatient}
              setSelectedPatient={setSelectedPatient}
            />
          </DialogContent>
        </Dialog>

        {/* New NHS Patient Fetch Dialog */}
        <Dialog
          fullWidth
          maxWidth='md'
          PaperProps={{
            sx: { minHeight: '600px' }
          }}
          scroll='body'
          TransitionComponent={Transition}
          open={nhsPatientDialog}
          onClose={() => setNhsPatientDialog(false)}
        >
          <DialogContent>
            <PDSPatientSearch
              onClose={() => setNhsPatientDialog(false)}
              onSelect={handlePatientSelect}
              setSelectedPatient={setSelectedPatient}
              handlePatientConfirm={handlePatientConfirm}
              searchType={searchType}
              setSearchType={setSearchType}
              firstName={firstName}
              setFirstName={setFirstName}
              middleName={middleName}
              setMiddleName={setMiddleName}
              lastName={lastName}
              setLastName={setLastName}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              gender={gender}
              setGender={setGender}
              nhsNumber={nhsNumber}
              setNhsNumber={setNhsNumber}
              feedback={feedback}
              isLoading={ptIsLoading}
              patientData={patientData}
              handleSearch={handleSearch}
              handleSearchAgain={handleSearchAgain}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          fullWidth
          maxWidth='md'
          PaperProps={{
            sx: { minHeight: '600px' }
          }}
          open={gpDialogOpen}
          onClose={() => setGpDialogOpen(false)}
        >
          <DialogTitle>Find GP</DialogTitle>
          <DialogContent>
            <GPSearchDialog
              gpSearchTerm={gpSearchTerm}
              setGpSearchTerm={setGpSearchTerm}
              handleGPSearch={handleGPSearch}
              handleGPSelect={gp => {
                handleGPSelect(gp)
                setGpDialogOpen(false)
              }}
              gpSearchResults={gpSearchResults}
              isLoading={isLoading}
              error={error}
            />
          </DialogContent>
        </Dialog>
        <CustomSnackbar
          message={snackbarMessage}
          severity={snackSeverity}
          horizontal={'center'}
          vertical={'top'}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
        />
        <Dialog
          open={openConfirmDialog}
          onClose={handleCancelNoText}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>{'Confirm Appointment Without Text Message'}</DialogTitle>
          <DialogContent>
            <Alert severity='warning'>
              <AlertTitle>Warning</AlertTitle>
              <DialogContentText id='alert-dialog-description'>
                You have chosen not to send a text message with this appointment. Are you sure you want to proceed?
              </DialogContentText>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelNoText}>Cancel</Button>
            <Button onClick={handleConfirmNoText} autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </PerfectScrollbar>
    </LocalizationProvider>
  )
}

export default BookingComponent
