import { createSlice } from '@reduxjs/toolkit'
import { fetchBags } from './ddBags'
import { fetchJobs } from './ddDelivery'

const drugDashSlice = createSlice({
  name: 'drug_dash',
  initialState: {
    lanes: {
      bagLane: {
        id: 1,
        title: 'Bag Lane',
        data: []
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
    // Update when bags are fetched
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
    },

    // Update when jobs are fetched
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
    }
  }
})

export default drugDashSlice.reducer
