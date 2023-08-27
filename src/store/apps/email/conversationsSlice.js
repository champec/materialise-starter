import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabaseOrg as supabase } from 'src/configs/supabase'

const initialConversationsState = {
  inbox: [],
  sent: [],
  starred: [],
  spam: [],
  deleted: [],
  status: 'idle',
  error: null,
  selectedRecipients: [], // Added this line
  selectedConversation: null // Added this line
}

// Thunks for CRUD operations on conversations
export const fetchConversations = createAsyncThunk('conversations/fetchConversations', async (_, thunkAPI) => {
  console.log('FETCHING CONVERSATIONS')
  // Fetch conversations for logged in organization

  const loggedInOrgId = thunkAPI.getState().organisation.organisation.id

  const { data, error } = await supabase
    .from('email_conversations')
    .select(
      `*,
      email_recipients(id, organisations(organisation_name, avatar_url)),
      email_messages(*).order(created_at:desc).limit(1)
      `
    )
    .eq('sender_organisation_id', loggedInOrgId)

  if (error) {
    console.log(error)
    throw error
  }
  console.log('CONVERSAITON JOINS', data)

  return { allConversations: data, loggedInOrgId }
})

export const createConversation = createAsyncThunk(
  'conversations/createConversation',
  async ({ subject, recipients, groupChat }, thunkAPI) => {
    const orgID = thunkAPI.getState().organisation.organisation.id
    const userID = thunkAPI.getState().user.user.id

    const initialConversationData = {
      sender_organisation_id: orgID,
      sender_user_id: userID,
      subject
    }

    let conversations = [] // Define an array to hold the conversations

    if (groupChat) {
      const { data: conversationData, error: conversationError } = await supabase
        .from('email_conversations')
        .insert(initialConversationData)
        .select('*')
        .single()
      if (conversationError) {
        console.log(conversationError)
        throw conversationError
      }

      for (const recipient of recipients) {
        const { error: recipientError } = await supabase
          .from('email_recipients')
          .insert({ conversation_id: conversationData.id, recipient_id: recipient })
        if (recipientError) {
          console.log(recipientError)
          throw recipientError
        }
      }
      conversations.push(conversationData)
    } else {
      for (const recipient of recipients) {
        const { data: conversationData, error: conversationError } = await supabase
          .from('email_conversations')
          .insert(initialConversationData)
          .select('*')
          .single()
        if (conversationError) {
          console.log(conversationError)
          throw conversationError
        }

        const { error: recipientError } = await supabase
          .from('email_recipients')
          .insert({ conversation_id: conversationData.id, recipient_id: recipient })
        if (recipientError) {
          console.log(recipientError)
          throw recipientError
        }
        conversations.push(conversationData)
      }
    }

    console.log(conversations)
    return {
      conversations,
      loggedInOrgId: orgID
    }
  }
)

export const updateConversation = createAsyncThunk('conversations/updateConversation', async updatedConversation => {
  const { data, error } = await supabase
    .from('email_conversations')
    .update(updatedConversation)
    .eq('id', updatedConversation.id)
    .select('*')
  if (error) throw error
  return data[0]
})

export const deleteConversation = createAsyncThunk('conversations/deleteConversation', async conversationId => {
  const { data, error } = await supabase.from('email_conversations').delete().eq('id', conversationId)
  if (error) throw error
  return data[0]
})

// The conversations slice
const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: initialConversationsState,
  reducers: {
    setSelectedRecipients: (state, action) => {
      // Reducer to set the selected recipients
      state.selectedRecipients = action.payload
    },
    clearSelectedRecipients: state => {
      // Reducer to clear the selected recipients
      state.selectedRecipients = []
    },
    setSelectedConversation: (state, action) => {
      // Reducer to set the selected conversation
      state.selectedConversation = action.payload
    },
    clearSelectedConversation: state => {
      // Reducer to clear the selected conversation
      state.selectedConversation = null
    }
  },
  extraReducers: {
    [fetchConversations.pending]: state => {
      state.status = 'loading'
    },
    [fetchConversations.fulfilled]: (state, action) => {
      const loggedInOrgId = action.payload.loggedInOrgId
      const conversations = action.payload.allConversations

      state.status = 'succeeded'
      const assignConvoToCategory = convo => {
        // Always add to the inbox unless it's Trash or Spam
        if (!convo.is_trash && !convo.is_spam) {
          if (
            convo.sender_organisation_id !== loggedInOrgId ||
            convo.recentMessage?.sender_organisation_id !== loggedInOrgId
          ) {
            // Add to the inbox if you are the recipient or if the most recent message is not from you
            state.inbox.push(convo)
          }
        }

        // Add to other categories based on other flags
        if (convo.is_starred) state.starred.push(convo)
        if (convo.is_spam) state.spam.push(convo)
        if (convo.is_trash) state.deleted.push(convo)

        // Add to the 'Sent' folder only if the organization is the sender
        if (convo.sender_organisation_id === loggedInOrgId) {
          state.sent.push(convo)
        }
      }

      console.log('CONVERSATION THUNK RETURN', action.payload.allConversations)

      action.payload.allConversations.forEach(assignConvoToCategory)
    },
    [fetchConversations.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [createConversation.fulfilled]: (state, action) => {
      const newConvos = action.payload.conversations
      const loggedInOrgId = action.payload.loggedInOrgId

      for (const newConvo of newConvos) {
        if (newConvo.is_starred) state.starred.push(newConvo)
        else if (newConvo.is_spam) state.spam.push(newConvo)
        else if (newConvo.is_trash) state.deleted.push(newConvo)
        else if (newConvo.sender_organisation_id === loggedInOrgId) state.sent.push(newConvo)
        else state.inbox.push(newConvo)
      }
    },

    [updateConversation.fulfilled]: (state, action) => {
      const updatedConvo = action.payload
      const loggedInOrgId = thunkAPI.getState().organisation.organisation.id

      // Remove from old category and add to new category based on updated attributes.
      const categories = ['inbox', 'sent', 'starred', 'spam', 'deleted']
      categories.forEach(category => {
        const index = state[category].findIndex(convo => convo.id === updatedConvo.id)
        if (index !== -1) state[category].splice(index, 1)
      })

      if (updatedConvo.is_starred) state.starred.push(updatedConvo)
      if (updatedConvo.is_spam) state.spam.push(updatedConvo)
      if (updatedConvo.is_trash) state.deleted.push(updatedConvo)
      if (updatedConvo.sender_organisation_id === loggedInOrgId) state.sent.push(updatedConvo)
      else state.inbox.push(updatedConvo)
    },
    [deleteConversation.fulfilled]: (state, action) => {
      const categories = ['inbox', 'sent', 'starred', 'spam', 'deleted']
      categories.forEach(category => {
        const index = state[category].findIndex(convo => convo.id === action.payload.id)
        if (index !== -1) state[category].splice(index, 1)
      })
    }
  }
})

export const selectAllConversations = state => {
  console.log(state.conversations)
  return {
    inbox: state.conversations.inbox,
    sent: state.conversations.sent,
    starred: state.conversations.starred,
    spam: state.conversations.spam,
    deleted: state.conversations.deleted
  }
}

// Selectors
export const selectConversationById = (state, conversationId) => {
  const allConversations = [
    ...state.conversations.inbox,
    ...state.conversations.sent,
    ...state.conversations.starred,
    ...state.conversations.spam,
    ...state.conversations.deleted
  ]
  return allConversations.find(conversation => conversation.id === conversationId)
}

export const { setSelectedRecipients, clearSelectedRecipients, setSelectedConversation, clearSelectedConversation } =
  conversationsSlice.actions

export default conversationsSlice.reducer
