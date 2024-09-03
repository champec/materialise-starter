import { supabaseOrg } from 'src/configs/supabase'
// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
const supabase = supabaseOrg

export const fetchAppointments = createAsyncThunk(
  'appointmentList/fetchAppointments',
  async ({ dateRange, type, table, service_id, service_table, page, pageSize }, { getState }) => {
    const orgId = getState().organisation.organisation.id

    const offset = page * pageSize
    const limit = pageSize

    // Set default start and end dates to 2 weeks before and after today
    const defaultStartDate = dayjs().subtract(2, 'week').startOf('day').toISOString()
    const defaultEndDate = dayjs().add(2, 'week').endOf('day').toISOString()

    // Extract startDate and endDate from dateRange if provided, else use defaults
    const { start = defaultStartDate, end = defaultEndDate } = dateRange || {}

    // Define the base select query
    let selectQuery =
      '*, consultation_status(*), calendar_events!calendar_events_booking_id_fkey!inner(*), sms_threads(id)'

    // Add table to the select query if it's provided
    if (table) {
      selectQuery += `, ${table}(*)`
    }

    if (service_table) {
      selectQuery += `, ${service_table}(*)`
    }

    // Initialize the query builder
    let query = supabase
      .from('consultations')
      .select(selectQuery, { count: 'exact' })
      .eq('pharmacy_id', orgId)
      .gte('calendar_events.start', start)
      .lte('calendar_events.end', end)
      .range(offset, offset + limit - 1)
    // .order('calendar_events', { ascending: true }) // or { ascending: false } for descending order

    // Add service conditionally
    if (type) {
      query = query.eq('service', type)
    }

    if (service_id) {
      query = query.eq('service_id', service_id)
    }

    console.log('final fetch apppointments query', query, 'and selectquery', selectQuery, 'selectQuery')

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    console.log(data, 'fetchAppointments', count)
    return { data: data || [], totalCount: count }
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
  async (
    { patientId, patientName, message, phoneNumber, time, appointmentId, doNotIncludeTextMessage },
    { getState }
  ) => {
    const orgId = getState().organisation.organisation.id
    const notifyApiKey = getState().organisation?.organisation?.pharmacy_settings?.notify_api_key

    console.log(patientId, patientName, message, phoneNumber, time, appointmentId, 'createThreadAndSendSMS')

    const { data, error } = await supabase
      .from('sms_threads')
      .upsert(
        {
          patientId,
          appointment_id: appointmentId,
          organisation_id: orgId,
          patient_phone_number: phoneNumber
        },
        {
          onConflict: 'appointment_id'
        }
      )
      .select('id')
      .single()

    if (error) {
      console.log('sms thread error')
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
    if (!doNotIncludeTextMessage) {
      const { data: messageData, error: messageError } = await supabase
        .from('sms_messages')
        .insert({ thread_id: data.id, message: message, sender_id: orgId })

      if (messageError) {
        console.log('sms send error', messageError)
        throw messageError // Consider throwing the error to be handled by Redux Toolkit
      }
    }

    return response
  }
)

export const appendMessageToThread = createAsyncThunk(
  'appointmentList/appendMessageToThread',
  async ({ threadId, message }, { getState }) => {
    const orgId = getState().organisation.organisation.id

    const { data, error } = await supabase
      .from('sms_messages')
      .insert({ thread_id: threadId, message: message, sender_id: orgId })
      .select('*')

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

async function refreshAccessToken(refreshToken) {
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', refreshToken)
  params.append('scope', 'Mail.Read Mail.Send offline_access')
  // params.append('client_secret', clientSecret); // Include for confidential clients

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw error
  }
}

export const sendEmailThunk = createAsyncThunk(
  'email/sendEmail',
  async ({ toAddress, subject, content }, { rejectWithValue, getState }) => {
    const graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me/sendMail'

    const accessToken = getState().organisation.organisation.pharmacy_settings.nhs_mail_access_token
    const refreshToken = getState().organisation.organisation.pharmacy_settings.nhs_mail_refresh_token

    const sendEmailRequest = async token => {
      const email = {
        message: {
          subject: subject,
          body: {
            contentType: 'Text',
            content: content
          },
          toRecipients: [
            {
              emailAddress: {
                address: toAddress
              }
            }
          ]
        },
        saveToSentItems: 'true'
      }

      const response = await fetch(graphApiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
      })

      return response
    }

    let response = await sendEmailRequest(accessToken)

    // Check if the response indicates an expired token
    if (!response.ok && response.status === 401) {
      // Refresh the token
      const newAccessToken = await refreshAccessToken(refreshToken) // Implement this function
      response = await sendEmailRequest(newAccessToken)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Email Send Error Response:', errorText)
      return rejectWithValue(`Error sending email: ${errorText}`)
    }

    if (response.status === 202) {
      return 'Email sending initiated'
    }

    try {
      return await response.json()
    } catch (error) {
      console.error('Non-202 success response not in JSON format:', error)
      return 'Email sent successfully'
    }
  }
)

export const updateSelectedBookingService = createAsyncThunk(
  'appointmentList/updateSelectedBookingService',
  async ({ bookingId, serviceTable, serviceInfo }) => {
    const { data: dataArray, error } = await supabase
      .from(serviceTable)
      .update({ pathwayform: serviceInfo })
      .eq('consultation_id', bookingId)
      .select('*')

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    const data = dataArray[0]
    console.log('updateSelectedBookingService', data)
    return { data, serviceTable, bookingId }
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
  totalCount: 0,
  loading: false,
  pdsPatient: null,
  selectedPatient: null,
  selectedBooking: null,
  loadingSelectedBooking: false,
  loadingServiceUpdate: false
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
      state.appointments = action.payload.data
      state.totalCount = action.payload.totalCount
      state.loading = false
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
    },
    [updateSelectedBookingService.fulfilled]: (state, action) => {
      const { data, serviceTable, bookingId } = action.payload
      const updatedAppointments = state.appointments.map(appointment => {
        if (appointment.id === bookingId) {
          appointment[serviceTable] = data
        }

        if (state.selectedBooking && state.selectedBooking.id === bookingId) {
          state.selectedBooking[serviceTable] = data
        }

        return appointment
      })

      state.appointments = updatedAppointments
      state.loadingServiceUpdate = false
    },
    [updateSelectedBookingService.pending]: (state, action) => {
      state.loadingServiceUpdate = true
    },
    [updateSelectedBookingService.rejected]: (state, action) => {
      state.loadingServiceUpdate = false
    }
  }
})

export const { setSelectedPatient, setSelectedBooking } = appointmnetListSlice.actions

export default appointmnetListSlice.reducer
