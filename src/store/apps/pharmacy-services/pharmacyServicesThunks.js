import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

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
