import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Fetch Bags
export const fetchBags = createAsyncThunk('drug_dash/fetchBags', async () => {
  const { data, error } = await supabase.from('dd_bags').select(`
      *,
      dd_jobs:job_id (*)
    `)
  if (error) throw error
  return data
})

// Fetch Jobs
export const fetchJobs = createAsyncThunk('drug_dash/fetchJobs', async () => {
  const { data, error } = await supabase.from('dd_jobs').select('*')
  if (error) throw error
  return data
})

const drugDashSlice = createSlice({
  name: 'drug_dash',
  initialState: {
    lanes: {
      bagLane: {
        id: 1,
        title: 'Bag Lane',
        data: Array.from({ length: 15 }, (_, index) => ({
          id: index + 1,
          title: `Card #${index + 1}`
        }))
      },
      jobLane: {
        id: 2,
        title: 'Job Lane',
        data: []
      },
      inTransit: {
        id: 3,
        title: 'In Transit',
        data: []
      },
      delivered: {
        id: 4,
        title: 'Delivered',
        data: []
      },
      failed: {
        id: 5,
        title: 'Failed',
        data: []
      }
    },
    status: 'idle',
    error: null
  },

  reducers: {},
  extraReducers: {
    // Fetch Bags
    [fetchBags.pending]: state => {
      state.status = 'loading'
    },
    [fetchBags.fulfilled]: (state, action) => {
      action.payload.forEach(bag => {
        if (bag.job_id && bag.job) {
          if (bag.job.location_status === 'inPharmacy') {
            if (bag.operational_status === 'failed') {
              state.lanes.failed.data.push(bag)
            } else if (bag.operational_status === 'delivered') {
              state.lanes.delivered.data.push(bag)
            }
          } else if (bag.job.location_status === 'inTransit') {
            return
          }
        } else {
          switch (bag.location_status) {
            case 'inPharmacy':
              if (['pending', 'ready'].includes(bag.operational_status)) {
                state.lanes.bagLane.data.push(bag)
              } else if (bag.operational_status === 'failed') {
                state.lanes.failed.data.push(bag)
              }
              break
            case 'inTransit':
              state.lanes.inTransit.data.push(bag)
              break
            case 'delivered':
              state.lanes.delivered.data.push(bag)
              break
            default:
              break
          }
        }
      })

      state.status = 'succeeded'
    },

    [fetchBags.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [fetchJobs.pending]: state => {
      state.status = 'loading'
    },
    [fetchJobs.fulfilled]: (state, action) => {
      action.payload.forEach(job => {
        if (job.location_status === 'inTransit') {
          state.lanes.inTransit.data.push(job)
        } else if (
          job.location_status === 'inPharmacy' &&
          !['completed', 'partiallyDelivered', 'failed'].includes(job.operational_status)
        ) {
          state.lanes.jobLane.data.push(job)
        }
      })
      state.status = 'succeeded'
    },

    [fetchJobs.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    }
  }
})

export default drugDashSlice.reducer
