import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseUser as supabase } from 'src/configs/supabase'

export const login = createAsyncThunk('user/login', async (params, thunkAPI) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password
  })

  if (error) {
    console.log('user login RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }

  console.log('RTK user auth', data)
  // Fetch corresponding record from the public.users table
  const { data: authUser, error: userError } = await supabase.from('users').select('*').eq('id', data.user.id).single()

  if (userError) {
    console.log('user data fetch RTK', { userError })
    return thunkAPI.rejectWithValue(userError.message)
  }

  return authUser
})

export const logout = createAsyncThunk('user/logout', async (_, thunkAPI) => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log('user logout RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }
})

export const initializeSession = createAsyncThunk('user/initializeSession', async (_, thunkAPI) => {
  const { data, error } = await supabase.auth.getSession()

  const id = data.session.user.id

  if (id) {
    const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', id).single()

    if (userError) {
      console.log('user data fetch RTK', { userError })
      return thunkAPI.rejectWithValue(userError.message)
    }
    return { user: user, loading: false }
  }
  return { user: null, loading: false }
})

export const editUserData = createAsyncThunk('user/editData', async (updatedData, thunkAPI) => {
  // Assume there's an API endpoint for updating user data
  const { data, error } = await supabase.from('users').update(updatedData).eq('id', updatedData.id)

  if (error) {
    console.log('user data update RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }

  return data[0]
})

let initialState = {
  user: null,
  loading: true,
  userError: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    switchUser: (state, action) => {
      const sessionToSwitch = state.activeSessions.find(session => session.userId === action.payload)

      if (sessionToSwitch) {
        supabase.auth.setSession({
          access_token: sessionToSwitch.access_token,
          refresh_token: sessionToSwitch.refresh_token
        })
        state.user = sessionToSwitch.user
      } else {
        console.error('Session not found for the selected user.')
      }
    },
    logoutUser: (state, action) => {
      const updatedSessions = state.activeSessions.filter(session => session.userId !== action.payload)
      state.activeSessions = updatedSessions

      if (action.payload === state.user.id) {
        state.user = updatedSessions.length > 0 ? updatedSessions[0].user : null
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setActiveSessions: (state, action) => {
      state.activeSessions = action.payload
    },
    setUserError: (state, action) => {
      state.userError = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.loading = false
      })
      .addCase(login.pending, state => {
        state.loading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
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
        state.user = null
        state.loading = false
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.error.message
        state.loading = false
      })
      .addCase(editUserData.fulfilled, (state, action) => {
        state.user = action.payload
      })
  }
})

export const { switchUser, logoutUser, setLoading, setActiveSessions, setUserError } = userSlice.actions

export default userSlice.reducer
