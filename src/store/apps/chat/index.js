// ** Redux Imports
//create slice create a slice of the store and thunk let you return a funciton instead of an object action
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import { useUserAuth } from 'src/hooks/useAuth'
import { useOrgAuth } from 'src/hooks/useOrgAuth'
import { supabaseOrg, supabaseUser } from 'src/configs/supabase'
import { idID } from '@mui/material/locale'

// ** Fetch User Profile - legacy
// export const fetchUserProfile = createAsyncThunk('appChat/fetchUserProfile', async () => {
//   const user = useUserAuth()
//   console.log('fetch users')
//   return user
// })

// ** Fetch Chats & Contacts
const con = [
  {
    id: 1,
    fullName: 'Felecia Rower',
    role: 'Frontend Developer',
    about: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing',
    avatar: '/images/avatars/2.png',
    status: 'offline'
  }
]
export const fetchChatsContacts = createAsyncThunk('appChat/fetchChatsChats', async orgArray => {
  let contacts = []

  orgArray.map((organisation, i) => {
    supabaseOrg
      .from('contacts')
      .select('*')
      .eq('id', organisation)
      .single()
      .then(res => {
        contacts = [...contacts, res]
      })
  })

  return contacts
})

// fetch chats f2ce0d63-0c83-4231-b204-c87c491ccfdc - 39f581c8-5c55-445d-b4ca-94d41784b144 -- bfef0f4d-72a1-401e-ad27-bd1d2647de61

export const fetchChatsChats = createAsyncThunk('appChat/fetchChatsContacts', async id => {
  //chats in supabase only contain ID and created at - they can belong to many different pharmacies - also have a type property for future ref if want to creaet groups
  // query select all chats ids and bring back back all messages and participants that have the current users id

  const { data, error } = await supabaseOrg
    .from('chats')
    .select('id,  chatMessages(message, created_at), chatParticipants(*)')
    .contains('participants', '{f2ce0d63-0c83-4231-b204-c87c491ccfdc}')
    .filter('chatParticipants.user_id', 'neq', 'f2ce0d63-0c83-4231-b204-c87c491ccfdc')
    .order('created_at', { foreignTable: 'chatMessages', ascending: false })
    .limit(1, { foreignTable: 'chatMessages' })

  return data
})

// ** Select Chat
// export const selectChat = createAsyncThunk(
//   'appChat/selectChat',
//   (id, { dispatch }, value) /*async (id, { dispatch })*/ => {
//     // const response = await axios.get('/apps/chat/get-chat', {
//     //   params: {
//     //     id
//     //   }
//     // })
//     // await dispatch(fetchChatsContacts())
//     console.log(value)
//     dispatch(value)

//     return value
//   }
//)

// ** Send Msg
export const sendMsg = createAsyncThunk('appChat/sendMsg', async (obj, { dispatch }) => {
  console.log({ obj })
  const message = obj.message
  const user = obj.UserName
  const userID = obj.id
  const org = obj.orgName
  const orgID = obj.orgID
  const chatID = obj[0].id

  const { data, error } = await supabaseUser.from('chatMessages').insert({
    message: message,
    chat_id: chatID,
    sender_id: userID,
    isSent: true,
    sender_name: user,
    organisation_name: org,
    organisation_avatar: '',
    organisation_id: orgID
  })

  // const response = await axios.post('/apps/chat/send-msg', {
  //   data: {
  //     obj
  //   }
  // })
  // if (obj.contact) {
  //   await dispatch(selectChat(obj.contact.id))
  // }
  // await dispatch(fetchChatsContacts())

  return data
})

//in redux a slice is mini store - has its own function to update state and its own initial state
export const appChatSlice = createSlice({
  //slice has a name, initial state, reducers, extra reducers
  name: 'appChat',
  initialState: {
    chats: null,
    contacts: null,
    userProfile: null,
    selectedChat: null
  },
  reducers: {
    currentProfile: (state, action) => {
      state.userProfile = action.payload
    },
    removeSelectedChat: state => {
      state.selectedChat = null
    },
    selectChat: (state, action) => {
      state.selectedChat = action.payload
    }
  },
  //extra reducers are used to create reducers that update state based on external factors - buildMapper is recommended becuase of TS and becuase of other features compared to cases
  //syntax is extraReducer: () => {} - map type function - builder.addCase or builder.DefaultCase or builder.addMatcher.
  // Remember we do not need o name cases like you do with normal reducers and call them later, externals are called automatically when something happens i.e .fulfilled in thunk
  //already built into thunk, like fulfilled / loading and / error
  extraReducers: builder => {
    builder.addCase(fetchChatsChats.fulfilled, (state, action) => {
      state.chats = action.payload
    })
    builder.addCase(fetchChatsContacts.fulfilled, (state, action) => {
      state.contacts = action.payload
    })
    // builder.addCase(selectChat.fulfilled, (state, action) => {
    //   state.selectedChat = action.payload
    // })
  }
})

// Remember normal reducers are called so you export, extraReducer will not be called do not need export - can be though of as listerners
export const { removeSelectedChat, currentProfile, selectChat } = appChatSlice.actions

export default appChatSlice.reducer
