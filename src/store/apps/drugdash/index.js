import { createSlice } from '@reduxjs/toolkit'
import * as thunks from './ddThunks'

const initialState = {
  patients: [],
  patientMedications: [],
  bags: [],
  collections: [],
  selectedPatient: null,
  selectedCollection: null,
  searchedDrivers: [],
  transitStops: [],
  selectedDriver: null,
  drivers: [],
  loading: false,
  error: null
}

const drugDashSlice = createSlice({
  name: 'drugDash',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    resetState: () => initialState,
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload
    },
    setSelectedCollection: (state, action) => {
      state.selectedCollection = action.payload
    },
    setSelectedDriver: (state, action) => {
      state.selectedDriver = action.payload
    },
    clearSelectedDriver: state => {
      state.selectedDriver = null
    }
  },
  extraReducers: builder => {
    builder
      // Patients
      .addCase(thunks.fetchPatients.pending, state => {
        state.loading = true
      })
      .addCase(thunks.fetchPatients.fulfilled, (state, action) => {
        state.patients = action.payload
        state.loading = false
      })

      // Patient Medications
      .addCase(thunks.fetchPatientMedications.fulfilled, (state, action) => {
        state.patientMedications = action.payload
      })
      .addCase(thunks.addPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload)
        state.selectedPatient = action.payload // Automatically select the newly added patient
      })

      // Bags
      .addCase(thunks.fetchBags.pending, state => {
        state.loading = true
      })
      .addCase(thunks.fetchBags.fulfilled, (state, action) => {
        const bags = action.payload.map(bag => ({ ...bag, is_bag: true }))
        state.bags = bags
        state.loading = false
      })
      .addCase(thunks.addBag.fulfilled, (state, action) => {
        // state.bags.push(action.payload)
      })
      .addCase(thunks.updateBagStatus.fulfilled, (state, action) => {
        const index = state.bags.findIndex(bag => bag.id === action.payload.id)
        if (index !== -1) {
          action.payload.is_bag = true
          state.bags[index] = action.payload
        }
      })

      // Transit Stops
      .addCase(thunks.createTransitStops.fulfilled, (state, action) => {
        state.transitStops = action.payload
      })
      .addCase(thunks.fetchTransitStops.fulfilled, (state, action) => {
        state.transitStops = action.payload
      })

      // Collections
      .addCase(thunks.fetchCollections.fulfilled, (state, action) => {
        const collecitons = action.payload.map(collection => ({ ...collection, is_collection: true }))
        state.collections = collecitons
      })
      .addCase(thunks.fetchCollectionById.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          action.payload.is_collection = true
          state.collections[index] = action.payload
        } else {
          action.payload.is_collection = true
          state.collections.push(action.payload)
        }
      })
      .addCase(thunks.updateCollection.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          action.payload.is_collection = true
          state.collections[index] = action.payload
        }
      })
      .addCase(thunks.createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload)
      })

      // Drivers
      .addCase(thunks.fetchDrivers.fulfilled, (state, action) => {
        state.drivers = action.payload
      })
      .addCase(thunks.addDriver.fulfilled, (state, action) => {
        state.selectedDriver = action.payload
      })
      .addCase(thunks.searchDrivers.fulfilled, (state, action) => {
        state.searchedDrivers = action.payload
      })
      .addCase(thunks.deleteCollection.fulfilled, (state, action) => {
        // Remove the collection from the state
        state.collections = state.collections.filter(c => c.id !== action.payload.collectionId)

        // Update the bags in the state
        action.payload.updatedBags.forEach(updatedBag => {
          const index = state.bags.findIndex(b => b.id === updatedBag.id)
          if (index !== -1) {
            updatedBag.is_bag = true
            state.bags[index] = updatedBag
          }
        })
      })

      // Generic error handling for all rejected actions
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'An error occurred'
        }
      )
      // Generic loading handling for all pending actions
      .addMatcher(
        action => action.type.endsWith('/pending'),
        state => {
          state.loading = true
        }
      )
  }
})

// Action creators are generated for each case reducer function
export const {
  clearError,
  resetState,
  setSelectedPatient,
  setSelectedCollection,
  setSelectedDriver,
  clearSelectedDriver
} = drugDashSlice.actions

export const selectSelectedPatient = state => state.drugDash.selectedPatient
export const selectSelectedCollection = state => state.drugDash.selectedCollection
export const selectTransitStops = state => state.drugDash.transitStops

// Selectors
export const selectAllPatients = state => state.drugDash.patients
export const selectAllBags = state => state.drugDash.bags
export const selectAllCollections = state => state.drugDash.collections
export const selectAllDrivers = state => state.drugDash.drivers
export const selectLoading = state => state.drugDash.loading
export const selectError = state => state.drugDash.error

// Advanced selectors
export const selectFilteredBags = state => {
  const { bags, filters } = state.drugDash
  return bags.filter(bag => {
    const matchesStatus = !filters.status || bag.status === filters.status
    const matchesStartDate = !filters.startDate || new Date(bag.due_date) >= new Date(filters.startDate)
    const matchesEndDate = !filters.endDate || new Date(bag.due_date) <= new Date(filters.endDate)
    return matchesStatus && matchesStartDate && matchesEndDate
  })
}

export const selectBagsByStatus = (state, status) => state.drugDash.bags.filter(bag => bag.status === status)
export const selectCollectionByStatus = (state, status) =>
  state.drugDash.collections.filter(collection => collection.status === status)

export const selectCollectionById = (state, collectionId) =>
  state.drugDash.collections.find(collection => collection.id === collectionId)

export const selectBagsByDateRange = (state, startDate, endDate) =>
  state.drugDash.bags.filter(bag => {
    const bagDate = new Date(bag.due_date)
    return (!startDate || bagDate >= new Date(startDate)) && (!endDate || bagDate <= new Date(endDate))
  })

export default drugDashSlice.reducer
