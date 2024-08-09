import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'
import { prepareClaimData } from '../pharmacy-services/utils/mysPrep'

export const fetchClaims = createAsyncThunk('claims/fetchClaims', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase
      .from('ps_service_delivery')
      .select('*, ps_appointments(*)')
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const sendClaim = createAsyncThunk('claims/sendClaim', async (claimData, { rejectWithValue }) => {
  try {
    // Fetch appointment and service delivery data
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('ps_appointments')
      .select('*')
      .eq('id', claimData.appointment_id)
      .single()

    if (appointmentError) throw appointmentError

    const { data: serviceDeliveryData, error: serviceDeliveryError } = await supabase
      .from('ps_service_delivery')
      .select('*')
      .eq('id', claimData.id)
      .single()

    if (serviceDeliveryError) throw serviceDeliveryError

    const formattedClaimData = prepareClaimData(claimData, appointmentData, serviceDeliveryData)

    // Send claim to MYS API
    const response = await fetch('https://stg.api.{service}.pharmacy.mys.nhsbsa.nhs.uk/v1/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add any required authentication headers
      },
      body: JSON.stringify(formattedClaimData)
    })

    if (!response.ok) {
      throw new Error('Failed to submit claim')
    }

    const result = await response.json()

    // Update the claim status in Supabase
    await supabase
      .from('ps_service_delivery')
      .update({ status: 'submitted', remote_details: result })
      .eq('id', claimData.id)

    return result
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const amendClaim = createAsyncThunk(
  'claims/amendClaim',
  async ({ claimId, amendedData }, { rejectWithValue }) => {
    try {
      // Fetch the existing claim data
      const { data: existingClaim, error: fetchError } = await supabase
        .from('ps_service_delivery')
        .select('*, ps_appointments(*)')
        .eq('id', claimId)
        .single()

      if (fetchError) throw fetchError

      const formattedAmendedData = prepareClaimData(
        { ...existingClaim, ...amendedData },
        existingClaim.ps_appointments,
        existingClaim
      )

      // Send amended claim to MYS API
      const response = await fetch(
        `https://stg.api.{service}.pharmacy.mys.nhsbsa.nhs.uk/v1/claim/${existingClaim.remote_details.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
            // Add any required authentication headers
          },
          body: JSON.stringify(formattedAmendedData)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to amend claim')
      }

      const result = await response.json()

      // Update the claim in Supabase
      await supabase
        .from('ps_service_delivery')
        .update({ details: { ...existingClaim.details, ...amendedData }, remote_details: result })
        .eq('id', claimId)

      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const claimsSlice = createSlice({
  name: 'claims',
  initialState: {
    claims: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchClaims.pending, state => {
        state.loading = true
      })
      .addCase(fetchClaims.fulfilled, (state, action) => {
        state.loading = false
        state.claims = action.payload
      })
      .addCase(fetchClaims.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(sendClaim.pending, state => {
        state.loading = true
      })
      .addCase(sendClaim.fulfilled, (state, action) => {
        state.loading = false
        state.claims = state.claims.map(claim =>
          claim.id === action.payload.id ? { ...claim, ...action.payload } : claim
        )
      })
      .addCase(sendClaim.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(amendClaim.pending, state => {
        state.loading = true
      })
      .addCase(amendClaim.fulfilled, (state, action) => {
        state.loading = false
        state.claims = state.claims.map(claim =>
          claim.id === action.payload.id ? { ...claim, ...action.payload } : claim
        )
      })
      .addCase(amendClaim.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export default claimsSlice.reducer
