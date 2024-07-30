import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAppointments,
  fetchServicesWithStages,
  fetchSubscribedServices,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from './pharmacyServicesThunks'

const pharmacyServicesSlice = createSlice({
  name: 'pharmacyServices',
  initialState: {
    appointments: [],
    services: [],
    subscribedServices: [],
    loading: false,
    error: null,
    filters: {
      status: [],
      service: []
    }
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload
    },
    setServiceFilter: (state, action) => {
      state.filters.service = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppointments.pending, state => {
        state.loading = true
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false
        state.appointments = action.payload
        if (state.filters.status.length === 0) {
          const statuses = [...new Set(action.payload.map(app => app.overall_status))]
          state.filters.status = ['all', ...statuses]
        }
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchServicesWithStages.fulfilled, (state, action) => {
        state.services = action.payload
        if (state.filters.service.length === 0) {
          state.filters.service = ['all', ...action.payload.map(s => s.id)]
        }
      })
      .addCase(fetchSubscribedServices.fulfilled, (state, action) => {
        state.subscribedServices = action.payload
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload)
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(app => app.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(app => app.id !== action.payload)
      })
  }
})

export const { setStatusFilter, setServiceFilter } = pharmacyServicesSlice.actions

export default pharmacyServicesSlice.reducer

// Updated selector for filtered appointments
export const selectFilteredAppointments = state => {
  const { appointments, filters } = state.services
  return appointments.filter(app => {
    const statusMatch = filters.status.includes('all') || filters.status.includes(app.overall_status)
    const serviceMatch = filters.service.includes('all') || filters.service.includes(app.service_id)
    return statusMatch && serviceMatch
  })
}

// Selector for services
export const selectServices = state => state.services.services

// Selector for subscribed services
export const selectSubscribedServices = state => state.services.subscribedServices

// New selectors for filters
export const selectServiceFilter = state => state.services.filters.service
export const selectStatusFilter = state => state.services.filters.status

// Selector for service stages by service ID
export const selectServiceStages = serviceId => state => {
  const service = state.services.services.find(s => s.id === serviceId)
  return service ? service.stages : []
}
