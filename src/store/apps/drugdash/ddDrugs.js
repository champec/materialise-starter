import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Fetch Patient Drugs based on the patient ID
export const fetchPatientDrugs = createAsyncThunk('drug_dash/fetchPatientDrugs', async patientId => {
  const { data, error } = await supabase
    .from('dd_patient_medication')
    .select('*, bnf_medicinal_forms(name)')
    .eq('patient', patientId)

  if (error) {
    console.log(error)
    throw error
  }
  const regularMedications = data.filter(drug => drug.is_regular)
  const acuteMedications = data.filter(drug => !drug.is_regular)

  return { regularMedications, acuteMedications }
})

// Search Drugs
export const searchDrugs = createAsyncThunk('drug_dash/searchDrugs', async searchTerm => {
  const { data, error } = await supabase
    .from('bnf_medicinal_forms')
    .select('name, manufacturer')
    .ilike('name', `%${searchTerm}%`)

  if (error) throw error
  return data
})

// Upsert Patient Drugs
export const upsertPatientDrug = createAsyncThunk('drug_dash/upsertPatientDrug', async drugInfo => {
  const conflictColumn = drugInfo.id ? 'id' : null // Determine if we are updating or inserting
  const { data, error } = await supabase.from('dd_patient_drugs').upsert([drugInfo], { onConflict: conflictColumn })

  if (error) throw error
  return data[0]
})

const ddDrugsSlice = createSlice({
  name: 'ddDrugs',
  initialState: {
    drugs: [],
    status: 'idle',
    error: null,
    searchedDrugs: [],
    selectedDrugs: [],
    regularMedications: [],
    acuteMedications: []
  },
  reducers: {},
  extraReducers: {
    [searchDrugs.pending]: state => {
      state.status = 'loading'
    },
    [searchDrugs.fulfilled]: (state, action) => {
      state.searchedDrugs = action.payload
      state.status = 'succeeded'
    },
    [searchDrugs.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [upsertPatientDrug.pending]: state => {
      state.status = 'loading'
    },
    [upsertPatientDrug.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      if (action.payload.is_regular) {
        state.selectedDrugs.push(action.payload)
      }
    },
    [upsertPatientDrug.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [fetchPatientDrugs.pending]: state => {
      state.status = 'loading'
    },
    [fetchPatientDrugs.fulfilled]: (state, action) => {
      state.regularMedications = action.payload.regularMedications
      state.acuteMedications = action.payload.acuteMedications
      state.status = 'succeeded'
    },
    [fetchPatientDrugs.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    }
  }
})

export default ddDrugsSlice.reducer
