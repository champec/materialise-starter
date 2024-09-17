import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormLabel,
  IconButton,
  Tooltip,
  Paper,
  Container,
  Snackbar,
  Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/de'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import BookingModal from './BookingModal'
import {
  fetchServices,
  fetchServiceStages,
  fetchPharmaciesByLocation,
  fetchAvailableSlots,
  handleBooking,
  getTriageQuestions,
  fetchPharmaciesByPostcode,
  fetchPharmacyByODS
} from '../../views/apps/book/utils'
import AssistedBooking from './AssistedBooking'
import Icon from 'src/@core/components/icon'

const steps = ['Select Service', 'Answer Triage Questions', 'Find a Pharmacy', 'Select a Slot']

const PatientBooking = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [bookingType, setBookingType] = useState('')
  const [services, setServices] = useState([])
  const [pharmacies, setPharmacies] = useState([])
  const [selectedServiceStage, setSelectedServiceStage] = useState('')
  const [serviceStages, setServiceStages] = useState([])
  const [triageQuestions, setTriageQuestions] = useState([])
  const [triageAnswers, setTriageAnswers] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedPharmacies, setSelectedPharmacies] = useState([])
  const [searchType, setSearchType] = useState('postcode')
  const [searchValue, setSearchValue] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('warning')
  const [presentingComplaint, setPresentingComplaint] = useState('')

  useEffect(() => {
    const loadInitialData = async () => {
      setServiceStages(await fetchServiceStages())
      setServices(await fetchServices())
    }
    loadInitialData()
  }, [])

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  // Function to show the Snackbar
  const showSnackbar = (message, severity = 'error') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleBookingTypeChange = type => {
    setBookingType(type)
    setActiveStep(1) // Move to the next step after selecting booking type
  }

  const handleTriageAnswer = (question, answer) => {
    setTriageAnswers(prev => ({ ...prev, [question]: answer }))
  }

  const handleTriageSubmit = () => {
    const allQuestionsAnswered = triageQuestions.every(q => triageAnswers[q] === 'Yes')
    if (presentingComplaint.length < 5) {
      showSnackbar(
        `Please add the presenting complaint, all you wrote was ${
          presentingComplaint ? "'" + presentingComplaint + "'" : 'nothing'
        }`
      )
      return
    }
    if (allQuestionsAnswered) {
      handleNext()
    } else {
      showSnackbar(
        'Based on your answers, this service may not be appropriate. Please consult with your GP or call NHS 111 for further advice.'
      )
    }
  }

  const handleBookSlot = slot => {
    setSelectedSlot(slot)
    setOpenModal(true)
  }

  const handleBookingSuccess = data => {
    console.log('Booking successful:', data)
    setOpenModal(false)
    fetchAvailableSlots(selectedDate, selectedPharmacies, selectedServiceStage.id, serviceStages, setAvailableSlots)
  }

  const handleBookingError = error => {
    console.error('Booking failed:', error)
  }

  const handleSearchPharmacies = () => {
    if (searchType === 'postcode') {
      setPharmacies([])
      setSelectedPharmacies([])
      fetchPharmaciesByPostcode(searchValue).then(data => {
        if (data?.length === 0 || !data) {
          showSnackbar('No pharmacies found for your location. Please try a different search.')
        } else {
          setPharmacies(data)
          setSelectedPharmacies(data)
        }
      })
    } else if (searchType === 'current') {
      setPharmacies([])
      setSelectedPharmacies([])
      fetchPharmaciesByLocation().then(data => {
        if (data?.length === 0 || !data) {
          console.log('No pharmacies found for your location. Please try a different search.', data)
          showSnackbar('No pharmacies found for your location. Please try a different search.')
        } else {
          console.log('Pharmacies found:', data)
          setPharmacies(data)
          setSelectedPharmacies(data)
        }
      })
    } else if (searchType === 'ods') {
      setPharmacies([])
      fetchPharmacyByODS(searchValue).then(data => {
        if (data?.length === 0 || !data) {
          showSnackbar('No pharmacies found for your location. Please try a different search.')
        } else {
          setPharmacies(data)
          setSelectedPharmacies(data)
        }
      })
    }
  }

  const renderBookingTypeSelection = () => (
    <Box display='flex' justifyContent='center' mt={4}>
      <Button
        variant='contained'
        color='primary'
        startIcon={<Icon icon='mdi:calendar-clock' />}
        onClick={() => setBookingType('manual')}
        sx={{ mr: 2 }}
      >
        Manual Booking
      </Button>
      <Button
        variant='contained'
        color='secondary'
        startIcon={<Icon icon='mdi:robot' />}
        onClick={() => setBookingType('assistant')}
      >
        AI-Assisted Booking
      </Button>
    </Box>
  )

  const renderAssistedBookingPlaceholder = () => (
    <Box>
      <Typography variant='h6'>Assisted Booking</Typography>
      <AssistedBooking
        serviceStages={serviceStages}
        setSelectedServiceStage={setSelectedServiceStage}
        pharmacies={pharmacies}
        triageAnswers={triageAnswers}
        setTriageAnswers={setTriageAnswers}
        setTriageQuestions={setTriageQuestions}
        triageQuestions={triageQuestions}
        getTriageQuestions={getTriageQuestions}
      />
    </Box>
  )

  const renderManualBookingStep = step => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel>Select Service</InputLabel>
            <Select
              value={selectedServiceStage}
              label='Select Service'
              onChange={e => {
                setSelectedServiceStage(e.target.value)
                setTriageQuestions(getTriageQuestions(e.target.value.id))
              }}
            >
              {serviceStages.map(stage => (
                <MenuItem key={stage.id} value={stage}>
                  {stage.ps_services.name} - {stage.name}
                </MenuItem>
              ))}
            </Select>
            <Button onClick={handleNext} disabled={!selectedServiceStage}>
              Next
            </Button>
          </FormControl>
        )
      case 1:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Triage Questions
            </Typography>
            <TextField
              value={presentingComplaint}
              onChange={e => setPresentingComplaint(e.target.value)}
              fullWidth
              label='please describe the issue'
              multiline
            ></TextField>
            {triageQuestions.map((question, index) => (
              <FormControl component='fieldset' key={index} fullWidth margin='normal'>
                <FormLabel component='legend'>{question}</FormLabel>
                <RadioGroup
                  row
                  value={triageAnswers[question] || ''}
                  onChange={e => handleTriageAnswer(question, e.target.value)}
                >
                  <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                  <FormControlLabel value='No' control={<Radio />} label='No' />
                </RadioGroup>
              </FormControl>
            ))}
            <Button
              variant='contained'
              color='primary'
              onClick={handleTriageSubmit}
              disabled={triageQuestions.length !== Object.keys(triageAnswers).length}
            >
              Submit Triage
            </Button>
            <Button onClick={handleBack}>Back</Button>
          </Box>
        )
      case 2:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Find a Pharmacy
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup row value={searchType} onChange={e => setSearchType(e.target.value)}>
                <FormControlLabel value='postcode' control={<Radio />} label='Search by Postcode' />
                <FormControlLabel value='current' control={<Radio />} label='Use Current Location' />
                <FormControlLabel value='ods' control={<Radio />} label='Search by ODS Code' />
              </RadioGroup>
            </FormControl>
            <TextField
              fullWidth
              label={`Enter ${searchType === 'ods' ? 'ODS Code' : 'Postcode'}`}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              margin='normal'
            />
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSearchPharmacies()} // Example coordinates for search
              disabled={searchType !== 'current' && !searchValue}
            >
              Search Pharmacies
            </Button>
            <List>
              {pharmacies.map(pharmacy => (
                <ListItem
                  key={pharmacy.id}
                  button
                  onClick={() =>
                    setSelectedPharmacies(prev =>
                      prev.some(p => p.id === pharmacy.id)
                        ? prev.filter(p => p.id !== pharmacy.id)
                        : [...prev, pharmacy]
                    )
                  }
                  selected={selectedPharmacies.some(p => p.id === pharmacy.id)}
                >
                  <Checkbox
                    checked={selectedPharmacies.some(p => p.id === pharmacy.id)}
                    onChange={() =>
                      setSelectedPharmacies(prev =>
                        prev.some(p => p.id === pharmacy.id)
                          ? prev.filter(p => p.id !== pharmacy.id)
                          : [...prev, pharmacy]
                      )
                    }
                  />
                  <ListItemText
                    primary={pharmacy.organisation_name}
                    secondary={`${pharmacy.address1}, ${pharmacy.postcode} - ${
                      pharmacy.distance ? `${pharmacy.distance.toFixed(2)} miles` : 'N/A'
                    }`}
                  />
                </ListItem>
              ))}
            </List>
            {selectedPharmacies.length > 0 && (
              <Button variant='contained' color='primary' onClick={handleNext}>
                View Available Slots
              </Button>
            )}
            <Button onClick={handleBack}>Back</Button>
          </Box>
        )
      case 3:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Select a Slot
            </Typography>
            <DatePicker
              label='Select Date'
              value={selectedDate}
              onChange={setSelectedDate}
              renderInput={params => <TextField {...params} fullWidth />}
            />
            <Button
              variant='contained'
              color='primary'
              onClick={() =>
                fetchAvailableSlots(
                  selectedDate,
                  selectedPharmacies,
                  selectedServiceStage.id,
                  serviceStages,
                  setAvailableSlots
                )
              }
              disabled={!selectedDate}
            >
              Find Available Slots
            </Button>
            <Box>
              {availableSlots.map(pharmacySlots => (
                <Box key={pharmacySlots.pharmacyId} mb={4}>
                  <Typography variant='h6'>{pharmacySlots?.pharmacyName}</Typography>
                  {pharmacySlots.slots.length > 0 ? (
                    <Box display='flex' flexWrap='wrap'>
                      {pharmacySlots.slots.map((slot, slotIndex) => (
                        <Button
                          key={slotIndex}
                          variant='outlined'
                          disabled={slot.isBooked}
                          onClick={() => handleBookSlot(slot)}
                          sx={{ m: 0.5 }}
                        >
                          {slot.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography color='textSecondary'>
                      No available slots for this pharmacy on the selected date.
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Button onClick={handleBack}>Back</Button>
          </Box>
        )
      default:
        return null
    }
  }

  console.log('bookingType', bookingType)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth='md'>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={4}>
            <Typography variant='h4' component='h1'>
              <Icon
                icon='mdi:hospital'
                width='32'
                height='32'
                style={{ marginRight: '8px', verticalAlign: 'bottom' }}
              />
              Book an Appointment
            </Typography>
            {bookingType !== '' && (
              <Tooltip title='Change Booking Type'>
                <IconButton onClick={() => setBookingType('')} color='primary'>
                  <Icon icon='mdi:refresh' width='24' height='24' />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {bookingType === '' ? (
            renderBookingTypeSelection()
          ) : bookingType === 'assistant' ? (
            renderAssistedBookingPlaceholder()
          ) : (
            <Box mt={4}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Icon
                          icon={
                            index === 0
                              ? 'mdi:clipboard-list'
                              : index === 1
                              ? 'mdi:comment-question'
                              : index === 2
                              ? 'mdi:map-marker'
                              : 'mdi:clock'
                          }
                          width='24'
                          height='24'
                          color={index <= activeStep ? '#1976d2' : '#bdbdbd'}
                        />
                      )}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box mt={4}>{renderManualBookingStep(activeStep)}</Box>
            </Box>
          )}
        </Paper>
      </Container>
      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={bookingDetails => handleBooking(bookingDetails, handleBookingSuccess, handleBookingError)}
        slot={selectedSlot}
        serviceId={selectedServiceStage}
        pharmacyId={selectedPharmacies[0]?.id}
        presentingComplaint={presentingComplaint}
      />
      <Snackbar
        open={snackbarOpen}
        // autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  )
}

export default PatientBooking
