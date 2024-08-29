// locumShiftSlice.js
import { createSlice } from '@reduxjs/toolkit'
import * as thunks from './locumShiftThunks'

const locumShiftSlice = createSlice({
  name: 'locumShifts',
  initialState: {
    availableShifts: [],
    bookedShifts: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(thunks.fetchAvailableShifts.pending, state => {
        state.status = 'loading'
      })
      .addCase(thunks.fetchAvailableShifts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.availableShifts = action.payload
      })
      .addCase(thunks.fetchAvailableShifts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(thunks.fetchLocumBookedShifts.fulfilled, (state, action) => {
        state.bookedShifts = action.payload
      })
      .addCase(thunks.bookShift.fulfilled, (state, action) => {
        state.availableShifts = state.availableShifts.filter(shift => shift.id !== action.payload.id)
        state.bookedShifts.push(action.payload)
      })
  }
})

export default locumShiftSlice.reducer
