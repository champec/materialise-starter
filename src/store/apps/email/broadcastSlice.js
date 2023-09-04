import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

// Initial state for the broadcasts slice
const initialState = {
  broadcasts: [],
  status: 'idle', // can be 'idle', 'loading', 'succeeded', 'failed'
  broadcastItems: [], // store broadcast items
  error: null
}

// Thunks for CRUD operations on broadcasts

export const fetchBroadcasts = createAsyncThunk('broadcasts/fetchBroadcasts', async () => {
  const { data, error } = await supabase.from('broadcasts').select('*')
  if (error) throw error
  return data
})

export const createBroadcast = createAsyncThunk(
  'broadcasts/createBroadcast',
  async ({ recipients, subject, content, type, broadcastItem }, { getState }) => {
    const orgId = getState().organisation.organisation.id
    const userId = getState().user.user.id

    // Assuming you'll replace this with the actual label ID for broadcasts later.
    const BROADCAST_LABEL_ID = 1

    // Step 1: Create the Broadcast
    const { data: broadcastData, error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        organisation_id: orgId,
        sender_id: userId,
        subject,
        content
      })
      .select('id')
      .single()

    if (broadcastError) {
      console.log(broadcastError)
      throw broadcastError
    }

    const broadcastId = broadcastData.id

    console.log('broadcastId', broadcastId)

    // Step 2: If broadcast type is productRequest, create an item in the broadcast_items table
    if (type === 'item' && broadcastItem) {
      const { error: itemError } = await supabase.from('broadcast_items').insert({
        ...broadcastItem,
        broadcast_id: broadcastId
      })

      if (itemError) throw itemError
    }

    // Step 3: Create Conversations for each recipient
    const conversations = recipients.map(recipient => ({
      sender_organisation_id: orgId,
      sender_user_id: userId,
      recipient_id: recipient,
      broadcast_id: broadcastId
    }))

    const { data: conversationData, error: conversationsError } = await supabase
      .from('email_conversations')
      .insert(conversations)
      .select('*')

    if (conversationsError) {
      console.log(conversationsError)
      throw conversationsError
    }

    // Step 4: Add recipients to email_recipients table
    const emailRecipients = conversationData.map(conv => ({
      conversation_id: conv.id,
      recipient_id: orgId,
      broadcast_id: broadcastId
    }))

    const { error: recipientsError } = await supabase.from('email_recipients').insert(emailRecipients)

    if (recipientsError) throw recipientsError

    // Step 5: Add initial message to each conversation in email_messages
    const initialMessages = conversationData.map(conv => ({
      conversation_id: conv.id,
      broadcast_id: broadcastId,
      content // or the initial content you want
    }))

    const { error: messagesError } = await supabase.from('email_messages').insert(initialMessages)

    if (messagesError) throw messagesError

    // Step 6: Add a label to each conversation
    const conversationLabels = conversationData.map(conv => ({
      conversation_id: conv.id,
      label_id: 1
    }))

    const { error: labelsError } = await supabase.from('email_conversation_labels').insert(conversationLabels)

    if (labelsError) {
      console.log(labelsError)
      throw labelsError
    }

    console.log('Great Success', broadcastData)
    return broadcastData
  }
)

export const updateBroadcast = createAsyncThunk('broadcasts/updateBroadcast', async updatedBroadcast => {
  const { data, error } = await supabase.from('broadcasts').update(updatedBroadcast).eq('id', updatedBroadcast.id)
  if (error) throw error
  return data
})

export const deleteBroadcast = createAsyncThunk('broadcasts/deleteBroadcast', async broadcastId => {
  const { data, error } = await supabase.from('broadcasts').delete().eq('id', broadcastId)
  if (error) throw error
  return data
})

export const createBroadcastItem = createAsyncThunk(
  'broadcasts/createBroadcastItem',
  async ({ broadcastId, itemData, conversationId }) => {
    const newData = {
      ...itemData,
      broadcast_id: broadcastId,
      counter: true,
      conversation_id: conversationId // if there's a direct association between broadcast_item and a conversation
    }

    const { data, error } = await supabase.from('broadcast_items').insert(newData).select('*') // specify the columns you want to return
    if (error) throw error

    return data
  }
)

export const updateBroadcastItem = createAsyncThunk('broadcasts/updateBroadcastItem', async updatedItem => {
  const { data, error } = await supabase
    .from('broadcast_items')
    .update(updatedItem)
    .eq('id', updatedItem.id)
    .select('*')
  if (error) throw error

  return data
})

export const deleteBroadcastItem = createAsyncThunk('broadcasts/deleteBroadcastItem', async itemId => {
  const { data, error } = await supabase.from('broadcast_items').delete().eq('id', itemId)
  if (error) throw error

  return data
})

// The broadcasts slice

const broadcastsSlice = createSlice({
  name: 'broadcasts',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchBroadcasts.pending]: state => {
      state.status = 'loading'
    },
    [fetchBroadcasts.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.broadcasts = action.payload
    },
    [fetchBroadcasts.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [createBroadcast.fulfilled]: (state, action) => {
      state.broadcasts.push(action.payload)
    },
    [updateBroadcast.fulfilled]: (state, action) => {
      const index = state.broadcasts.findIndex(broadcast => broadcast.id === action.payload.id)
      if (index !== -1) {
        state.broadcasts[index] = action.payload
      }
    },
    [deleteBroadcast.fulfilled]: (state, action) => {
      const index = state.broadcasts.findIndex(broadcast => broadcast.id === action.payload.id)
      if (index !== -1) {
        state.broadcasts.splice(index, 1)
      }
    },
    [createBroadcast.fulfilled]: (state, action) => {
      state.broadcasts.push(action.payload)
    },
    [updateBroadcast.fulfilled]: (state, action) => {
      const index = state.broadcasts.findIndex(broadcast => broadcast.id === action.payload.id)
      if (index !== -1) {
        state.broadcasts[index] = action.payload
      }
    },
    [deleteBroadcast.fulfilled]: (state, action) => {
      const index = state.broadcasts.findIndex(broadcast => broadcast.id === action.payload.id)
      if (index !== -1) {
        state.broadcasts.splice(index, 1)
      }
    },
    [createBroadcastItem.fulfilled]: (state, action) => {
      state.broadcastItems.push(action.payload[0]) // assuming supabase returns an array with the created item
    },
    [updateBroadcastItem.fulfilled]: (state, action) => {
      const index = state.broadcastItems.findIndex(item => item.id === action.payload[0].id)
      if (index !== -1) {
        state.broadcastItems[index] = action.payload[0] // assuming supabase returns an array with the updated item
      }
    },
    [deleteBroadcastItem.fulfilled]: (state, action) => {
      const index = state.broadcastItems.findIndex(item => item.id === action.payload[0].id)
      if (index !== -1) {
        state.broadcastItems.splice(index, 1)
      }
    }
  }
})

// Selectors

export const selectAllBroadcasts = state => state.broadcasts.broadcasts
export const selectBroadcastById = (state, broadcastId) =>
  state.broadcasts.broadcasts.find(broadcast => broadcast.id === broadcastId)

export default broadcastsSlice.reducer
