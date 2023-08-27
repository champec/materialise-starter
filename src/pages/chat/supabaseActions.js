import React from 'react'
import { supabaseOrg } from 'src/configs/supabase'
import { useDispatch, useSelector } from 'react-redux'
import { getUserChats, updateSelectedChat } from 'src/store/apps/chat'

export const fetchChatContacts = () => async dispatch => {
  try {
    const { data: contacts, error } = await supabase.from('profiles').select('*')

    if (error) throw error

    dispatch({
      type: 'GET_CHAT_CONTACTS',
      payload: contacts
    })
  } catch (error) {
    console.error('Error fetching chat contacts:', error.message)
  }
}

export const fetchChatMessages = chatId => async dispatch => {
  try {
    const { data: messages, error } = await supabase.from('chatMessages').select('*').eq('chat_id', chatId)

    if (error) throw error

    dispatch({
      type: 'GET_CHAT_MESSAGES',
      payload: messages
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error.message)
  }
}

export const sendChatMessage = async message => {
  try {
    const { data: newMessage, error } = await supabaseOrg.from('chatMessages').insert([message])

    if (error) throw error

    // dispatch({
    //   type: 'SEND_CHAT_MESSAGE',
    //   payload: newMessage
    // })

    // Refetch the user chats after sending the message
    // dispatch(fetchUserChats(message.organisation_id))
  } catch (error) {
    console.error('Error sending chat message:', error.message)
  }
}

// export const fetchUserChats = userId => async dispatch => {
//   try {
//     const { data: userChats, error } = await supabaseOrg
//       .from('chatParticipants')
//       .select('chat_id')
//       .eq('user_id', userId)

//     if (error) throw error

//     const chatIds = userChats.map(chat => chat.chat_id)

//     const { data: chats, error: chatsError } = await supabaseOrg
//       .from('chats')
//       .select(
//         `
//             *,
//             chatParticipants:chatParticipants (
//               user_id,
//               profile:user_id (*)
//             ),
//             chatMessages:chatMessages (*)
//           `
//       )
//       .in('id', chatIds)

//     if (chatsError) throw chatsError

//     const sortedChats = chats.sort((a, b) => {
//       const aTimestamp = new Date(a.chatMessages.slice(-1)[0]?.timestamp || 0)
//       const bTimestamp = new Date(b.chatMessages.slice(-1)[0]?.timestamp || 0)
//       return bTimestamp - aTimestamp
//     })

//     dispatch(getUserChats(sortedChats))
//   } catch (error) {
//     console.error('Error fetching user chats:', error.message)
//   }
// }
