// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Supabase Imports
import { supabaseOrg } from 'src/configs/supabase'

// ** Fetch User Profile
export const fetchUserProfile = createAsyncThunk('appChat/fetchUserProfile', async () => {
  const response = await axios.get('/apps/chat/users/profile-user')

  return response.data
})

// ** Fetch Chats & Contacts
export const fetchChatsContacts = createAsyncThunk('appChat/fetchChatsContacts', async () => {
  const response = await axios.get('/apps/chat/chats-and-contacts')

  return response.data
})

// ** Fetch Chats SUPABASE
export const fetchUserChats = createAsyncThunk('appChat/fetchUserChats', async (userId, { rejectWithValue }) => {
  try {
    const { data: userChats, error } = await supabaseOrg
      .from('chatParticipants')
      .select('chat_id')
      .eq('user_id', userId)

    if (error) throw error

    const chatIds = userChats.map(chat => chat.chat_id)

    const { data: chats, error: chatsError } = await supabaseOrg
      .from('chats')
      .select(
        `
            *,
            chatParticipants:chatParticipants (
              user_id,
              profile:user_id (*)
            ),
            chatMessages:chatMessages (*)
          `
      )
      .in('id', chatIds)

    if (chatsError) throw chatsError

    const sortedChats = chats.sort((a, b) => {
      const aTimestamp = new Date(a.chatMessages.slice(-1)[0]?.timestamp || 0)
      const bTimestamp = new Date(b.chatMessages.slice(-1)[0]?.timestamp || 0)
      return bTimestamp - aTimestamp
    })

    return sortedChats
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// ** Select Chat
export const selectChat = createAsyncThunk('appChat/selectChat', async chat => {
  // const response = await axios.get('/apps/chat/get-chat', {
  //   params: {
  //     id
  //   }
  // })
  // await dispatch(fetchChatsContacts())

  return chat
})

// ** Send Msg
export const sendMsg = createAsyncThunk('appChat/sendMsg', async (obj, { dispatch }) => {
  const response = await axios.post('/apps/chat/send-msg', {
    data: {
      obj
    }
  })
  if (obj.contact) {
    await dispatch(selectChat(obj.contact.id))
  }
  await dispatch(fetchChatsContacts())

  return response.data
})

export const appChatSlice = createSlice({
  name: 'appChat',
  initialState: {
    chats: null,
    contacts: null,
    userProfile: null,
    selectedChat: null
  },
  reducers: {
    removeSelectedChat: state => {
      state.selectedChat = null
    },
    getUserChats: (state, action) => {
      state.chats = action.payload
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload
    },
    updateSelectedChat: (state, action) => {
      state.selectedChat = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.userProfile = action.payload
    })
    builder.addCase(fetchChatsContacts.fulfilled, (state, action) => {
      state.contacts = action.payload.contacts
      state.chats = action.payload.chatsContacts
    })
    builder
      .addCase(selectChat.fulfilled, (state, action) => {
        state.selectedChat = action.payload
      })
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
  }
})

export const { removeSelectedChat, getUserChats, setUserProfile, updateSelectedChat } = appChatSlice.actions

export default appChatSlice.reducer
