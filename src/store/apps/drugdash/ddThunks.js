import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Fetch Patients
export const fetchPatients = createAsyncThunk('drugDash/fetchPatients', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_patients').select('*')
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Add Patient
export const addPatient = createAsyncThunk(
  'drugDash/addPatient',
  async (patientData, { rejectWithValue, getState }) => {
    try {
      const org_id = getState().organisation?.organisation?.id
      const user_id = getState().user?.user?.id
      const { data, error } = await supabase
        .from('dd_patients')
        .insert({ ...patientData, organisation_id: org_id, created_by: user_id })
        .select('*')
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Patient Medications
export const fetchPatientMedications = createAsyncThunk(
  'drugDash/fetchPatientMedications',
  async (patientId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('dd_patient_medications')
        .select('*, medication:dmd.ampp_ampptype(*)')
        .eq('patient_id', patientId)
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add Patient Medication
export const addPatientMedication = createAsyncThunk(
  'drugDash/addPatientMedication',
  async (medicationData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_patient_medications').insert(medicationData).single()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Bags
// Updated fetchBags thunk
export const fetchBags = createAsyncThunk(
  'drugDash/fetchBags',
  async ({ status, startDate, endDate }, { rejectWithValue }) => {
    try {
      let query = supabase.from('dd_bags').select('*')

      if (status) {
        query = query.eq('status', status)
      }

      if (startDate) {
        query = query.gte('due_date', startDate)
      }

      if (endDate) {
        query = query.lte('due_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Updated addBag thunk
export const addBag = createAsyncThunk('drugDash/addBag', async (bagData, { rejectWithValue }) => {
  try {
    const bagWithDueDate = {
      ...bagData,
      due_date: bagData.due_date || new Date().toISOString()
    }
    const { data, error } = await supabase.from('dd_bags').insert(bagWithDueDate).single()
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// New thunk to update bag due date
export const updateBagDueDate = createAsyncThunk(
  'drugDash/updateBagDueDate',
  async ({ bagId, newDueDate }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_bags').update({ due_date: newDueDate }).eq('id', bagId).single()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update Bag Status
export const updateBagStatus = createAsyncThunk(
  'drugDash/updateBagStatus',
  async ({ bagId, newStatus }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_bags').update({ status: newStatus }).eq('id', bagId).single()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Collections
export const fetchCollections = createAsyncThunk('drugDash/fetchCollections', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_collections').select('*')
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Create Collection
export const createCollection = createAsyncThunk(
  'drugDash/createCollection',
  async (collectionData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('dd_collections').insert(collectionData).single()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch Drivers
export const fetchDrivers = createAsyncThunk('drugDash/fetchDrivers', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_drivers').select('*')
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Add Driver
export const addDriver = createAsyncThunk('drugDash/addDriver', async (driverData, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase.from('dd_drivers').insert(driverData).single()
    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})
