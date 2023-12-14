import { supabaseOrg } from 'src/configs/supabase'
// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
const supabase = supabaseOrg

export const fetchAppointments = createAsyncThunk(
  'appointmnetList/fetchAppointments',
  async (dateRange, { getState }) => {
    const orgId = getState().organisation.organisation.id

    // Set default start and end dates to 2 weeks before and after today
    const defaultStartDate = dayjs().subtract(2, 'week').startOf('day').toISOString()
    const defaultEndDate = dayjs().add(2, 'week').endOf('day').toISOString()

    // Extract startDate and endDate from dateRange if provided, else use defaults
    const { startDate = defaultStartDate, endDate = defaultEndDate } = dateRange || {}

    const { data, error } = await supabase
      .from('consultations')
      .select('*, pp_booking_status(status), calendar_events!consultations_event_id_fkey(*)')
      .eq('pharmacy_id', orgId)
      .gte('start_date', startDate || defaultStartDate)
      .lte('start_date', endDate || defaultEndDate)

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    console.log(data, 'fetchAppointments')
    return data || []
  }
)

export const fetchPatientData = createAsyncThunk('appointmentList/fetchPatientData', async searchParams => {
  const sandboxUrl = 'https://sandbox.api.service.nhs.uk/personal-demographics/FHIR/R4/Patient/9000000009'
  const baseUrl = 'https://api.service.nhs.uk/personal-demographics/FHIR/R4/'
  const token = 'Your_OAuth_Token' // Replace with actual token
  const headers = {
    Authorization: `Bearer ${token}`,
    accept: 'application/fhir+json'
  }

  if (searchParams.nhsNumber) {
    // Get patient details by NHS number
    const response = await fetch(`${baseUrl}Patient/${searchParams.nhsNumber}`, { headers })
    return response.json()
  } else {
    // Search patient by other criteria
    const queryString = new URLSearchParams(searchParams).toString()
    const response = await fetch(`${baseUrl}Patient?${queryString}`, { headers })
    return response.json()
  }
})

export const createThreadAndSendSMS = createAsyncThunk(
  'appointmentList/createThreadAndSendSMS',
  async ({ patientId, patientName, message, phoneNumber, time, appointmentId }, { getState }) => {
    const orgId = getState().organisation.organisation.id
    const notifyApiKey = getState().organisation?.organisation?.pharmacy_settings?.notify_api_key

    console.log(patientId, patientName, message, phoneNumber, time, appointmentId, 'createThreadAndSendSMS')

    const { data, error } = await supabase
      .from('sms_threads')
      .insert({ patient_id: patientId, consultation_id: appointmentId, organisation_id: orgId })
      .select('id')
      .single()

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    console.log(data, 'data')

    // const unixTimeStamp = dayjs(time).unix()
    // const response = await supabase.functions.invoke('send-appointment-notification', {
    //   body: {
    //     phoneNumber: phoneNumber, // assuming userData contains the phone number
    //     message: message,
    //     scheduledTime: unixTimeStamp,
    //     apiKey: notifyApiKey,
    //     name: patientName
    //   }
    // })

    // console.log(response, 'response')

    // create message and append to thread
    const { data: messageData, error: messageError } = await supabase
      .from('sms_messages')
      .insert({ thread_id: data.id, message: message, sender_id: orgId })

    if (messageError) {
      console.error(messageError)
      throw messageError // Consider throwing the error to be handled by Redux Toolkit
    }

    return response
  }
)

export const appendMessageToThread = createAsyncThunk(
  'appointmentList/appendMessageToThread',
  async ({ threadId, message }, { getState }) => {
    const orgId = getState().organisation.organisation.id
    const notifyApiKey = getState().organisation?.organisation?.pharmacy_settings?.notify_api_key

    const response = await supabase.functions.invoke('send-appointment-notification', {
      body: {
        phoneNumber: phoneNumber, // assuming userData contains the phone number
        message: message,
        scheduledTime: null,
        apiKey: notifyApiKey
      }
    })

    console.log(response, 'response')

    const { data, error } = await supabase
      .from('sms_messages')
      .insert({ thread_id: threadId, message: message, sender_id: orgId })

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    return data
  }
)

export const updateAppointmentStatus = createAsyncThunk(
  'appointmentList/updateAppointmentStatus',
  async ({ appointmentId, status }) => {
    const { data, error } = await supabase
      .from('consultations')
      .update({ status: status })
      .eq('id', appointmentId)
      .select('*')

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    return data
  }
)

export const scheduleReminder = createAsyncThunk(
  'appointmentList/scheduleReminder',
  async ({ phoneNumber, message, time, apiKey, organisation_id, title, org_message }) => {
    const { data, error } = await supabase.from('consultation_reminders').insert({
      phone_number: phoneNumber,
      message: message,
      scheduled_time: time,
      api_key: apiKey,
      organisation_id: organisation_id,
      title: title,
      org_message: org_message
    })

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    console.log(data, 'reminder scheduled data')
    return data
  }
)

export const fetchSelectedBooking = createAsyncThunk('appointmentList/fetchSelectedBooking', async bookingId => {
  const { data, error } = await supabase
    .from('consultations')
    .select('*, consultation_status(*), calendar_events!calendar_events_booking_id_fkey(*)')
    .eq('id', bookingId)
    .single()

  if (error) {
    console.error(error)
    throw error // Consider throwing the error to be handled by Redux Toolkit
  }

  console.log(data, 'fetchSelectedBooking')
  return data
})

const initialState = {
  appointments: [],
  loading: false,
  pdsPatient: null,
  selectedPatient: null,
  selectedBooking: null,
  loadingSelectedBooking: false
}

export const appointmnetListSlice = createSlice({
  name: 'appointmnetList',
  initialState: initialState,
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload
    }
  },
  extraReducers: {
    [fetchAppointments.fulfilled]: (state, action) => {
      state.appointments = action.payload
    },
    [fetchAppointments.pending]: (state, action) => {
      state.loading = true
    },
    [fetchAppointments.rejected]: (state, action) => {
      state.loading = false
    },
    [fetchSelectedBooking.fulfilled]: (state, action) => {
      state.selectedBooking = action.payload
    },
    [fetchSelectedBooking.pending]: (state, action) => {
      state.loadingSelectedBooking = true
    },
    [fetchSelectedBooking.rejected]: (state, action) => {
      state.loadingSelectedBooking = false
    }
  }
})

export const { setSelectedPatient, setSelectedBooking } = appointmnetListSlice.actions

export default appointmnetListSlice.reducer
