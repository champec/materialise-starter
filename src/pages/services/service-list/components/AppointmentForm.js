import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  styled,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Dialog,
  InputAdornment,
  Alert,
  Snackbar,
  colors
} from '@mui/material'
// import { styled } from '@mui/material/styles'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/de'
import dayjs from 'dayjs'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker, TimePicker, LocalizationProvider, DigitalClock } from '@mui/x-date-pickers'
import CustomAutoCompleteInput from 'src/views/apps/Calendar/services/pharmacy-first/CustomAutoComplete'
import IconifyIcon from 'src/@core/components/icon'
import PatientPreview from './PatientPreview'
import useGPSearch from '../hooks/useGPSearch'
import GPSearchDialog from './GPSearchDialog'
import GPPreview from './GPPreview'
import TriageSection from './TriageSection' // Import the new TriageSection component
import { StaticDateTimePicker, StaticDatePicker, StaticTimePicker } from '@mui/x-date-pickers'
import { TimeClock } from '@mui/x-date-pickers/TimeClock'
import {
  isSameDay,
  isSameHour,
  isSameMinute,
  parseISO,
  startOfDay,
  addMinutes,
  format,
  isEqual,
  parse,
  isValid,
  endOfDay,
  setMinutes,
  setHours
} from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { toZonedTime } from 'date-fns-tz'

// Styled FormControl to adjust label positioning
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-outlined': {
    backgroundColor: theme.palette.background.paper,
    padding: '0 8px',
    marginLeft: '-6px'
  }
}))

// Styled DateTimePicker to ensure full width
const StyledDateTimePicker = styled(DateTimePicker)({
  width: '100%'
})

// Custom component to display selected value with icon
const SelectedValue = ({ value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <IconifyIcon icon={value === 'remote-video' ? 'mdi:video' : 'mdi:account'} />
    <Typography sx={{ ml: 1 }}>{value === 'remote-video' ? 'Remote Video' : 'In-Person'}</Typography>
  </Box>
)

const AppointmentForm = ({
  appointment,
  formData,
  services,
  serviceStages,
  selectedPatient,
  patientInputValue,
  onPatientSelect,
  onPatientInputChange,
  onEditPatient,
  onServiceChange,
  onFieldChange,
  onDateChange,
  onSubmit,
  onNhsPatientFetch,
  onNewPatientDialogOpen,
  setSelectedPatient,
  setPatientInputValue,
  selectedGP,
  setGpSearchTerm,
  handleRemoveGP,
  setGpDialogOpen,
  gpDialogOpen,
  setSelectedGP,
  handleCheckboxChange,
  quickService = false,
  editingAppointment = false,
  generateLink,
  setGenerateLink
}) => {
  const prevServiceIdRef = useRef(appointment?.service_id)
  const prevStageIdRef = useRef(appointment?.current_stage_id)
  const [selectedDate, setSelectedDate] = useState(
    appointment?.scheduled_time ? dayjs(appointment.scheduled_time) : null
  )

  const [selectedTime, setSelectedTime] = useState(
    appointment?.scheduled_time ? dayjs(appointment.scheduled_time) : null
  )

  const [dateInputValue, setDateInputValue] = useState(
    appointment?.scheduled_time ? format(new Date(appointment.scheduled_time), 'dd/MM/yyyy') : ''
  )
  const [timeInputValue, setTimeInputValue] = useState(
    appointment?.scheduled_time ? format(new Date(appointment.scheduled_time), 'HH:mm') : ''
  )
  const [bookedSlots, setBookedSlots] = useState([])
  const [availableTimes, setAvailableTimes] = useState([])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [timePickerOpen, setTimePickerOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [selectedHour, setSelectedHour] = useState(null)
  //!diable booked times, might have to seperate date and time
  const orgId = useSelector(state => state.organisation.organisation.id)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const handleTimeAccept = newTime => {
    const jsTime = newTime ? newTime.toDate() : null
    // Ensure selectedDate is a Day.js object before calling .toDate()
    const jsDate = dayjs.isDayjs(selectedDate) ? selectedDate.toDate() : selectedDate

    // if (jsDate && jsTime) {
    //   const selectedDateTime = setMinutes(setHours(jsDate, jsTime.getHours()), jsTime.getMinutes())
    //   const isBooked = bookedSlots.some(slot => isSameMinute(slot, selectedDateTime))

    //   if (isBooked) {
    //     setAlertMessage('This time slot is already booked. Please select a different time.')
    //     setAlertOpen(true)
    //   } else {
    setSelectedTime(newTime)
    setTimeInputValue(jsTime ? format(jsTime, 'HH:mm') : '')
    updateScheduledTime(dayjs(jsDate), dayjs(newTime)) // Pass Day.js objects here
    setTimePickerOpen(false)
    //   }
    // }
  }

  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setAlertOpen(false)
  }

  const bookedTimes = useMemo(
    () =>
      bookedSlots.map(time => {
        const date = new Date(time)
        return {
          hours: date.getHours(),
          minutes: date.getMinutes()
        }
      }),
    [bookedSlots]
  )

  const StyledClock = styled('div')(({ theme }) => {
    const generateStyles = () => {
      const styles = {}
      bookedTimes.forEach(({ hours, minutes }) => {
        styles[`& .MuiClockNumber-root[aria-label="${hours.toString().padStart(2, '0')} hours"]`] = {
          color: theme.palette.error.main,
          fontWeight: 'bold'
        }
        if (selectedHour === hours) {
          styles[`& .MuiClockNumber-root[aria-label="${minutes.toString().padStart(2, '0')} minutes"]`] = {
            color: theme.palette.error.main,
            fontWeight: 'bold'
          }
        }
      })
      return styles
    }

    return {
      '& .MuiClockNumber-root': {
        // Base styles for all numbers
      },
      ...generateStyles()
    }
  })

  const handleDateInputChange = event => {
    setDateInputValue(event.target.value)
  }

  const handleTimeInputChange = event => {
    setTimeInputValue(event.target.value)
  }

  const handleDateInputBlur = () => {
    const parsedDate = parse(dateInputValue, 'dd/MM/yyyy', new Date())
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate)
      handleDateChange(dayjs(parsedDate))
    } else {
      setDateInputValue(selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '')
    }
  }

  const handleTimeInputBlur = () => {
    const parsedTime = dayjs(timeInputValue, 'HH:mm')
    if (parsedTime.isValid()) {
      setSelectedTime(parsedTime)
      updateScheduledTime(selectedDate, parsedTime)
    } else {
      setTimeInputValue(selectedTime ? selectedTime.format('HH:mm') : '')
    }
  }

  const updateScheduledTime = (date, time) => {
    if (date && time) {
      const combinedDateTime = date.hour(time.hour()).minute(time.minute())
      onDateChange(combinedDateTime.toDate()) // Convert to JavaScript Date if needed
    }
  }

  // Simulated API call to fetch booked slots
  const fetchBookedSlots = useCallback(
    async date => {
      const startTime = startOfDay(date)
      const endTime = endOfDay(date)

      const { data, error } = await supabase
        .from('ps_appointments')
        .select('scheduled_time')
        .eq('pharmacy_id', orgId)
        .gte('scheduled_time', startTime.toISOString())
        .lte('scheduled_time', endTime.toISOString())
        .order('scheduled_time', { ascending: true })

      if (error) {
        console.error('Error fetching booked slots:', error)
        return []
      }

      const timeZonedDates = data.map(appointment => toZonedTime(parseISO(appointment.scheduled_time), timeZone))
      console.log('FETCHED TIME, ', data, timeZonedDates)
      return timeZonedDates
    },
    [orgId]
  )

  const handleDateChange = async newDate => {
    const jsDate = newDate ? newDate.toDate() : null
    setSelectedDate(jsDate)
    setDateInputValue(jsDate ? format(jsDate, 'dd/MM/yyyy') : '')
    if (jsDate) {
      const slots = await fetchBookedSlots(jsDate)
      setBookedSlots(slots)
      generateAvailableTimes(jsDate, slots)
    }
  }

  const generateAvailableTimes = useCallback((date, bookedSlots) => {
    const times = []
    const dayStart = setMinutes(setHours(date, 0), 0)
    const dayEnd = setMinutes(setHours(date, 23), 59)

    for (let time = dayStart; time <= dayEnd; time = addMinutes(time, 15)) {
      const isBooked = bookedSlots.some(bookedSlot => {
        const slotStart = new Date(bookedSlot)
        const slotEnd = addMinutes(slotStart, 15)
        return time >= slotStart && time < slotEnd
      })

      if (!isBooked) {
        times.push(time)
      }
    }

    setAvailableTimes(times)
  }, [])

  useEffect(() => {
    const scheduledTime = appointment?.scheduled_time || formData?.scheduled_time
    if (scheduledTime) {
      const appointmentDate = new Date(scheduledTime)
      if (!isNaN(appointmentDate) && appointmentDate.toString() !== selectedDate?.toString()) {
        setSelectedDate(appointmentDate)
        setSelectedTime(appointmentDate)
        setDateInputValue(format(appointmentDate, 'dd/MM/yyyy'))
        setTimeInputValue(format(appointmentDate, 'HH:mm'))
        handleDateChange(dayjs(appointmentDate)) // Pass Day.js object to handleDateChange
      }
    }
  }, [appointment?.scheduled_time, formData?.scheduled_time])

  // const handleTimeChange = newTime => {
  //   setSelectedTime(newTime)
  //   setTimeInputValue(format(newTime, 'HH:mm'))
  //   updateScheduledTime(selectedDate, newTime)
  //   setSelectedHour(newTime.getHours())
  // }

  useEffect(() => {
    // Only run this effect if we're not in quickService mode
    if (quickService || !formData.service_id || !formData.current_stage_id) return

    console.log('triag changes', { prevServiceIdRef, prevStageIdRef }, formData.service_id, formData.current_stage_id)
    console.log(
      'triage changes 2',
      formData.service_id !== prevServiceIdRef.current || formData.current_stage_id !== prevStageIdRef.current
    )

    // Check if the service or stage has changed
    if (formData.service_id !== prevServiceIdRef.current || formData.current_stage_id !== prevStageIdRef.current) {
      // Reset triage data when changing services or stages
      onFieldChange({
        target: {
          name: 'details.triage',
          value: {}
        }
      })

      // Update the refs with the new values
      prevServiceIdRef.current = formData.service_id
      prevStageIdRef.current = formData.current_stage_id
    }
  }, [formData.service_id, formData.current_stage_id, quickService, onFieldChange])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: 400, p: 3 }}>
        <Typography variant='h6' gutterBottom>
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </Typography>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {selectedPatient ? (
              <Grid item xs={12}>
                <PatientPreview
                  patient={selectedPatient}
                  onEdit={onEditPatient}
                  setSelectedPatient={setSelectedPatient}
                  setPatientInputValue={setPatientInputValue}
                />
              </Grid>
            ) : (
              <Grid item xs={12} container alignItems='center'>
                <Grid item xs={11}>
                  <CustomAutoCompleteInput
                    onSelect={onPatientSelect}
                    value={patientInputValue}
                    setValue={onPatientInputChange}
                    placeHolder={'Search for a patient'}
                    tableName={'patients'}
                    displayField={'full_name'}
                    onAdd={onNewPatientDialogOpen}
                    label='Search or add patient'
                    searchVector={'name_search_vector'}
                    displayFields={['full_name', 'address', 'dob']}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={onNhsPatientFetch}>
                    <IconifyIcon icon='mdi:database-search' />
                  </IconButton>
                </Grid>
              </Grid>
            )}

            {/* GP Selection */}
            <Grid item xs={12}>
              {selectedGP ? (
                <GPPreview
                  gp={selectedGP}
                  onEdit={() => setGpDialogOpen(true)}
                  setSelectedGP={setSelectedGP}
                  setGPInputValue={setGpSearchTerm}
                />
              ) : (
                <Button onClick={() => setGpDialogOpen(true)} variant='outlined' fullWidth>
                  Find GP
                </Button>
              )}
            </Grid>

            {!quickService && (
              <>
                <Grid item xs={12}>
                  <StyledFormControl fullWidth variant='outlined'>
                    <InputLabel id='service-label'>Service</InputLabel>
                    <Select
                      labelId='service-label'
                      name='service_id'
                      value={formData.service_id}
                      onChange={onServiceChange}
                      label='Service'
                      required
                      disabled={editingAppointment}
                    >
                      {services.map(service => (
                        <MenuItem key={service.id} value={service.id}>
                          {service.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledFormControl>
                </Grid>

                <Grid item xs={12}>
                  <StyledFormControl fullWidth variant='outlined'>
                    <InputLabel id='appointment-type-label'>Appointment Type</InputLabel>
                    <Select
                      labelId='appointment-type-label'
                      id='appointment-type'
                      value={formData.appointment_type || ''}
                      onChange={onFieldChange}
                      name='appointment_type'
                      label='Appointment Type'
                      renderValue={value => <SelectedValue value={value} />}
                      required
                    >
                      <MenuItem value='remote-video'>
                        <ListItemIcon>
                          <IconifyIcon icon='mdi:video' />
                        </ListItemIcon>
                        <ListItemText primary='Remote Video' />
                      </MenuItem>
                      <MenuItem value='in-person'>
                        <ListItemIcon>
                          <IconifyIcon icon='mdi:account' />
                        </ListItemIcon>
                        <ListItemText primary='In-Person' />
                      </MenuItem>
                    </Select>
                  </StyledFormControl>
                </Grid>

                <Grid item xs={12}>
                  <StyledFormControl fullWidth variant='outlined'>
                    <InputLabel>Overall Status</InputLabel>
                    <Select name='overall_status' value={formData.overall_status} onChange={onFieldChange} required>
                      <MenuItem value='Scheduled'>Scheduled</MenuItem>
                      <MenuItem value='In Progress'>In Progress</MenuItem>
                      <MenuItem value='Completed'>Completed</MenuItem>
                      <MenuItem value='Cancelled'>Cancelled</MenuItem>
                    </Select>
                  </StyledFormControl>
                </Grid>

                <Grid item xs={12}>
                  <Tooltip title={!formData.service_id ? 'Please select a service first' : ''}>
                    <span>
                      <StyledFormControl fullWidth variant='outlined'>
                        <InputLabel>Current Stage</InputLabel>
                        <Select
                          name='current_stage_id'
                          value={formData.current_stage_id}
                          onChange={onFieldChange}
                          required
                          disabled={!formData.service_id}
                        >
                          {serviceStages.map(stage => (
                            <MenuItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </StyledFormControl>
                    </span>
                  </Tooltip>
                </Grid>

                {formData.service_id === '5a499835-7a49-43b6-9de5-6b492baf12d9' && formData.current_stage_id && (
                  <Grid item xs={12}>
                    <TriageSection
                      stageId={formData.current_stage_id}
                      formData={formData}
                      onFieldChange={onFieldChange}
                    />
                  </Grid>
                )}
              </>
            )}
            {console.log('FORM DATA SCHEDULED TIME', formData.scheduled_time, formData)}
            <Grid item xs={12}>
              <TextField
                label='Appointment Date'
                value={dateInputValue}
                onChange={handleDateInputChange}
                onBlur={handleDateInputBlur}
                placeholder='DD/MM/YYYY'
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setDatePickerOpen(true)} edge='end'>
                        <IconifyIcon icon='mdi:calendar' />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
                <StaticDatePicker
                  value={dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate)}
                  onChange={newDate => {
                    // handleDateChange(newDate)
                    // setDatePickerOpen(false)
                  }}
                  onAccept={newDate => {
                    handleDateChange(newDate)
                    setDatePickerOpen(false)
                  }}
                  onClose={() => setDatePickerOpen(false)}
                />
              </Dialog>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label='Appointment Time'
                value={timeInputValue}
                onChange={handleTimeInputChange}
                onBlur={handleTimeInputBlur}
                placeholder='HH:mm'
                fullWidth
                disabled={!selectedDate}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setTimePickerOpen(true)} edge='end' disabled={!selectedDate}>
                        <IconifyIcon icon='mdi:clock-outline' />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Dialog open={timePickerOpen} onClose={() => setTimePickerOpen(false)}>
                <StyledClock>
                  <StaticTimePicker
                    value={dayjs.isDayjs(selectedTime) ? selectedTime : dayjs(selectedTime)} // Ensure value is a Day.js object
                    // onChange={handleTimeChange}
                    onAccept={handleTimeAccept}
                    onClose={() => setTimePickerOpen(false)}
                    ampm={false}
                    minutesStep={15}
                    views={['hours', 'minutes']}
                  />
                </StyledClock>
              </Dialog>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name='details.additional_details'
                label='Additional Details'
                multiline
                rows={4}
                value={formData.details.additional_details || ''}
                onChange={onFieldChange}
              />
            </Grid>

            {appointment && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={generateLink} onChange={() => setGenerateLink(!generateLink)} />}
                  label='Generate new remote video link'
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.details.acceptTerms || false}
                    onChange={handleCheckboxChange}
                    name='details.acceptTerms'
                  />
                }
                label='I accept all usage terms and conditions'
              />
            </Grid>

            {!quickService && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.details.sendTextUpdate || false}
                      onChange={handleCheckboxChange}
                      name='details.sendTextUpdate'
                    />
                  }
                  label='Send a text message with this update'
                />
              </Grid>
            )}

            {!quickService && (
              <Grid item xs={12}>
                <Button type='submit' variant='contained' color='primary' fullWidth>
                  {appointment ? 'Update Appointment' : 'Create Appointment'}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          onClose={handleAlertClose}
          severity='warning'
          sx={{ width: '100%', zIndex: 10000 }}
          style={{ background: 'red', color: 'white' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  )
}

export default AppointmentForm
