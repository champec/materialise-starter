import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export const fetchServicesFromSupabase = createAsyncThunk(
  'finder/fetchServicesFromSupabase',
  async (coords, thunkAPI) => {
    const { lat, lng } = coords
    console.log({ lat, lng, coords })
    console.log('Fetching services from Supabase')
    const { data, error } = await supabase.rpc('get_nearby_pharmacies_first', {
      lat: lat,
      lon: lng,
      radius: 2000
    })

    if (error) {
      console.log('Error fetching services from Supabase:', error)
      return thunkAPI.rejectWithValue(error)
    }

    console.log('Services fetched from Supabase:', data)
    return data
  }
)

export const fetchUserLocationFromBrowser = createAsyncThunk(
  'finder/fetchUserLocationFromBrowser',
  async (_, thunkAPI) => {
    return new Promise((resolve, reject) => {
      const locationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }

      const locationSuccess = pos => {
        const coords = pos.coords
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      }

      const locationErrors = err => {
        reject(err)
      }

      if (navigator.geolocation) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
          if (result.state === 'granted' || result.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(locationSuccess, locationErrors, locationOptions)
          }
        })
      } else {
        reject(new Error('Sorry, geolocation is not available!'))
      }
    })
  }
)

const finderSlice = createSlice({
  name: 'finder',
  initialState: {
    coords: { latitude: 0, longitude: 0 },
    stateLocation: null,
    browserLocation: null,
    locationSource: 'browser', // or 'state'
    places: [],
    viewport: { latitude: null, longitude: null, zoom: 14 },
    status: 'idle',
    error: null
  },
  reducers: {
    toggleLocationSource: state => {
      if (state.locationSource === 'browser') {
        state.locationSource = 'state'
        state.coords = state.stateLocation

        state.viewport = {
          ...state.viewport,
          latitude: state.stateLocation.latitude,
          longitude: state.stateLocation.longitude
        }
      } else {
        state.locationSource = 'browser'
        state.coords = state.browserLocation

        state.viewport = {
          ...state.viewport,
          latitude: state.browserLocation.latitude,
          longitude: state.browserLocation.longitude
        }
      }
    },
    setStateLocation: (state, action) => {
      state.stateLocation = action.payload
      if (state.locationSource === 'state') {
        state.coords = action.payload
      }
    },
    updateBrowserLocation: (state, action) => {
      state.browserLocation = action.payload
    },
    setViewport: (state, action) => {
      state.viewport = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchServicesFromSupabase.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchServicesFromSupabase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.places = action.payload
      })
      .addCase(fetchServicesFromSupabase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchUserLocationFromBrowser.fulfilled, (state, action) => {
        state.browserLocation = action.payload
        if (state.locationSource === 'browser') {
          state.coords = action.payload
        }
      })
  }
})

export const { toggleLocationSource, setStateLocation, updateBrowserLocation, setViewport } = finderSlice.actions

export default finderSlice.reducer
