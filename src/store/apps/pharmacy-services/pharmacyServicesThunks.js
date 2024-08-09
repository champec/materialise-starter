import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { prepareClaimData } from './utils/mysPrep'

// Fetch appointments for the current organisation
export const fetchAppointments = createAsyncThunk('pharmacyServices/fetchAppointments', async (_, { getState }) => {
  const organisationId = getState().organisation.organisation.id
  const { data, error } = await supabase
    .from('ps_appointments')
    .select(
      `
        *,
        ps_services (*)
      `
    )
    .eq('pharmacy_id', organisationId)
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data
})

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
  async (appointmentData, { getState }) => {
    const organisationId = getState().organisation.organisation.id
    const { data, error } = await supabase
      .from('ps_appointments')
      .insert({ ...appointmentData, pharmacy_id: organisationId })
      .select()

    if (error) throw error
    return data[0]
  }
)

export const updateAppointment = createAsyncThunk(
  'pharmacyServices/updateAppointment',
  async (appointmentData, { getState }) => {
    const { id, ps_services, ...updateData } = appointmentData
    console.log('APPOINTMENT DATA', updateData)
    const { data, error } = await supabase.from('ps_appointments').update(updateData).eq('id', id).select()

    if (error) throw error
    return data[0]
  }
)

export const deleteAppointment = createAsyncThunk('pharmacyServices/deleteAppointment', async (id, { getState }) => {
  const { error } = await supabase.from('ps_appointments').delete().eq('id', id)

  if (error) throw error
  return id
})

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

    return results
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

const updateAppointmentStatus = async (appointmentId, newStatus) => {
  const { data, error } = await supabase
    .from('ps_appointments')
    .update({ overall_status: newStatus })
    .eq('id', appointmentId)

  if (error) throw new Error(`Failed to update appointment status: ${error.message}`)
  return data
}
