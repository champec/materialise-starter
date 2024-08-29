// pharmacyShiftSlice.js
import { createSlice } from '@reduxjs/toolkit'
import * as thunks from './pharmacyShiftThunks'

const pharmacyShiftSlice = createSlice({
  name: 'pharmacyShifts',
  initialState: {
    shifts: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(thunks.fetchPharmacyShifts.pending, state => {
        state.status = 'loading'
      })
      .addCase(thunks.fetchPharmacyShifts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.shifts = action.payload
      })
      .addCase(thunks.fetchPharmacyShifts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(thunks.createShift.fulfilled, (state, action) => {
        // state.shifts.push(action.payload)
        state.status = 'succeeded'
      })
      .addCase(thunks.updateShift.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // const index = state.shifts.findIndex(shift => shift.id === action.payload.id)
        // if (index !== -1) {
        //   state.shifts[index] = action.payload
        // }
      })
  }
})

export default pharmacyShiftSlice.reducer
