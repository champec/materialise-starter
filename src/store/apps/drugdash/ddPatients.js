import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Fetch Patients (with pagination)
export const fetchPatients = createAsyncThunk('drug_dash/fetchPatients', async page => {
  const { data, error } = await supabase.from('dd_patients').select('*')

  if (error) {
    console.log('error', error)
    throw error
  }

  console.log('data', data)
  return data
})

// Search Patients
export const searchPatients = createAsyncThunk('drug_dash/searchPatients', async searchTerm => {
  const { data, error } = await supabase.from('dd_patients').select('*').ilike('name', `%${searchTerm}%`)
  if (error) throw error
  return data
})

// Fetch Patient Drugs
export const fetchPatientDrugs = createAsyncThunk('drug_dash/fetchPatientDrugs', async patientId => {
  const { data, error } = await supabase.from('dd_patient_drugs').select('*').eq('patient_id', patientId)
  if (error) throw error
  return {
    regular: (data || []).filter(drug => drug.is_regular),
    acute: (data || []).filter(drug => !drug.is_regular)
  }
})

// Upsert Patient Drugs
export const upsertPatientDrug = createAsyncThunk('drug_dash/upsertPatientDrug', async drugInfo => {
  const { data, error } = await supabase.from('dd_patient_drugs').upsert([drugInfo])
  if (error) throw error
  return data[0] // Assuming you're upserting one record at a time
})

// Upsert Patients
export const upsertPatient = createAsyncThunk('drug_dash/upsertPatient', async patientInfo => {
  const { data: existingPatients, error: searchError } = await supabase
    .from('dd_patients')
    .select('*')
    .eq('date_of_birth', patientInfo.date_of_birth)
    .eq('post_code', patientInfo.post_code)

  if (searchError) {
    console.log('add error', searchError)
    throw searchError
  }
  if (existingPatients.length > 0) {
    console.log('Exisitng patient error folowing already exists', existingPatients)
    throw new Error('Patient with the same DOB and Postcode exists.')
  }

  const { data, error } = await supabase.from('dd_patients').upsert([patientInfo])
  if (error) {
    console.log('add error', error)
    throw error
  }
  return data[0] // Assuming you're upserting one record at a time
})

const ddPatientsSlice = createSlice({
  name: 'ddPatients',
  initialState: {
    patients: [],
    status: 'idle',
    error: null,
    searchTerm: '',
    searchedPatients: [],
    selectedPatient: null,
    selectedPatientDrugs: {
      regular: [],
      acute: []
    }
  },
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload
    },
    removeSelectedPatient: state => {
      state.selectedPatient = null
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload

      if (state.searchTerm) {
        const terms = state.searchTerm.toLowerCase().split(' ').filter(Boolean)
        state.searchedPatients = state.patients.filter(patient => {
          return terms.every(
            term =>
              patient.first_name.toLowerCase().includes(term) ||
              patient.last_name.toLowerCase().includes(term) ||
              patient.address.toLowerCase().includes(term) ||
              (patient.date_of_birth && patient.date_of_birth.toLowerCase().includes(term))
          )
        })
      } else {
        state.searchedPatients = [] // Clear the searched patients if no search term
      }
    }
  },
  extraReducers: {
    [fetchPatients.pending]: state => {
      state.status = 'loading'
    },
    [fetchPatients.fulfilled]: (state, action) => {
      state.patients = action.payload
      state.status = 'succeeded'
    },
    [fetchPatients.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [searchPatients.fulfilled]: (state, action) => {
      state.searchedPatients = action.payload
    },
    [fetchPatientDrugs.fulfilled]: (state, action) => {
      state.selectedPatientDrugs = action.payload
    },
    [upsertPatient.fulfilled]: (state, action) => {
      state.patients.push(action.payload)
    }
  }
})

// Export the actions as needed
export const { removeSelectedPatient, setSelectedPatient, setSearchTerm } = ddPatientsSlice.actions
export default ddPatientsSlice.reducer
