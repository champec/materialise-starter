import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { prepareClaimData } from './utils/mysPrep'
import { createThreadAndSendSMS } from '../calendar/pharmacyfirst/appointmentListSlice'
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns'

// Fetch appointments for the current organisation
// export const fetchAppointments = createAsyncThunk(
//   'pharmacyServices/fetchAppointments',
//   async (params, { getState }) => {
//     const organisationId = getState().organisation.organisation.id

//     let query = supabase
//       .from('ps_appointments')
//       .select(
//         `
//         *,
//         ps_services (
//           *,
//           ps_pharmacy_services (id, color)
//         )
//       `
//       )
//       .eq('pharmacy_id', organisationId)

//     // Check if params is an object with startDate and endDate
//     if (params && typeof params === 'object' && 'startDate' in params && 'endDate' in params) {
//       const { startDate, endDate } = params
//       if (startDate && endDate) {
//         query = query
//           .gte('scheduled_time', startOfDay(startDate).toISOString())
//           .lte('scheduled_time', endOfDay(endDate).toISOString())
//       }
//     } else {
//       // If no date range is provided, fetch all appointments
//       // You can optionally add a default date range here if you want to limit the data
//       // For example, to fetch appointments for the next 30 days by default:
//       //
//       const defaultStartDate = subDays(new Date(), 30)
//       const defaultEndDate = addDays(new Date(), 30)
//       query = query
//         .gte('scheduled_time', startOfDay(defaultStartDate).toISOString())
//         .lte('scheduled_time', endOfDay(defaultEndDate).toISOString())
//     }

//     const { data, error } = await query.order('scheduled_time', { ascending: false })

//     if (error) throw error

//     const formattedData = data.map(appointment => ({
//       ...appointment,
//       start: appointment.scheduled_time,
//       color: appointment.ps_services?.ps_pharmacy_services?.[0]?.color,
//       p_service_id: appointment.ps_services?.ps_pharmacy_services?.[0]?.id,
//       title: appointment.patient_object?.full_name || 'Full Name'
//     }))

//     console.log('formattedData', formattedData)

//     return formattedData
//   }
// )
export const fetchAppointments = createAsyncThunk(
  'pharmacyServices/fetchAppointments',
  async (params, { getState }) => {
    const organisationId = getState().organisation.organisation.id

    let query = supabase
      .from('ps_appointments')
      .select(
        `
        *,
        ps_services (
          *,
          ps_pharmacy_services (id, color)
        )
      `
      )
      .eq('pharmacy_id', organisationId)

    if (params && typeof params === 'object') {
      if ('startDate' in params && 'endDate' in params) {
        // Date range query
        query = query
          .gte('scheduled_time', startOfDay(params.startDate).toISOString())
          .lte('scheduled_time', endOfDay(params.endDate).toISOString())
      } else if (params.fetchType === 'recent') {
        // Recent 50 query
        query = query.order('created_at', { ascending: false }).limit(params.limit || 50)
      } else if (params.fetchType === 'recentUpdates') {
        // Recent updates query
        query = query.order('last_updated', { ascending: false }).limit(params.limit || 50)
      }
    } else {
      // Default behavior: fetch appointments for the last 30 days to next 30 days
      const defaultStartDate = subDays(new Date(), 30)
      const defaultEndDate = addDays(new Date(), 30)
      query = query
        .gte('scheduled_time', startOfDay(defaultStartDate).toISOString())
        .lte('scheduled_time', endOfDay(defaultEndDate).toISOString())
    }

    const { data, error } = await query.order('scheduled_time', { ascending: false })

    if (error) throw error

    const formattedData = data.map(appointment => ({
      ...appointment,
      start: appointment.scheduled_time,
      color: appointment.ps_services?.ps_pharmacy_services?.[0]?.color,
      p_service_id: appointment.ps_services?.ps_pharmacy_services?.[0]?.id,
      title: appointment.patient_object?.full_name || 'Full Name'
    }))

    return formattedData
  }
)

export const fetchServiceDeliveries = createAsyncThunk(
  'pharmacyServices/fetchServiceDeliveries',
  async (id, { getState }) => {
    const { data, error } = await supabase
      .from('ps_service_delivery')
      .select(`*, ps_service_stages!ps_service_delivery_service_stage_id_fkey(*)`)
      .eq('appointment_id', id)

    if (error) throw error

    return data || []
  }
)

// Fetch services and their stages for the current organisation
export const fetchServicesWithStages = createAsyncThunk(
  'pharmacyServices/fetchServicesWithStages',
  async (_, { getState }) => {
    const organisationId = getState().organisation.organisation.id
    const { data: subscribedServices, error: subscribedError } = await supabase
      .from('ps_pharmacy_services')
      .select(
        `
        ps_services (
          id,
          name,
          abbreviation,
          description,
          ps_service_stages (*)
        )
      `
      )
      .eq('pharmacy_id', organisationId)

    if (subscribedError) throw subscribedError

    // Flatten the structure
    const services = subscribedServices.map(item => ({
      ...item.ps_services,
      stages: item.ps_services.ps_service_stages
    }))

    return services
  }
)

// Fetch services subscribed by the current organisation
export const fetchSubscribedServices = createAsyncThunk(
  'pharmacyServices/fetchSubscribedServices',
  async (_, { getState }) => {
    const organisationId = getState().organisation.organisation.id
    const { data, error } = await supabase
      .from('ps_pharmacy_services')
      .select(
        `
          ps_services (*)
        `
      )
      .eq('pharmacy_id', organisationId)

    if (error) throw error
    return data.map(item => item.ps_services)
  }
)

// Other thunks (createAppointment, updateAppointment, deleteAppointment) remain the same

export const createAppointment = createAsyncThunk(
  'pharmacyServices/createAppointment',
  async (appointmentData, { getState, dispatch }) => {
    const organisationId = getState().organisation.organisation.id
    const { data, error } = await supabase
      .from('ps_appointments')
      .insert({ ...appointmentData, pharmacy_id: organisationId })
      .select()
      .single()

    if (error) throw error
    dispatch(fetchAppointments())
    return { data, error }
  }
)

export const updateAppointment = createAsyncThunk(
  'pharmacyServices/updateAppointment',
  async ({ appointmentData, sendText }, { getState, dispatch }) => {
    console.log('APPOINTMENT DATA', appointmentData)
    const { id, ps_services, start, end, p_service_id, title, ...updateData } = appointmentData

    // take the scheduled_time from the updateData and add an appointment_end_time 30 minutes after
    const appointmentEndTime = new Date(updateData.scheduled_time)
    appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + 30)
    updateData.appointment_end_time = appointmentEndTime.toISOString()

    const { data, error } = await supabase.from('ps_appointments').update(updateData).eq('id', id).select().single()

    if (sendText) {
      const { data: threadId, error } = await supabase
        .from('sms_threads')
        .select('*')
        .eq('appointment_id', id)
        .maybeSingle()
      console.log('THREAD ID', threadId, error)
      if (threadId) {
        const message = `Your appointment has been updated: ${data.scheduled_time}`
        await dispatch(appendMessageToThread({ threadId: threadId.id, message: message }))
      } else {
        console.log('NO THREAD ID FOUND')
        await dispatch(
          createThreadAndSendSMS({
            patientId: data.patient_id,
            patientName: data.patient_object.full_name,
            message: `Your appointment has been updated: ${data.scheduled_time}`,
            phoneNumber: data.patient_object.mobile_number,
            time: data.scheduled_time,
            appointmentId: data.id
          })
        )
      }
    }

    if (error) throw error
    console.log('UPDATED APPOINTMENT RETURNED DATA', data)
    dispatch(fetchAppointments())
    return data
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

export const deleteAppointment = createAsyncThunk(
  'pharmacyServices/deleteAppointment',
  async (id, { getState, dispatch }) => {
    const { error } = await supabase.from('ps_appointments').delete().eq('id', id)

    if (error) throw error
    dispatch(fetchAppointments())
    return id
  }
)

export const submitClaim = createAsyncThunk(
  'pharmacyServices/submitClaim',
  async (appointmentIds, { getState, rejectWithValue }) => {
    const state = getState()
    const results = []

    for (const appointmentId of appointmentIds) {
      try {
        console.log('working on appointment', appointmentId)
        // 1. Fetch appointment details
        const { data: appointment, error: appointmentError } = await supabase
          .from('ps_appointments')
          .select('*, ps_service_delivery(*)')
          .eq('id', appointmentId)
          .single()

        if (appointmentError) throw new Error(`Failed to fetch appointment: ${appointmentError.message}`)
        if (appointment.overall_status !== 'Completed') {
          throw new Error('Appointment is not completed')
        }
        // 2. Prepare claim data
        const claimData = prepareClaimData(appointment, appointment.ps_service_delivery[0])
        // 3. Submit to MYS
        const mysResponse = await submitToMYS(claimData)
        // 4. Store claim result
        await storeClaimResult(appointmentId, mysResponse)
        // 5. Update appointment status
        await updateAppointmentStatus(appointmentId, 'claim_sent')

        results.push({ appointmentId, status: 'success', claimId: mysResponse.id })
      } catch (error) {
        results.push({ appointmentId, status: 'error', message: error.message })
      }
    }

    dispatch(fetchAppointments())
    return
  }
)

export const cancelAppointment = createAsyncThunk(
  'pharmacyServices/cancelAppointment',
  async (appointmentId, { dispatch }) => {
    try {
      const { data, error } = await supabase
        .from('ps_appointments')
        .update({ overall_status: 'Cancelled' })
        .eq('id', appointmentId)
        .single()

      if (error) throw new Error(`Failed to cancel appointment: ${error.message}`)

      return { id: appointmentId, status: 'success', message: 'Appointment cancelled successfully' }
    } catch (error) {
      return { id: appointmentId, status: 'error', message: error.message }
    }
  }
)

const submitToMYS = async (claimData, serviceId) => {
  let baseUrl, endpoint

  // Determine the correct endpoint based on the service ID
  switch (serviceId) {
    case 'DMS_SERVICE_ID':
      baseUrl = 'https://stg.api.dms.pharmacy.mys.nhsbsa.nhs.uk/v1'
      endpoint = `${baseUrl}/QuestionnaireResponse`
      break
    case 'NMS_SERVICE_ID':
      baseUrl = 'https://stg.api.nms.pharmacy.mys.nhsbsa.nhs.uk/v1'
      endpoint = `${baseUrl}/claim`
      break
    case 'CVD_SERVICE_ID':
      baseUrl = 'https://stg.api.cvd.pharmacy.mys.nhsbsa.nhs.uk/v1'
      endpoint = `${baseUrl}/claim`
      break
    case 'CPCS_SERVICE_ID':
      baseUrl = 'https://stg.services.nhsbsa.nhs.uk'
      endpoint = `${baseUrl}/pharmacy-cpcs-api/resources/Claim`
      break
    // Add other service types as needed
    default:
      throw new Error(`Unsupported service ID: ${serviceId}`)
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache'
      // Add any required authentication headers here
    },
    body: JSON.stringify(claimData)
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access forbidden. Check your authentication credentials.')
    } else if (response.status === 400 || response.status === 422) {
      const errorData = await response.json()
      throw new Error(`Request error: ${JSON.stringify(errorData)}`)
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  const responseData = await response.json()

  // Extract the claim ID from the response
  let claimId
  if (serviceId === 'DMS_SERVICE_ID') {
    claimId = responseData.id
  } else {
    // For other services, the claim ID might be in a different location
    claimId = responseData.submissionId || responseData.id
  }

  return {
    id: claimId,
    responseData // Include full response data for logging or further processing
  }
}

const storeClaimResult = async (appointmentId, mysResponse) => {
  const { data, error } = await supabase.from('ps_claims').insert({
    appointment_id: appointmentId,
    mys_claim_id: mysResponse.id,
    status: 'submitted',
    submitted_at: new Date().toISOString()
  })

  if (error) throw new Error(`Failed to store claim result: ${error.message}`)

  await supabase.from('ps_appointments').update({ overall_status: 'claim_sent' }).eq('id', appointmentId)

  return data
}

const updateAppointmentStatus = async ({ appointmentId, newStatus }, { dispatch }) => {
  const { data, error } = await supabase
    .from('ps_appointments')
    .update({ overall_status: newStatus })
    .eq('id', appointmentId)

  if (error) throw new Error(`Failed to update appointment status: ${error.message}`)
  dispatch(fetchAppointments())
  return
}
