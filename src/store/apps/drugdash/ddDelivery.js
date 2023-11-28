// slices/jobSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Thunks for Jobs
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const { data, error } = await supabase.from('dd_jobs').select('*')
  if (error) throw error
  return data
})

export const addJob = createAsyncThunk('jobs/addJob', async job => {
  const { data, error } = await supabase.from('dd_jobs').insert([job])
  if (error) throw error
  return data[0]
})

// ... Similarly, you can create thunks for editJob, updateJob, etc.

const deliverySlice = createSlice({
  name: 'ddDeliveries',
  initialState: {
    jobs: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: {
    [fetchJobs.pending]: state => {
      state.status = 'loading'
    },
    [fetchJobs.fulfilled]: (state, action) => {
      state.jobs = action.payload
      state.status = 'succeeded'
    },
    [fetchJobs.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    }
    // ...reducers for addJob, editJob, etc.
  }
})

export default deliverySlice.reducer
