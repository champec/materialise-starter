import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

export const login = createAsyncThunk('organisation/login', async (params, thunkAPI) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password
  })

  if (error) {
    console.log('organisaiton login RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }

  console.log('RTK user auth', data)

  // Fetch corresponding record from the public.users table
  const { data: authUser, error: userError } = await supabase
    .from('organisations')
    .select('*, pharmacies(*)')
    .eq('id', data.user.id)
    .single()

  if (userError) {
    console.log('user data fetch RTK', { userError })
    return thunkAPI.rejectWithValue(userError.message)
  }

  console.log('RTK user return', authUser)

  return authUser
})

export const logout = createAsyncThunk('organisation/logout', async (_, thunkAPI) => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log('organisation logout RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }
})

export const initializeSession = createAsyncThunk('organisation/initializeSession', async (_, thunkAPI) => {
  console.log('RUNNING INIT ORG')
  const { data, error } = await supabase.auth.getSession()

  console.log('RUNNING INIT ORG 1', data.session.user, error)

  const id = data.session.user.id

  if (id) {
    const { data: organisation, error: organisationError } = await supabase
      .from('organisations')
      .select('*, pharmacies(*)')
      .eq('id', id)

    if (organisationError) {
      console.log('user data fetch RTK', { organisationError })
      return thunkAPI.rejectWithValue(organisationError.message)
    }
    return { organisation: organisation[0], loading: false }
  }

  return { organisation: data, loading: false }
})

let initialState = {
  organisation: null,
  loading: true, // You might set this to true if you're going to immediately check for a session
  organisationError: null
}

const organisationSlice = createSlice({
  name: 'organisation',
  initialState,
  reducers: {
    logoutOrganisation: (state, action) => {
      const updatedSessions = state.activeSessions.filter(session => session.userId !== action.payload)
      state.activeSessions = updatedSessions

      if (action.payload === state.organisation.id) {
        state.organisation = updatedSessions.length > 0 ? updatedSessions[0].user : null
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setOrganisationError: (state, action) => {
      state.organisationError = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.organisation = action.payload.organisation
        state.loading = false
      })
      .addCase(login.pending, state => {
        state.loading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.organisation = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message
        state.loading = false
      })
      .addCase(logout.pending, state => {
        state.loading = true
      })
      .addCase(logout.fulfilled, state => {
        state.organisation = null
        state.loading = false
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.error.message
        state.loading = false
      })
  }
})

export const { logoutOrganisation, setLoading, setOrganisationError } = organisationSlice.actions

export default organisationSlice.reducer
