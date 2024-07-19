// slices/cdr.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export const fetchExistingRegisters = createAsyncThunk('cdr/fetchExistingRegisters', async orgId => {
  const { data, error } = await supabase
    .from('cdr_registers')
    .select('*, cdr_drugs(box_image, pill_image)')
    .eq('organisation_id', orgId)
  if (error) throw error
  return data
})

export const fetchDrugClasses = createAsyncThunk('cdr/fetchDrugClasses', async () => {
  const { data, error } = await supabase.from('cdr_distinct_classes').select('drug_class')
  if (error) throw error
  return data.map(item => ({ id: item.drug_class, drug_class: item.drug_class }))
})

export const fetchDrugBrands = createAsyncThunk('cdr/fetchDrugBrands', async drugClass => {
  const { data, error } = await supabase.from('cdr_distinct_brands').select('drug_brand').eq('drug_class', drugClass)
  if (error) throw error
  return data.map(item => ({ id: item.drug_brand, drug_brand: item.drug_brand }))
})

export const fetchDrugForms = createAsyncThunk('cdr/fetchDrugForms', async ({ className, brandName }) => {
  const { data, error } = await supabase
    .from('cdr_distinct_forms')
    .select('drug_form')
    .eq('drug_class', className)
    .eq('drug_brand', brandName)
    .order('drug_form')
  if (error) throw error
  return data.map(item => ({ id: item.drug_form, form_name: item.drug_form }))
})

export const fetchStrengths = createAsyncThunk('cdr/fetchStrengths', async ({ className, brandName }) => {
  const { data, error } = await supabase
    .from('cdr_distinct_strengths')
    .select('drug_strength')
    .eq('drug_class', className)
    .eq('drug_brand', brandName)
  if (error) throw error
  // return data.map(item => ({
  //   id: `${item.drug_strength}${item.units}`,
  //   strength: item.drug_strength,
  //   units: item.units,
  //   display: `${item.drug_strength} ${item.units}`
  // }))

  return data.map(item => ({ id: item.drug_strength, drug_strength: item.drug_strength }))
})

export const createNewRegister = createAsyncThunk(
  'cdr/createNewRegister',
  async ({ registerData, orgId }, { rejectWithValue }) => {
    try {
      // First, find the matching drug
      const { data: drugData, error: drugError } = await supabase
        .from('cdr_drugs_unique')
        .select('id')
        .eq('drug_class', registerData.className)
        .eq('drug_brand', registerData.brandName)
        .eq('drug_strength', registerData.strength)
        .eq('drug_form', registerData.formName)
        .single()

      if (drugError) throw drugError
      if (!drugData) throw new Error('No matching drug found')

      // Now create the register with the drug_id
      const { data: newRegisterData, error: registerError } = await supabase
        .from('cdr_registers')
        .insert([
          {
            drug_id: drugData.id,
            drug_class: registerData.className,
            drug_brand: registerData.brandName,
            drug_strength: registerData.strength,
            units: registerData.unit,
            drug_form: registerData.formName,
            // initial_stock: registerData.initialStock,
            organisation_id: orgId
          }
        ])
        .single()
        .select('*')

      if (registerError) {
        // Check if the error is due to a duplicate register
        if (registerError.code === '23505') {
          // PostgreSQL unique violation error code
          throw new Error('A register for this drug already exists for your organization')
        }
        throw registerError
      }

      return newRegisterData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

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
    entries: [],
    drugClasses: [],
    drugBrands: [],
    drugForms: [],
    strengths: [],
    newRegisterStatus: 'idle',
    newRegisterError: null,
    existingRegisters: [],
    existingRegistersStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    existingRegistersError: null
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
      // .addCase(fetchDrugs.pending, state => {
      //   state.status = 'loading'
      // })
      // .addCase(fetchDrugs.fulfilled, (state, action) => {
      //   state.status = 'succeeded'
      //   state.drugs = action.payload
      // })
      // .addCase(fetchDrugs.rejected, (state, action) => {
      //   state.status = 'failed'
      //   state.error = action.error.message
      // })

      // New cases for drug classes
      .addCase(fetchDrugClasses.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchDrugClasses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.drugClasses = action.payload
      })
      .addCase(fetchDrugClasses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Cases for drug brands
      .addCase(fetchDrugBrands.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchDrugBrands.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.drugBrands = action.payload
      })
      .addCase(fetchDrugBrands.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Cases for drug forms
      .addCase(fetchDrugForms.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchDrugForms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.drugForms = action.payload
      })
      .addCase(fetchDrugForms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Cases for strengths
      .addCase(fetchStrengths.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchStrengths.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.strengths = action.payload
      })
      .addCase(fetchStrengths.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      .addCase(fetchExistingRegisters.pending, state => {
        state.existingRegistersStatus = 'loading'
      })
      .addCase(fetchExistingRegisters.fulfilled, (state, action) => {
        state.existingRegistersStatus = 'succeeded'
        state.existingRegisters = action.payload
        state.existingRegistersError = null
      })
      .addCase(fetchExistingRegisters.rejected, (state, action) => {
        state.existingRegistersStatus = 'failed'
        state.existingRegistersError = action.error.message
      })

      .addCase(createNewRegister.pending, state => {
        state.newRegisterStatus = 'loading'
      })
      .addCase(createNewRegister.fulfilled, (state, action) => {
        state.newRegisterStatus = 'succeeded'
        state.existingRegisters.push(action.payload)
        state.newRegisterError = null
      })
      .addCase(createNewRegister.rejected, (state, action) => {
        state.newRegisterStatus = 'failed'
        state.newRegisterError = action.payload
      })
  }
})

// exports

export default cdrSlice.reducer
