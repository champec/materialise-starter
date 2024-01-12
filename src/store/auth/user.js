import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseUser as supabase } from 'src/configs/supabase'

export const login = createAsyncThunk('user/login', async (params, thunkAPI) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password
  })

  if (error) {
    console.log('user login RTK', { error })
    throw new Error(error.message)
  }

  console.log('RTK user auth', data)
  // Fetch corresponding record from the public.users table
  const { data: authUser, error: userError } = await supabase
    .from('profiles')
    .select('*, users(*)')
    .eq('id', data.user.id)
    .single()

  if (userError) {
    console.log('user data fetch RTK', { userError })
    throw new Error(userError.message)
  }

  const access_token = data.session.access_token
  const refresh_token = data.session.refresh_token

  const enrichedUser = {
    ...authUser,
    access_token,
    refresh_token
  }
  return enrichedUser
})

export const logout = createAsyncThunk('user/logout', async (_, thunkAPI) => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log('user logout RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }
})

export const initializeSession = createAsyncThunk('user/initializeSession', async (_, thunkAPI) => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    const user = data?.session?.user

    if (user && user.id) {
      const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (userError) throw userError

      return { user: userData, loading: false }
    } else {
      return { user: null, loading: false }
    }
  } catch (error) {
    console.error('initializeSession error:', error)
    // Optionally, handle the error or log it
    return thunkAPI.rejectWithValue({ user: null, loading: false })
  }
})

export const editUserData = createAsyncThunk('user/editData', async (updatedData, thunkAPI) => {
  // Assume there's an API endpoint for updating user data
  const id = thunkAPI.getState().user.user.id
  const { data, error } = await supabase.from('users').update(updatedData).eq('id', id).select('*')

  if (error) {
    console.log('user data update RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }

  console.log('redux edit', data)

  return data[0]
})

export const editPassword = createAsyncThunk('user/editPassword', async (new_password, thunkAPI) => {
  // Assume there's an API endpoint for updating user data
  const id = thunkAPI.getState().user.user.id
  console.log('RUNNING PASSWORD RESET')
  const { data, error } = await supabase.auth
    .updateUser({
      password: new_password
    })
    .eq('id', id)

  if (error) {
    console.log('user data update RTK', { error })
    return thunkAPI.rejectWithValue(error.message)
  }

  console.log('password edit', data)

  return data[0]
})

let initialState = {
  user: null,
  loading: true,
  userError: null,
  loggedInUsers: []
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
    },
    setUser(state, action) {
      state.user = action.payload
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

export const { switchUser, setUser, logoutUser, setLoading, setActiveSessions, setUserError } = userSlice.actions

export default userSlice.reducer
