// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Supabase Imports
import { supabaseOrg as supabase } from 'src/configs/supabase'

// ** Fetch Chats SUPABASE
export const fetchUserChats = createAsyncThunk('appChat/fetchUserChats', async (userId, thunkAPI) => {
  console.log('FETCHING CHATS')
  const loggedInOrgId = thunkAPI.getState().organisation.organisation.id
  console.log('LOGGED IN ORG ID', loggedInOrgId)
  try {
    // Step 1: Fetch chat IDs where loggedInOrgId is a participant
    const { data: chatIDs, error: chatIDError } = await supabase
      .from('chatParticipants')
      .select('chat_id')
      .eq('org_id', loggedInOrgId)

    if (chatIDError) {
      console.log('Error fetching chat IDs:', chatIDError)
      throw chatIDError
    }

    console.log('FETCHED CHAT IDS', chatIDs)

    const chatIDsArray = chatIDs.map(item => item.chat_id)

    // Step 2: Fetch full chat data using those IDs
    const { data: chats, error: chatError } = await supabase
      .from('chats')
      .select(
        `
  *,
  chatParticipants (
    *,
    profile:organisations (*)
  ),
  chatMessages (*).order(timestamp:desc).limit(1)
`
      )
      .in('id', chatIDsArray)
      .neq('chatParticipants.org_id', loggedInOrgId)

    if (chatError) {
      console.log('Error fetching chats:', chatError)
      throw chatError
    }
    console.log('FETCHED CHATS', chats)
    return chats
  } catch (error) {
    console.log('FETCH CHATS ERROR', error)
    // return rejectWithValue(error.message)
  }
})

export const fetchInitialMessages = createAsyncThunk('appChat/fetchInitialMessages', async chatId => {
  try {
    const { data: messages, error } = await supabase
      .from('chatMessages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: false })
      .limit(50) // Fetch last 50 messages

    if (error) {
      console.log('FETCH MESSAGES ERROR', error)
      throw error
    }

    return messages
  } catch (error) {
    console.log('FETCH MESSAGES ERROR', error)
    // Handle the error appropriately
  }
})

// ** Send Msg
export const sendMsg = createAsyncThunk('appChat/sendMsg', async (obj, thunkAPI) => {
  const senderId = thunkAPI.getState().user.user.id
  const orgId = thunkAPI.getState().organisation.organisation.id
  const { data, error } = await supabase
    .from('chatMessages')
    .insert([{ chat_id: obj.chat_id, message: obj.message, sender_id: senderId, organisation_id: orgId }])
    .select('*')
    .single()

  if (error) {
    console.log('SEND MSG ERROR', error)
    throw error
  }
  console.log('SEND MSG DATA', data)
  return data
})

export const appChatSlice = createSlice({
  name: 'appChat',
  initialState: {
    chats: null,
    selectedChat: null
  },
  reducers: {
    removeSelectedChat: state => {
      state.selectedChat = null
    },
    getUserChats: (state, action) => {
      state.chats = action.payload
    },
    updateSelectedChat: (state, action) => {
      state.selectedChat = action.payload
    },
    selectChat: (state, action) => {
      console.log('SELECTED CHAT ACTIVATED', action.payload)
      state.selectedChat = state.chats.find(chat => chat.id === action.payload)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserChats.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.chats = action.payload
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchInitialMessages.fulfilled, (state, action) => {
        if (state.selectedChat) {
          state.selectedChat.chatMessages = action.payload
        }
      })
  }
})

export const { removeSelectedChat, getUserChats, setUserProfile, updateSelectedChat, selectChat } = appChatSlice.actions

export default appChatSlice.reducer
