import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAppointments,
  fetchServicesWithStages,
  fetchSubscribedServices,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  fetchServiceDeliveries
} from './pharmacyServicesThunks'

const pharmacyServicesSlice = createSlice({
  name: 'pharmacyServices',
  initialState: {
    appointments: [],
    services: [],
    subscribedServices: [],
    selectedAppointment: null,
    selectedAppointmentStartDate: null,
    tempOriginalAppointment: null,
    loading: false,
    error: null,
    errors: {
      updateAppointment: null,
      deleteAppointment: null,
      fetchAppointments: null,
      fetchServicesWithStages: null,
      fetchSubscribedServices: null,
      createAppointment: null,
      fetchServiceDeliveries: null
    },
    serviceDeliveries: [],
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
    },
    setSelectedAppointmentById: (state, action) => {
      state.selectedAppointment = state.appointments.find(app => app.id === action.payload)
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload
    },
    setSelectedAppointmentStartDate: (state, action) => {
      state.selectedAppointmentStartDate = action.payload
    },
    tempUpdateAppointment: (state, action) => {
      const { id, updatedAppointment } = action.payload
      const index = state.appointments.findIndex(app => app.id === id)
      if (index !== -1) {
        state.tempOriginalAppointment = { ...state.appointments[index] }
        state.appointments[index] = updatedAppointment
      }
    },
    revertAppointmentUpdate: state => {
      if (state.tempOriginalAppointment) {
        const index = state.appointments.findIndex(app => app.id === state.tempOriginalAppointment.id)
        if (index !== -1) {
          state.appointments[index] = state.tempOriginalAppointment
        }
        state.tempOriginalAppointment = null
      }
    },
    clearTempOriginalAppointment: state => {
      state.tempOriginalAppointment = null
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
        state.errors.fetchAppointments = null
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        state.errors.fetchAppointments = action.error.message
      })
      .addCase(fetchServicesWithStages.fulfilled, (state, action) => {
        state.services = action.payload
        if (state.filters.service.length === 0) {
          state.filters.service = ['all', ...action.payload.map(s => s.id)]
        }
        state.errors.fetchServicesWithStages = null
      })
      .addCase(fetchSubscribedServices.fulfilled, (state, action) => {
        state.subscribedServices = action.payload
        state.errors.fetchSubscribedServices = null
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        console.log('Appointment created:', action.payload)
        state.errors.createAppointment = null
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.errors.createAppointment = action.error.message
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        console.log('Appointment updated:', action.payload)
        state.tempOriginalAppointment = null // Clear the temp data
        // const index = state.appointments.findIndex(app => app.id === action.payload.id)
        // if (index !== -1) {
        //   state.appointments[index] = action.payload
        // }
        state.errors.updateAppointment = null
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        // If the update fails, revert to the original appointment
        // if (state.tempOriginalAppointment) {
        //   const index = state.appointments.findIndex(app => app.id === state.tempOriginalAppointment.id)
        //   if (index !== -1) {
        //     state.appointments[index] = state.tempOriginalAppointment
        //   }
        // }
        state.tempOriginalAppointment = null // Clear the temp data
        state.errors.updateAppointment = action.error.message
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        // state.appointments = state.appointments.filter(app => app.id !== action.payload)
        console.log('Appointment deleted:', action.payload)
        state.errors.deleteAppointment = null
      })
      .addCase(fetchServiceDeliveries.fulfilled, (state, action) => {
        state.serviceDeliveries = action.payload
        state.errors.fetchServiceDeliveries = null
      })
  }
})

export const {
  setStatusFilter,
  setServiceFilter,
  setSelectedAppointmentById,
  setSelectedAppointment,
  setSelectedAppointmentStartDate,
  tempUpdateAppointment,
  revertAppointmentUpdate,
  clearTempOriginalAppointment
} = pharmacyServicesSlice.actions

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
