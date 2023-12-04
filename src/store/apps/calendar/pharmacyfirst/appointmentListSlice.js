import { supabaseOrg } from 'src/configs/supabase'
// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
const supabase = supabaseOrg

export const fetchAppointments = createAsyncThunk(
  'appointmnetList/fetchAppointments',
  async (dateRange, { getState }) => {
    const orgId = getState().organisation.organisation.id

    // Set default start and end dates to 2 weeks before and after today
    const defaultStartDate = dayjs().subtract(2, 'week').startOf('day').toISOString()
    const defaultEndDate = dayjs().add(2, 'week').endOf('day').toISOString()

    // Extract startDate and endDate from dateRange if provided, else use defaults
    const { startDate = defaultStartDate, endDate = defaultEndDate } = dateRange || {}

    const { data, error } = await supabase
      .from('pp_bookings')
      .select('*, pp_booking_status(status)')
      .eq('pharmacy_id', orgId)
      .gte('start_date', startDate || defaultStartDate)
      .lte('start_date', endDate || defaultEndDate)

    if (error) {
      console.error(error)
      throw error // Consider throwing the error to be handled by Redux Toolkit
    }

    console.log(data, 'fetchAppointments')
    return data || []
  }
)

const initialState = {
  appointments: [],
  loading: false
}

export const appointmnetListSlice = createSlice({
  name: 'appointmnetList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [fetchAppointments.fulfilled]: (state, action) => {
      state.appointments = action.payload
    },
    [fetchAppointments.pending]: (state, action) => {
      state.loading = true
    },
    [fetchAppointments.rejected]: (state, action) => {
      state.loading = false
    }
  }
})

export default appointmnetListSlice.reducer
