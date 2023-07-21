// slices/cdr.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export const fetchDrugs = createAsyncThunk('cdr/fetchDrugs', async () => {
  const { data, error } = await supabase.from('cdr_drugs')
  return data
})

export const fetchPatients = createAsyncThunk('cdr/fetchPatients', async organisationId => {
  const { data: patients, error } = await supabase.from('cdr_patients').select().eq('organisation_id', organisationId)

  if (error) throw error
  return patients
})

export const fetchEntries = createAsyncThunk('cdr/fetchEntries', async ({ drugId, orgId }) => {
  const { data: entries, error } = await supabase
    .from('cdr_entries')
    .select()
    .eq('organisation_id', orgId)
    .eq('drug_id', drugId)
    .order('date')
  console.log(error)
  if (error) throw error

  return entries
})

export const fetchPrescribers = createAsyncThunk('cdr/fetchPrescribers', async orgId => {
  const { data, error } = await supabase.from('cdr_prescribers').select().eq('organisation_id', orgId)

  if (error) throw error
  return data
})

export const fetchSuppliers = createAsyncThunk('cdr/fetchSuppliers', async orgId => {
  const { data, error } = await supabase.from('cdr_suppliers').select().eq('organisation_id', orgId)

  if (error) throw error
  return data
})

export const addEntry = createAsyncThunk('cdr/addEntry', async entry => {
  const { data, error } = await supabase.from('cdr_entries').insert(entry)

  if (error) throw error

  return data
})

export const cdrSlice = createSlice({
  name: 'cdr',
  initialState: {
    drugs: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    drugClasses: [],
    selectedDrug: null,
    patients: [],
    prescribers: [],
    suppliers: [],
    entries: []
  },
  reducers: {
    entryAdded(state, action) {
      // Optimistically add entry
      state.entries.push(action.payload)
    },

    entryAddRollback(state, action) {
      // Rollback optimistic add
      state.entries = state.entries.filter(entry => entry.id !== action.payload.id)
    },
    patientsAdded(state, action) {
      state.patients.push(...action.payload)
    },
    patientAddRollback(state, action) {
      state.patients = state.patients.filter(patient => !action.payload.includes(patient))
    },
    drugsAdded(state, action) {
      state.drugs.push(...action.payload)
    },
    drugAddRollback(state, action) {
      state.drugs = state.drugs.filter(drug => !action.payload.includes(drug))
    },
    entriesAdded(state, action) {
      state.entries.push(...action.payload)
    },
    entriesAddRollback(state, action) {
      state.entries = state.entries.filter(entry => !action.payload.includes(entry))
    },
    prescribersAdded(state, action) {
      state.prescribers.push(...action.payload)
    },

    prescribersAddRollback(state, action) {
      state.prescribers = state.prescribers.filter(prescriber => !action.payload.includes(prescriber))
    },
    suppliersAdded(state, action) {
      state.suppliers.push(...action.payload)
    },

    suppliersAddRollback(state, action) {
      state.suppliers = state.suppliers.filter(supplier => !action.payload.includes(supplier))
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDrugs.pending, state => {
        state.status = 'loading'
      })
      .addCase(addEntry.fulfilled, (state, action) => {
        if (action.error) {
          // Rollback on error
          dispatch(entryAddRollback(action.payload))
        } else {
          // Get optimistically added entry
          const addedEntry = state.entries.find(entry => entry.id === action.payload.id)
          // Compare response to addedEntry
          if (JSON.stringify(addedEntry) !== JSON.stringify(action.payload)) {
            // Update state with response if different
            state.entries = state.entries.map(entry => {
              if (entry.id === action.payload.id) {
                return action.payload
              } else {
                return entry
              }
            })
          }
        }
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        if (action.error) {
          dispatch(patientAddRollback(action.payload))
        } else {
          // Compare response to added patients
          const areEqual = JSON.stringify(state.patients) === JSON.stringify(action.payload)
          if (!areEqual) {
            state.patients = action.payload
          }
        }
      })
      .addCase(fetchDrugs.fulfilled, (state, action) => {
        if (action.error) {
          dispatch(drugAddRollback(action.payload))
        } else {
          const areEqual = JSON.stringify(state.drugs) === JSON.stringify(action.payload)
          if (!areEqual) {
            state.drugs = action.payload
          }
        }
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        if (action.error) {
          dispatch(entriesAddRollback(action.payload))
        } else {
          const areEqual = JSON.stringify(state.entries) === JSON.stringify(action.payload)
          if (!areEqual) {
            state.entries = action.payload
          }
        }
      })
      .addCase(fetchPrescribers.fulfilled, (state, action) => {
        if (action.error) {
          dispatch(prescribersAddRollback(action.payload))
        } else {
          // Compare response
          const areEqual = JSON.stringify(state.prescribers) === JSON.stringify(action.payload)
          if (!areEqual) {
            state.prescribers = action.payload
          }
        }
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        if (action.error) {
          dispatch(suppliersAddRollback(action.payload))
        } else {
          const areEqual = JSON.stringify(state.suppliers) === JSON.stringify(action.payload)
          if (!areEqual) {
            state.suppliers = action.payload
          }
        }
      })
  }
})

// exports

export default cdrSlice.reducer
