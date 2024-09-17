import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Drawer,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  styled,
  Dialog,
  DialogContent,
  Fade,
  DialogTitle
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import DailyIframe from '@daily-co/daily-js'
import { createThreadAndSendSMS } from '../../../store/apps/calendar/pharmacyfirst/appointmentListSlice'
import { Icon } from '@iconify/react'
import AdvancedFormEngine from '../../../views/apps/services/serviceDelivery/components/AdvancedFormEngine'
import AddEditPatientForm from '../service-list/components/AddEditPatientForm'
import GPSearchDialog from '../service-list/components/GPSearchDialog'
import useGPSearch from '../service-list/hooks/useGPSearch'
import useAppointmentSubmission from '../service-list/hooks/useAppointmentSubmission'
import pharmacyServicesSlice, {
  selectServices,
  selectServiceStages
} from 'src/store/apps/pharmacy-services/pharmacyServicesSlice'
import { fetchServicesWithStages } from '../../../store/apps/pharmacy-services/pharmacyServicesThunks'
import { getFormDefinitionForService } from '../../../views/apps/services/serviceDelivery/components/utils/getFormDefinitionForService'
import withReducer from 'src/@core/HOC/withReducer'
import AppointMentChat from '../pharmacy-first/appointment-list/AppointMentChat'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { useCallFrame } from '@daily-co/daily-react'
import { position } from 'stylis'
import VideoCallComponent from '../pharmacy-first/call-screen/CallScreen'
import AppointmentForm from '../service-list/components/AppointmentForm'
import usePatient from '../service-list/hooks/usePatient'
import PDSPatientSearch from '../service-list/components/PDSPatientSearch'
import CustomSnackbar from 'src/views/apps/Calendar/services/pharmacy-first/CustomSnackBar'
import { createServiceDeliveries } from '../service-list/hooks/useAppointmentSubmission'
import ConsultationNotesComponent from '../service-stats/AIConsult'

const steps = ['Initial Configuration', 'Service Form', 'Appointment Details', 'Review & Submit']

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

//styled components

const StepperContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1]
}))

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3]
}))

const MainStepperButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}))

const QuickServiceDeliveryComponent = () => {
  const dispatch = useDispatch()
  const organisationId = useSelector(state => state.organisation.organisation.id)
  const userId = useSelector(state => state.user.user.id)
  const services = useSelector(selectServices)
  const [activeStep, setActiveStep] = useState(0)
  const [config, setConfig] = useState({ appointmentType: '', service: '', stage: '', shared_data: {} })
  const [formDef, setFormDef] = useState({})
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState({
    patient: null,
    gp: null,
    phoneNumber: '',
    patientName: '',
    remote_details: null,
    pharmacy_id: organisationId,
    patient_id: null,
    service_id: '',
    appointment_type: '',
    overall_status: 'Scheduled',
    current_stage_id: '',
    scheduled_time: null,
    patient_object: null,
    gp_object: null,
    details: {}
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const serviceStages = useSelector(selectServiceStages(config.service))
  const [videoLinkCreated, setVideoLinkCreated] = useState(false)
  const [isCallReady, setIsCallReady] = useState(false)
  const [textSent, setTextSent] = useState(false)
  const { submitAppointment, loading } = useAppointmentSubmission()
  const [nhsPatientDialog, setNhsPatientDialog] = useState(false)
  const [gpDialogOpen, setGpDialogOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackSeverity, setSnackbarSeverity] = useState(null)
  const [currentThread, setCurrentThread] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [objectToSubmit, setObjectToSubmit] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  // ADVANCED FORM STATES
  const [currentNodeId, setCurrentNodeId] = useState(formDef?.startNode)
  const [formData, setFormData] = useState({})
  const [history, setHistory] = useState([formDef?.startNode])
  const [errors, setErrors] = useState({})
  const [isLocked, setIsLocked] = useState(false)
  const [prescriptionId, setPrescriptionId] = useState(null)
  const [serviceDeliveryId, setServiceDeliveryId] = useState(null)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
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

  // AI CHAT BOT STATES
  const [notes, setNotes] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [chatBotMessages, setChatBotMessages] = useState([])
  // END AI CHAT BOT STATES

  const handleNhsPatientFetch = () => {
    setNhsPatientDialog(true)
  }

  const {
    selectedGP,
    gpSearchTerm,
    gpSearchResults,
    isLoading: gpLoading,
    error: gpError,
    setSelectedGP,
    setGpSearchTerm,
    handleGPSearch,
    handleGPSelect,
    handleRemoveGP
  } = useGPSearch()

  useEffect(() => {
    dispatch(fetchServicesWithStages())
  }, [dispatch])

  useEffect(() => {
    if (config?.stage) {
      const formDef = getFormDefinitionForService(config.stage)
      setCurrentNodeId(formDef.startNode)
      setHistory([formDef.startNode])
      setFormDef(formDef)
    }
  }, [config?.stage])

  const callRef = useRef(null)

  // Handlers for custom buttons
  const handleBookingButton = () => {
    console.log('Booking button clicked')
    // Add your logic here
  }

  const handleScrButton = () => {
    console.log('SCR button clicked')
    // Add your logic here
  }

  const handleNotesButton = () => {
    console.log('Notes button clicked')
    // Add your logic here
  }

  const setSnackbarOpen = isOpen => {
    setSnackbar(prev => ({ ...prev, open: isOpen }))
  }

  const handlePrintForm = () => {
    // Implement logic to open a new window for printing the form
    window.open(`/services/quick-service/print-form/${serviceDeliveryId}`, '_blank')
  }

  const handlePrintPrescription = () => {
    // Implement logic to open a new window for printing the prescription
    window.open(`/services/quick-service/print-prescription/${prescriptionId}`, '_blank')
  }

  const handlePrescriptionButton = () => {
    console.log('Prescription button clicked')
    // Add your logic here
  }

  const handleReset = () => {
    resetForm()
    setActiveStep(0)
    setSubmissionComplete(false)
    setServiceDeliveryId(null)
    setPrescriptionId(null)
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const handleFormSubmit = newFormData => {
    setFormData(newFormData)
    setIsDrawerOpen(false)
  }

  const handleSaveProgress = newFormData => {
    setFormData(newFormData)
    showSnackbar('Progress saved successfully', 'success')
  }

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleStep = step => () => {
    setActiveStep(step)
  }

  const handleNext = async () => {
    if (activeStep === 0 && config.appointmentType === 'remote-video' && !videoLinkCreated) {
      if (!appointmentDetails.phoneNumber || !appointmentDetails.patientName) {
        showSnackbar('Please enter both phone number and patient name for remote appointments.', 'error')
        return
      }

      try {
        setLoadingRemote(true)
        // Create video link
        const { data: dailyResponse, error: dailyError } = await supabase.functions.invoke('daily-scheduler', {
          body: { scheduledTime: appointmentDetails.scheduledTime }
        })

        if (dailyError) {
          console.log('error generitng vid link', dailyError)
          setLoadingRemote(false)
          throw new Error('Error generating video link')
        }

        console.log('SUCCESSFULLY CREATED DAILY LINK', { dailyResponse })

        setAppointmentDetails(prev => ({
          ...prev,
          remote_details: {
            url: dailyResponse.room.url,
            hcp_token: dailyResponse.hcpToken,
            patient_token: dailyResponse.patientToken
          }
        }))

        const patientFirstName = appointmentDetails.patientName || 'sir/madam'

        // Send text message
        const message = dailyResponse.scheduledTime
          ? `Your remote Pharmacy First appointment is scheduled for ${new Date(
              dailyResponse.scheduledTime * 1000
            ).toLocaleString()}. 
           Use this link to join the meeting: ${dailyResponse.room.url}?token=${dailyResponse.patientToken}. 
           Please be ready at the scheduled time. When prompted, enter your first name '${patientFirstName}' to join the call.`
          : `Your immediate remote Pharmacy First appointment is ready. 
           Use this link to join the meeting: ${dailyResponse.room.url}?token=${dailyResponse.patientToken}. 
           You can join the call now. When prompted, enter your first name '${patientFirstName}' to join the call.`

        await dispatch(
          createThreadAndSendSMS({
            patientName: appointmentDetails.patientName,
            message,
            phoneNumber: appointmentDetails.phoneNumber,
            time: new Date()
          })
        )

        setVideoLinkCreated(true)
        setTextSent(true)
        showSnackbar('Video link created and text message sent', 'success')
      } catch (error) {
        showSnackbar('Error setting up remote appointment, error')
        setLoadingRemote(false)
        console.log('Error setting up remote appointment', error)
        return
      }
    }
    setLoadingRemote(false)
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleAppointmentDetailsChange = (field, value) => {
    setAppointmentDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = event => {
    const { name, checked } = event.target

    const keys = name.split('.')
    const [outerKey, ...innerKeys] = keys
    const mainkey = innerKeys[0]

    const appointmentData = {
      ...config,
      ...formData,
      ...appointmentDetails,
      details: {
        ...formData,
        [mainkey]: checked
      }
    }

    setAppointmentDetails(appointmentData)
  }

  const handleAdditionalDetails = event => {
    const { name, value } = event.target

    const keys = name.split('.')
    const [outerKey, ...innerKeys] = keys
    const mainkey = innerKeys[0]

    const appointmentData = {
      ...config,
      ...formData,
      ...appointmentDetails,
      details: {
        ...formData,
        [mainkey]: value
      }
    }

    setAppointmentDetails(appointmentData)
  }

  //temp
  // appointment requirements - id(auto supabse), pharmacy_id, patient_id, service_id, appointment_type, overall_Status, current_stage_id, scheduled_time, last_updated,
  // completed_at, details, patient_object, gp_object, remote_details, status_details, referral
  //generate all the ps_service_delivery entries based on the ps_service_stages for the chosen service, and populate the ps_service_delivery for the current just filled in stage
  // ps_service_delivery table requirements: id(auto supabase), appointment_id (from recently generated appointment),
  //service_stage_id - (one for each, getting ps_service.id and the ps_service.multi bool and if multi finding all the ps_service_stages.service_id for that service, if not multi then just the currently selected stage is made), status (will be completed for this stage, required by stepper, completed_at will be now, details is where the entire service deliver oject goes), last_updated is now, completed_by for now is null, outcome will come from the object details.outcome if there is one, not all services have it,
  // this entire process needs to succeed for it to be completed, if at any stage there is failure we need to undo all saved supabased changed and go back to initial state in db, i dont want half baked entries, there is need to clear error handling, and also clear process indicators along the way.
  // submisison should start by simple validation, obviously a service needs to have been picked and a service stage needs to have been picked,
  //temp

  const handleSubmit = async () => {
    // Start by showing a loading indicator
    setSubmitLoading(true)

    try {
      // 1. Validate input
      if (!config.service || !config.stage) {
        throw new Error('Please select both a service and a stage.')
      }

      // 2. Prepare appointment data
      const appointmentData = {
        pharmacy_id: organisationId,
        patient_id: selectedPatient?.id,
        service_id: config.service,
        appointment_type: config.appointmentType,
        overall_status: 'Scheduled',
        current_stage_id: config.stage.id,
        scheduled_time: appointmentDetails.scheduledTime,
        last_updated: new Date().toISOString(),
        details: {
          ...formData,
          sendTextUpdate: config.appointmentType === 'remote-video'
        },
        patient_object: selectedPatient,
        gp_object: appointmentDetails.gp,
        remote_details: appointmentDetails.remote_details,
        status_details: { currentStatus: 'Scheduled' },
        referral: null, // Add referral data if available
        appointment_source: 'quick-service',
        source_details: 'Booked with Quick Service'
      }

      console.log('SUBMIT', appointmentData, 'FORM DATA', formData)
      // 3. Insert appointment
      const { data: appointmentResult, error: appointmentError } = await supabase
        .from('ps_appointments')
        .insert(appointmentData)
        .select('*')
        .single()

      if (appointmentError) throw appointmentError

      const appointmentId = appointmentResult.id

      console.log('APPOINTMENT ID', appointmentId, 'APPOINTMENT DATA', appointmentResult)

      // 4. Create service deliveries
      await createServiceDeliveries(appointmentId, config.service, config.stage.id)

      // 5. Update the current stage's service delivery with form data
      const { data: currentDelivery, error: updateError } = await supabase
        .from('ps_service_delivery')
        .update({
          status: 'Completed',
          completed_at: new Date().toISOString(),
          details: formData,
          outcome: formData.outcome || 'completed',
          shared_data: formData?.medicationDetails?.medications ? formData?.medicationDetails?.medications : null
        })
        .eq('appointment_id', appointmentId)
        .eq('service_stage_id', config.stage.id)
        .select('id')

      console.log('CURRENT DELIVERY', currentDelivery, 'UPDATE ERROR', updateError)

      if (updateError) {
        console.log('UPDATE APPOINTMENT ERROR', updateError)
        throw updateError
      }

      setServiceDeliveryId(currentDelivery[0].id)

      // 6. Check for medications and create prescriptions
      if (
        formData.medicationSupplyDetails?.medications &&
        Object.keys(formData.medicationSupplyDetails.medications).length > 0
      ) {
        const prescriptions = Object.entries(formData.medicationSupplyDetails.medications).map(
          ([drugCode, details]) => ({
            created_at: new Date().toISOString(),
            drug_code: drugCode,
            drug_desc: details.drugDescription,
            drug_brand: details.pack,
            drug_dose: details.drugDose,
            prescription_particulars: formData.medicationSupplyDetails.commonFields,
            drug_qty: details.quantitySupplied,
            drug_unit: details?.drugUnit || null,
            patient_id: selectedPatient?.id,
            written_by: userId, // Assuming you have access to the current user's ID
            ps_delivery_id: currentDelivery[0].id,
            patient_object: appointmentDetails.patient_object,
            gp_object: appointmentDetails.gp_object
          })
        )

        const { data: prescriptionData, error: prescriptionError } = await supabase
          .from('ps_prescriptions')
          .insert(prescriptions)
          .select('id')

        if (prescriptionError) {
          console.log('PRESCRIPTION ERROR', prescriptionError)
          throw prescriptionError
        }

        if (prescriptionData) {
          setPrescriptionId(prescriptionData[0]?.id)
        }
      }

      // 7. Handle remote appointment specifics
      if (config.appointmentType === 'remote-video' && appointmentDetails.remote_details) {
        // Send SMS reminder if needed
        if (appointmentData.details.sendTextUpdate) {
          await sendSMSReminder(appointmentDetails.phoneNumber, appointmentDetails.remote_details.url)
        }
      }

      // 7. Show success message
      showSnackbar('Appointment created successfully', 'success')
      setSubmissionComplete(true)

      // 8. Reset form or navigate away
      resetForm() // Implement this function to clear all form fields
      // or
      // router.push('/appointments'); // Navigate to appointments list
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      showSnackbar(`Error: ${error.message}`, 'error')

      // 9. Attempt to roll back changes if possible
      if (error.appointmentId) {
        await supabase.from('ps_appointments').delete().eq('id', error.appointmentId)
        await supabase.from('ps_service_delivery').delete().eq('appointment_id', error.appointmentId)
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDateChange = date => {
    setAppointmentDetails(prev => ({ ...prev, scheduled_time: date }))
  }

  // Helper function to send SMS reminder
  const sendSMSReminder = async (phoneNumber, meetingUrl) => {
    // Implement your SMS sending logic here
    // This could be a call to your backend API or a third-party service
    console.log(`Sending SMS to ${phoneNumber} with meeting URL: ${meetingUrl}`)
  }

  // Helper function to reset the form
  const resetForm = () => {
    setConfig({ appointmentType: '', service: '', stage: '' })
    setFormData({})
    setAppointmentDetails({
      patient: null,
      gp: null,
      phoneNumber: '',
      patientName: '',
      remote_details: null,
      pharmacy_id: organisationId,
      patient_id: null,
      service_id: '',
      appointment_type: '',
      overall_status: 'Scheduled',
      current_stage_id: '',
      scheduled_time: null,
      details: {}
    })
    setSelectedPatient(null)
    setVideoLinkCreated(false)
    setTextSent(false)
  }

  const renderStepContent = step => {
    switch (step) {
      case 0:
        return (
          <FormContainer>
            <FormControl fullWidth sx={{ mb: 2 }} disabled={loadingRemote}>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                value={config.appointmentType || 'in-person'}
                onChange={e => handleConfigChange('appointmentType', e.target.value)}
                label='Appointment Type'
              >
                <MenuItem value='in-person'>In-Person</MenuItem>
                <MenuItem value='remote-video'>Remote Video</MenuItem>
              </Select>
            </FormControl>
            {config.appointmentType === 'remote-video' && (
              <>
                <TextField
                  fullWidth
                  label='Patient Name'
                  value={appointmentDetails.patientName}
                  onChange={e => handleAppointmentDetailsChange('patientName', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label='Patient Phone Number'
                  value={appointmentDetails.phoneNumber}
                  onChange={e => handleAppointmentDetailsChange('phoneNumber', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Service</InputLabel>
              <Select
                value={config.service || services[1]}
                onChange={e => handleConfigChange('service', e.target.value)}
                label='Service'
              >
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {config.service && (
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={config.stage}
                  onChange={e => handleConfigChange('stage', e.target.value)}
                  label='Stage / Type'
                >
                  {serviceStages.map(stage => (
                    <MenuItem key={stage.id} value={stage}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </FormContainer>
        )
      case 1:
        return (
          <FormContainer>
            {config.appointmentType === 'remote-video' ? (
              <>
                {submitLoading ? 'Submitting...' : 'Submit Appointment'}
                {appointmentDetails.remote_details?.url ? (
                  <Box ref={callRef} sx={{ height: '80vh', position: 'relative' }}>
                    {/* <div ref={callRef} style={{ height: '80vh', position: 'relative' }} />
                    {!isCallReady && <Typography>Connecting to video call...</Typography>} */}
                    <VideoCallComponent
                      containerRef={callRef}
                      url={appointmentDetails.remote_details.url}
                      handleBookingButton={() => setIsDrawerOpen(true)}
                      handleScrButton={handleScrButton}
                      handleNotesButton={handleNotesButton}
                      handlePrescriptionButton={handlePrescriptionButton}
                      hcpToken={appointmentDetails.remote_details.hcp_token}
                    />
                  </Box>
                ) : (
                  <Typography>Video call is being set up...</Typography>
                )}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
                  <Button variant='contained' onClick={() => setIsDrawerOpen(true)}>
                    {isDrawerOpen ? 'Close Form' : 'Open Form'}
                  </Button>
                </Box>
                <Drawer
                  anchor='right'
                  open={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  sx={{
                    '& .MuiDrawer-paper': {
                      width: '40%',
                      maxWidth: '600px',
                      padding: 2
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h6'>Service Delivery Form</Typography>
                    <IconButton onClick={() => setIsDrawerOpen(false)}>
                      <Icon icon='gg:close-r' />
                    </IconButton>
                  </Box>
                  <AdvancedFormEngine
                    formDefinition={formDef}
                    // initialData={}
                    onSubmit={handleFormSubmit}
                    onSaveProgress={handleSaveProgress}
                    formData={formData}
                    setFormData={setFormData}
                    currentNodeId={currentNodeId}
                    setCurrentNodeId={setCurrentNodeId}
                    history={history}
                    setHistory={setHistory}
                    isLocked={isLocked}
                    setIsLocked={setIsLocked}
                    errors={errors}
                    setErrors={setErrors}
                    sharedData={config.shared_data}
                    isQuickService={true}
                  />
                </Drawer>
              </>
            ) : (
              <Box sx={{ padding: 2 }}>
                <Typography variant='h6' gutterBottom>
                  Service Delivery Form
                </Typography>
                {formDef && (
                  <AdvancedFormEngine
                    formDefinition={formDef}
                    // initialData={formData}
                    onSubmit={handleFormSubmit}
                    onSaveProgress={handleSaveProgress}
                    formData={formData}
                    setFormData={setFormData}
                    currentNodeId={currentNodeId}
                    setCurrentNodeId={setCurrentNodeId}
                    history={history}
                    setHistory={setHistory}
                    isLocked={isLocked}
                    setIsLocked={setIsLocked}
                    errors={errors}
                    setErrors={setErrors}
                    sharedData={config.shared_data}
                    isQuickService={true}
                  />
                )}
              </Box>
            )}
          </FormContainer>
        )
      case 2:
        return (
          <FormContainer>
            <AppointmentForm
              quickService={true}
              formData={appointmentDetails}
              selectedPatient={selectedPatient}
              patientInputValue={patientInputValue}
              onPatientSelect={handlePatientSelect}
              onPatientInputChange={handlePatientInputChange}
              onEditPatient={handleEditPatient}
              onNewPatientDialogOpen={() => setAddNewPatientDialog(true)}
              setPatientInputValue={setPatientInputValue}
              setSelectedPatient={setSelectedPatient}
              onSubmit={handleSubmit}
              onNhsPatientFetch={handleNhsPatientFetch}
              selectedGP={selectedGP}
              gpSearchTerm={gpSearchTerm}
              gpSearchResults={gpSearchResults}
              isLoading={gpLoading}
              error={gpError}
              setGpSearchTerm={setGpSearchTerm}
              handleGPSearch={handleGPSearch}
              handleGPSelect={handleGPSelect}
              handleRemoveGP={handleRemoveGP}
              setGpDialogOpen={setGpDialogOpen}
              gpDialogOpen={gpDialogOpen}
              handleCheckboxChange={handleCheckboxChange}
              onFieldChange={handleAdditionalDetails}
              onDateChange={handleDateChange}
            />
            {/* <AddEditPatientForm
              onSelect={patient => handleAppointmentDetailsChange('patient', patient)}
              selectedPatient={appointmentDetails.patient}
            />
            <GPSearchDialog
              gpSearchTerm={gpSearchTerm}
              setGpSearchTerm={setGpSearchTerm}
              handleGPSearch={handleGPSearch}
              handleGPSelect={gp => handleAppointmentDetailsChange('gp', gp)}
              gpSearchResults={gpSearchResults}
              isLoading={gpLoading}
              error={gpError}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label='Scheduled Time'
                value={appointmentDetails.scheduledTime}
                onChange={date => handleAppointmentDetailsChange('scheduledTime', date)}
                renderInput={params => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
              />
            </LocalizationProvider> */}
          </FormContainer>
        )
      case 3:
        return (
          <FormContainer>
            {submitLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <CircularProgress />
                <Typography variant='h6' sx={{ mt: 2 }}>
                  Submitting appointment...
                </Typography>
              </Box>
            ) : submissionComplete ? (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Submission Successful
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button onClick={handlePrintForm} sx={{ mr: 1 }}>
                    Print Form
                  </Button>
                  {prescriptionId && (
                    <Button onClick={handlePrintPrescription} sx={{ mr: 1 }}>
                      Print Prescription
                    </Button>
                  )}
                  <Button onClick={handleReset}>Reset</Button>
                </Box>
                <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                  Appointment Summary
                </Typography>
                <Typography>Appointment Type: {config.appointmentType}</Typography>
                <Typography>Service: {services.find(s => s.id === config.service)?.name}</Typography>
                <Typography>Stage: {serviceStages.find(s => s.id === config.stage.id)?.name}</Typography>
                <Typography>
                  Patient: {appointmentDetails.patient?.full_name || appointmentDetails.patientName}
                </Typography>
                <Typography>GP: {appointmentDetails.gp?.OrganisationName}</Typography>
                <Typography>Scheduled Time: {appointmentDetails.scheduledTime?.toString()}</Typography>
                {config.appointmentType === 'remote-video' && (
                  <Typography>Phone Number: {appointmentDetails.phoneNumber}</Typography>
                )}
              </Box>
            ) : (
              <>
                <Typography variant='h6' gutterBottom>
                  Review Appointment Details
                </Typography>
                <Typography>Appointment Type: {config.appointmentType}</Typography>
                <Typography>Service: {services.find(s => s.id === config.service)?.name}</Typography>
                <Typography>Stage: {serviceStages.find(s => s.id === config.stage?.id)?.name}</Typography>
                <Typography>
                  Patient: {appointmentDetails.patient?.full_name || appointmentDetails.patientName}
                </Typography>
                <Typography>GP: {appointmentDetails.gp?.OrganisationName}</Typography>
                <Typography>Scheduled Time: {appointmentDetails.scheduledTime?.toString()}</Typography>
                {config.appointmentType === 'remote-video' && (
                  <Typography>Phone Number: {appointmentDetails.phoneNumber}</Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button onClick={handleSubmit} disabled={submitLoading || submissionComplete}>
                    {submitLoading ? 'Submitting...' : 'Submit Appointment'}
                  </Button>
                </Box>
              </>
            )}
          </FormContainer>
        )
      default:
        return null
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        {/* create a tray menu above the stopper with one button to open ai assistance, use iconify icon, it will open a drawer component which must fiarly wide */}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant='contained' startIcon={<Icon icon='mdi:robot' />} onClick={() => setAiDrawerOpen(true)}>
            AI Assistance
          </Button>
        </Box>

        {/* AI Assistance Drawer */}
        <Drawer
          anchor='right'
          open={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '40%',
              maxWidth: '600px',
              padding: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6'>AI Assistance</Typography>
            <Icon icon='mdi:close' onClick={() => setAiDrawerOpen(false)} style={{ cursor: 'pointer' }} />
          </Box>
          {/* Add AI assistance content here */}
          <ConsultationNotesComponent
            patientInfo={selectedPatient}
            notes={notes}
            setNotes={setNotes}
            recommendation={recommendation}
            setRecommendation={setRecommendation}
            conversationHistory={conversationHistory}
            setConversationHistory={setConversationHistory}
            chatBotMessages={chatBotMessages}
            setChatBotMessages={setChatBotMessages}
            currentThread={currentThread}
            setCurrentThread={setCurrentThread}
          />
        </Drawer>

        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel onClick={handleStep(index)} style={{ cursor: 'pointer' }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 2, mb: 1 }}>{renderStepContent(activeStep)}</Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button color='inherit' disabled={activeStep === 0 || loadingRemote} onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={loadingRemote}>
              {loadingRemote ? <CircularProgress /> : 'Next'}
            </Button>
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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
            isLoading={gpLoading}
            error={gpError}
          />
        </DialogContent>
      </Dialog>
      <CustomSnackbar
        message={snackbar.message}
        severity={snackbar.severity || 'warning'}
        horizontal={'center'}
        vertical={'top'}
        open={snackbar.open}
        setOpen={setSnackbarOpen}
      />
    </LocalizationProvider>
  )
}

export default withReducer({
  services: pharmacyServicesSlice
})(QuickServiceDeliveryComponent)
