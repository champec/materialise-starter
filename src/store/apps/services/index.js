import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from 'src/configs/supabase'

export const fetchGPs = createAsyncThunk('services/fetchGPs', async (searchTerm, thunkAPI) => {
  const NHS_API_ENDPOINT = 'https://api.nhs.uk/service-search'
  const subscriptionKey = process.env.NEXT_PUBLIC_NHS_API_KEY // Replace with your subscription key

  const url = new URL(`${NHS_API_ENDPOINT}`)
  const params = {
    'api-version': '2',
    search: searchTerm
    // add other parameters as required
  }
  url.search = new URLSearchParams(params).toString()
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'subscription-key': subscriptionKey
        // add other headers as required
      }
    })

    if (response.ok) {
      const data = await response.json()
      // setResults(data.value) // Update according to actual response structure
      return data.value
    } else {
      throw new Error('Failed to fetch data: ' + response.statusText)
    }
  } catch (error) {
    console.error(error)
  }
})

export const fetchServiceTableInfo = createAsyncThunk(
  'services/fetchServiceTableInfo',
  async ({ consultation_id, table }, thunkAPI) => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('consultation_id', consultation_id)

      if (error) {
        console.error(error)
        throw new Error(error)
      }

      return data
    } catch (error) {
      console.error(error)
    }
  }
)

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    selectedService: null,
    gps: [],
    selectedGP: null,
    selectedServiceTableInfo: null
  },

  // create a thunk to search nhs gps

  reducers: {
    setSelectedService: (state, action) => {
      state.selectedService = action.payload
    }
  },
  extraReducers: {
    // Update when bags are fetched
    [fetchGPs.fulfilled]: (state, action) => {
      state.gps = action.payload.value
    },
    [fetchGPs.rejected]: (state, action) => {
      console.log('fetchGPs rejected', action)
    },
    [fetchGPs.pending]: (state, action) => {
      console.log('fetchGPs pending', action)
    },
    [fetchServiceTableInfo.fulfilled]: (state, action) => {
      state.selectedServiceTableInfo = action.payload
    },
    [fetchServiceTableInfo.rejected]: (state, action) => {
      console.log('fetchServiceTableInfo rejected', action)
    },
    [fetchServiceTableInfo.pending]: (state, action) => {
      console.log('fetchServiceTableInfo pending', action)
    }
  }
})

export const { setSelectedService } = servicesSlice.actions

export default servicesSlice.reducer
