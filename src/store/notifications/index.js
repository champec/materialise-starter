import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async () => {
  const { data, error } = await supabase.from('notifications').select('*')

  if (error) {
    throw error
  }

  return data
})

const initialState = {
  notifications: [],
  status: 'idle',
  error: null
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      state.notifications.push(action.payload)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export const { addNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
