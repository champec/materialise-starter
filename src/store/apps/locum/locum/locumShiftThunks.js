// locumShiftThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from 'src/configs/supabase'

export const fetchAvailableShifts = createAsyncThunk(
  'locumShifts/fetchAvailable',
  async ({ startDate, endDate, location }) => {
    // In a real app, you'd implement location-based filtering
    const { data, error } = await supabase
      .from('locum_shifts')
      .select('*')
      .eq('status', 'VACANT')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) throw error
    return data
  }
)

export const fetchLocumBookedShifts = createAsyncThunk('locumShifts/fetchBooked', async (_, { getState }) => {
  const { user } = getState().auth // Assuming you have an auth slice
  const { data, error } = await supabase
    .from('locum_shifts')
    .select('*')
    .eq('pharmacist_id', user.id)
    .order('date', { ascending: true })

  if (error) throw error
  return data
})

export const bookShift = createAsyncThunk('locumShifts/bookShift', async (shiftId, { getState }) => {
  const { user } = getState().auth
  const { data, error } = await supabase
    .from('locum_shifts')
    .update({ pharmacist_id: user.id, status: 'BOOKED' })
    .eq('id', shiftId)
    .single()

  if (error) throw error
  return data
})
