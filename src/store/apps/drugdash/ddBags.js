// slices/bagSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Thunks for Bags
export const fetchBags = createAsyncThunk('bags/fetchBags', async (_, thunkAPI) => {
  const orgId = thunkAPI.getState().organisation.organisation.id
  const { data, error } = await supabase
    .from('dd_bags')
    .select('*, patient:dd_patients(*), medications:dd_bag_contents(*)')
    .eq('organisation', orgId)
  if (error) {
    console.log(error)
    throw error
  }
  return data
})

export const addBag = createAsyncThunk('bags/addBag', async (bag, thunkAPI) => {
  const orgId = thunkAPI.getState().organisation.organisation.id
  const selectedDrugs = thunkAPI.getState().ddDrugs.selectedDrugs
  const patinetId = thunkAPI.getState().ddPatients.selectedPatient.id
  bag.organisation = orgId
  bag.patient_id = patinetId
  const { data, error } = await supabase.from('dd_bags').insert(bag).select('id')
  if (error) throw error
  const bagId = data[0].id
  if (bagId) {
    const { data, error } = await supabase
      .from('dd_bag_contents')
      .insert(selectedDrugs.map(drug => ({ bag: bagId, drug: drug.id })))
  }
  return data[0]
})

// ... Similarly, you can create thunks for editBag, updateBag, etc.

const bagSlice = createSlice({
  name: 'ddBags',
  initialState: {
    bags: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: {
    [fetchBags.pending]: state => {
      state.status = 'loading'
    },
    [fetchBags.fulfilled]: (state, action) => {
      state.bags = action.payload
      state.status = 'succeeded'
    },
    [fetchBags.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    }
    // ...reducers for addBag, editBag, etc.
  }
})

export default bagSlice.reducer
