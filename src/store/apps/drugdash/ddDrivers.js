import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const ddDriversSlice = createSlice({
  name: 'ddDrivers',
  initialState: {
    drivers: [],
    status: 'idle',
    error: null,
    searchedDrivers: []
  },
  reducers: {},
  extraReducers: {
    // Fill with extraReducers when you have async actions related to drivers
  }
})

export default ddDriversSlice.reducer
