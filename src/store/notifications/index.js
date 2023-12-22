import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (_, { getState }) => {
  const orgId = getState().organisation.organisation?.id
  const userId = getState().user.user?.id
  console.log('FETCH NOTIFICATIONS', orgId)
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('organisation_id', orgId)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('read', false)

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
      state.notifications.unshift(action.payload)
    },
    updateNotification(state, action) {
      const index = state.notifications.findIndex(notification => notification.id === action.payload.id)

      if (index !== -1) {
        state.notifications[index] = action.payload
      } else {
        state.notifications.unshift(action.payload)
      }
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

export const { addNotification, updateNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
