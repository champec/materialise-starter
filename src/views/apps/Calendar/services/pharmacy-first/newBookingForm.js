// ** React Imports
import { Fragment, useState, useEffect, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Backdrop } from '@mui/material'
import AddNewPatientForm from './AddNewPatientForm'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// RTK imports
import { useDispatch, useSelector } from 'react-redux'
import {
  createBooking,
  addEvent,
  updateBooking,
  updateEvent,
  simpleEventUpdate
} from 'src/store/apps/calendar/pharmacyfirst/bookingsCalendarSlice'
import {
  appendMessageToThread,
  createThreadAndSendSMS,
  scheduleReminder,
  updateAppointmentStatus,
  setSelectedBooking
} from 'src/store/apps/calendar/pharmacyfirst/appointmentListSlice'

// ** Custom Components Imports
import StepperCustomDot from '../../../broadcast/elements/StepperCustomDot'
import CustomAutoCompleteInput from './CustomAutoComplete'
import CustomSnackbar from './CustomSnackBar'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'
import { Stack, Fade } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { StaticDateTimePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

import Capturepatient from '../commonformelements/capturepatient'
import CapturePersonalInfo from '../commonformelements/CapturePersonalInfo'

// ** supabase
import { supabase } from 'src/configs/supabase'
import AddNewPharmacistForm from './AddNewPharmacistForm'

// ** Variable form fields
import PharmacyFirstVariableForm from '../pharmacy-first-vf'
import NmsVariableForm from '../nms-vf'
import DmsVariableForm from '../dms-vf'
import BookHTNform from '../htn/BookHTNform'
import FluVariableForm from '../flu-vf'

const CustomInput = forwardRef(({ ...props }, ref) => {
  return <TextField inputRef={ref} label='Date' {...props} />
})
const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const steps = [
  {
    title: 'Patient',
    subtitle: 'Who is the patient'
  },
  {
    title: 'Booking',
    subtitle: 'When is the booking'
  },
  {
    title: 'Confirm',
    subtitle: 'Confirm and send booking'
  }
]

const defaultAccountValues = {
  email: '',
  fullName: '',
  nhsNumber: '',
  mobileNumber: '',
  houseNumber: '',
  address: '',
  postCode: '',
  dateOfBirth: '',
  telephoneNumber: '',
  surgery: {},
  pharmacist: {},
  p_first_name: '',
  pFirstName: ''
}

const defaultBookingValues = {
  pharmacist: {},
  startDate: dayjs(),
  duration: 15,
  textMessage: '',
  presentingComplaint: '',
  clinicalPathway: ''
}

const defaultConfirmValues = {
  iAgree: false
}

const accountSchema = yup.object().shape({
  // username: yup.string().required(),
  email: yup.string().email().required(),
  fullName: yup.string().required(),
  // nhsNumber: yup.number().required(),
  mobileNumber: yup.number().required(),
  houseNumber: yup.string().required(),
  address: yup.string().required(),
  postCode: yup.string().required(),
  dateOfBirth: yup.string().required(),
  // telephoneNumber: yup.number().required(),
  // surgery: yup.object().required(),
  pharmacist: yup.object().required()
})

const bookingSchema = yup.object().shape({
  // clinicalPathway: yup.string().required(),
  // pharmacist: yup.object().required(),
  // startDate: yup.string().required(),
  // duration: yup.string().required(),
  // textMessage: yup.string().required(),
  // presentingComplaint: yup.string().required()
})

const confirmSchema = yup.object().shape({
  // google: yup.string().required(),
  iAgree: yup.boolean().required()
})

const getServiceTableName = service => {
  switch (service) {
    case 'PFS':
      return 'service_pharmacy_first'
    case 'Pharmacy First Appointment':
      return 'service_pharmacy_first'
    case 'NMS':
      return 'service_nms'
    case 'DMS':
      return 'service_dms'
    case 'DMS S3':
      return 'service_dms'
    case 'HTN':
      return 'service_htn'
    case 'FLU':
      return 'service_flu'
    default:
      return `userCustom.${service}`
  }
}

const NewBookingForm = ({
  onClose,
  isEditing,
  selectedService,
  resetToEmptyValues,
  setResetToEmptyValues,
  refetchAppointments,
  addBookingSidebarOpen
}) => {
  // ** States
  const [activeStep, setActiveStep] = useState(0)
  const [addNewPatientDialog, setAddNewPatientDialog] = useState(false)
  const [addNewPharmacistDialog, setAddNewPharmacistDialog] = useState(false)
  const [openSnack, setOpenSnack] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState('success') // success, error, warning, info, or default
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const selectedBookingLoading = useSelector(state => state.appointmentListSlice.selectedBookingLoading)
  const selectedBooking = useSelector(state => state.appointmentListSlice.selectedBooking)
  const [variableLoading, setVariableLoading] = useState(false)

  console.log('typeof refetchAppointments', typeof refetchAppointments)

  // console.log('selectedBooking', selectedBooking, selectedBookingLoading)
  //fetch the variable table data
  const fetchVariableTableData = async () => {
    console.log('fetching variable table data', selectedService.table)
    setVariableLoading(true)
    const { data: serviceData, error: serviceError } = await supabase
      .from(selectedService.table)
      .select('*')
      .match({ consultation_id: selectedBooking?.id })

    console.log('service data', serviceData)
    if (serviceError) {
      console.log('service error', serviceError)
      showMessage('error fetching service, please try again, if problem persists contact admin with code 104', 'error')

      setVariableLoading(false)
      return
    }

    console.log('service data', variableLoading)
    setVariableLoading(false)
    const serviceDataResponse = serviceData[0]
    setServiceInfo(serviceDataResponse)
    return serviceDataResponse
  }

  useEffect(() => {
    if (selectedBooking) {
      fetchVariableTableData()
    }
  }, [selectedBooking])

  // ** Effects
  useEffect(() => {
    if (addBookingSidebarOpen == false) {
      handleReset()
    }
  }, [addBookingSidebarOpen])

  useEffect(() => {
    if (selectedBooking) {
      // set all form values based on the selectedBooking object
      // set the selected patient
      setSelectedPatient(selectedBooking.patient_object)
      // set the selected pharmacist
      setSelectedPharmacist(selectedBooking.pharmacist_object)
      // set the form values
      setSelectedGP(selectedBooking.gp_object)
      bookingReset({
        pharmacist: selectedBooking.pharmacist_object,
        startDate: selectedBooking.calendar_events.start,
        duration: selectedBooking.duration,
        textMessage: selectedBooking.text_message,
        presentingComplaint: selectedBooking.presenting_complaint,
        clinicalPathway: selectedBooking.clinical_pathway
      })
      // patientReset({
      //   fullName: selectedBooking.patient_object.full_name,
      //   email: selectedBooking.patient_object.email,
      //   nhsNumber: selectedBooking.patient_object.nhs_number,
      //   mobileNumber: selectedBooking.patient_object.mobile_number,
      //   houseNumber: selectedBooking.patient_object.house_number,
      //   address: selectedBooking.patient_object.address,
      //   postCode: selectedBooking.patient_object.post_code,
      //   dateOfBirth: selectedBooking.patient_object.dob,
      //   telephoneNumber: selectedBooking.patient_object.telephone_number,
      //   surgery: selectedBooking?.surgery_object,
      //   pharmacist: selectedBooking?.pharmacist_object
      // })
    }

    return () => {
      // setSelectedPatient(null)
      // setSelectedPharmacist(null)
      // dispatch(setSelectedBooking(null))
      setSnackMessage('')
      setActiveStep(0)

      // patientReset(defaultAccountValues)
      // bookingReset(defaultBookingValues)
    }
  }, [selectedBooking])

  const handleSelect = value => {
    console.log('handle select value', value)
    setSelectedPatient(value)
  }

  const handlePharmacistSelect = value => {
    console.log('handle select value', value)
    setSelectedPharmacist(value)
  }

  useEffect(() => {
    if (resetToEmptyValues) {
      setSelectedPatient(null)
      setSelectedPharmacist(null)
      setSelectedGP(null)
      // dispatch(setSelectedBooking(null))

      setSnackMessage('')
      setActiveStep(0)
      patientReset(defaultAccountValues)
      bookingReset(defaultBookingValues)
      setResetToEmptyValues(false)
    }
  }, [resetToEmptyValues])

  console.log('IS EDITING', isEditing)

  const showMessage = (msg, sev) => {
    setSnackMessage(msg)
    setSnackSeverity(sev)
    setOpenSnack(true)
  }

  const getVariableFormFields = (selectedService, handleBack) => {
    console.log('Get variable form service is', selectedService == 'Pharmacy First' || 'Pharmacy First Appointment')
    switch (selectedService) {
      case 'PFS':
        return (
          <PharmacyFirstVariableForm
            handleConfirmSubmit={handleConfirmSubmit}
            handleBookingSubmit={handleBookingSubmit}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
            handleBack={handleBack}
          />
        )
      case 'Pharmacy First Appointment':
        return (
          <PharmacyFirstVariableForm
            handleConfirmSubmit={handleConfirmSubmit}
            handleBookingSubmit={handleBookingSubmit}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
          />
        )
      case 'NMS':
        return (
          <NmsVariableForm
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            handleBookingSubmit={handleBookingSubmit}
          />
        )
      case 'DMS':
        return (
          <DmsVariableForm
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            handleBookingSubmit={handleBookingSubmit}
          />
        )
      case 'DMS S3':
        return (
          <DmsVariableForm
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            handleBookingSubmit={handleBookingSubmit}
          />
        )
      case 'HTN':
        return (
          <BookHTNform
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            handleBookingSubmit={handleBookingSubmit}
          />
        )
      case 'FLU':
        return (
          <FluVariableForm
            setServiceInfo={setServiceInfo}
            serviceInfo={serviceInfo}
            steps={steps}
            bookingControl={bookingControl}
            bookingErrors={bookingErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            handleBookingSubmit={handleBookingSubmit}
          />
        )

      default:
        return null
    }
  }
  const handleStepClick = async index => {
    // Check if the user is moving forward
    if (index > activeStep) {
      let isStepValid = false

      // Perform validation based on the current active step
      if (activeStep === 0) {
        isStepValid = await handleAccountSubmit(onSubmit)()
      } else if (activeStep === 1) {
        isStepValid = await handleBookingSubmit(onSubmit)()
      } else if (activeStep === 2) {
        isStepValid = await handleConfirmSubmit(onSubmit)()
      }

      // If the step is valid, move to the next step
      if (isStepValid) {
        setActiveStep(index)
      }
    } else {
      // If moving backward or clicking the current step, change step without validation
      setActiveStep(index)
    }
  }

  const handleSelectedPharmacist = value => {
    console.log('handle select value', value)
    setSelectedPharmacist(value)
  }

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedPharmacist, setSelectedPharmacist] = useState(null)
  const [selectedGP, setSelectedGP] = useState(null)
  const [serviceInfo, setServiceInfo] = useState({})
  const [doNotIncludeTextMessage, setdoNotIncludeTextMessage] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const orgId = useSelector(state => state.organisation.organisation.id)
  const notifyApiKey = useSelector(state => state.organisation?.organisation?.pharmacy_settings?.notify_api_key)
  const userId = useSelector(state => state.user.user.id)
  // ** Hooks
  const {
    reset: patientReset,
    control: accountControl,
    handleSubmit: handleAccountSubmit,
    formState: { errors: accountErrors },
    watch: accountWatch,
    getValues: accountGetValues
  } = useForm({
    defaultValues: defaultAccountValues,
    resolver: yupResolver(accountSchema)
  })

  useEffect(() => {
    if (selectedBooking) {
      setdoNotIncludeTextMessage(true)
    }
  }, [selectedBooking])

  const {
    reset: bookingReset,
    control: bookingControl,
    handleSubmit: handleBookingSubmit,
    formState: { errors: bookingErrors },
    setValue,
    watch: bookingWatch,
    getValues: bookingGetValues
  } = useForm({
    defaultValues: defaultBookingValues,
    resolver: yupResolver(bookingSchema)
  })

  const {
    reset: confirmReset,
    control: confirmControl,
    handleSubmit: handleConfirmSubmit,
    formState: { errors: confirmErrors },
    getValues: confirmGetValues
  } = useForm({
    defaultValues: defaultConfirmValues,
    resolver: yupResolver(confirmSchema)
  })

  const fullNameValue = accountWatch('fullName')
  const Pharmacist = bookingWatch('pharmacist')
  const startDate = bookingWatch('startDate')

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setServiceInfo({})
    setSelectedPatient(null)
    setSelectedPharmacist(null)
    setSelectedGP(null)
    setdoNotIncludeTextMessage(false)

    // confirmReset({ iAgree: false })
    // patientReset({ fullName: '', email: '', nhsNumber: '', password: '', 'confirm-password': '' })

    // bookingReset({
    //   pharmacist: '',
    //   startDate: '',
    //   duration: 15,
    //   textMessage: '',
    //   presentingComplaint: '',
    //   clinicalPathway: ''
    // })
  }

  const onSubmit = async data => {
    setActiveStep(activeStep + 1)
    if (activeStep === steps.length - 1) {
      setLoading(true)
      // this is the last step of the submission
      // check the values have all been filled - wont see final submit unless prev is all filled in anyway
      const bookingData = bookingGetValues()

      let dailyData = null
      let newBooking = null

      // generate a scheduled meeting, nbf time set returns object with meeting url
      if (!selectedBooking) {
        console.log('booking data', bookingData)
        const unixTimeStamp = dayjs(bookingData?.startDate).unix()
        const { data: dailyDatar, error: dailyError } = await supabase.functions.invoke('daily-scheduler', {
          body: { scheduledTime: unixTimeStamp }
        })

        console.log('daily data', dailyDatar)

        if (dailyError) {
          console.log('daily error', dailyError)
          //show custom snackbar
          showMessage(
            'error generating video link, please try again, if problem persists contact admin with code 101',
            'error'
          )
          setLoading(false)
          return
        }

        dailyData = dailyDatar
      }

      const userData = accountGetValues()

      const dailyUrl = dailyData?.room.url

      const bookingPayload = {
        pharmacist_id: bookingData?.pharmacist?.id || null,
        // start_date: bookingData?.startDate.format() || null,
        // duration: bookingData?.duration || null,
        text_message: bookingData?.textMessage || null,
        presenting_complaint: bookingData?.presentingComplaint || null,
        clinical_pathway: bookingData?.clinicalPathway || null,
        patient_object: selectedPatient || null,
        pharmacist_object: selectedPharmacist || null,
        gp_object: selectedGP || null,
        pharmacy_id: orgId,
        booked_by: userId,
        url: dailyUrl,
        hcp_token: dailyData?.hcpToken || null,
        patient_token: dailyData?.patientToken || null,
        duration: bookingData?.duration || null,
        service: 'pharmacy_first',
        service_id: selectedService.id
        // event_id: newEvent?.id || null
      }

      if (!selectedBooking) {
        const { payload: newBookingr, error: newBookingError } = await dispatch(createBooking(bookingPayload))

        // console.log('Booking Payload', bookingPayload)
        // console.log('Booking Info', newBooking, newBooking.id, newBookingError)
        // console.log('BOOKING DATA, ', bookingData)

        if (newBookingError) {
          console.log('new booking error', newBookingError)
          //show custom snackbar
          showMessage(
            'error creating booking, please try again, if problem persists contact admin with code 102',
            'error'
          )
          setLoading(false)
          return
        }
        newBooking = newBookingr
      } else {
        // update the booking
        const { payload: updatedBooking, error: updatedBookingError } = await dispatch(
          updateBooking({
            booking: bookingPayload,
            id: selectedBooking.id
          })
        )

        if (updatedBookingError) {
          console.log('updated booking error', updatedBookingError)
          //show custom snackbar
          showMessage(
            'error updating booking, please try again, if problem persists contact admin with code 102',
            'error'
          )
          setLoading(false)
          return
        }
        newBooking = updatedBooking
      }

      const endDateTime = dayjs(bookingData?.startDate).add(bookingData?.duration, 'minute')
      console.log('start date in event payload is', bookingData?.startDate)
      const eventPayload = {
        start: dayjs(bookingData?.startDate).format() || null,
        end: endDateTime.format() || null,
        location: 'online',
        company_id: orgId,
        created_by: userId,
        allDay: false,
        calendarType: selectedService.id,
        title: 'Pharmacy First',
        url: dailyUrl || null,
        booking_id: newBooking?.id || null
      }

      if (eventPayload.start_date && eventPayload.duration) {
        const startDate = dayjs(payload.start_date)
        const endDate = startDate.add(payload.duration, 'minute')
        eventPayloadpayload.end = endDate.toISOString()
      }

      if (!selectedBooking) {
        const { payload: newEvent, error: newEventError } = await dispatch(addEvent(eventPayload))

        console.log('Event Payload', eventPayload)
        console.log('Event Info', newEvent, newEventError)

        if (newEventError) {
          console.log('new event error', newEventError)
          //show custom snackbar
          showMessage(
            'error creating event, please try again, if problem persists contact admin with code 103',
            'error'
          )
          setLoading(false)
          return
        }
      } else {
        // update the event
        const { payload: updatedEvent, error: updatedEventError } = await dispatch(simpleEventUpdate(eventPayload))

        if (updatedEventError) {
          console.log('updated event error', updatedEventError)
          //show custom snackbar
          showMessage(
            'error updating event, please try again, if problem persists contact admin with code 103',
            'error'
          )
          setLoading(false)
          return
        }
      }

      if (!selectedBooking) {
        // upload the bookingData to the service table in supabase
        // const serviceTableName = getServiceTableName(selectedService)
        console.log('Creating NEw Service Row in supabase', serviceInfo)
        const { data: serviceData, error: serviceError } = await supabase
          .from(selectedService.table)
          .upsert({ ...serviceInfo, consultation_id: newBooking?.id }, { onConflict: 'consultation_id' })
          .select('*')

        if (serviceError) {
          console.log('service error', serviceError)
          showMessage(
            'error creating service, please try again, if problem persists contact admin with code 104',
            'error'
          )

          console.log('service data', serviceData)
          setLoading(false)
          return
        }
      } else {
        // update the service table
        // const serviceTableName = getServiceTableName(selectedService)
        const { data: serviceData, error: serviceError } = await supabase
          .from(selectedService.table)
          .upsert({ ...serviceInfo, consultation_id: newBooking?.id }, { onConflict: 'consultation_id' })
        // .match({ consultation_id: newBooking?.id })

        if (serviceError) {
          console.log('service error', serviceError)
          showMessage(
            'error updating service, please try again, if problem persists contact admin with code 104',
            'error'
          )
          setLoading(false)
          return
        }
      }

      const userLink = `https://pharmex.uk/pharmacy-first/patient/${newBooking?.id}`

      const phoneNumber = userData.mobileNumber // assuming userData contains the phone number
      const message = `${bookingData.textMessage}. Use this link to join the meeting ${userLink}. Your secure word is your first name = ${selectedPatient.first_name}`
      const org_message = `The scheduled appointment with ${selectedPatient?.full_name} scheduled for ${dayjs(
        bookingData.startDate
      ).format('YYYY-MM-DD HH:mm')} is starting soon`
      const title = `Consultation ${selectedPatient?.full_name}`

      const smsResponse = await dispatch(
        createThreadAndSendSMS({
          patientId: selectedPatient?.id,
          patientName: selectedPatient.full_name,
          message,
          phoneNumber: userData.mobileNumber,
          appointmentId: newBooking.id,
          time: bookingData.startDate,
          doNotIncludeTextMessage
        })
      )
      console.log('SMS response', smsResponse)
      // remind 30minuted before appointment
      const reminderDate = dayjs(bookingData.startDate).subtract(30, 'minute')
      const scheduledMeeting = await dispatch(
        scheduleReminder({
          phoneNumber,
          message,
          time: reminderDate,
          apiKey: notifyApiKey,
          organisation_id: orgId,
          org_message,
          title
        })
      )
      console.log('scheduledMeeting', scheduledMeeting)

      //show custom snackbar
      showMessage('Booking created successfully', 'success')

      setLoading(false)
      toast.success('Form Submitted Successfully!')
      refetchAppointments()
      onClose()
      handleReset()
    }
  }

  const createNewBookings = async () => {}

  const updateExistingBookings = async () => {}

  useEffect(() => {
    // Check if a patient is selected
    if (selectedPatient) {
      patientReset({
        ...defaultAccountValues,
        fullName: selectedPatient.full_name,
        email: selectedPatient.email,
        nhsNumber: selectedPatient.nhs_number,
        mobileNumber: selectedPatient.mobile_number,
        houseNumber: selectedPatient.house_number,
        address: selectedPatient.address,
        postCode: selectedPatient.post_code,
        dateOfBirth: selectedPatient.dob,
        telephoneNumber: selectedPatient.telephone_number
        // ... other fields you want to autofill
      })
    } else {
      // If no patient is selected, reset the forms to default values
      patientReset(defaultAccountValues)
    }
  }, [selectedPatient, patientReset])

  useEffect(() => {
    let message = ''
    let pharmacistName = ''

    // Check if Pharmacist is an object and has a property 'full_name'
    if (Pharmacist && typeof Pharmacist === 'object' && Pharmacist.full_name) {
      pharmacistName = Pharmacist.full_name
    } else if (Pharmacist && typeof Pharmacist === 'string') {
      // Pharmacist is a string
      pharmacistName = Pharmacist
    }

    if (fullNameValue && Pharmacist && startDate) {
      message = `Dear ${fullNameValue}, Your appointment has been booked. To see: ${
        pharmacistName || 'a pharmacist'
      } Date: ${dayjs(startDate).format('DD/MMM/YYYY')} time: ${dayjs(startDate).format('h:mm A')}`
    } else if (fullNameValue && Pharmacist) {
      message = `Dear ${fullNameValue}, Your appointment has  been booked. To see: ${pharmacistName || 'a pharmacist'}`
    } else if (fullNameValue && startDate) {
      message = `Dear ${fullNameValue}, Your appointment has  been booked. Date: ${dayjs(startDate).format(
        'DD/MMM/YYYY'
      )} time: ${dayjs(startDate).format('h:mm A')}`
    } else if (fullNameValue) {
      message = `Dear ${fullNameValue}, Your appointment has  been booked.`
    } else {
      message = `Dear patient, Your appointment has been booked.`
    }

    setValue('textMessage', message)
  }, [fullNameValue, Pharmacist, startDate])

  const handleSelectedGP = value => {
    console.log('handle select value', value)
    setSelectedGP(value)
  }

  const findFirstErrorMessage = errorObject => {
    for (let key in errorObject) {
      if (errorObject[key].message) {
        return errorObject[key].message
      }
    }
    return ''
  }

  // log out any form error
  useEffect(() => {
    console.log('form errors', selectedPatient?.dob, typeof selectedPatient?.dob)
    console.log('account errors', accountErrors)
    console.log('booking errors', bookingErrors)
    console.log('confirm errors', confirmErrors)

    // show message if any error are present and show the actual error
    const firstErrorMessage =
      findFirstErrorMessage(accountErrors) ||
      findFirstErrorMessage(bookingErrors) ||
      findFirstErrorMessage(confirmErrors)
    if (firstErrorMessage) {
      showMessage(firstErrorMessage, 'error')
    }
  }, [accountErrors, bookingErrors, confirmErrors])

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <CapturePersonalInfo
            steps={steps}
            handleAccountSubmit={handleAccountSubmit}
            accountControl={accountControl}
            accountErrors={accountErrors}
            onSubmit={onSubmit}
            handleSelect={handleSelect}
            setAddNewPatientDialog={setAddNewPatientDialog}
            setAddNewPharmacistDialog={setAddNewPharmacistDialog}
            patientData={selectedPatient}
            handleSelectedPharmacist={handleSelectedPharmacist}
            pharmacistData={selectedPharmacist}
            dispatch={dispatch}
            selectedGPData={selectedGP}
            handleSelectedGP={handleSelectedGP}
            bookingErrors={bookingErrors}
            bookingControl={bookingControl}
            setDatePickerOpen={setDatePickerOpen}
            datePickerOpen={datePickerOpen}
          />
        )
      case 1:
        return !variableLoading ? getVariableFormFields(selectedService.title, handleBack) : <CircularProgress />
      case 2:
        return (
          <form key={2} onSubmit={handleConfirmSubmit(onSubmit)}>
            <Box container spacing={5}>
              <Box sx={{ mb: 4 }}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {steps[2].title}
                </Typography>
                <Typography variant='caption' component='p'>
                  {steps[2].subtitle}
                </Typography>
              </Box>
              <Stack>
                <Card sx={{ p: 2, mb: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Patient
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {fullNameValue}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Pharmacist
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {selectedPharmacist?.full_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Date
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {dayjs(startDate).format('DD/MMM/YYYY h:mm A')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Duration
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {bookingGetValues().duration} minutes
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Presenting Complaint
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {bookingGetValues().presentingComplaint}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Reminder Message time
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {dayjs(startDate).subtract(30, 'minute').format('DD/MMM/YYYY h:mm A')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>

                <FormControl fullWidth>
                  <Controller
                    name='textMessage'
                    control={bookingControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label='Text Message'
                        multiline
                        rows={4}
                        onChange={onChange}
                        autoComplete='off'
                        error={Boolean(bookingErrors.textMessage)}
                        placeholder='Text to send to the patient'
                        aria-describedby='stepper-linear-booking-textMessage'
                      />
                    )}
                  />
                  {bookingErrors.textMessage && (
                    <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-booking-textMessage'>
                      {bookingErrors.textMessage.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth>
                  <Controller
                    name='iAgree'
                    control={confirmControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={onChange}
                            name='iAgree'
                            color='primary'
                            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.3rem' } }}
                          />
                        }
                        label='I agree to the terms and conditions'
                      />
                    )}
                  />
                  {confirmErrors.twitter && (
                    <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-confirm-iagree'>
                      This field is required
                    </FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <Controller
                    name='doNotIncludeTextMessage'
                    control={confirmControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={() => setdoNotIncludeTextMessage(!doNotIncludeTextMessage)}
                            name='doNotIncludeTextMessage'
                            color='primary'
                            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.3rem' } }}
                          />
                        }
                        label='Do not send text message'
                      />
                    )}
                  />
                  {confirmErrors.twitter && (
                    <FormHelperText sx={{ color: 'error.main' }} id='stepper-linear-confirm-iagree'>
                      This field is required
                    </FormHelperText>
                  )}
                </FormControl>
              </Stack>
              <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button size='large' variant='outlined' color='secondary' onClick={handleBack}>
                  Back
                </Button>
                <Button size='large' type='submit' variant='contained'>
                  Submit
                </Button>
              </Grid>
            </Box>
          </form>
        )
      default:
        return null
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography>All steps are completed!</Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='large' variant='contained' onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Fragment>
      )
    } else {
      return getStepContent(activeStep)
    }
  }

  return (
    <Card>
      <CardContent>
        <StepperWrapper>
          <Stepper activeStep={activeStep} style={{ alignItems: 'flex-start' }}>
            {steps.map((step, index) => {
              const labelProps = {}
              if (index === activeStep) {
                labelProps.error = false
                if (
                  (accountErrors.email ||
                    accountErrors.fullName ||
                    accountErrors.nhsNumber ||
                    accountErrors.password ||
                    accountErrors['confirm-password']) &&
                  activeStep === 0
                ) {
                  labelProps.error = true
                } else if (
                  (bookingErrors.pharmacist ||
                    bookingErrors.startDate ||
                    bookingErrors.presentingComplaint ||
                    bookingErrors.textMessage) &&
                  activeStep === 1
                ) {
                  labelProps.error = true
                } else if (confirmErrors.iAgree && activeStep === 2) {
                  labelProps.error = true
                } else {
                  labelProps.error = false
                }
              }

              return (
                <Step key={index} onClick={() => handleStepClick(index)} style={{ cursor: 'pointer' }}>
                  <StepLabel {...labelProps}>
                    <div
                      className='step-label'
                      style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography className='step-number' style={{ marginLeft: '4px' }}>{`0${index + 1}`}</Typography>
                      </div>
                    </div>
                  </StepLabel>
                  <div>
                    <Typography className='step-title'>{step.title}</Typography>
                    <Typography className='step-subtitle'>{step.subtitle}</Typography>
                  </div>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
      </CardContent>

      <Divider sx={{ m: '0 !important' }} />

      <CardContent>{renderContent()}</CardContent>
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        TransitionComponent={Transition}
        open={addNewPatientDialog}
        onClose={() => setAddNewPatientDialog(false)}
      >
        <DialogContent>
          <AddNewPatientForm
            patient={fullNameValue}
            onClose={() => setAddNewPatientDialog(false)}
            onSelect={handleSelect}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        TransitionComponent={Transition}
        open={addNewPharmacistDialog}
        onClose={() => setAddNewPharmacistDialog(false)}
      >
        <DialogContent>
          <AddNewPharmacistForm
            selectedPharmacist={selectedPharmacist}
            setSelectedPharmacist={setSelectedPharmacist}
            onClose={() => setAddNewPharmacistDialog(false)}
            onSelect={handlePharmacistSelect}
          />
        </DialogContent>
      </Dialog>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <CustomSnackbar
        vertical='top'
        horizontal='center'
        open={openSnack}
        setOpen={setOpenSnack}
        message={snackMessage}
        severity={snackSeverity}
        duration={15000}
      />
    </Card>
  )
}

export default NewBookingForm
