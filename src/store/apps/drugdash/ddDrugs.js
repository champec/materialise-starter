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
    .select('id, name, manufacturer, bnf_form_packs(id, size)')
    .ilike('name', `%${searchTerm}%`)

  if (error) throw error

  return data
})

// Upsert Patient Drugs
export const upsertPatientDrug = createAsyncThunk('drug_dash/upsertPatientDrug', async drugInfo => {
  const { data, error } = await supabase.from('dd_patient_medication').upsert([drugInfo], { onConflict: 'id' })

  if (error) {
    console.log(error)
    throw error
  }
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
    acuteMedications: [],
    selectedDrugDetail: null
  },
  reducers: {
    setSelectedDrugDetail: (state, action) => {
      state.selectedDrugDetail = action.payload
    },
    addSelectedDrugs: (state, action) => {
      state.selectedDrugs.push(action.payload)
    },
    removeSelectedDrugs: (state, action) => {
      state.selectedDrugs = state.selectedDrugs.filter(drug => drug.id !== action.payload.id)
    },
    deselectAllDrugs: (state, action) => {
      const drugsToRemove = action.payload
      state.selectedDrugs = state.selectedDrugs.filter(drug => !drugsToRemove.find(d => d.id === drug.id))
    },

    selectAllDrugs: (state, action) => {
      state.selectedDrugs.push(...action.payload)
    }
  },
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

export const { setSelectedDrugDetail, addSelectedDrugs, removeSelectedDrugs, deselectAllDrugs, selectAllDrugs } =
  ddDrugsSlice.actions
export default ddDrugsSlice.reducer
