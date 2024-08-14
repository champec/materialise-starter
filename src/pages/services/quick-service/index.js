import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  CircularProgress
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

const steps = ['Initial Configuration', 'Service Form', 'Appointment Details', 'Review & Submit']

const QuickServiceDeliveryComponent = () => {
  const dispatch = useDispatch()
  const services = useSelector(selectServices)
  const [activeStep, setActiveStep] = useState(0)
  const [config, setConfig] = useState({ appointmentType: '', service: '', stage: '' })
  const [formDef, setFormDef] = useState({})
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState({
    patient: null,
    gp: null,
    scheduledTime: null,
    phoneNumber: '',
    patientName: '',
    remote_details: null
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const serviceStages = useSelector(selectServiceStages(config.service))
  const [videoLinkCreated, setVideoLinkCreated] = useState(false)
  const [isCallReady, setIsCallReady] = useState(false)
  const [textSent, setTextSent] = useState(false)
  const { submitAppointment, loading } = useAppointmentSubmission()

  // ADVANCED FORM STATES
  const [currentNodeId, setCurrentNodeId] = useState(formDef?.startNode)
  const [formData, setFormData] = useState({})
  const [history, setHistory] = useState([formDef?.startNode])
  const [errors, setErrors] = useState({})
  const [isLocked, setIsLocked] = useState(false)

  const {
    selectedGP,
    gpSearchTerm,
    gpSearchResults,
    isLoading: gpLoading,
    error: gpError,
    setSelectedGP,
    setGpSearchTerm,
    handleGPSearch,
    handleGPSelect
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

  const handlePrescriptionButton = () => {
    console.log('Prescription button clicked')
    // Add your logic here
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

  const handleSubmit = async () => {
    const appointmentData = {
      ...config,
      ...formData,
      ...appointmentDetails,
      details: {
        ...formData,
        sendTextUpdate: config.appointmentType === 'remote-video'
      }
    }

    try {
      const result = await submitAppointment(appointmentData)
      if (result.remote_details) {
        setAppointmentDetails(prev => ({ ...prev, remote_details: result.remote_details }))
      }
      showSnackbar('Appointment created successfully', 'success')
    } catch (error) {
      console.log('Error creating appointment', error)
      showSnackbar('Error creating appointment', 'error')
    }
  }

  const renderStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }} disabled={loadingRemote}>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                value={config.appointmentType || 'in-person'}
                onChange={e => handleConfigChange('appointmentType', e.target.value)}
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
                <Select value={config.stage} onChange={e => handleConfigChange('stage', e.target.value)}>
                  {serviceStages.map(stage => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )
      case 1:
        return (
          <Box sx={{ height: '100vh', position: 'relative' }}>
            {config.appointmentType === 'remote-video' ? (
              <>
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
                  />
                )}
              </Box>
            )}
          </Box>
        )
      case 2:
        return (
          <Box>
            <AddEditPatientForm
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
            </LocalizationProvider>
          </Box>
        )
      case 3:
        return (
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Review Appointment Details
            </Typography>
            <Typography>Appointment Type: {config.appointmentType}</Typography>
            <Typography>Service: {services.find(s => s.id === config.service)?.name}</Typography>
            <Typography>Stage: {serviceStages.find(s => s.id === config.stage)?.name}</Typography>
            <Typography>Patient: {appointmentDetails.patient?.full_name || appointmentDetails.patientName}</Typography>
            <Typography>GP: {appointmentDetails.gp?.OrganisationName}</Typography>
            <Typography>Scheduled Time: {appointmentDetails.scheduledTime?.toString()}</Typography>
            {config.appointmentType === 'remote-video' && (
              <Typography>Phone Number: {appointmentDetails.phoneNumber}</Typography>
            )}
          </Paper>
        )
      default:
        return null
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
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
    </LocalizationProvider>
  )
}

export default withReducer({
  services: pharmacyServicesSlice
})(QuickServiceDeliveryComponent)
