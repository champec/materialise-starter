// pharmacyShiftThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export const fetchPharmacyShifts = createAsyncThunk('pharmacyShifts/fetchShifts', async (_, { getState }) => {
  const { organisation } = getState().organisation // Assuming you have an auth slice
  const { data, error } = await supabase
    .from('locum_shifts')
    .select('*')
    .eq('pharmacy_id', organisation.id)
    .order('date', { ascending: true })

  console.log('fetch shifts', organisation, data)
  if (error) throw error
  return data
})

export const createShift = createAsyncThunk('pharmacyShifts/createShift', async (shiftData, { getState, dispatch }) => {
  const { organisation } = getState().organisation
  const { data, error } = await supabase
    .from('locum_shifts')
    .insert({ ...shiftData, pharmacy_id: organisation.id, created_by: organisation.id, status: 'VACANT' })
    .single()

  if (error) throw error
  dispatch(fetchPharmacyShifts())
  return null
})

export const updateShift = createAsyncThunk(
  'pharmacyShifts/updateShift',
  async ({ id, ...updateData }, { dispatch }) => {
    const { data, error } = await supabase.from('locum_shifts').update(updateData).eq('id', id).single()

    if (error) throw error
    dispatch(fetchPharmacyShifts())
    return null
  }
)
