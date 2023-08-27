import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from 'src/configs/supabase'

const initialState = {
  messages: [],
  status: 'idle',
  error: null
}

// Thunks for CRUD operations on messages

export const fetchMessagesByConversation = createAsyncThunk(
  'messages/fetchMessagesByConversation',
  async conversationId => {
    const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId)
    if (error) throw error
    return data
  }
)

export const appendMessage = createAsyncThunk(
  'messages/appendMessage',
  async ({ conversationId, content }, thunkAPI) => {
    const orgId = thunkAPI.getState().organisation.organisation.id
    const userId = thunkAPI.getState().user.user.id

    const { data, error } = await supabase
      .from('email_messages')
      .insert({
        conversation_id: conversationId,
        sender_organisation_id: orgId,
        sender_user_id: userId,
        is_draft: false,
        is_read: false,
        content
      })
      .select('*')
    if (error) throw error
    return data[0]
  }
)

// The messages slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchMessagesByConversation.pending]: state => {
      state.status = 'loading'
    },
    [fetchMessagesByConversation.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      // Store the messages associated with a conversation.
      state.messages = action.payload
    },
    [fetchMessagesByConversation.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [appendMessage.fulfilled]: (state, action) => {
      state.messages.push(action.payload)
    }
  }
})

export default messagesSlice.reducer
